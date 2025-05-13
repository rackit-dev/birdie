from fastapi import HTTPException, UploadFile

from database import SessionLocal
from aws import bucket_session
from utils.db_utils import row_to_dict
from product.domain.repository.product_repo import IProductRepository
from product.domain.product import Product as ProductVO
from product.infra.db_models.product import Product


class ProductRepository(IProductRepository):
    def save(self, product: ProductVO, image: UploadFile):
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

        with SessionLocal() as db:
            try:
                db.add(new_product)
                self._upload_img(product.name, image)
                db.commit()
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to Save Product.")
            
    def find_by_name(self, name: str) -> ProductVO:
        with SessionLocal() as db:
            product = db.query(Product).filter(
                Product.name == name
            ).first()
        
        if not product:
            raise HTTPException(status_code=422)
        
        return ProductVO(**row_to_dict(product))
    
    def _upload_img(self, name: str, image: UploadFile):
        file_extension = image.filename.split(".")[-1]
        object_key = f"products/{name}/testimg.{file_extension}"
        
        with bucket_session() as s3:
            s3.upload_fileobj(
                image.file,
                "birdie-image-bucket",
                object_key,
            )
       
    def update(self, user):
        return super().update(user)
    
    def get_products(self, page, items_per_page):
        return super().get_products(page, items_per_page)
    
    def delete(self, id):
        return super().delete(id)