from datetime import datetime
from typing import Annotated, List
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from containers import Container
from order.application.order_service import OrderService

router = APIRouter(prefix="/orders")


class OrderResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    quantity: int
    status: str
    created_at: datetime
    updated_at: datetime


@router.post("", response_model=OrderResponse)
@inject
def create_order(
    user_id: str,
    product_id: str,
    quantity: int,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order = order_service.create_order(user_id, product_id, quantity)
    return order


@router.get("/{order_id}", response_model=OrderResponse)
@inject
def get_order(
    order_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    return order_service.get_order(order_id)


@router.put("/{order_id}", response_model=OrderResponse)
@inject
def update_order(
    order_id: str,
    status: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    return order_service.update_order(order_id, status)


@router.delete("/{order_id}", status_code=204)
@inject
def delete_order(
    order_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order_service.delete_order(order_id)


class GetOrdersResponse(BaseModel):
    total_count: int
    orders: List[OrderResponse]


@router.get("", response_model=GetOrdersResponse)
@inject
def get_orders(
    page: int = 1,
    items_per_page: int = 10,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    total_count, orders = order_service.get_orders(page, items_per_page)
    return {"total_count": total_count, "orders": orders}
