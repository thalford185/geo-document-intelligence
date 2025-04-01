"""
Fixtures for mocking driving port implementations
"""

from unittest.mock import Mock

import pytest

from geo_document_intelligence.ai.raw_document.core.ports.driving.object_boundary_detector import (
    ObjectBoundaryDetector,
)


@pytest.fixture
def object_boundary_detector() -> Mock:
    mock = Mock(spec=ObjectBoundaryDetector)
    mock.predict.return_value = []
    mock.complete.return_value = []
    return mock
