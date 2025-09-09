from dataclasses import dataclass
from datetime import datetime


@dataclass
class CartItem:
    id: str
    user_id: str
    product_id: str
    product_option_id: str | None
    quantity: int
    created_at: datetime
    updated_at: datetime