from datetime import datetime
from dataclasses import dataclass


@dataclass
class Order:
    id: str
    user_id: str
    status: str
    subtotal_price: int
    coupon_discount_price: int
    point_discount_price: int
    total_price: int
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
    created_at: datetime
    updated_at: datetime


@dataclass
class OrderItem:
    id: str
    order_id: str
    product_id: str
    product_name: str
    coupon_wallet_id: str | None
    status: str
    quantity: int
    unit_price: int
    coupon_discount_price: int
    point_discount_price: int
    final_price: int
    option_1_type: str | None
    option_1_value: str | None
    option_2_type: str | None
    option_2_value: str | None
    option_3_type: str | None
    option_3_value: str | None
    created_at: datetime
    updated_at: datetime


@dataclass
class Payment:
    id: str
    order_id: str
    merchant_id: str
    status: str
    method: str
    amount: int
    paid_at: datetime | None
    created_at: datetime
    updated_at: datetime


@dataclass
class PointTransaction:
    id: str
    user_id: str
    order_id: str | None
    type: str
    amount: int
    balance_after: int
    created_at: datetime
    updated_at: datetime


@dataclass
class Refund:
    id: str
    order_id: str
    payment_id: str
    merchant_id: str
    status: str
    amount: int
    restore_point_amount: int
    created_at: datetime
    updated_at: datetime
    memo: str | None