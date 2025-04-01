from fastapi import APIRouter
from google.cloud.storage import Bucket as GcsBucket
from sam2.sam2_image_predictor import SAM2ImagePredictor

from geo_document_intelligence.ai.document.adapters.api import object_boundary
from geo_document_intelligence.ai.document.adapters.raw_document_storage.gcs import (
    GcsRawDocumentStorage,
)
from geo_document_intelligence.ai.document.adapters.segmentation_ml.sam import (
    LocalSam2SegmentationMl,
)
from geo_document_intelligence.ai.document.core.use_cases.segmented_object_boundary import (
    SegmentedObjectBoundaryUseCase,
)

SEGMENTATION_BASED_OBJECT_BOUNDARY_USE_CASE__MAX_SIMPLIFICATION_DISPLACEMENT = 0.01
SEGMENTATION_BASED_OBJECT_BOUNDARY_USE_CASE__MAX_ISLAND_SIZE = 0.01
SEGMENTATION_BASED_OBJECT_BOUNDARY_USE_CASE__MAX_SNAP_DISTANCE = 0.01


def init(gcs_bucket: GcsBucket, sam2_model: SAM2ImagePredictor):
    raw_document_storage = GcsRawDocumentStorage(gcs_bucket)
    segmentation_ml = LocalSam2SegmentationMl(sam2_model)
    object_boundary_use_case = SegmentedObjectBoundaryUseCase(
        raw_document_storage,
        segmentation_ml,
        SEGMENTATION_BASED_OBJECT_BOUNDARY_USE_CASE__MAX_SIMPLIFICATION_DISPLACEMENT,
        SEGMENTATION_BASED_OBJECT_BOUNDARY_USE_CASE__MAX_ISLAND_SIZE,
        SEGMENTATION_BASED_OBJECT_BOUNDARY_USE_CASE__MAX_SNAP_DISTANCE,
    )
    object_boundary.init(object_boundary_use_case)


router = APIRouter(prefix="/documents")
router.include_router(object_boundary.router)
