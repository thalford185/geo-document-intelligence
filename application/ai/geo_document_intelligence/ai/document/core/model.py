from dataclasses import dataclass

import numpy as np
import numpy.typing as npt
import shapely

Dimension = tuple[int, int]
BoundingBox = tuple[float, float, float, float]
Raster = npt.NDArray[np.uint8]
MaskRaster = npt.NDArray[np.bool]


@dataclass
class DocumentRegion:
    document_id: str
    page_number: int
    normalized_bounding_box: BoundingBox


@dataclass
class ObjectBoundary:
    normalized_geometry: shapely.LinearRing


@dataclass
class PartialObjectBoundary:
    normalized_geometry: shapely.LineString
