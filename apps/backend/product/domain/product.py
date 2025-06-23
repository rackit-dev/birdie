from dataclasses import dataclass
from datetime import datetime


@dataclass
class Product:
    id: str
    product_number: int
    name: str
    price_whole: int
    price_sell: int
    discount_rate: int   # 0 ~ 100
    is_active: bool
    category_main: str   # 대분류
    category_sub: str    # 소분류
    created_at: datetime
    updated_at: datetime


@dataclass
class ProductOption:
    id: str
    product_id: str
    option: str
    is_active: bool
    created_at: datetime
    updated_at: datetime