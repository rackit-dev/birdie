from datetime import datetime
from typing import List
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from containers import Container
from order.application.order_service import OrderService

router = APIRouter(prefix="/coupons")


class CouponResponse(BaseModel):
    id: str
    code: str | None
    description: str | None
    discount_type: str
    discount_rate: int | None
    discount_amount: int | None
    min_order_amount: int
    max_discount_amount: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CreateCouponRequest(BaseModel):
    code: str | None = Field(None, max_length=32)  # Limit to 32 characters
    description: str | None = Field(None, max_length=36)  # Limit to 36 characters
    discount_type: str
    discount_rate: int | None
    discount_amount: int | None
    min_order_amount: int
    max_discount_amount: int
    valid_from: datetime
    valid_until: datetime


class GetCouponsResponse(BaseModel):
    total_count: int
    coupons: List[CouponResponse]


@router.post("", response_model=CouponResponse)
@inject
def create_coupon(
    request: CreateCouponRequest,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    coupon = order_service.create_coupon(
        code=request.code,
        description=request.description,
        discount_type=request.discount_type,
        discount_rate=request.discount_rate,
        discount_amount=request.discount_amount,
        min_order_amount=request.min_order_amount,
        max_discount_amount=request.max_discount_amount,
        valid_from=request.valid_from,
        valid_until=request.valid_until,
    )
    return coupon


@router.get("/by_id", response_model=CouponResponse)
@inject
def get_coupon(
    coupon_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    coupon = order_service.get_coupon(coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.get("", response_model=GetCouponsResponse)
@inject
def get_coupons(
    page: int = 1,
    items_per_page: int = 10,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    total_count, coupons = order_service.get_coupons(page, items_per_page)
    return {"total_count": total_count, "coupons": coupons}


@router.delete("", status_code=204)
@inject
def delete_coupon(
    coupon_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order_service.mark_coupon_inactive(coupon_id)