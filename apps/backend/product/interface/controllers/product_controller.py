from datetime import datetime
from typing import Annotated
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from containers import Container
from common.auth import CurrentUser, get_admin_user
from product.application.product_service import ProductService

router = APIRouter(prefix="/products")


class CreateProductBody(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    price_whole: int = Field(gt=0, le=99999999) # 999원 ~ 9999만원
    price_sell: int = Field(gt=0, le=99999999) # 999원 ~ 9999만원
    discount_rate: int = Field(gt=0, le=100) # 0% ~ 100%
    category_main: str = Field(min_length=2, max_length=32)
    category_sub: str = Field(min_length=2, max_length=32)


class ProductResponse(BaseModel):
    id: str
    name: str


@router.post("", status_code=201, response_model=ProductResponse)
@inject
def create_product(
    product: CreateProductBody,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    created_product = product_service.create_product(
        name=product.name,
        price_whole=product.price_whole,
        price_sell=product.price_sell,
        discount_rate=product.discount_rate,
        category_main=product.category_main,
        category_sub=product.category_sub,
    )

    return created_product