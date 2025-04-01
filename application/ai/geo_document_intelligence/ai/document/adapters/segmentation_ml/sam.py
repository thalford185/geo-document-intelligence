"""
Driven adapter for segmenting images using a local SAM2 model
"""

import numpy as np
from sam2.sam2_image_predictor import SAM2ImagePredictor

from geo_document_intelligence.ai.document.core.model import (
    BoundingBox,
    MaskRaster,
    Raster,
)
from geo_document_intelligence.ai.document.core.ports.segmentation_ml import (
    SegmentationMl,
)


class LocalSam2SegmentationMl(SegmentationMl):

    def __init__(self, model: SAM2ImagePredictor):
        self._model = model

    async def get_object_mask(
        self, image: Raster, object_bounding_box: BoundingBox
    ) -> MaskRaster:
        self._model.set_image(image)
        mask, _, _ = self._model.predict(
            multimask_output=False, box=np.array(object_bounding_box)
        )
        return mask[0].astype(np.bool)
