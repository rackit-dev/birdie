from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

    database_username: str
    database_password: str
    database_host: str
    database_schema: str
    jwt_secret: str
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str
    iamport_webhook_secret: str
    iamport_webhook_secret_test: str
    iamport_payment_secret: str


@lru_cache
def get_settings():
    return Settings()