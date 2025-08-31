from datetime import datetime
from dataclasses import dataclass


@dataclass
class Order:
    id: str
    user_id: str
    status: str
    subtotal_price: int
    discount_price: int
    total_price: int
    order_coupon_id: str | None
    recipient_name: str
    phone_number: str
    zipcode: str
    address_line1: str
    address_line2: str | None
    order_memo: str | None
    created_at: datetime
    updated_at: datetime


@dataclass
class Coupon:
    id: str
    code: str | None
    description: str | None
    discount_type: str
    discount_rate: int | None
    discount_amount: int | None
    min_order_amount: int
    max_discount_amount: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class CouponWallet:
    id: str
    user_id: str
    coupon_id: str
    is_used: bool
    used_at: datetime | None
    order_id: str | None
    created_at: datetime
    updated_at: datetime


@dataclass
class OrderItem:
    id: str
    order_id: str
    product_id: str
    quantity: int
    price: int
    created_at: datetime
    updated_at: datetime