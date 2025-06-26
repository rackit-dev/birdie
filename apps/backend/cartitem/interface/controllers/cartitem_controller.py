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
    product_option_id: str = Field(min_length=1, max_length=32)
    quantity: int = Field(ge=1, le=99)


class CartItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    product_option_id: str
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
        product_option_id=cartitem.product_option_id,
        quantity=cartitem.quantity,
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