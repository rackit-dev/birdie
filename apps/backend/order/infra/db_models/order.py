from sqlalchemy import String, Numeric, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import mapped_column
from database import Base


class Order(Base):
    __tablename__ = "Orders"

    id = mapped_column(String(36), primary_key=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)

    status = mapped_column(
        Enum("결제대기", "결제완료", "상품준비중", "배송중", "배송완료", "구매확정", "주문취소", name="order_status"),
        default="결제대기",
        nullable=False
    )

    subtotal_price = mapped_column(Numeric(10, 0), nullable=False)  # 상품 원가 합계
    discount_price = mapped_column(Numeric(10, 0), default=0)       # 할인된 금액
    total_price = mapped_column(Numeric(10, 0), nullable=False)     # 최종 결제 금액

    order_coupon_id = mapped_column(ForeignKey("CouponWallet.id"), nullable=True)  # 적용된 쿠폰 (사용자 쿠폰 지갑에서)

    # 배송지 (스냅샷)
    recipient_name = mapped_column(String(32), nullable=False)
    phone_number = mapped_column(String(32), nullable=False)
    zipcode = mapped_column(String(16), nullable=False)
    address_line1 = mapped_column(String(128), nullable=False)
    address_line2 = mapped_column(String(128), nullable=True)
    order_memo = mapped_column(Text, nullable=True)

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)


class Coupon(Base):
    __tablename__ = "Coupon"

    id = mapped_column(String(36), primary_key=True)
    code = mapped_column(String(32), unique=True, nullable=True)  # 프로모션 코드
    description = mapped_column(String(64), nullable=True)

    discount_type = mapped_column(Enum("비율", "정액", name="discount_type"), nullable=False)
    discount_rate = mapped_column(Numeric(2, 0), nullable=True)  # 할인율 (~99%)
    discount_amount = mapped_column(Numeric(7, 0), nullable=True)  # 금액 (~9,999,999원)

    min_order_amount = mapped_column(Numeric(7, 0), default=0)  # 최소 주문 금액 조건
    max_discount_amount = mapped_column(Numeric(7, 0), nullable=False)  # 퍼센트 할인 시 상한선

    valid_from = mapped_column(DateTime, nullable=False)
    valid_until = mapped_column(DateTime, nullable=False)
    is_active = mapped_column(Boolean, default=True)

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)


class CouponWallet(Base):
    __tablename__ = "CouponWallet"

    id = mapped_column(String(36), primary_key=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)
    coupon_id = mapped_column(ForeignKey("Coupon.id"), nullable=False)

    is_used = mapped_column(Boolean, default=False)
    used_at = mapped_column(DateTime, nullable=True)
    order_id = mapped_column(String(36), nullable=True)

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)


class OrderItem(Base):
    __tablename__ = "OrderItem"

    id = mapped_column(String(36), primary_key=True)
    order_id = mapped_column(ForeignKey("Order.id"), nullable=False)
    product_id = mapped_column(ForeignKey("Product.id"), nullable=False)

    # 상품 정보(스냅샷)
    quantity = mapped_column(Numeric(5, 0), nullable=False)
    price = mapped_column(Numeric(10, 0), nullable=False)

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)