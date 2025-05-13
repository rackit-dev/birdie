from contextlib import contextmanager
from boto3 import session
from config import get_settings

settings = get_settings()

aws_session = session.Session(
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region,
)
bucket = aws_session.client("s3")

@contextmanager
def bucket_session():
    try:
        yield bucket
    finally:
        pass