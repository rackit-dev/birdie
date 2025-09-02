from datetime import datetime, timezone
from typing import List, Optional
from dependency_injector.wiring import inject
from fastapi import HTTPException
from ulid import ULID

from order.domain.order import Order, Coupon, CouponWallet, OrderItem
from order.domain.repository.order_repo import IOrderRepository


class OrderService:
    @inject
    def __init__(
        self,
        order_repo: IOrderRepository,
    ):
        self.order_repo = order_repo
        self.ulid = ULID()

    def create_order(
        self,
        user_id: str,
        recipient_name: str,
        phone_number: str,
        zipcode: str,
        address_line1: str,
        address_line2: Optional[str],
        order_memo: Optional[str],
        user_coupon_id: Optional[str],
        items: List[dict],
    ) -> Order:
        now = datetime.now()

        # Calculate subtotal price and validate items
        subtotal_price = 0
        order_items = []
        for item in items:
            if item.quantity == None or item.price == None:
                raise HTTPException(status_code=400, detail="Item must include quantity and price")
            item_total_price = item.quantity * item.price
            subtotal_price += item_total_price
            order_items.append(
                OrderItem(
                    id=self.ulid.generate(),
                    order_id="None",  # Will be set after order creation
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=item.price,
                    created_at=now,
                    updated_at=now,
                )
            )

        # Calculate discount price
        discount_price = 0
        if user_coupon_id:
            coupon = self.order_repo.find_coupon_by_id(user_coupon_id)
            discount_price = min(
                coupon.discount_amount or 0,
                coupon.max_discount_amount,
            )

        # Calculate total price
        total_price = subtotal_price - discount_price

        # Create order
        order = Order(
            id=self.ulid.generate(),
            user_id=user_id,
            status="결제대기",
            subtotal_price=subtotal_price,
            discount_price=discount_price,
            total_price=total_price,
            user_coupon_id=user_coupon_id,
            recipient_name=recipient_name,
            phone_number=phone_number,
            zipcode=zipcode,
            address_line1=address_line1,
            address_line2=address_line2,
            order_memo=order_memo,
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save(order)

        # Save order items
        for item in order_items:
            item.order_id = order.id
            self.order_repo.save_order_item(item)

        return order

    def get_order(self, order_id: str) -> Order:
        return self.order_repo.find_by_id(order_id)

    def update_order(self, order_id: str, status: str) -> Order:
        order = self.order_repo.find_by_id(order_id)
        order.status = status
        order.updated_at = datetime.now()
        self.order_repo.update(order)
        return order

    def delete_order(self, order_id: str):
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        self.order_repo.delete(order_id)

    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[Order]]:
        return self.order_repo.get_orders(page, items_per_page)

    def create_coupon(
        self,
        code: str | None,
        description: str | None,
        discount_type: str,
        discount_rate: int | None,
        discount_amount: int | None,
        min_order_amount: int,
        max_discount_amount: int,
        valid_from: datetime,
        valid_until: datetime,
    ) -> Coupon:
        now = datetime.now(timezone.utc)  # Ensure `now` is timezone-aware

        # Validation logic
        if discount_type not in ["비율", "정액"]:
            raise HTTPException(status_code=400, detail="Invalid discount type. Must be '비율' or '정액'.")

        if discount_type == "비율":
            if discount_rate is None or not (0 < discount_rate <= 99):
                raise HTTPException(status_code=400, detail="Discount rate must be between 1 and 99 for '비율' type.")
            if discount_amount is not None:
                raise HTTPException(status_code=400, detail="Discount amount must be None for '비율' type.")

        if discount_type == "정액":
            if discount_amount is None or discount_amount <= 0:
                raise HTTPException(status_code=400, detail="Discount amount must be greater than 0 for '정액' type.")
            if discount_rate is not None:
                raise HTTPException(status_code=400, detail="Discount rate must be None for '정액' type.")

        if valid_from >= valid_until:
            raise HTTPException(status_code=400, detail="valid_from must be earlier than valid_until.")

        if valid_until <= now:
            raise HTTPException(status_code=400, detail="valid_until must be a future date.")

        # Create coupon
        coupon = Coupon(
            id=self.ulid.generate(),
            code=code,
            description=description,
            discount_type=discount_type,
            discount_rate=discount_rate,
            discount_amount=discount_amount,
            min_order_amount=min_order_amount,
            max_discount_amount=max_discount_amount,
            valid_from=valid_from,
            valid_until=valid_until,
            is_active=True,
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save_coupon(coupon)
        return coupon

    def get_coupon(self, coupon_id: str) -> Coupon:
        return self.order_repo.find_coupon_by_id(coupon_id)

    def mark_coupon_inactive(self, coupon_id: str):
        coupon = self.order_repo.find_coupon_by_id(coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        coupon.is_active = False
        coupon.updated_at = datetime.now()
        self.order_repo.update_coupon(coupon)

    def get_coupons(self, page: int, items_per_page: int) -> tuple[int, List[Coupon]]:
        return self.order_repo.get_coupons(page, items_per_page)

    def create_coupon_wallet(self, user_id: str, coupon_id: str) -> CouponWallet:
        now = datetime.now()
        coupon_wallet = CouponWallet(
            id=self.ulid.generate(),
            user_id=user_id,
            coupon_id=coupon_id,
            is_used=False,
            used_at=None,
            order_id=None,
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save_coupon_wallet(coupon_wallet)
        return coupon_wallet

    def get_coupon_wallet(self, coupon_wallet_id: str) -> CouponWallet:
        return self.order_repo.find_coupon_wallet_by_id(coupon_wallet_id)

    def delete_coupon_wallet(self, coupon_wallet_id: str):
        coupon_wallet = self.order_repo.find_coupon_wallet_by_id(coupon_wallet_id)
        if not coupon_wallet:
            raise HTTPException(status_code=404, detail="CouponWallet not found")
        self.order_repo.delete_coupon_wallet(coupon_wallet_id)

    def get_coupon_wallets(self, page: int, items_per_page: int) -> tuple[int, List[CouponWallet]]:
        return self.order_repo.get_coupon_wallets(page, items_per_page)

    def get_coupon_wallets_by_user(self, user_id: str) -> List[CouponWallet]:
        return self.order_repo.get_coupon_wallets_by_user(user_id)