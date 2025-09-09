from datetime import datetime, timezone
from typing import List
from dependency_injector.wiring import inject
from fastapi import HTTPException, UploadFile
from ulid import ULID

from product.domain.product import Product, ProductOption, ProductLike, ProductReview, ProductOptionType
from product.domain.repository.product_repo import IProductRepository


class ProductService:
    @inject
    def __init__(
        self,
        product_repo: IProductRepository,
    ):
        self.product_repo = product_repo
        self.ulid = ULID()

    def create_product(
        self,
        name: str,
        price_whole: int,
        price_sell: int,
        discount_rate: int,
        category_main: str,
        category_sub: str,
        image_thumbnail: UploadFile,
        image_detail: List[UploadFile],
    ) -> Product:
        _product = None

        try:
            _product = self.product_repo.find_by_name(name)
        except HTTPException as e:
            if e.status_code != 422:
                raise e
        
        if _product:
            raise HTTPException(status_code=422)
        
        now = datetime.now(timezone.utc)
        product: Product = Product(
            id=self.ulid.generate(),
            product_number=None,
            name=name,
            price_whole=price_whole,
            price_sell=price_sell,
            discount_rate=discount_rate,
            is_active=True,
            category_main=category_main,
            category_sub=category_sub,
            created_at=now,
            updated_at=now,
        )
        new_product = self.product_repo.save(product, image_thumbnail, image_detail)

        return new_product
    
    def get_products(self, page: int, items_per_page: int) -> tuple[int, list[Product]]:
        products = self.product_repo.get_products(page, items_per_page)

        return products
    
    def get_products_by_id(self, product_id: str) -> tuple[int, list[Product]]:
        products = self.product_repo.get_products_by_id(product_id)

        return products
    
    def get_products_by_category(self, page: int, items_per_page: int, category_main: str, category_sub) -> tuple[int, list[Product]]:
        products = self.product_repo.get_products_by_category(page, items_per_page, category_main, category_sub)

        return products
    
    def update_product(
        self,
        product_id: str,
        name: str,
        price_whole: int,
        price_sell: int,
        discount_rate: int,
        is_active: bool,
        category_main: str,
        category_sub: str,
        image_thumbnail: UploadFile,
        image_detail: List[UploadFile],
    ) -> Product:
        product = self.product_repo.find_by_id(product_id)

        _product = None
        try:
            _product = self.product_repo.find_by_name(name)
        except HTTPException as e:
            if e.status_code != 422:
                raise e
            
        if _product:
            raise HTTPException(status_code=422)

        product.name = name
        product.price_whole = price_whole
        product.price_sell = price_sell
        product.discount_rate = discount_rate
        product.is_active = is_active
        product.category_main = category_main
        product.category_sub = category_sub
        product.updated_at = datetime.now(timezone.utc)

        self.product_repo.update(product, image_thumbnail, image_detail)

        return product

    def delete_product(self, product_id: str):
        self.product_repo.delete(product_id)

    def create_product_option_type(self, product_id: str, option_type: str) -> ProductOptionType:
        now = datetime.now(timezone.utc)
        product_option_type: ProductOptionType = ProductOptionType(
            id=self.ulid.generate(),
            product_id=product_id,
            option_type=option_type,
            created_at=now,
            updated_at=now,
        )
        self.product_repo.save_option_type(product_option_type)
        return product_option_type
    
    def get_product_option_types(self, product_id: str) -> tuple[int, list[ProductOptionType]]:
        product_option_types = self.product_repo.get_option_types(product_id)
        return product_option_types
    
    def update_product_option_type(self, id: str, option_type: str) -> ProductOptionType:
        product_option_type = self.product_repo.find_option_type_by_id(id)
        if not product_option_type:
            raise HTTPException(status_code=422, detail="Product option type not found.")
        
        product_option_type.option_type = option_type
        product_option_type.updated_at = datetime.now(timezone.utc)
        self.product_repo.update_option_type(product_option_type)
        return product_option_type
    
    def delete_product_option_type(self, product_option_type_id: str):
        self.product_repo.delete_option_type(product_option_type_id)

    def create_product_options(
        self,
        product_id: str,
        product_option_type_id: str,
        options: List[str],
    ) -> tuple[int, list[ProductOption]]:
        option_list = []
        for option in options:
            now = datetime.now(timezone.utc)
            product_option: ProductOption = ProductOption(
                id=self.ulid.generate(),
                product_id=product_id,
                product_option_type_id=product_option_type_id,
                option=option,
                is_active=True,
                created_at=now,
                updated_at=now,
            )
            self.product_repo.save_option(product_option)
            option_list.append(product_option)

        return len(option_list), option_list

    def get_product_options(self, product_id: str) -> tuple[int, list[ProductOption]]:
        product_options = self.product_repo.get_options(product_id)

        return product_options
    
    def update_product_option(self, id: str, option: str, is_active: bool) -> ProductOption:
        product_option = self.product_repo.find_by_optionid(id)

        product_option.option = option
        product_option.is_active = is_active
        product_option.updated_at = datetime.now(timezone.utc)

        self.product_repo.update_option(product_option)

        return product_option
    
    def delete_product_option(self, product_option_id: str):
        self.product_repo.delete_option(product_option_id)

    def create_product_like(self, user_id: str, product_id: str) -> ProductLike:
        now = datetime.now(timezone.utc)
        product_like: ProductLike = ProductLike(
            id=self.ulid.generate(),
            user_id=user_id,
            product_id=product_id,
            created_at=now,
        )
        self.product_repo.save_like(product_like)

        return product_like
    
    def get_product_likes(self, user_id: str) -> tuple[int, list[ProductLike]]:
        product_likes = self.product_repo.get_likes(user_id)

        return product_likes

    def delete_product_like(self, product_like_id: str):
        self.product_repo.delete_like(product_like_id)

    def create_product_review(
        self, 
        user_id: str,
        user_name: str,
        product_id: str,
        rating: int,
        images: List[UploadFile],
        content: str | None = None,
    ) -> ProductReview:
        now = datetime.now(timezone.utc)
        product_review: ProductReview = ProductReview(
            id=self.ulid.generate(),
            user_id=user_id,
            user_name=user_name,
            product_id=product_id,
            rating=rating,
            content=content,
            created_at=now,
            updated_at=now,
            visible=True,
        )
        self.product_repo.save_review(product_review, images)

        return product_review
    
    def get_product_reviews(
        self,
        product_id: str | None = None,
        user_id: str | None = None,
    ) -> tuple[int, list[ProductReview]]:
        if product_id is None and user_id is None:
            raise HTTPException(status_code=400, detail="Either product id or user id must be provided.")
        
        product_reviews = self.product_repo.get_reviews(product_id, user_id)

        return product_reviews
    
    def delete_product_review(self, product_review_id: str):
        self.product_repo.delete_review(product_review_id)