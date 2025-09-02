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
    min_order_amount: int = Field(ge=0)
    max_discount_amount: int = Field(gt=0)
    valid_from: datetime
    valid_until: datetime


class GetCouponsResponse(BaseModel):
    total_count: int
    coupons: List[CouponResponse]


class CouponWalletResponse(BaseModel):
    id: str
    user_id: str
    coupon_id: str
    is_used: bool
    used_at: datetime | None
    created_at: datetime
    updated_at: datetime


class CreateCouponWalletRequest(BaseModel):
    user_id: str
    coupon_id: str


class GetCouponWalletsResponse(BaseModel):
    total_count: int
    coupon_wallets: List[CouponWalletResponse]


@router.post("", status_code=201, response_model=CouponResponse)
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


@router.put("", response_model=CouponResponse)
@inject
def inactive_coupon(
    coupon_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    coupon = order_service.mark_coupon_inactive(coupon_id)
    return coupon


@router.post("/wallet", status_code=201, response_model=CouponWalletResponse)
@inject
def create_coupon_wallet(
    request: CreateCouponWalletRequest,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    coupon_wallet = order_service.create_coupon_wallet(
        user_id=request.user_id,
        coupon_id=request.coupon_id,
    )
    return coupon_wallet


@router.get("/wallet", response_model=GetCouponWalletsResponse)
@inject
def get_coupon_wallets(
    page: int = 1,
    items_per_page: int = 10,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    total_count, coupon_wallets = order_service.get_coupon_wallets(page, items_per_page)
    return {"total_count": total_count, "coupon_wallets": coupon_wallets}


@router.get("/wallet/by_id", response_model=CouponWalletResponse)
@inject
def get_coupon_wallet(
    coupon_wallet_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    coupon_wallet = order_service.get_coupon_wallet(coupon_wallet_id)
    return coupon_wallet


@router.get("/wallet/by_user", response_model=List[CouponWalletResponse])
@inject
def get_coupon_wallets_by_user(
    user_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    coupon_wallets = order_service.get_coupon_wallets_by_user(user_id)
    return coupon_wallets


@router.delete("/wallet", status_code=204)
@inject
def delete_coupon_wallet(
    coupon_wallet_id: str,
    order_service: OrderService = Depends(Provide[Container.order_service]),
):
    order_service.delete_coupon_wallet(coupon_wallet_id)