from datetime import datetime
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
            if "quantity" not in item or "price" not in item:
                raise HTTPException(status_code=400, detail="Item must include quantity and price")
            item_total_price = item["quantity"] * item["price"]
            subtotal_price += item_total_price
            order_items.append(
                OrderItem(
                    id=self.ulid.generate(),
                    order_id=None,  # Will be set after order creation
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    price=item["price"],
                    created_at=now,
                    updated_at=now,
                )
            )

        # Calculate discount price
        discount_price = 0
        if user_coupon_id:
            coupon = self.order_repo.find_coupon_by_id(user_coupon_id)
            if not coupon or not coupon.is_active:
                raise HTTPException(status_code=400, detail="Invalid or inactive coupon")
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
            status="PENDING",
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
            item["order_id"] = order.id
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