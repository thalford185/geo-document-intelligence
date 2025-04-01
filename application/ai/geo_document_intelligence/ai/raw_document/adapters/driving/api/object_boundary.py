"""
Driving adapter for getting object boundaries from documents via a HTTP API.
Implemented as a FastAPI router.

Search is implemented as GET with query search params rather than POST with JSON body, trading-off
an increase in cachability for an increase in parsing complexity.

Must be initialized with object boundary detector before serving requests.
"""

from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import TypeAdapter, ValidationError
from shapely import LineString

from geo_document_intelligence.ai.raw_document.core.model import (
    BoundingBox,
    PartialObjectBoundary,
    RawDocumentRegion,
)
from geo_document_intelligence.ai.raw_document.core.ports.driving.object_boundary_detector import (
    ObjectBoundaryDetector,
    ObjectBoundaryDetectorDocumentNotFoundError,
    ObjectBoundaryDetectorPageNotFoundError,
)


@dataclass
class State:
    object_boundary_detector: ObjectBoundaryDetector | None = None


@dataclass
class ObjectBoundaryDto:
    normalized_vertices: list[tuple[float, float]]


def init(object_boundary_detector: ObjectBoundaryDetector) -> None:
    state.object_boundary_detector = object_boundary_detector


def initialized_object_boundary_detector() -> ObjectBoundaryDetector:
    if state.object_boundary_detector is None:
        raise HTTPException(500, "object_boundary is not initialized")
    return state.object_boundary_detector


state = State()
router = APIRouter()


def partial_boundary_normalized_vertices_query(
    partial_boundary_normalized_vertices: Annotated[str | None, Query()] = None,
) -> LineString:
    if partial_boundary_normalized_vertices == None:
        return LineString([])
    try:
        parsed_partial_boundary_normalized_vertices = TypeAdapter(
            list[tuple[float, float]]
        ).validate_json(partial_boundary_normalized_vertices)
    except ValidationError as exc:
        raise HTTPException(422, exc.json()) from exc
    return LineString(parsed_partial_boundary_normalized_vertices)


def normalized_bounding_box_query(
    normalized_bounding_box: Annotated[str, Query()],
) -> BoundingBox:
    try:
        return TypeAdapter(tuple[float, float, float, float]).validate_json(
            normalized_bounding_box
        )
    except ValidationError as exc:
        raise HTTPException(422, exc.json()) from exc


@router.get("/{document_id}/object-boundaries")
async def read(
    document_id: str,
    page_number: Annotated[int, Query(min=1)],
    normalized_bounding_box: Annotated[
        tuple[float, float, float, float], Depends(normalized_bounding_box_query)
    ],
    partial_boundary_normalized_geometry: Annotated[
        LineString, Depends(partial_boundary_normalized_vertices_query)
    ],
    object_boundary: Annotated[
        ObjectBoundaryDetector, Depends(initialized_object_boundary_detector)
    ],
) -> list[ObjectBoundaryDto]:
    raw_document_region = RawDocumentRegion(
        document_id,
        page_number=page_number,
        normalized_bounding_box=normalized_bounding_box,
    )
    try:
        if len(partial_boundary_normalized_geometry.coords) == 0:
            object_boundaries = await object_boundary.predict(raw_document_region)
        else:
            object_boundaries = await object_boundary.complete(
                raw_document_region,
                PartialObjectBoundary(
                    normalized_geometry=partial_boundary_normalized_geometry
                ),
            )
    except ObjectBoundaryDetectorDocumentNotFoundError as exc:
        raise HTTPException(404, "Document not found") from exc
    except ObjectBoundaryDetectorPageNotFoundError as exc:
        raise HTTPException(404, "Page not found") from exc

    return [
        ObjectBoundaryDto(
            normalized_vertices=[
                (x, y) for x, y in object_boundary.normalized_geometry.coords
            ]
        )
        for object_boundary in object_boundaries
    ]
