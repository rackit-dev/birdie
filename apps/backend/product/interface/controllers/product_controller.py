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
    product_number: int
    name: str
    price_whole: int
    price_sell: int
    discount_rate: int
    is_active: bool
    category_main: str
    category_sub: str
    created_at: datetime
    updated_at: datetime


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
    #NEED ADMIN TOKEN
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


class GetProductsResponse(BaseModel):
    total_count: int
    page: int
    products: list[ProductResponse]


@router.get("", response_model=GetProductsResponse)
@inject
def get_products(
    page: int = 1,
    items_per_page: int = 10,
    #NO NEED TO AUTORIZE
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, products = product_service.get_products(page, items_per_page)
    
    return {
        "total_count": total_count,
        "page": page,
        "products": products,
    }


@router.put("", response_model=ProductResponse)
@inject
def update_product( 
    id: Annotated[str, Form(min_length=26, max_length=26)],
    name: Annotated[str, Form(min_length=2, max_length=128)],
    price_whole: Annotated[int, Form(ge=0, le=99999999)],
    price_sell: Annotated[int, Form(gt=0, le=99999999)],
    discount_rate: Annotated[int, Form(ge=0, le=100)],
    is_active: Annotated[bool, Form()],
    category_main: Annotated[str, Form(min_length=2, max_length=32)],
    category_sub: Annotated[str, Form(min_length=2, max_length=32)],
    image_thumbnail: UploadFile = File(...),
    image_detail: List[UploadFile] = File(...),
    #NEED ADMIN TOKEN
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    product = product_service.update_product(
        product_id=id,
        name=name,
        price_whole=price_whole,
        price_sell=price_sell,
        discount_rate=discount_rate,
        is_active=is_active,
        category_main=category_main,
        category_sub=category_sub,
        image_thumbnail=image_thumbnail,
        image_detail=image_detail,
    )

    return product


@router.delete("", status_code=204)
@inject
def delete_product(
    product_id: str,
    #NEED ADMIN TOKEN
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    product_service.delete_product(product_id)


class CreateProductOptionBody(BaseModel):
    product_id: str = Field(min_length=10, max_length=32)
    options: list[str] = Field(min_length=1, max_length=10)


class ProductOptionResponse(BaseModel):
    total_count: int
    options: list


@router.post("/options", status_code=201, response_model=ProductOptionResponse)
@inject
def create_product_option(
    product_option: CreateProductOptionBody,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, product_options = product_service.create_product_options(
        product_option.product_id,
        product_option.options,
    )

    return {
        "total_count": total_count,
        "options": product_options,
    }


@router.get("/options", response_model=ProductOptionResponse)
@inject
def get_product_option(
    product_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, product_options = product_service.get_product_options(product_id)

    return {
        "total_count": total_count,
        "options": product_options,
    }
    