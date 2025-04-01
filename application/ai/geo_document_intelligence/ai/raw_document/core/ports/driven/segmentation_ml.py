"""
Driven port for segmenting images with machine learning
"""

from abc import ABC, abstractmethod

from geo_document_intelligence.ai.raw_document.core.model import (
    BoundingBox,
    MaskRaster,
    Raster,
)


class SegmentationMlError(Exception): ...


class SegmentationMl(ABC):
    @abstractmethod
    async def get_object_mask(
        self, image: Raster, object_bounding_box: BoundingBox
    ) -> MaskRaster:
        """
        :raises SegmentationMlError
        """
