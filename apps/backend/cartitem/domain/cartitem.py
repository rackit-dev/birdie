from dataclasses import dataclass
from datetime import datetime


@dataclass
class CartItem:
    id: str
    user_id: str
    product_id: str
    is_active: bool
    option_type_1: str | None
    option_1: str | None
    is_option_1_active: bool | None
    option_type_2: str | None
    option_2: str | None
    is_option_2_active: bool | None
    option_type_3: str | None
    option_3: str | None
    is_option_3_active: bool | None
    quantity: int
    created_at: datetime
    updated_at: datetime