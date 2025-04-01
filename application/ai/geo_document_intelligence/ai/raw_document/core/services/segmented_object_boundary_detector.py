"""
Service that implements the object boundary detector driving port via image segmentation
"""

import logging
from typing import TypeVar

import cv2
import numpy as np
import shapely
import shapely.ops

from geo_document_intelligence.ai.raw_document.core.model import (
    BoundingBox,
    Dimension,
    MaskRaster,
    ObjectBoundary,
    PartialObjectBoundary,
    RawDocumentRegion,
)
from geo_document_intelligence.ai.raw_document.core.ports.driven.raw_document_storage import (
    RawDocumentStorage,
    RawDocumentStorageNotFoundError,
)
from geo_document_intelligence.ai.raw_document.core.ports.driven.segmentation_ml import (
    SegmentationMl,
    SegmentationMlError,
)
from geo_document_intelligence.ai.raw_document.core.ports.driving.object_boundary_detector import (
    ObjectBoundaryDetector,
    ObjectBoundaryDetectorDocumentNotFoundError,
    ObjectBoundaryDetectorError,
    ObjectBoundaryDetectorPageNotFoundError,
)

GeoT = TypeVar("GeoT", bound=shapely.Geometry)

logger = logging.getLogger()


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
    # Ignore holes in the contours extracted from the raster
    contours, _ = cv2.findContours(
        mask.astype(np.uint8) * 255, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    mask_dimension = mask.shape[1], mask.shape[0]
    # Remove all contours that do not form a polygon
    contour_polygons = [
        shapely.Polygon([(row[0], row[1]) for row in contour.reshape(-1, 2)])
        for contour in contours
        if len(contour) > 2
    ]
    # Normalize polygon contours from pixel coordinates to [0,1]
    contour_polygons = [
        _normalize_geometry(
            contour_polygon,
            mask_dimension,
        )
        for contour_polygon in contour_polygons
    ]
    # Remove redundant vertices from polygons derived from pixel contours
    polygons = [
        shapely.simplify(
            contour_polygon,
            preserve_topology=True,
            tolerance=max_boundary_displacement,
        )
        for contour_polygon in contour_polygons
    ]
    # Remove small polygons that are likely to be islands extracted from noise in the mask
    polygons = [polygon for polygon in polygons if polygon.area > max_island_size]
    boundaries = [
        ObjectBoundary(normalized_geometry=polygon.exterior) for polygon in polygons
    ]
    return boundaries


def _snap_partial_boundary_to_boundary(
    partial_boundary: PartialObjectBoundary,
    boundary: ObjectBoundary,
    max_snap_distance: float,
) -> tuple[float, float] | None:
    """
    points on the boundary are represented by their normalized interpolation distance along the
    boundary
    """
    partial_boundary_start = partial_boundary.normalized_geometry.interpolate(
        0.0, normalized=True
    )
    partial_boundary_end = partial_boundary.normalized_geometry.interpolate(
        1.0, normalized=True
    )
    if (
        partial_boundary_start.distance(boundary.normalized_geometry)
        > max_snap_distance
    ):
        return None
    if partial_boundary_end.distance(boundary.normalized_geometry) > max_snap_distance:
        return None
    return (
        boundary.normalized_geometry.project(partial_boundary_start, normalized=True),
        boundary.normalized_geometry.project(partial_boundary_end, normalized=True),
    )


def _partial_boundary_is_aligned_with_boundary(
    partial_boundary: PartialObjectBoundary, boundary: ObjectBoundary
) -> bool:
    """
    true if the interpolation distance of boundary increases in the same direction as the end of
    the partial boundary
    """
    partial_boundary_end_secant_line = shapely.LineString(
        [
            partial_boundary.normalized_geometry.interpolate(0.99, normalized=True),
            partial_boundary.normalized_geometry.interpolate(1.0, normalized=True),
        ]
    )
    return boundary.normalized_geometry.project(
        partial_boundary_end_secant_line.interpolate(0, normalized=True),
        normalized=True,
    ) <= boundary.normalized_geometry.project(
        partial_boundary_end_secant_line.interpolate(1.0, normalized=True),
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
    """
    Extends the shapely substring operation to allow substrings to cross the zero interpolation
    distance point instead of reversing the substring.
    https://shapely.readthedocs.io/en/stable/manual.html#shapely.ops.substring
    """
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
                normalized=True,
            )
        )
    )


class SegmentedObjectBoundaryDetectorError(ObjectBoundaryDetectorError): ...


class SegmentedObjectBoundaryDetectorDocumentNotFoundError(
    ObjectBoundaryDetectorDocumentNotFoundError, SegmentedObjectBoundaryDetectorError
): ...


class SegmentedObjectBoundaryDetectorPageNotFoundError(
    ObjectBoundaryDetectorPageNotFoundError, SegmentedObjectBoundaryDetectorError
): ...


class SegmentedObjectBoundaryDetector(ObjectBoundaryDetector):
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

    async def predict(
        self, raw_document_region: RawDocumentRegion
    ) -> list[ObjectBoundary]:
        logger.info("Retrieving document %s", raw_document_region.raw_document_id)
        try:
            raw_document = await self._raw_document_storage.get_by_document_id(
                raw_document_region.raw_document_id
            )
        except RawDocumentStorageNotFoundError as exc:
            raise SegmentedObjectBoundaryDetectorDocumentNotFoundError(
                f"Document {raw_document_region.raw_document_id} does not exist"
            ) from exc
        logger.info("Retrieved document %s", raw_document_region.raw_document_id)
        if raw_document_region.page_number > len(raw_document):
            raise SegmentedObjectBoundaryDetectorPageNotFoundError(
                f"Page number {raw_document_region.page_number}"
                " does not exist in document {document_region.document_id}"
            )
        page = raw_document[raw_document_region.page_number - 1]
        page_dimension = page.shape[1], page.shape[0]
        bounding_box = _denormalize_bounding_box(
            raw_document_region.normalized_bounding_box,
            page_dimension,
        )
        logger.info(
            "Segmenting document %s page %s",
            raw_document_region.raw_document_id,
            raw_document_region.page_number,
        )
        try:
            object_mask = await self._segmentation_ml.get_object_mask(
                page,
                bounding_box,
            )
        except SegmentationMlError as exc:
            raise SegmentedObjectBoundaryDetectorError("Segmentation error") from exc
        logger.info(
            "Segmented document %s page %s",
            raw_document_region.raw_document_id,
            raw_document_region.page_number,
        )
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
        self,
        raw_document_region: RawDocumentRegion,
        partial_boundary: PartialObjectBoundary,
    ) -> list[PartialObjectBoundary]:
        predicted_boundaries = await self.predict(raw_document_region)
        completions: list[PartialObjectBoundary] = []
        for predicted_boundary in predicted_boundaries:
            # Snap the partial boundary to the predicted boundary
            completion_predicted_boundary_end_and_start_distances = (
                _snap_partial_boundary_to_boundary(
                    partial_boundary,
                    predicted_boundary,
                    self._max_snap_distance,
                )
            )
            if completion_predicted_boundary_end_and_start_distances is None:
                continue
            (
                completion_predicted_boundary_end_distance,
                completion_predicted_boundary_start_distance,
            ) = completion_predicted_boundary_end_and_start_distances
            completion_predicted_boundary_direction_is_positive = (
                _partial_boundary_is_aligned_with_boundary(
                    partial_boundary, predicted_boundary
                )
            )
            completion_predicted_boundary_substring = _slice_boundary_in_direction(
                predicted_boundary,
                completion_predicted_boundary_start_distance,
                completion_predicted_boundary_end_distance,
                completion_predicted_boundary_direction_is_positive,
            )
            # Start and end the boundary completion at the end and start of the partial boundary
            # respectively, not the snapped points on the boundary completion itself
            completion = PartialObjectBoundary(
                normalized_geometry=shapely.LineString(
                    partial_boundary.normalized_geometry.interpolate(
                        1.0, normalized=True
                    ).coords[:]
                    + completion_predicted_boundary_substring.normalized_geometry.coords[
                        1:-1
                    ]
                    + partial_boundary.normalized_geometry.interpolate(
                        0.0, True
                    ).coords[:]
                )
            )
            completions += [completion]
        return completions
