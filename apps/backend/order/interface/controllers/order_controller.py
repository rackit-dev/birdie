from datetime import datetime
from typing import List
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from containers import Container
from order.application.order_service import OrderService

router = APIRouter(prefix="/orders")


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    quantity: int
    price: int
    created_at: datetime
    updated_at: datetime


class OrderResponse(BaseModel):
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


class CreateOrderItemRequest(BaseModel):
    product_id: str
    quantity: int
    price: int


class CreateOrderRequest(BaseModel):
    user_id: str
    recipient_name: str
    phone_number: str
    zipcode: str
    address_line1: str
    address_line2: str | None
    order_memo: str | None
    user_coupon_id: str | None
    items: List[CreateOrderItemRequest]


@router.post("", response_model=OrderResponse)
@inject
def create_order(
    request: CreateOrderRequest,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order = order_service.create_order(
        user_id=request.user_id,
        recipient_name=request.recipient_name,
        phone_number=request.phone_number,
        zipcode=request.zipcode,
        address_line1=request.address_line1,
        address_line2=request.address_line2,
        order_memo=request.order_memo,
        user_coupon_id=request.user_coupon_id,
        items=request.items,
    )
    return order


@router.get("/by_id", response_model=OrderResponse)
@inject
def get_order(
    order_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    return order_service.get_order(order_id)


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

"""
@router.put("", response_model=OrderResponse)
@inject
def update_order(
    order_id: str,
    status: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    return order_service.update_order(order_id, status)

@router.delete("", status_code=204)
@inject
def delete_order(
    order_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order_service.delete_order(order_id)
"""