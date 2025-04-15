from unittest.mock import Mock

import numpy as np

from geo_document_intelligence.ai.raw_document.adapters.driven.segmentation_ml.local_sam2 import (
    LocalSam2SegmentationMl,
)


async def test_get_object_mask(sam2_model: Mock) -> None:
    sam2_model.predict.return_value = np.zeros((1, 0, 0), np.float32), None, None
    segmentation_ml = LocalSam2SegmentationMl(sam2_model, "cpu")
    object_mask = await segmentation_ml.get_object_mask(
        np.zeros((0, 0), np.uint8), (0, 0, 0, 0)
    )
    assert object_mask.dtype == np.bool
