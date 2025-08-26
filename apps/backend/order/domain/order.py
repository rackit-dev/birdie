from datetime import datetime
from pydantic import BaseModel


class Order(BaseModel):
    id: str
    user_id: str
    product_id: str
    quantity: int
    status: str
    created_at: datetime
    updated_at: datetime
