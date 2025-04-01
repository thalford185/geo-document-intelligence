from typing import Any
from unittest.mock import Mock

import pytest
import shapely
from fastapi import FastAPI
from fastapi.testclient import TestClient

from geo_document_intelligence.ai.raw_document.adapters.driving.api import (
    object_boundary as object_boundary_api_adapter,
)
from geo_document_intelligence.ai.raw_document.core.model import (
    PartialObjectBoundary,
    RawDocumentRegion,
)
from geo_document_intelligence.ai.raw_document.core.ports.driving.object_boundary_detector import (
    ObjectBoundaryDetectorDocumentNotFoundError,
    ObjectBoundaryDetectorError,
    ObjectBoundaryDetectorPageNotFoundError,
)
from tests.geo_document_intelligence.ai.raw_document import make


@pytest.fixture(name="api_client")
def fixture_api_client(object_boundary_detector: Mock) -> TestClient:
    object_boundary_api_adapter.init(object_boundary_detector)
    api = FastAPI()
    api.include_router(object_boundary_api_adapter.router)
    return TestClient(api)


@pytest.mark.parametrize(
    "search_query,expected_detector_call",
    [
        pytest.param(
            ("page_number=1&normalized_bounding_box=[0.25,0.25,0.75,0.75]"),
            make.raw_document_region(
                "00000000-0000-0000-0000-000000000000",
                page_number=1,
                normalized_bounding_box=(0.25, 0.25, 0.75, 0.75),
            ),
            id="valid",
        ),
    ],
)
def test_read__success_without_boundary(
    api_client: TestClient,
    object_boundary_detector: Mock,
    search_query: str,
    expected_detector_call: Any,
) -> None:
    object_boundary_detector.predict.return_value = [
        make.object_boundary(
            normalized_geometry=shapely.LinearRing([(0, 0), (0, 1), (1, 1)])
        )
    ]
    response = api_client.get(
        f"00000000-0000-0000-0000-000000000000/object-boundaries?{search_query}"
    )
    assert response.status_code == 200
    assert response.json() == [
        {"normalized_vertices": [[0, 0], [0, 1], [1, 1], [0, 0]]}
    ]
    object_boundary_detector.predict.assert_called_with(expected_detector_call)


@pytest.mark.parametrize(
    "search_query,expected_detector_call",
    [
        pytest.param(
            (
                "page_number=1"
                "&normalized_bounding_box=[0.25,0.25,0.75,0.75]"
                "&partial_boundary_normalized_vertices=[[0.4,0.4],[0.4,0.6]]"
            ),
            (
                make.raw_document_region(
                    "00000000-0000-0000-0000-000000000000",
                    page_number=1,
                    normalized_bounding_box=(0.25, 0.25, 0.75, 0.75),
                ),
                make.partial_object_boundary(
                    normalized_geometry=shapely.LineString([(0.4, 0.4), (0.4, 0.6)])
                ),
            ),
            id="valid",
        ),
    ],
)
def test_read__success_with_boundary(
    api_client: TestClient,
    object_boundary_detector: Mock,
    search_query: str,
    expected_detector_call: tuple[RawDocumentRegion, PartialObjectBoundary],
) -> None:
    object_boundary_detector.predict.return_value = [
        make.object_boundary(
            normalized_geometry=shapely.LinearRing([(0, 0), (0, 1), (1, 1)])
        )
    ]
    response = api_client.get(
        f"00000000-0000-0000-0000-000000000000/object-boundaries?{search_query}"
    )
    assert response.status_code == 200
    object_boundary_detector.complete.assert_called_with(*expected_detector_call)


@pytest.mark.parametrize(
    "search_query,",
    [
        pytest.param(
            "page_number=1&normalized_bounding_box=[0.25,0.25,0.75]",
            id="invalid_bounding_box_no_y2",
        ),
        pytest.param(
            (
                "page_number=1"
                "&normalized_bounding_box=[0.25,0.25,0.75,0.75]"
                "&partial_boundary_normalized_vertices=[[0.4,0.4],[0.4]]"
            ),
            id="invalid_boundary_different_amount_of_xs_and_ys",
        ),
    ],
)
def test_read__unprocessable_content_error(
    api_client: TestClient,
    object_boundary_detector: Mock,
    search_query: str,
) -> None:
    response = api_client.get(
        f"00000000-0000-0000-0000-000000000000/object-boundaries?{search_query}"
    )
    object_boundary_detector.predict.assert_not_called()
    assert response.status_code == 422


@pytest.mark.parametrize(
    "predict_side_effect",
    [
        pytest.param(
            ObjectBoundaryDetectorDocumentNotFoundError(),
            id="document",
        ),
        pytest.param(
            ObjectBoundaryDetectorPageNotFoundError(),
            id="page",
        ),
    ],
)
def test_read__not_found_error_without_boundary(
    api_client: TestClient,
    object_boundary_detector: Mock,
    predict_side_effect: ObjectBoundaryDetectorError,
) -> None:
    object_boundary_detector.predict.side_effect = predict_side_effect
    response = api_client.get(
        "00000000-0000-0000-0000-000000000000/object-boundaries?"
        "page_number=1"
        "&normalized_bounding_box=[0.25,0.25,0.75,0.75]"
    )
    object_boundary_detector.predict.assert_called_once()
    object_boundary_detector.complete.assert_not_called()
    assert response.status_code == 404


@pytest.mark.parametrize(
    "complete_side_effect",
    [
        pytest.param(
            ObjectBoundaryDetectorDocumentNotFoundError(),
            id="document",
        ),
        pytest.param(
            ObjectBoundaryDetectorPageNotFoundError(),
            id="page",
        ),
    ],
)
def test_read__not_found_error_with_boundary(
    api_client: TestClient,
    object_boundary_detector: Mock,
    complete_side_effect: ObjectBoundaryDetectorError,
) -> None:
    object_boundary_detector.complete.side_effect = complete_side_effect
    response = api_client.get(
        "00000000-0000-0000-0000-000000000000/object-boundaries?"
        "page_number=1"
        "&normalized_bounding_box=[0.25,0.25,0.75,0.75]"
        "&partial_boundary_normalized_vertices=[[0.4,0.4],[0.4, 0.6]]"
    )
    object_boundary_detector.predict.assert_not_called()
    object_boundary_detector.complete.assert_called_once()
    assert response.status_code == 404
