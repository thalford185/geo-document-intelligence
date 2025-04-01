"""
Factories for document core test data
"""

import shapely

from geo_document_intelligence.ai.document.core.model import (
    BoundingBox,
    DocumentRegion,
    ObjectBoundary,
    PartialObjectBoundary,
)


def document_region(
    document_id: str = "00000000-0000-0000-0000-00000000000000",
    page_number: int = 1,
    normalized_bounding_box: BoundingBox = (0.25, 0.25, 0.75, 0.75),
) -> DocumentRegion:
    return DocumentRegion(
        document_id=document_id,
        page_number=page_number,
        normalized_bounding_box=normalized_bounding_box,
    )


def object_boundary(
    normalized_geometry: shapely.LinearRing = shapely.LinearRing(
        [[0.4, 0.4], [0.4, 0.6], [0.5, 0.6]]
    )
) -> ObjectBoundary:
    return ObjectBoundary(normalized_geometry=normalized_geometry)


def partial_object_boundary(
    normalized_geometry: shapely.LineString = shapely.LineString(
        [[0.4, 0.4], [0.4, 0.6]]
    )
) -> PartialObjectBoundary:
    return PartialObjectBoundary(normalized_geometry=normalized_geometry)


def pdf_bytes() -> bytes:
    return b"""
%PDF-1.
1 0 obj<</Pages 2 0 R>>endobj
2 0 obj<</Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Parent 2 0 R>>endobj
trailer <</Root 1 0 R>>
    """
