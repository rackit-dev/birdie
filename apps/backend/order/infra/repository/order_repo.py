from typing import List
from fastapi import HTTPException

from database import SessionLocal
from utils.db_utils import row_to_dict
from order.domain.repository.order_repo import IOrderRepository
from order.domain.order import Order as OrderVO
from order.domain.order import Coupon as CouponVO
from order.domain.order import CouponWallet as CouponWalletVO
from order.domain.order import OrderItem as OrderItemVO
from order.infra.db_models.order import Order, Coupon, CouponWallet, OrderItem


class OrderRepository(IOrderRepository):
    def save(self, order: OrderVO):
        new_order = Order(
            id=order.id,
            user_id=order.user_id,
            status=order.status,
            subtotal_price=order.subtotal_price,
            discount_price=order.discount_price,
            total_price=order.total_price,
            order_coupon_id=order.user_coupon_id,
            recipient_name=order.recipient_name,
            phone_number=order.phone_number,
            zipcode=order.zipcode,
            address_line1=order.address_line1,
            address_line2=order.address_line2,
            order_memo=order.order_memo,
            created_at=order.created_at,
            updated_at=order.updated_at,
        )
        with SessionLocal() as db:
            db.add(new_order)
            db.commit()

    def find_by_id(self, id: str) -> OrderVO:
        with SessionLocal() as db:
            order = db.query(Order).filter(Order.id == id).first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            return OrderVO(**row_to_dict(order))

    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[OrderVO]]:
        with SessionLocal() as db:
            query = db.query(Order)
            total_count = query.count()
            offset = (page - 1) * items_per_page
            orders = query.limit(items_per_page).offset(offset).all()
            return total_count, [OrderVO(**row_to_dict(order)) for order in orders]

    def update(self, order_vo: OrderVO):
        with SessionLocal() as db:
            order = db.query(Order).filter(Order.id == order_vo.id).first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            order.status = order_vo.status
            order.updated_at = order_vo.updated_at
            db.add(order)
            db.commit()

    def delete(self, id: str):
        with SessionLocal() as db:
            order = db.query(Order).filter(Order.id == id).first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            db.delete(order)
            db.commit()

    def save_order_item(self, order_item: OrderItemVO):
        new_order_item = OrderItem(
            id=order_item.id,
            order_id=order_item.order_id,  # Ensure order_id is set correctly
            product_id=order_item.product_id,
            quantity=order_item.quantity,
            price=order_item.price,
            created_at=order_item.created_at,
            updated_at=order_item.updated_at,
        )
        with SessionLocal() as db:
            db.add(new_order_item)
            db.commit()

    def find_coupon_by_id(self, coupon_id: str) -> CouponVO:
        with SessionLocal() as db:
            coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
            if not coupon or not coupon.is_active:
                raise HTTPException(status_code=400, detail="Invalid or inactive coupon")
            return CouponVO(**row_to_dict(coupon))