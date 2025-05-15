from datetime import datetime
from typing import List
from dependency_injector.wiring import inject
from fastapi import HTTPException, UploadFile
from ulid import ULID

from product.domain.product import Product
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

        # TODO S3 IMAGE MODIFY LOGIC...

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