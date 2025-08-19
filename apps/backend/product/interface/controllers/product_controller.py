from datetime import datetime
from typing import Annotated, List, Optional
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field

from containers import Container
from common.auth import CurrentUser, get_admin_user
from utils.val_image import validate_images
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
    #NO NEED TO AUTHORIZE
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, products = product_service.get_products(page, items_per_page)
    
    return {
        "total_count": total_count,
        "page": page,
        "products": products,
    }


@router.get("/by_id", response_model=GetProductsResponse)
@inject
def get_products_by_id(
    product_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    product = product_service.get_products_by_id(product_id)

    return {
        "total_count": 1,
        "page": 1,
        "products": product,
    }


@router.get("/by_category", response_model=GetProductsResponse)
@inject
def get_products_by_category(
    page: int,
    items_per_page: int,
    category_main: str,
    category_sub: str | None = None,
    #NO NEED TO AUTHORIZE
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, products = product_service.get_products_by_category(page, items_per_page, category_main, category_sub)
    
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
    id: str
    product_id: str
    option: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    

class ProductOptionsResponse(BaseModel):
    total_count: int
    product_options: list


@router.post("/options", status_code=201, response_model=ProductOptionsResponse)
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
        "product_options": product_options,
    }


class UpdateProductOptionBody(BaseModel):
    id: str = Field(min_length=10, max_length=32)
    option: str = Field(min_length=1, max_length=10)
    is_active: bool


@router.get("/options", response_model=ProductOptionsResponse)
@inject
def get_product_option(
    product_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, product_options = product_service.get_product_options(product_id)

    return {
        "total_count": total_count,
        "product_options": product_options,
    }


@router.put("/options", response_model=ProductOptionResponse)
@inject
def update_product_option(
    body: UpdateProductOptionBody,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    product_option = product_service.update_product_option(
        id=body.id,
        option=body.option,
        is_active=body.is_active,
    )

    return product_option


@router.delete("/options", status_code=204)
@inject
def delete_product_option(
    product_option_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    product_service.delete_product_option(product_option_id)


class CreateProductLikeBody(BaseModel):
    user_id: str = Field(min_length=10, max_length=32)
    product_id: str = Field(min_length=10, max_length=32)


class ProductLikeResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    created_at: datetime


@router.post("/like", status_code=201, response_model=ProductLikeResponse)
@inject
def create_like(
    product_like: CreateProductLikeBody,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    created_product_like = product_service.create_product_like(
        user_id=product_like.user_id,
        product_id=product_like.product_id,
    )

    return created_product_like


class GetProductLikesResponse(BaseModel):
    total_count: int
    product_like_ids: list[str]
    products: list[ProductResponse]
    

@router.get("/like", response_model=GetProductLikesResponse)
@inject
def get_likes(
    user_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, product_like_ids, products = product_service.get_product_likes(user_id)

    return {
        "total_count": total_count,
        "product_like_ids": product_like_ids,
        "products": products,
    }


@router.delete("/like", status_code=204)
@inject
def delete_product_option(
    product_like_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    product_service.delete_product_like(product_like_id)


class CreateProductReviewBody(BaseModel):
    user_id: str = Field(min_length=10, max_length=32)
    user_name: str = Field(min_length=2, max_length=8)
    product_id: str = Field(min_length=10, max_length=32)
    rating: int = Field(ge=1, le=5)
    content: str = Field(min_length=5, max_length=100)


class ProductReviewResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    product_id: str
    rating: int
    content: str
    created_at: datetime
    updated_at: datetime
    visible: bool
    #images_url: List[str] = []


@router.post("/reviews", status_code=201, response_model=ProductReviewResponse)
@inject
def create_product_review(
    user_id: Annotated[str, Form(..., min_length=10, max_length=32)],
    user_name: Annotated[str, Form(..., min_length=2, max_length=8)],
    product_id: Annotated[str, Form(..., min_length=10, max_length=32)],
    rating: Annotated[int, Form(..., ge=1, le=5)],
    content: Annotated[str, Form(..., min_length=5, max_length=100)],
    images: Optional[List[UploadFile]] = File(None),
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    if images:
        validate_images(images)
    created_product_review = product_service.create_product_review(
        user_id=user_id,
        user_name=user_name,
        product_id=product_id,
        rating=rating,
        content=content,
        images=images,
    )

    return created_product_review


class GetProductReviewsResponse(BaseModel):
    total_count: int
    product_reviews: list[ProductReviewResponse]


@router.get("/reviews/by_product", response_model=GetProductReviewsResponse)
@inject
def get_reviews_by_product(
    product_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, product_reviews = product_service.get_product_reviews(product_id, None)

    return {
        "total_count": total_count,
        "product_reviews": product_reviews,
    }


@router.get("/reviews/by_user", response_model=GetProductReviewsResponse)
@inject
def get_reviews_by_user(
    user_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    total_count, product_reviews = product_service.get_product_reviews(None, user_id)

    return {
        "total_count": total_count,
        "product_reviews": product_reviews,
    }


@router.delete("/reviews", status_code=204)
@inject
def delete_review(
    product_review_id: str,
    product_service: ProductService = Depends(Provide[Container.product_service]),
):
    product_service.delete_product_review(product_review_id)