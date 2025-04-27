from dataclasses import dataclass
from datetime import datetime


@dataclass
class User:
    id: str
    name: str
    provider: str | None
    provider_id: str | None
    email: str
    password: str | None
    memo: str | None
    created_at: datetime
    updated_at: datetime