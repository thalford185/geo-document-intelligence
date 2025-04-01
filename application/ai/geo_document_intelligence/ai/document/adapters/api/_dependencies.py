from typing import Annotated

from fastapi import HTTPException, Query
from shapely import LineString

from geo_document_intelligence.ai.document.core.model import BoundingBox


def boundary_query(
    boundary_x: Annotated[list[float] | None, Query()] = None,
    boundary_y: Annotated[list[float] | None, Query()] = None,
) -> LineString:
    if boundary_x is None:
        if boundary_y is not None:
            raise HTTPException(
                422, "boundary_x and boundary_y must be the same length"
            )
        return LineString([])
    if boundary_y is None or len(boundary_x) != len(boundary_y):
        raise HTTPException(422, "boundary_x and boundary_y must be the same length")

    if len(boundary_x) == 1:
        return LineString([])
    return LineString(zip(boundary_x, boundary_y))


def bounding_box_query(
    bounding_box: Annotated[list[float], Query(min_length=4, max_length=4)],
) -> BoundingBox:
    return (bounding_box[0], bounding_box[1], bounding_box[2], bounding_box[3])
