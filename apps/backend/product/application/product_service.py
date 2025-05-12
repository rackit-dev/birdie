from datetime import datetime
from dependency_injector.wiring import inject
from fastapi import HTTPException
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
    ) -> Product: # autogenerate id, prdct_num, is_active, createat, updateat
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
        self.product_repo.save(product)

        return product