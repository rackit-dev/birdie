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
class ProductOptionType:
    id: str
    product_id: str
    option_type: str
    created_at: datetime
    updated_at: datetime


@dataclass
class ProductOption:
    id: str
    product_id: str
    product_option_type_id: str
    option: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class ProductLike:
    id: str
    user_id: str
    product_id: str
    created_at: datetime


@dataclass
class ProductReview:
    id: str
    user_id: str
    user_name: str
    product_id: str
    rating: int  # 1 ~ 5
    content: str | None
    created_at: datetime
    updated_at: datetime
    visible: bool