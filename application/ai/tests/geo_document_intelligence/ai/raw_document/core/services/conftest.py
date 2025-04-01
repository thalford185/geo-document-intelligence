"""
Fixtures of mocks implementing driven ports
"""

from unittest.mock import Mock

import numpy as np
import pytest

from geo_document_intelligence.ai.raw_document.core.ports.driven.raw_document_storage import (
    RawDocumentStorage,
)
from geo_document_intelligence.ai.raw_document.core.ports.driven.segmentation_ml import (
    SegmentationMl,
)


@pytest.fixture
def raw_document_storage() -> Mock:
    mock = Mock(spec=RawDocumentStorage)
    mock.get_by_document_id.return_value = [np.array([], np.uint8)]
    return mock


@pytest.fixture
def segmentation_ml() -> Mock:
    mock = Mock(spec=SegmentationMl)
    mock.get_object_mask.return_value = None
    return mock
