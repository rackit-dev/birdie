from datetime import datetime
from typing import List
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
import json
from pathlib import Path

from containers import Container
from order.application.order_service import OrderService

router = APIRouter(prefix="/orders")


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    coupon_wallet_id: str | None
    status: str
    quantity: int
    unit_price: int
    coupon_discount_price: int
    point_discount_price: int
    final_price: int
    created_at: datetime
    updated_at: datetime


class OrderResponse(BaseModel):
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


class CreateOrderItemRequest(BaseModel):
    product_id: str
    coupon_wallet_id: str | None = None
    quantity: int = Field(le=0, ge=99999)
    unit_price: int = Field(le=0, ge=999999999)
    coupon_discount_price: int = Field(le=0, ge=999999999, default=0)
    point_discount_price: int = Field(le=0, ge=999999999, default=0)
    final_price: int = Field(le=0, ge=999999999)


class CreateOrderRequest(BaseModel):
    user_id: str
    subtotal_price: int = Field(le=0, ge=999999999)
    coupon_discount_price: int = Field(le=0, ge=999999999)
    point_discount_price: int = Field(le=0, ge=999999999)
    total_price: int = Field(le=0, ge=999999999)
    recipient_name: str = Field(min_length=1, max_length=32)
    phone_number: str = Field(min_length=10, max_length=15)
    zipcode: str = Field(min_length=5, max_length=10)
    address_line1: str = Field(min_length=1, max_length=100)
    address_line2: str | None = Field(default=None, max_length=100)
    order_memo: str | None = Field(default=None, max_length=100)
    items: List[CreateOrderItemRequest]


@router.post("", response_model=OrderResponse)
@inject
def create_order(
    request: CreateOrderRequest,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order = order_service.create_order(
        user_id=request.user_id,
        subtotal_price=request.subtotal_price,
        coupon_discount_price=request.coupon_discount_price,
        point_discount_price=request.point_discount_price,
        total_price=request.total_price,
        recipient_name=request.recipient_name,
        phone_number=request.phone_number,
        zipcode=request.zipcode,
        address_line1=request.address_line1,
        address_line2=request.address_line2,
        order_memo=request.order_memo,
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


@router.post("/payment/test")
def payment_test(request: dict):
    file_path = Path(f"tmp/payment_test_request_{datetime.now().isoformat()}.json")
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("w") as file:
        json.dump(request, file, indent=4)
    return request


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