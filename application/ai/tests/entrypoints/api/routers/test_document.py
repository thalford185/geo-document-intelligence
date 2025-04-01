from unittest.mock import Mock

import numpy as np
import pytest
import shapely
from fastapi import FastAPI
from fastapi.testclient import TestClient
from numpy.typing import NDArray

from entrypoints.api.routers import document
from geo_document_intelligence.ai.document.core.model import BoundingBox
from tests.geo_document_intelligence.ai.document import make as document_make


def make_raster_mask_of_square(
    normalized_bounding_box_of_square: BoundingBox,
) -> NDArray[np.float32]:
    x1, y1, x2, y2 = normalized_bounding_box_of_square
    object_mask_raster = np.zeros((1, 2200, 1700), np.float32)
    object_mask_raster[
        :, int(x1 * 2200) : int(x2 * 2200), int(y1 * 1700) : int(y2 * 1700)
    ] = 1.0
    return object_mask_raster


@pytest.fixture(name="api_client")
def fixture_api_client(gcs_bucket: Mock, sam2_model: Mock) -> TestClient:
    app = FastAPI()
    app.include_router(document.router)
    document.init(gcs_bucket, sam2_model)
    return TestClient(app)


@pytest.mark.parametrize(
    "object_raster_mask,expected_object_boundary",
    [
        pytest.param(
            make_raster_mask_of_square((0.2, 0.2, 0.8, 0.8)),
            shapely.LineString(
                [
                    [0.2, 0.2],
                    [0.2, 0.8],
                    [0.8, 0.8],
                    [0.8, 0.2],
                    [0.2, 0.2],
                ]
            ),
            id="single_square_object_within_bounding_box",
        )
    ],
)
def test_read_document_object_boundaries__without_partial_boundary(
    api_client: TestClient,
    gcs_blob: Mock,
    sam2_model: Mock,
    object_raster_mask: NDArray[np.float32],
    expected_object_boundary: shapely.LinearRing,
) -> None:
    gcs_blob.download_as_bytes.return_value = document_make.pdf_bytes()
    sam2_model.predict.return_value = (
        object_raster_mask,
        None,
        None,
    )
    response = api_client.get(
        (
            "/documents/00000000-0000-0000-0000-00000000000000/object-boundaries?"
            "page_number=1&"
            "bounding_box=0.1&"
            "bounding_box=0.1&"
            "bounding_box=0.9&"
            "bounding_box=0.9"
        )
    )
    assert response.status_code == 200
    response_body = response.json()
    assert len(response_body) == 1
    assert shapely.LineString(response_body[0]["normalized_vertices"]).equals_exact(
        expected_object_boundary,
        0.01,
    )


@pytest.mark.parametrize(
    "partial_object_boundary_query,object_raster_mask,expected_object_boundary",
    [
        pytest.param(
            ("boundary_x=0.2&boundary_y=0.8&boundary_x=0.8&boundary_y=0.8"),
            make_raster_mask_of_square((0.2, 0.2, 0.8, 0.8)),
            shapely.LineString(
                [
                    [0.8, 0.8],
                    [0.8, 0.2],
                    [0.2, 0.2],
                    [0.2, 0.8],
                ]
            ),
            id="single_square_object_within_bounding_box_partially_complete",
        )
    ],
)
def test_read_document_object_boundaries__with_partial_boundary(
    api_client: TestClient,
    gcs_blob: Mock,
    sam2_model: Mock,
    partial_object_boundary_query: str,
    object_raster_mask: NDArray[np.float32],
    expected_object_boundary: shapely.LineString,
) -> None:
    gcs_blob.download_as_bytes.return_value = document_make.pdf_bytes()
    sam2_model.predict.return_value = (
        object_raster_mask,
        None,
        None,
    )
    response = api_client.get(
        (
            "/documents/00000000-0000-0000-0000-00000000000000/object-boundaries?"
            f"{partial_object_boundary_query}&"
            "page_number=1&"
            "bounding_box=0.1&"
            "bounding_box=0.1&"
            "bounding_box=0.9&"
            "bounding_box=0.9"
        )
    )
    assert response.status_code == 200
    response_body = response.json()
    assert len(response_body) == 1
    assert shapely.LineString(response_body[0]["normalized_vertices"]).equals_exact(
        expected_object_boundary,
        0.01,
    )
