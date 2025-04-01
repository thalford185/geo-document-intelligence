"""
Driven port for predicting and completing object boundaries in documents
"""

from abc import ABC, abstractmethod

from geo_document_intelligence.ai.document.core.model import (
    DocumentRegion,
    ObjectBoundary,
    PartialObjectBoundary,
)


class ObjectBoundaryUseCaseError(Exception): ...


class ObjectBoundaryUseCaseDocumentNotFoundError(ObjectBoundaryUseCaseError): ...


class ObjectBoundaryUseCasePageNotFoundError(ObjectBoundaryUseCaseError): ...


class ObjectBoundaryUseCase(ABC):
    @abstractmethod
    async def predict(self, document_region: DocumentRegion) -> list[ObjectBoundary]:
        """
        :raises ObjectBoundaryUseCaseError
        :raises ObjectBoundaryUseCaseDocumentNotFoundError
        :raises ObjectBoundaryUseCasePageNotFoundError
        """

    @abstractmethod
    async def complete(
        self, document_region: DocumentRegion, partial_boundary: PartialObjectBoundary
    ) -> list[PartialObjectBoundary]:
        """
        :raises ObjectBoundaryUseCaseError
        :raises ObjectBoundaryUseCaseNotFoundError
        :raises ObjectBoundaryUseCasePageNotFoundError
        """
