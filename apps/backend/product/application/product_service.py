from datetime import datetime
from typing import List
from dependency_injector.wiring import inject
from fastapi import HTTPException, UploadFile
from ulid import ULID

from product.domain.product import Product, ProductOption, ProductLike, ProductReview
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
        
        now = datetime.now()
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
        product.updated_at = datetime.now()

        self.product_repo.update(product, image_thumbnail, image_detail)

        return product

    def delete_product(self, product_id: str):
        self.product_repo.delete(product_id)

    def create_product_options(
            self,
            product_id: str,
            options: List[str],
    ) -> tuple[int, list[ProductOption]]:
        product_option_list = []

        for option in options:
            now = datetime.now()
            product_option: ProductOption = ProductOption(
                id=self.ulid.generate(),
                product_id=product_id,
                option=option,
                is_active=True,
                created_at=now,
                updated_at=now,
            )
            product_option_list.append(product_option)

        self.product_repo.save_options(product_option_list)
        
        return len(product_option_list), product_option_list
    
    def get_product_options(self, product_id: str) -> tuple[int, list[Product]]:
        product_options = self.product_repo.get_options(product_id)

        return product_options
    
    def update_product_option(self, id: str, option: str, is_active: bool) -> ProductOption:
        product_option = self.product_repo.find_by_optionid(id)

        product_option.option = option
        product_option.is_active = is_active
        product_option.updated_at = datetime.now()

        self.product_repo.update_option(product_option)

        return product_option
    
    def delete_product_option(self, product_option_id: str):
        self.product_repo.delete_option(product_option_id)

    def create_product_like(self, user_id: str, product_id: str) -> ProductLike:
        now = datetime.now()
        product_like: ProductLike = ProductLike(
            id=self.ulid.generate(),
            user_id=user_id,
            product_id=product_id,
            created_at=now,
        )
        self.product_repo.save_like(product_like)

        return product_like