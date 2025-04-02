"""
FastAPI entrypoint
"""

import logging
import os

from fastapi import FastAPI
from google.cloud.storage import Client as GcsClient
from sam2.sam2_image_predictor import SAM2ImagePredictor

from entrypoints.api.routers import raw_document

app = FastAPI()


@app.get("/")
def read_root():
    return {}


app.include_router(raw_document.router)
logging.basicConfig(level=logging.INFO)

gcs_client = GcsClient()
gcs_bucket = gcs_client.bucket(os.environ["GCS_RAW_DOCUMENTS_BUCKET_NAME"])
sam2_model = SAM2ImagePredictor.from_pretrained(
    os.environ["SAM2_HUGGING_FACE_MODEL_ID"],
    device="cpu",
)
raw_document.init(gcs_bucket, sam2_model)
