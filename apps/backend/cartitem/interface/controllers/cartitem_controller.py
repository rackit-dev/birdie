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


@router.post("", status_code=201)
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