from typing import TypeVar

import cv2
import numpy as np
import shapely
import shapely.ops

from geo_document_intelligence.ai.document.core.model import (
    BoundingBox,
    Dimension,
    DocumentRegion,
    MaskRaster,
    ObjectBoundary,
    PartialObjectBoundary,
)
from geo_document_intelligence.ai.document.core.ports.object_boundary_use_case import (
    ObjectBoundaryUseCase,
    ObjectBoundaryUseCaseDocumentNotFoundError,
    ObjectBoundaryUseCaseError,
    ObjectBoundaryUseCasePageNotFoundError,
)
from geo_document_intelligence.ai.document.core.ports.raw_document_storage import (
    RawDocumentStorage,
    RawDocumentStorageNotFoundError,
)
from geo_document_intelligence.ai.document.core.ports.segmentation_ml import (
    SegmentationMl,
    SegmentationMlError,
)

GeoT = TypeVar("GeoT", bound=shapely.Geometry)


def _denormalize_bounding_box(
    bounding_box: BoundingBox, page_dimension: Dimension
) -> BoundingBox:
    return (
        bounding_box[0] * page_dimension[0],
        bounding_box[1] * page_dimension[1],
        bounding_box[2] * page_dimension[0],
        bounding_box[3] * page_dimension[1],
    )


def _normalize_geometry(geometry: GeoT, page_dimension: Dimension) -> GeoT:
    return shapely.affinity.scale(
        geometry,
        xfact=1.0 / page_dimension[0],
        yfact=1.0 / page_dimension[1],
        origin=(0, 0),
    )


def _convert_mask_to_boundaries(
    mask: MaskRaster, max_boundary_displacement: float, max_island_size: float
) -> list[ObjectBoundary]:
    contours, _ = cv2.findContours(
        mask.astype(np.uint8) * 255, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    mask_dimension = mask.shape[1], mask.shape[0]
    normalized_contour_polygons = [
        _normalize_geometry(
            shapely.Polygon([(row[0], row[1]) for row in contour.reshape(-1, 2)]),
            mask_dimension,
        )
        for contour in contours
        if len(contour) > 2
    ]
    boundaries = [
        ObjectBoundary(
            normalized_geometry=shapely.simplify(
                polygon,
                preserve_topology=True,
                tolerance=max_boundary_displacement,
            ).exterior
        )
        for polygon in normalized_contour_polygons
        if polygon.area > max_island_size
    ]
    return boundaries


def _snap_partial_boundary_to_boundary(
    partial_boundary: PartialObjectBoundary,
    boundary: ObjectBoundary,
    max_snap_distance: float,
) -> tuple[float, float] | None:
    line_start = partial_boundary.normalized_geometry.interpolate(0.0, normalized=True)
    line_end = partial_boundary.normalized_geometry.interpolate(1.0, normalized=True)
    if line_start.distance(boundary.normalized_geometry) > max_snap_distance:
        return None
    if line_end.distance(boundary.normalized_geometry) > max_snap_distance:
        return None
    return (
        boundary.normalized_geometry.project(line_start, normalized=True),
        boundary.normalized_geometry.project(line_end, normalized=True),
    )


def _partial_boundary_is_aligned_with_boundary(
    partial_boundary: PartialObjectBoundary, boundary: ObjectBoundary
) -> bool:
    return boundary.normalized_geometry.project(
        partial_boundary.normalized_geometry.interpolate(0.999, normalized=True),
        normalized=True,
    ) <= boundary.normalized_geometry.project(
        partial_boundary.normalized_geometry.interpolate(1.0, normalized=True),
        normalized=True,
    )


def _coerce_to_line_string(
    point_or_line: shapely.Point | shapely.LineString,
) -> shapely.LineString:
    if isinstance(point_or_line, shapely.Point):
        return shapely.LineString([])
    else:
        return point_or_line


def _slice_boundary_in_direction(
    boundary: ObjectBoundary,
    start_normalized_distance: float,
    end_normalized_distance: float,
    direction_is_positive: bool,
) -> PartialObjectBoundary:
    if start_normalized_distance <= end_normalized_distance:
        if direction_is_positive:
            return PartialObjectBoundary(
                normalized_geometry=_coerce_to_line_string(
                    shapely.ops.substring(
                        boundary.normalized_geometry,
                        start_normalized_distance,
                        end_normalized_distance,
                        normalized=True,
                    )
                )
            )
        return PartialObjectBoundary(
            normalized_geometry=shapely.LineString(
                _coerce_to_line_string(
                    shapely.ops.substring(
                        boundary.normalized_geometry,
                        start_normalized_distance,
                        0.0,
                        normalized=True,
                    )
                ).coords[:-1]
                + _coerce_to_line_string(
                    shapely.ops.substring(
                        boundary.normalized_geometry,
                        1.0,
                        end_normalized_distance,
                        normalized=True,
                    )
                ).coords[:]
            )
        )
    if direction_is_positive:
        return PartialObjectBoundary(
            normalized_geometry=shapely.LineString(
                _coerce_to_line_string(
                    shapely.ops.substring(
                        boundary.normalized_geometry,
                        start_normalized_distance,
                        1.0,
                        normalized=True,
                    )
                ).coords[:-1]
                + _coerce_to_line_string(
                    shapely.ops.substring(
                        boundary.normalized_geometry,
                        0.0,
                        end_normalized_distance,
                        normalized=True,
                    )
                ).coords[:]
            )
        )
    return PartialObjectBoundary(
        normalized_geometry=_coerce_to_line_string(
            shapely.ops.substring(
                boundary.normalized_geometry,
                start_normalized_distance,
                end_normalized_distance,
            )
        )
    )


class SegmentedObjectBoundaryUseCaseError(ObjectBoundaryUseCaseError): ...


class SegmentedObjectBoundaryUseCaseDocumentNotFoundError(
    ObjectBoundaryUseCaseDocumentNotFoundError, SegmentedObjectBoundaryUseCaseError
): ...


class SegmentedObjectBoundaryUseCasePageNotFoundError(
    ObjectBoundaryUseCasePageNotFoundError, SegmentedObjectBoundaryUseCaseError
): ...


class SegmentedObjectBoundaryUseCase(ObjectBoundaryUseCase):
    def __init__(
        self,
        raw_document_storage: RawDocumentStorage,
        segmentation_ml: SegmentationMl,
        max_simplification_displacement: float,
        max_island_size: float,
        max_snap_distance: float,
    ):
        self._raw_document_storage = raw_document_storage
        self._segmentation_ml = segmentation_ml
        self._max_simplification_displacement = max_simplification_displacement
        self._max_island_size = max_island_size
        self._max_snap_distance = max_snap_distance

    async def predict(self, document_region: DocumentRegion) -> list[ObjectBoundary]:
        try:
            raw_document = await self._raw_document_storage.get_by_document_id(
                document_region.document_id
            )
        except RawDocumentStorageNotFoundError as exc:
            raise SegmentedObjectBoundaryUseCaseDocumentNotFoundError(
                f"Document {document_region.document_id} does not exist"
            ) from exc
        if document_region.page_number > len(raw_document):
            raise SegmentedObjectBoundaryUseCasePageNotFoundError(
                f"Page number {document_region.page_number}"
                " does not exist in document {document_region.document_id}"
            )
        page = raw_document[document_region.page_number - 1]
        page_dimension = page.shape[1], page.shape[0]
        bounding_box = _denormalize_bounding_box(
            document_region.normalized_bounding_box,
            page_dimension,
        )
        try:
            object_mask = await self._segmentation_ml.get_object_mask(
                page,
                bounding_box,
            )
        except SegmentationMlError as exc:
            raise SegmentedObjectBoundaryUseCaseError("Segmentation error") from exc
        boundaries = _convert_mask_to_boundaries(
            object_mask,
            self._max_simplification_displacement,
            self._max_island_size,
        )
        return sorted(
            boundaries,
            key=lambda boundary: boundary.normalized_geometry.area,
            reverse=True,
        )

    async def complete(
        self, document_region: DocumentRegion, partial_boundary: PartialObjectBoundary
    ) -> list[PartialObjectBoundary]:
        predicted_boundaries = await self.predict(document_region)
        completions: list[PartialObjectBoundary] = []
        for predicted_boundary in predicted_boundaries:
            partial_boundary_end_distances = _snap_partial_boundary_to_boundary(
                partial_boundary,
                predicted_boundary,
                self._max_snap_distance,
            )
            if partial_boundary_end_distances is None:
                continue
            (
                partial_predicted_boundary_end_distance,
                partial_predicted_boundary_start_distance,
            ) = partial_boundary_end_distances
            partial_predicted_boundary_direction_is_positive = (
                _partial_boundary_is_aligned_with_boundary(
                    partial_boundary, predicted_boundary
                )
            )
            partial_predicted_boundary = _slice_boundary_in_direction(
                predicted_boundary,
                partial_predicted_boundary_start_distance,
                partial_predicted_boundary_end_distance,
                partial_predicted_boundary_direction_is_positive,
            )
            completions += [
                PartialObjectBoundary(
                    normalized_geometry=shapely.LineString(
                        partial_boundary.normalized_geometry.interpolate(1.0).coords[:]
                        + partial_predicted_boundary.normalized_geometry.coords[1:-1]
                        + partial_boundary.normalized_geometry.interpolate(0.0).coords[
                            :
                        ]
                    )
                )
            ]
        return completions
