from typing import Literal

from fastapi import APIRouter
from google.cloud.storage import Bucket as GcsBucket
from sam2.sam2_image_predictor import SAM2ImagePredictor

from geo_document_intelligence.ai.raw_document.adapters.driven.raw_document_storage.gcs import (
    GcsRawDocumentStorage,
)
from geo_document_intelligence.ai.raw_document.adapters.driven.segmentation_ml.local_sam2 import (
    LocalSam2SegmentationMl,
)
from geo_document_intelligence.ai.raw_document.adapters.driving.api import (
    object_boundary,
)
from geo_document_intelligence.ai.raw_document.core.services.segmented_object_boundary_detector import (
    SegmentedObjectBoundaryDetector,
)

SEGMENTED_OBJECT_BOUNDARY_DETECTOR__MAX_SIMPLIFICATION_DISPLACEMENT = (
    0.005  # 0.5% of document dimension
)
SEGMENTED_OBJECT_BOUNDARY_DETECTOR__MAX_ISLAND_SIZE = 0.01  # 1% of document dimension
SEGMENTED_OBJECT_BOUNDARY_DETECTOR__MAX_SNAP_DISTANCE = 0.01  # 1% of document dimension


def init(
    gcs_bucket: GcsBucket,
    sam2_model: SAM2ImagePredictor,
    torch_device: Literal["cuda", "cpu"],
):
    raw_document_storage = GcsRawDocumentStorage(gcs_bucket)
    segmentation_ml = LocalSam2SegmentationMl(sam2_model, torch_device)
    object_boundary_detector = SegmentedObjectBoundaryDetector(
        raw_document_storage,
        segmentation_ml,
        SEGMENTED_OBJECT_BOUNDARY_DETECTOR__MAX_SIMPLIFICATION_DISPLACEMENT,
        SEGMENTED_OBJECT_BOUNDARY_DETECTOR__MAX_ISLAND_SIZE,
        SEGMENTED_OBJECT_BOUNDARY_DETECTOR__MAX_SNAP_DISTANCE,
    )
    object_boundary.init(object_boundary_detector)


router = APIRouter(prefix="/raw-documents")
router.include_router(object_boundary.router)
