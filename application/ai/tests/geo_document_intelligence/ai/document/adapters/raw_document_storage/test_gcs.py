from unittest.mock import Mock

import pytest

from geo_document_intelligence.ai.document.adapters.raw_document_storage.gcs import (
    GcsRawDocumentStorage,
    GcsRawDocumentStorageNotFoundError,
)
from tests.geo_document_intelligence.ai.document import make


async def test_get_by_document_id__success(gcs_bucket: Mock, gcs_blob: Mock) -> None:
    raw_document_storage = GcsRawDocumentStorage(gcs_bucket)
    gcs_blob.download_as_bytes.return_value = make.pdf_bytes()
    raw_document = await raw_document_storage.get_by_document_id(
        "00000000-0000-0000-0000-00000000000000"
    )
    assert len(raw_document) > 0
    gcs_bucket.get_blob.assert_called_once_with(
        "00000000-0000-0000-0000-00000000000000.pdf"
    )
    gcs_blob.download_as_bytes.assert_called_once()


async def test_get_by_document_id__error(gcs_bucket: Mock) -> None:
    gcs_bucket.get_blob.return_value = None
    raw_document_storage = GcsRawDocumentStorage(gcs_bucket)
    with pytest.raises(GcsRawDocumentStorageNotFoundError):
        await raw_document_storage.get_by_document_id(
            "00000000-0000-0000-0000-00000000000000"
        )
    gcs_bucket.get_blob.assert_called_once_with(
        "00000000-0000-0000-0000-00000000000000.pdf"
    )
