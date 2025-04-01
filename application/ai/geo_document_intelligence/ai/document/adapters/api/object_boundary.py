"""
Driving adapter for getting object boundaries from documents via a HTTP API.
Implemented as a FastAPI router.
Search is implemented as GET with query params rather than POST with JSON body, trading an increase
in cachability for a custom partial boundary serialization requirement.
"""

from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from shapely import LineString

from geo_document_intelligence.ai.document.adapters.api._dependencies import (
    boundary_query,
    bounding_box_query,
)
from geo_document_intelligence.ai.document.core.model import (
    DocumentRegion,
    PartialObjectBoundary,
)
from geo_document_intelligence.ai.document.core.ports.object_boundary_use_case import (
    ObjectBoundaryUseCase,
    ObjectBoundaryUseCaseDocumentNotFoundError,
    ObjectBoundaryUseCasePageNotFoundError,
)


@dataclass
class State:
    object_boundary_use_case: ObjectBoundaryUseCase | None = None


@dataclass
class ObjectBoundaryDto:
    normalized_vertices: list[tuple[float, float]]


def init(object_boundary_use_case: ObjectBoundaryUseCase) -> None:
    state.object_boundary_use_case = object_boundary_use_case


def initialized_object_boundary_use_case() -> ObjectBoundaryUseCase:
    if state.object_boundary_use_case is None:
        raise HTTPException(500, "object_detection_use_case is not initialized")
    return state.object_boundary_use_case


state = State()
router = APIRouter()


@router.get("/{document_id}/object-boundaries")
async def read(
    document_id: str,
    page_number: Annotated[int, Query(min=1)],
    normalized_bounding_box: Annotated[
        tuple[float, float, float, float], Depends(bounding_box_query)
    ],
    partial_object_boundary: Annotated[LineString, Depends(boundary_query)],
    object_boundary_use_case: Annotated[
        ObjectBoundaryUseCase, Depends(initialized_object_boundary_use_case)
    ],
) -> list[ObjectBoundaryDto]:
    document_region = DocumentRegion(
        document_id,
        page_number=page_number,
        normalized_bounding_box=normalized_bounding_box,
    )
    try:
        if len(partial_object_boundary.coords) == 0:
            object_boundaries = await object_boundary_use_case.predict(document_region)
        else:
            object_boundaries = await object_boundary_use_case.complete(
                document_region,
                PartialObjectBoundary(normalized_geometry=partial_object_boundary),
            )
    except ObjectBoundaryUseCaseDocumentNotFoundError as exc:
        raise HTTPException(404, "Document not found") from exc
    except ObjectBoundaryUseCasePageNotFoundError as exc:
        raise HTTPException(404, "Page not found") from exc

    return [
        ObjectBoundaryDto(
            normalized_vertices=[
                (x, y) for x, y in object_boundary.normalized_geometry.coords
            ]
        )
        for object_boundary in object_boundaries
    ]
