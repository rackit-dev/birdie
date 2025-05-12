from fastapi import HTTPException

from database import SessionLocal
from utils.db_utils import row_to_dict
from product.domain.repository.product_repo import IProductRepository
from product.domain.product import Product as ProductVO
from product.infra.db_models.product import Product


class ProductRepository(IProductRepository):
    def save(self, product: ProductVO):
        new_product = Product(
            id=product.id,
            name=product.name,
            price_whole=product.price_whole,
            price_sell=product.price_sell,
            discount_rate=product.discount_rate,
            is_active=product.is_active,
            category_main=product.category_main,
            category_sub=product.category_sub,
            created_at=product.created_at,
            updated_at=product.updated_at,
        )

        """
        TODO
        product.name으로 s3 products/ 에 사진 업로드
        """

        with SessionLocal() as db:
            db.add(new_product)
            db.commit()
    
    def find_by_name(self, name: str) -> ProductVO:
        with SessionLocal() as db:
            product = db.query(Product).filter(
                Product.name == name
            ).first()
        
        if not product:
            raise HTTPException(status_code=422)
        
        return ProductVO(**row_to_dict(product))
    
    def update(self, user):
        return super().update(user)
    
    def get_products(self, page, items_per_page):
        return super().get_products(page, items_per_page)
    
    def delete(self, id):
        return super().delete(id)