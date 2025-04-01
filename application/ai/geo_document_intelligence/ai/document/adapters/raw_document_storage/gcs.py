"""
Driven adapter for retrieving raw documents from Google Cloud Storage as rasters
"""

import numpy as np
from google.cloud.storage import Bucket
from pdf2image import convert_from_bytes

from geo_document_intelligence.ai.document.core.model import Raster
from geo_document_intelligence.ai.document.core.ports.raw_document_storage import (
    RawDocumentStorage,
    RawDocumentStorageNotFoundError,
)


class GcsRawDocumentStorageNotFoundError(RawDocumentStorageNotFoundError): ...


class GcsRawDocumentStorage(RawDocumentStorage):
    def __init__(self, bucket: Bucket):
        self._bucket = bucket

    async def get_by_document_id(self, document_id: str) -> list[Raster]:
        """
        :raises GcsRawDocumentStorageNotFoundError
        """
        path = f"{document_id}.pdf"
        blob = self._bucket.get_blob(path)
        if blob is None:
            raise GcsRawDocumentStorageNotFoundError(
                f"Raw document {document_id} at path {path} not found"
            )
        page_rasters = [
            np.array(image) for image in convert_from_bytes(blob.download_as_bytes())
        ]
        return page_rasters
