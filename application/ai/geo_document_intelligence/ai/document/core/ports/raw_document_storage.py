"""
Driven port for retrieving raw documents as rasters
"""

from abc import ABC, abstractmethod

from geo_document_intelligence.ai.document.core.model import Raster


class RawDocumentStorageError(Exception): ...


class RawDocumentStorageNotFoundError(RawDocumentStorageError): ...


class RawDocumentStorage(ABC):
    @abstractmethod
    async def get_by_document_id(self, document_id: str) -> list[Raster]:
        """
        :raises RawDocumentStorageError
        :raises RawDocumentStorageNotFoundError
        """
