from sqlalchemy import String, Numeric, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import mapped_column
from database import Base


class Order(Base):
    __tablename__ = "Orders"

    id = mapped_column(String(36), primary_key=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)

    status = mapped_column(
        Enum("결제대기", "결제완료", "상품준비중", "배송중", "배송완료", "구매확정", "주문취소", "부분취소", name="status"),
        default="결제대기",
        nullable=False
    )

    subtotal_price = mapped_column(Numeric(10, 0), nullable=False)   # 상품 원가 합계
    coupon_discount_price = mapped_column(Numeric(10, 0), default=0) # 할인된 금액 (쿠폰)
    point_discount_price = mapped_column(Numeric(10, 0), default=0)  # 할인된 금액 (포인트)
    total_price = mapped_column(Numeric(10, 0), nullable=False)      # 최종 결제 금액

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
    code = mapped_column(String(64), unique=True, nullable=True)
    description = mapped_column(String(36), nullable=True)     

    discount_type = mapped_column(Enum("비율", "정액", name="discount_type"), nullable=False)
    discount_rate = mapped_column(Numeric(2, 0), nullable=True)    # 할인율 (~99%)
    discount_amount = mapped_column(Numeric(7, 0), nullable=True)  # 금액 (~9,999,999원)

    min_order_amount = mapped_column(Numeric(7, 0), default=0)          # 최소 주문 금액 조건
    max_discount_amount = mapped_column(Numeric(7, 0), nullable=False)  # 할인 시 상한선

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

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)


class OrderItem(Base):
    __tablename__ = "OrderItem"

    id = mapped_column(String(36), primary_key=True)
    order_id = mapped_column(ForeignKey("Orders.id"), nullable=False)
    product_id = mapped_column(ForeignKey("Product.id"), nullable=False)
    coupon_wallet_id = mapped_column(ForeignKey("CouponWallet.id"), nullable=True)

    status = mapped_column(Enum("주문완료", "주문취소", "환불", name="status"), default="주문완료")

    # 상품 정보(스냅샷)
    quantity = mapped_column(Numeric(5, 0), nullable=False)
    unit_price = mapped_column(Numeric(10, 0), nullable=False)
    coupon_discount_price = mapped_column(Numeric(10, 0), default=0)  # 할인된 금액 (쿠폰)
    point_discount_price = mapped_column(Numeric(10, 0), default=0)   # 할인된 금액 (포인트)
    final_price = mapped_column(Numeric(10, 0), nullable=False)       # 최종 결제 금액

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)


class Payment(Base):
    __tablename__ = "Payment"

    id = mapped_column(String(36), primary_key=True)
    order_id = mapped_column(ForeignKey("Orders.id"), nullable=False, unique=True)

    status = mapped_column(Enum("대기중", "성공", "실패", name="status"), default="대기중")
    method = mapped_column(Enum("카드", "휴대폰", "카카오페이", "토스페이", "포인트", name="method"), nullable=False)
    amount = mapped_column(Numeric(10, 0), nullable=False)
    paid_at = mapped_column(DateTime, nullable=True)

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)


class PointTransaction(Base):
    __tablename__ = "PointTransaction"

    id = mapped_column(String(36), primary_key=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)
    order_id = mapped_column(ForeignKey("Orders.id"), nullable=True)

    type = mapped_column(Enum("적립", "사용", "취소", name="type"), nullable=False)
    amount = mapped_column(Numeric(5, 0), nullable=False)
    balance_after = mapped_column(Numeric(10, 0), nullable=False)

    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)