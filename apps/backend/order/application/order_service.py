from typing import List
from datetime import datetime
from dependency_injector.wiring import inject
from fastapi import HTTPException

from order.domain.order import Order
from order.domain.repository.order_repo import IOrderRepository


class OrderService:
    @inject
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    def create_order(self, user_id: str, product_id: str, quantity: int) -> Order:
        now = datetime.now()
        order = Order(
            id=str(now.timestamp()),
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
            status="PENDING",
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save(order)
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
        self.order_repo.delete(order_id)

    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[Order]]:
        return self.order_repo.get_orders(page, items_per_page)
