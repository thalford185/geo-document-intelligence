"""
Fixtures of mocks implementing driving ports
"""

from unittest.mock import Mock

import pytest

from geo_document_intelligence.ai.document.core.ports.object_boundary_use_case import (
    ObjectBoundaryUseCase as ObjectBoundaryUseCasePort,
)


@pytest.fixture
def object_boundary_use_case() -> Mock:
    mock = Mock(spec=ObjectBoundaryUseCasePort)
    mock.predict.return_value = []
    mock.complete.return_value = []
    return mock
