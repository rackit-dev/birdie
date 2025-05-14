from datetime import datetime
from typing import Annotated, List
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field

from containers import Container
from common.auth import CurrentUser, get_admin_user
from product.application.product_service import ProductService

router = APIRouter(prefix="/products")


class ProductResponse(BaseModel):
    id: str
    name: str


@router.post("", status_code=201, response_model=ProductResponse)
@inject
def create_product(
    name: Annotated[str, Form(min_length=2, max_length=128)],
    price_whole: Annotated[int, Form(ge=0, le=99999999)],
    price_sell: Annotated[int, Form(gt=0, le=99999999)],
    discount_rate: Annotated[int, Form(ge=0, le=100)],
    category_main: Annotated[str, Form(min_length=2, max_length=32)],
    category_sub: Annotated[str, Form(min_length=2, max_length=32)],
    image_thumbnail: UploadFile = File(...),
    image_detail: List[UploadFile] = File(...),
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    created_product = product_service.create_product(
        name=name,
        price_whole=price_whole,
        price_sell=price_sell,
        discount_rate=discount_rate,
        category_main=category_main,
        category_sub=category_sub,
        image_thumbnail=image_thumbnail,
        image_detail=image_detail,
    )

    return created_product