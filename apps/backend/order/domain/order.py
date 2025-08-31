from datetime import datetime
from dataclasses import dataclass
from pydantic import BaseModel
from typing import Optional


@dataclass
class Order(BaseModel):
    id: str
    user_id: str
    status: str
    subtotal_price: int
    discount_price: int
    total_price: int
    user_coupon_id: Optional[str]
    recipient_name: str
    phone_number: str
    zipcode: str
    address_line1: str
    address_line2: Optional[str]
    order_memo: Optional[str]
    created_at: datetime
    updated_at: datetime


@dataclass
class Coupon(BaseModel):
    id: str
    code: Optional[str]
    description: Optional[str]
    discount_type: str
    discount_rate: Optional[int]
    discount_amount: Optional[int]
    min_order_amount: int
    max_discount_amount: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class CouponWallet(BaseModel):
    id: str
    user_id: str
    coupon_id: str
    is_used: bool
    used_at: Optional[datetime]
    order_id: Optional[str]
    created_at: datetime
    updated_at: datetime


@dataclass
class OrderItem(BaseModel):
    id: str
    order_id: str
    product_id: str
    quantity: int
    price: int
    created_at: datetime
    updated_at: datetime