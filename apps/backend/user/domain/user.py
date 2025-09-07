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


@dataclass
class UserInquiry:
    id: str
    user_id: str
    product_id: str | None
    order_id: str | None
    type: str  # 'product', 'order', 'account' 등으로 구분
    content: str
    answer: str | None
    status: str  # pending, answered, closed
    created_at: datetime
    updated_at: datetime


@dataclass
class UserAddress:
    id: str
    user_id: str
    recipient_name: str
    phone_number: str
    zipcode: str
    address_line1: str
    address_line2: str | None
    order_memo: str | None
    is_default: bool
    created_at: datetime
    updated_at: datetime