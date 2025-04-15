"""
Driven adapter for segmenting images using a local SAM2 model, optionally with GPU acceleration
via CUDA.
"""

from typing import Literal

import numpy as np
import torch
from sam2.sam2_image_predictor import SAM2ImagePredictor

from geo_document_intelligence.ai.raw_document.core.model import (
    BoundingBox,
    MaskRaster,
    Raster,
)
from geo_document_intelligence.ai.raw_document.core.ports.driven.segmentation_ml import (
    SegmentationMl,
)


class LocalSam2SegmentationMl(SegmentationMl):

    def __init__(self, model: SAM2ImagePredictor, device: Literal["cpu", "cuda"]):
        self._model = model
        self._device = device

    async def get_object_mask(
        self, image: Raster, object_bounding_box: BoundingBox
    ) -> MaskRaster:
        with torch.inference_mode(), torch.autocast(self._device, dtype=torch.bfloat16):
            self._model.set_image(image)
            mask, _, _ = self._model.predict(
                multimask_output=False, box=np.array(object_bounding_box)
            )
        return mask[0].astype(np.bool)
