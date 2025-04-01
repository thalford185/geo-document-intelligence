"""
Driven port for predicting and completing object boundaries in documents
"""

from abc import ABC, abstractmethod

from geo_document_intelligence.ai.raw_document.core.model import (
    ObjectBoundary,
    PartialObjectBoundary,
    RawDocumentRegion,
)


class ObjectBoundaryDetectorError(Exception): ...


class ObjectBoundaryDetectorDocumentNotFoundError(ObjectBoundaryDetectorError): ...


class ObjectBoundaryDetectorPageNotFoundError(ObjectBoundaryDetectorError): ...


class ObjectBoundaryDetector(ABC):
    @abstractmethod
    async def predict(
        self, raw_document_region: RawDocumentRegion
    ) -> list[ObjectBoundary]:
        """
        :raises ObjectBoundaryDetectorError
        :raises ObjectBoundaryDetectorDocumentNotFoundError
        :raises ObjectBoundaryDetectorPageNotFoundError
        """

    @abstractmethod
    async def complete(
        self,
        raw_document_region: RawDocumentRegion,
        partial_boundary: PartialObjectBoundary,
    ) -> list[PartialObjectBoundary]:
        """
        :raises ObjectBoundaryDetectorError
        :raises ObjectBoundaryDetectorDocumentNotFoundError
        :raises ObjectBoundaryDetectorPageNotFoundError
        """
