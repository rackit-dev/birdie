from datetime import datetime
from typing import List
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from containers import Container
from order.application.order_service import OrderService

router = APIRouter(prefix="/orders")


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    product_name: str
    coupon_wallet_id: str | None
    status: str
    quantity: int
    unit_price: int
    coupon_discount_price: int
    point_discount_price: int
    final_price: int
    option_1_type: str | None
    option_1_value: str | None
    option_2_type: str | None
    option_2_value: str | None
    option_3_type: str | None
    option_3_value: str | None
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


class GetOrderResponse(BaseModel):
    order: OrderResponse
    items: List[OrderItemResponse]

class GetOrdersResponse(BaseModel):
    total_count: int
    orders: List[OrderResponse]


class CreateOrderItemRequest(BaseModel):
    product_id: str
    product_name: str = Field(min_length=1, max_length=128)
    coupon_wallet_id: str | None = None
    quantity: int = Field(ge=0, le=99999)
    unit_price: int = Field(ge=0, le=999999999)
    coupon_discount_price: int = Field(ge=0, le=999999999, default=0)
    point_discount_price: int = Field(ge=0, le=999999999, default=0)
    final_price: int = Field(ge=0, le=999999999)
    option_1_type: str | None = None
    option_1_value: str | None = None
    option_2_type: str | None = None
    option_2_value: str | None = None
    option_3_type: str | None = None
    option_3_value: str | None = None


class CreateOrderRequest(BaseModel):
    user_id: str
    subtotal_price: int = Field(ge=0, le=999999999)
    coupon_discount_price: int = Field(ge=0, le=999999999)
    point_discount_price: int = Field(ge=0, le=999999999)
    total_price: int = Field(ge=0, le=999999999)
    recipient_name: str = Field(min_length=1, max_length=32)
    phone_number: str = Field(min_length=10, max_length=15)
    zipcode: str = Field(min_length=5, max_length=10)
    address_line1: str = Field(min_length=1, max_length=100)
    address_line2: str | None = Field(default=None, max_length=100)
    order_memo: str | None = Field(default=None, max_length=100)
    items: List[CreateOrderItemRequest]


class CreateRefundRequest(BaseModel):
    order_id: str
    payment_id: str
    merchant_id: str
    amount: int
    memo: str | None


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


@router.get("/by_id", response_model=GetOrderResponse)
@inject
def get_order(
    order_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order, orderitems = order_service.get_order(order_id)
    return {"order": order, "items": orderitems}


@router.get("", response_model=GetOrdersResponse)
@inject
def get_orders(
    page: int = 1,
    items_per_page: int = 10,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    total_count, orders = order_service.get_orders(page, items_per_page)
    return {"total_count": total_count, "orders": orders}


@router.post("/payment/webhook/test")
@inject
async def payment_webhook(
    request: Request,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    webhook = await order_service.handle_webhook(request, is_test=True)
    return webhook


@router.post("/payment/webhook")
@inject
async def payment_webhook(
    request: Request,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    webhook = await order_service.handle_webhook(request, is_test=False)
    return webhook

@router.post("/payment/refund/whole")
@inject
def payment_refund_whole(
    request: CreateRefundRequest,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    refund = order_service.refund_payment(
        order_id=request.order_id,
        payment_id=request.payment_id,
        merchant_id=request.merchant_id,
        amount=request.amount,
        memo=request.memo,
    )
    return refund


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