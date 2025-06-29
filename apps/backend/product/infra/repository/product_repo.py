from typing import List
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, UploadFile
import MySQLdb

from database import SessionLocal
from aws import bucket_session
from utils.db_utils import row_to_dict
from product.domain.repository.product_repo import IProductRepository
from product.domain.product import Product as ProductVO
from product.domain.product import ProductOption as ProductOptionVO
from product.domain.product import ProductLike as ProductLikeVO
from product.domain.product import ProductReview as ProductReviewVO
from product.infra.db_models.product import Product, ProductOption, ProductLike, ProductReview


class ProductRepository(IProductRepository):
    def save(self, product: ProductVO, image_thumbnail: UploadFile, image_detail: List[UploadFile]) -> ProductVO:
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
                db.flush()
                db.refresh(new_product)
                db.expunge(new_product)
                self._upload_img(product.name, image_thumbnail, image_detail)
                db.commit()
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to Save Product.")
        
        return ProductVO(**row_to_dict(new_product))
            
    def find_by_name(self, name: str) -> ProductVO:
        with SessionLocal() as db:
            product = db.query(Product).filter(
                Product.name == name
            ).first()
        
        if not product:
            raise HTTPException(status_code=422)
        
        return ProductVO(**row_to_dict(product))
    
    def _upload_img(self, name: str, image_thumbnail: UploadFile, image_detail: List[UploadFile]):
        thumbnail_extension = image_thumbnail.filename.split(".")[-1]
        thumbnail_key = f"products/{name}/thumbnail.{thumbnail_extension}"
        
        with bucket_session() as s3:
            s3.upload_fileobj(
                image_thumbnail.file,
                "birdie-image-bucket",
                thumbnail_key,
            )

            for i, image in enumerate(image_detail, start=1):
                extension = image.filename.split(".")[-1]
                key = f"products/{name}/detail_{i}.{extension}"
                s3.upload_fileobj(
                    image.file,
                    "birdie-image-bucket",
                    key,
                )

    def get_products(self, page: int = 1, items_per_page: int = 10) -> tuple[int, list[ProductVO]]:
        with SessionLocal() as db:
            query = db.query(Product)
            total_count = query.count()

            offset = (page - 1) * items_per_page
            products = query.limit(items_per_page).offset(offset).all()

        return total_count, [ProductVO(**row_to_dict(product)) for product in products]
    
    def get_products_by_id(self, product_id):
        with SessionLocal() as db:
            product = db.query(Product).filter(
                Product.id == product_id,
            ).first()

            if not product:
                raise HTTPException(status_code=404, detail="Product Not Found")

        return [ProductVO(**row_to_dict(product))]
    
    def get_products_by_category(self, page, items_per_page, category_main, category_sub):
        with SessionLocal() as db:
            query = db.query(Product).filter(Product.category_main == category_main)
            
            if category_sub is not None:
                query = query.filter(
                    Product.category_sub == category_sub,
                )

            total_count = query.count()

            offset = (page - 1) * items_per_page
            products = query.limit(items_per_page).offset(offset).all()

        return total_count, [ProductVO(**row_to_dict(product)) for product in products]

    def update(self, product_vo: ProductVO, image_thumbnail: UploadFile, image_detail: List[UploadFile]) -> ProductVO:
        with SessionLocal() as db:
            product = db.query(Product).filter(Product.id == product_vo.id).first()
        
        if not product:
            raise HTTPException(status_code=422)
        
        product.name = product_vo.name
        product.price_whole = product_vo.price_whole
        product.price_sell = product_vo.price_sell
        product.discount_rate = product_vo.discount_rate
        product.is_active = product_vo.is_active
        product.category_main = product_vo.category_main
        product.category_sub = product_vo.category_sub
        product.updated_at = product_vo.updated_at

        try:
            db.add(product)
            # TODO S3 IMAGE MODIFY LOGIC TODO
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to Update product.")
        
        return product
    
    def find_by_id(self, id) -> ProductVO:
        with SessionLocal() as db:
            product = db.query(Product).filter(Product.id == id).first()

        if not product:
            raise HTTPException(status_code=422)
        
        return ProductVO(**row_to_dict(product))
    
    def delete(self, id):
        with SessionLocal() as db:
            product = db.query(Product).filter(Product.id == id).first()
            
            if not product:
                raise HTTPException(status_code=422)

            try:
                db.delete(product)
                self._delete_img(product.name)
                db.commit()
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to Delete product.")
    
    def _delete_img(self, name: str):
        prefix = f"products/{name}/"
        bucket_name = "birdie-image-bucket"

        with bucket_session() as s3:
            objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

            if "Contents" not in objects:
                return  # NO CONTENTS

            delete_keys = [{"Key": obj["Key"]} for obj in objects["Contents"]]

            s3.delete_objects(
                Bucket=bucket_name,
                Delete={"Objects": delete_keys}
            )

    def save_options(self, product_options: List[ProductOptionVO]):
        with SessionLocal() as db:
            try:
                for product_option in product_options:
                    new_option = ProductOption(
                        id=product_option.id,
                        product_id=product_option.product_id,
                        option=product_option.option,
                        is_active=product_option.is_active,
                        created_at=product_option.created_at,
                        updated_at=product_option.updated_at,
                    )
                    db.add(new_option)
                db.commit()
            except Exception:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to save product options.")

    def get_options(self, product_id: str) -> tuple[int, List[ProductOptionVO]]:
        with SessionLocal() as db:
            product_options = db.query(ProductOption).filter(
                ProductOption.product_id == product_id
            ).order_by(ProductOption.option.asc())
            total_count = product_options.count()

            if not product_options:
                raise HTTPException(status_code=422)

        return total_count, [ProductOptionVO(**row_to_dict(product_option)) for product_option in product_options]
    
    def update_option(self, product_option_vo: ProductOptionVO) -> ProductOption:
        with SessionLocal() as db:
            product_option = db.query(ProductOption).filter(ProductOption.id == product_option_vo.id).first()
        
        if not product_option:
            raise HTTPException(status_code=422)
        
        product_option.option = product_option_vo.option
        product_option.is_active = product_option_vo.is_active
        product_option.updated_at = product_option_vo.updated_at

        try:
            db.add(product_option)
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to Update product option.")

        return product_option
    
    
    def find_by_optionid(self, id: str) -> ProductOptionVO:
        with SessionLocal() as db:
            product_option = db.query(ProductOption).filter(ProductOption.id == id).first()

        if not product_option:
            raise HTTPException(status_code=422)
        
        return ProductOptionVO(**row_to_dict(product_option))
    
    
    def delete_option(self, id: str):
        with SessionLocal() as db:
            product_option = db.query(ProductOption).filter(ProductOption.id == id).first()
            
            if not product_option:
                raise HTTPException(status_code=422)
            
            try:
                db.delete(product_option)
                db.commit()
            except:
                raise HTTPException(status_code=500, detail="Failed to Delete product option.")
            
    def save_like(self, product_like: ProductLikeVO):
        new_product_like = ProductLike(
            id=product_like.id,
            user_id=product_like.user_id,
            product_id=product_like.product_id,
            created_at=product_like.created_at,
        )

        with SessionLocal() as db:
            try:
                db.add(new_product_like)
                db.commit()
            except IntegrityError as e:
                db.rollback()
                if isinstance(e.orig, MySQLdb.IntegrityError):
                    code = e.orig.args[0]
                    if code == 1062:
                        raise HTTPException(status_code=409, detail="Already liked this product.")
                    elif code == 1452:
                        raise HTTPException(status_code=422, detail="Invalid product or user ID.")
        
    def get_likes(self, user_id: str) -> tuple[int, list[ProductVO]]:
        with SessionLocal() as db:
            products = (
                db.query(Product)
                .join(ProductLike, Product.id == ProductLike.product_id)
                .filter(ProductLike.user_id == user_id)
                .all()
            )

            total_count = len(products)

        return total_count, [ProductVO(**row_to_dict(p)) for p in products]
    
    def delete_like(self, product_like_id: str):
        with SessionLocal() as db:
            product_like = db.query(ProductLike).filter(
                ProductLike.id == product_like_id
            ).first()
            
            if not product_like_id:
                raise HTTPException(status_code=422)
            
            try:
                db.delete(product_like)
                db.commit()
            except:
                raise HTTPException(status_code=500, detail="Failed to Delete product like.")
    
    def save_review(self, product_review: ProductReviewVO):
        new_product_review = ProductReview(
            id=product_review.id,
            user_id=product_review.user_id,
            user_name=product_review.user_name,
            product_id=product_review.product_id,
            rating=product_review.rating,
            content=product_review.content,
            created_at=product_review.created_at,
            updated_at=product_review.updated_at,
            visible=product_review.visible,
        )

        with SessionLocal() as db:
            try:
                db.add(new_product_review)
                db.commit()
            except IntegrityError as e:
                db.rollback()
                if isinstance(e.orig, MySQLdb.IntegrityError):
                    code = e.orig.args[0]
                    if code == 1452:
                        raise HTTPException(status_code=422, detail="Invalid product ID.")
    
    def get_reviews(self, product_id: str, user_id: str) -> tuple[int, list[ProductReviewVO]]:
        with SessionLocal() as db:
            if product_id is None and user_id is None:
                raise HTTPException(status_code=400, detail="Either product id or user id must be provided.")

            with SessionLocal() as db:
                query = db.query(ProductReview)

                if product_id:
                    query = query.filter(ProductReview.product_id == product_id)
                elif user_id:
                    query = query.filter(ProductReview.user_id == user_id)

                reviews = query.order_by(ProductReview.created_at.desc()).all()
                total_count = len(reviews)

                return total_count, [ProductReviewVO(**row_to_dict(review)) for review in reviews]
    
    def delete_review(self, product_review_id: str):
        with SessionLocal() as db:
            product_review = db.query(ProductReview).filter(
                ProductReview.id == product_review_id
            ).first()
            
            if not product_review_id:
                raise HTTPException(status_code=422)
            
            try:
                db.delete(product_review)
                db.commit()
            except:
                raise HTTPException(status_code=500, detail="Failed to Delete product review.")