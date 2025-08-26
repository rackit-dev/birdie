from typing import List
from fastapi import HTTPException
from datetime import datetime

from database import SessionLocal
from utils.db_utils import row_to_dict
from order.domain.repository.order_repo import IOrderRepository
from order.domain.order import Order as OrderVO
from order.infra.db_models.order import Order


class OrderRepository(IOrderRepository):
    def save(self, order: OrderVO):
        new_order = Order(
            id=order.id,
            user_id=order.user_id,
            product_id=order.product_id,
            quantity=order.quantity,
            status=order.status,
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

    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[OrderVO]]:
        with SessionLocal() as db:
            query = db.query(Order)
            total_count = query.count()
            offset = (page - 1) * items_per_page
            orders = query.limit(items_per_page).offset(offset).all()
            return total_count, [OrderVO(**row_to_dict(order)) for order in orders]
