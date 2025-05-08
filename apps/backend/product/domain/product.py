from dataclasses import dataclass
from datetime import datetime


@dataclass
class Product:
    id: str
    created_at: datetime
    updated_at: datetime
    pass
