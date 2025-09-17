from datetime import datetime
from typing import Annotated
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from containers import Container
from common.auth import CurrentUser, get_current_user, get_admin_user
from cartitem.application.cartitem_service import CartItemService

router = APIRouter(prefix="/cartitems")


class CreateCartItemBody(BaseModel):
    user_id: str = Field(min_length=1, max_length=32)
    product_id: str = Field(min_length=1, max_length=32)
    quantity: int = Field(ge=1, le=99)
    option_type_1_id: str | None = None
    option_1_id: str | None = None
    is_option_1_active: bool | None = None
    option_type_2_id: str | None = None
    option_2_id: str | None = None
    is_option_2_active: bool | None = None
    option_type_3_id: str | None = None
    option_3_id: str | None = None
    is_option_3_active: bool | None = None


class CartItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    is_active: bool
    option_type_1: str | None
    option_1: str | None
    is_option_1_active: bool | None
    option_type_2: str | None
    option_2: str | None
    is_option_2_active: bool | None
    option_type_3: str | None
    option_3: str | None
    is_option_3_active: bool | None
    quantity: int
    created_at: datetime
    updated_at: datetime


@router.post("", status_code=201, response_model=CartItemResponse)
@inject
def create_cartitem(
    cartitem: CreateCartItemBody,
    cartitem_service: CartItemService = Depends(Provide[Container.cartitem_service]),
):
    created_cartitem = cartitem_service.create_cartitem(
        user_id=cartitem.user_id,
        product_id=cartitem.product_id,
        quantity=cartitem.quantity,
        option_type_1_id=cartitem.option_type_1_id,
        option_1_id=cartitem.option_1_id,
        is_option_1_active=cartitem.is_option_1_active,
        option_type_2_id=cartitem.option_type_2_id,
        option_2_id=cartitem.option_2_id,
        is_option_2_active=cartitem.is_option_2_active,
        option_type_3_id=cartitem.option_type_3_id,
        option_3_id=cartitem.option_3_id,
        is_option_3_active=cartitem.is_option_3_active,
    )

    return created_cartitem


class GetCartItemsResponse(BaseModel):
    total_count: int
    cartitems: list[CartItemResponse]


@router.get("", response_model=GetCartItemsResponse)
@inject
def get_cartitems(
    user_id: str,
    cartitem_service: CartItemService = Depends(Provide[Container.cartitem_service]),
):
    total_count, cartitems = cartitem_service.get_cartitems(user_id)
    
    return {
        "total_count": total_count,
        "cartitems": cartitems,
    }


class UpdateCartItemBody(BaseModel):
    cartitem_id: str = Field(min_length=1, max_length=32)
    user_id: str = Field(min_length=1, max_length=32)
    product_id: str = Field(min_length=1, max_length=32)
    quantity: int = Field(ge=1, le=99)
    option_type_1_id: str | None = None
    option_1_id: str | None = None
    is_option_1_active: bool | None = None
    option_type_2_id: str | None = None
    option_2_id: str | None = None
    is_option_2_active: bool | None = None
    option_type_3_id: str | None = None
    option_3_id: str | None = None
    is_option_3_active: bool | None = None


@router.put("", response_model=CartItemResponse)
@inject
def update_cartitem(
    body: UpdateCartItemBody,
    cartitem_service: CartItemService = Depends(Provide[Container.cartitem_service]),
):
    cartitem = cartitem_service.update_cartitem(
        cartitem_id=body.cartitem_id,
        user_id=body.user_id,
        product_id=body.product_id,
        quantity=body.quantity,
        option_type_1=body.option_type_1_id,
        option_1=body.option_1_id,
        is_option_1_active=body.is_option_1_active,
        option_type_2=body.option_type_2_id,
        option_2=body.option_2_id,
        is_option_2_active=body.is_option_2_active,
        option_type_3=body.option_type_3_id,
        option_3=body.option_3_id,
        is_option_3_active=body.is_option_3_active,
    )

    return cartitem


@router.delete("", status_code=204)
@inject
def delete_cartitem(
    cartitem_id: str,
    cartitem_service: CartItemService = Depends(Provide[Container.cartitem_service]),
):
    cartitem_service.delete_cartitem(cartitem_id)