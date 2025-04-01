from unittest.mock import Mock

import pytest
from google.cloud.storage import Bucket as GcsBucket
from sam2.sam2_image_predictor import SAM2ImagePredictor


@pytest.fixture
def gcs_blob(gcs_bucket: Mock) -> Mock:
    return gcs_bucket.get_blob.return_value


@pytest.fixture(name="gcs_bucket")
def fixture_gcs_bucket() -> Mock:
    bucket = Mock(spec=GcsBucket)
    return bucket


@pytest.fixture
def sam2_model() -> Mock:
    mock = Mock(spec=SAM2ImagePredictor)
    return mock
