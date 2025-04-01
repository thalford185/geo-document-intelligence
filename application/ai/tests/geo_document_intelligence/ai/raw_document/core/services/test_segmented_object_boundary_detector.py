from typing import Type
from unittest.mock import AsyncMock, Mock

import numpy as np
import pytest
import shapely
from numpy.typing import NDArray

from geo_document_intelligence.ai.raw_document.core.model import (
    BoundingBox,
    Dimension,
    ObjectBoundary,
    PartialObjectBoundary,
    Raster,
    RawDocumentRegion,
)
from geo_document_intelligence.ai.raw_document.core.ports.driven.raw_document_storage import (
    RawDocumentStorageNotFoundError,
)
from geo_document_intelligence.ai.raw_document.core.ports.driven.segmentation_ml import (
    SegmentationMlError,
)
from geo_document_intelligence.ai.raw_document.core.services.segmented_object_boundary_detector import (
    SegmentedObjectBoundaryDetector,
    SegmentedObjectBoundaryDetectorDocumentNotFoundError,
    SegmentedObjectBoundaryDetectorError,
    SegmentedObjectBoundaryDetectorPageNotFoundError,
)
from tests.geo_document_intelligence.ai.raw_document import make


def make_single_page_raw_document(dimension: Dimension = (1000, 2000)) -> list[Raster]:
    return [np.zeros((dimension[1], dimension[0]), np.uint8)]


def make_raster_mask_of_square(
    normalized_bounding_box_of_square: BoundingBox = (0, 0, 1, 1),
    dimension: Dimension = (1000, 2000),
) -> NDArray[np.bool]:
    x1, y1, x2, y2 = normalized_bounding_box_of_square
    object_mask_raster = np.zeros((dimension[1], dimension[0]), np.bool)
    object_mask_raster[
        int(y1 * dimension[1]) : int(y2 * dimension[1]),
        int(x1 * dimension[0]) : int(x2 * dimension[0]),
    ] = True
    return object_mask_raster


@pytest.fixture(name="segmented_object_boundary_detector")
def fixture_segmented_object_boundary_detector(
    raw_document_storage: Mock, segmentation_ml: Mock
) -> SegmentedObjectBoundaryDetector:
    return SegmentedObjectBoundaryDetector(
        raw_document_storage, segmentation_ml, 0.01, 0.01, 0.01
    )


@pytest.mark.parametrize(
    "raw_document_region,raw_document,object_mask,expected_boundaries,expected_bounding_box",
    [
        pytest.param(
            make.raw_document_region(
                page_number=1, normalized_bounding_box=(0.1, 0.1, 0.9, 0.9)
            ),
            make_single_page_raw_document((1000, 2000)),
            make_raster_mask_of_square((0.2, 0.2, 0.8, 0.8), (1000, 2000)),
            [
                make.object_boundary(
                    normalized_geometry=shapely.LinearRing(
                        [
                            [0.2, 0.2],
                            [0.2, 0.8],
                            [0.8, 0.8],
                            [0.8, 0.2],
                            [0.2, 0.2],
                        ]
                    ),
                )
            ],
            (100, 200, 900, 1800),
            id="single_square_object_within_bounding_box",
        )
    ],
)
async def test_predict__success(
    segmented_object_boundary_detector: SegmentedObjectBoundaryDetector,
    raw_document_storage: Mock,
    segmentation_ml: Mock,
    raw_document: list[Raster],
    raw_document_region: RawDocumentRegion,
    object_mask: NDArray[np.bool],
    expected_boundaries: list[ObjectBoundary],
    expected_bounding_box: BoundingBox,
) -> None:
    raw_document_storage.get_by_document_id.return_value = raw_document
    segmentation_ml.get_object_mask.return_value = object_mask
    actual_boundaries = await segmented_object_boundary_detector.predict(
        raw_document_region
    )
    assert len(actual_boundaries) == len(expected_boundaries)
    for actual_boundary, expected_boundary in zip(
        actual_boundaries, expected_boundaries
    ):
        assert expected_boundary.normalized_geometry.equals_exact(
            actual_boundary.normalized_geometry, tolerance=0.01
        )
    raw_document_storage.get_by_document_id.assert_called_once_with(
        raw_document_region.raw_document_id
    )
    segmentation_ml.get_object_mask.assert_called_once_with(
        raw_document[0], expected_bounding_box
    )


@pytest.mark.parametrize(
    "raw_document_region,get_by_document_id,get_object_mask,expected_exception_cls",
    [
        pytest.param(
            make.raw_document_region(),
            AsyncMock(side_effect=RawDocumentStorageNotFoundError()),
            AsyncMock(),
            SegmentedObjectBoundaryDetectorDocumentNotFoundError,
            id="page_not_found",
        ),
        pytest.param(
            make.raw_document_region(page_number=2),
            AsyncMock(return_value=make_single_page_raw_document()),
            AsyncMock(),
            SegmentedObjectBoundaryDetectorPageNotFoundError,
            id="page_not_found",
        ),
        pytest.param(
            make.raw_document_region(page_number=1),
            AsyncMock(return_value=make_single_page_raw_document()),
            AsyncMock(side_effect=SegmentationMlError()),
            SegmentedObjectBoundaryDetectorError,
            id="segmentation_ml",
        ),
    ],
)
async def test_predict__error(
    segmented_object_boundary_detector: SegmentedObjectBoundaryDetector,
    raw_document_storage: Mock,
    segmentation_ml: Mock,
    raw_document_region: RawDocumentRegion,
    get_by_document_id: AsyncMock,
    get_object_mask: AsyncMock,
    expected_exception_cls: Type[SegmentedObjectBoundaryDetectorError],
) -> None:
    raw_document_storage.get_by_document_id = get_by_document_id
    segmentation_ml.get_object_mask = get_object_mask
    with pytest.raises(expected_exception_cls):
        await segmented_object_boundary_detector.predict(raw_document_region)


@pytest.mark.parametrize(
    (
        "raw_document_region,partial_boundary,raw_document,object_mask,expected_partial_boundaries"
        ",expected_bounding_box"
    ),
    [
        pytest.param(
            make.raw_document_region(
                page_number=1, normalized_bounding_box=(0.1, 0.1, 0.9, 0.9)
            ),
            make.partial_object_boundary(
                normalized_geometry=shapely.LineString([[0.2, 0.8], [0.8, 0.8]])
            ),
            make_single_page_raw_document((1000, 2000)),
            make_raster_mask_of_square((0.2, 0.2, 0.8, 0.8), (1000, 2000)),
            [
                make.partial_object_boundary(
                    normalized_geometry=shapely.LineString(
                        [
                            [0.8, 0.8],
                            [0.8, 0.2],
                            [0.2, 0.2],
                            [0.2, 0.8],
                        ]
                    ),
                )
            ],
            (100, 200, 900, 1800),
            id="single_square_object_within_bounding_box",
        )
    ],
)
async def test_complete__success(
    segmented_object_boundary_detector: SegmentedObjectBoundaryDetector,
    raw_document_storage: Mock,
    segmentation_ml: Mock,
    raw_document: list[Raster],
    raw_document_region: RawDocumentRegion,
    partial_boundary: PartialObjectBoundary,
    object_mask: NDArray[np.bool],
    expected_partial_boundaries: list[PartialObjectBoundary],
    expected_bounding_box: BoundingBox,
) -> None:
    raw_document_storage.get_by_document_id.return_value = raw_document
    segmentation_ml.get_object_mask.return_value = object_mask
    actual_partial_boundaries = await segmented_object_boundary_detector.complete(
        raw_document_region, partial_boundary
    )
    assert len(actual_partial_boundaries) == len(expected_partial_boundaries)
    for actual_boundary, expected_partial_boundary in zip(
        actual_partial_boundaries, expected_partial_boundaries
    ):
        assert expected_partial_boundary.normalized_geometry.equals_exact(
            actual_boundary.normalized_geometry, tolerance=0.01
        )
    raw_document_storage.get_by_document_id.assert_called_once_with(
        raw_document_region.raw_document_id
    )
    segmentation_ml.get_object_mask.assert_called_once_with(
        raw_document[0], expected_bounding_box
    )


@pytest.mark.parametrize(
    "raw_document_region,get_by_document_id,get_object_mask,expected_exception_cls",
    [
        pytest.param(
            make.raw_document_region(),
            AsyncMock(side_effect=RawDocumentStorageNotFoundError()),
            AsyncMock(),
            SegmentedObjectBoundaryDetectorDocumentNotFoundError,
            id="document_not_found",
        ),
        pytest.param(
            make.raw_document_region(page_number=2),
            AsyncMock(return_value=make_single_page_raw_document()),
            AsyncMock(),
            SegmentedObjectBoundaryDetectorPageNotFoundError,
            id="page_not_found",
        ),
        pytest.param(
            make.raw_document_region(page_number=1),
            AsyncMock(return_value=make_single_page_raw_document()),
            AsyncMock(side_effect=SegmentationMlError()),
            SegmentedObjectBoundaryDetectorError,
            id="segmentation_ml",
        ),
    ],
)
async def test_complete__error(
    segmented_object_boundary_detector: SegmentedObjectBoundaryDetector,
    raw_document_storage: Mock,
    segmentation_ml: Mock,
    raw_document_region: RawDocumentRegion,
    get_by_document_id: AsyncMock,
    get_object_mask: AsyncMock,
    expected_exception_cls: Type[SegmentedObjectBoundaryDetectorError],
) -> None:
    raw_document_storage.get_by_document_id = get_by_document_id
    segmentation_ml.get_object_mask = get_object_mask
    with pytest.raises(expected_exception_cls):
        await segmented_object_boundary_detector.complete(
            raw_document_region,
            PartialObjectBoundary(normalized_geometry=shapely.LineString([])),
        )
