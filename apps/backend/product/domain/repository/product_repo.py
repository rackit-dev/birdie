from typing import List
from abc import ABCMeta, abstractmethod
from fastapi import UploadFile

from product.domain.product import Product, ProductOptionType, ProductOption, ProductLike, ProductReview


class IProductRepository(metaclass=ABCMeta):
    @abstractmethod
    def save(self, 
             product: Product,
             image_thumbnail: UploadFile,
             image_detail: List[UploadFile],
        ) -> Product:
        """
        DB 트랜잭션 도중 오류에 대해서 500 에러 발생.
        """
        raise NotImplementedError
    
    @abstractmethod
    def find_by_name(self, name: str) -> Product:
        """
        이름으로 상품 검색.
        검색한 상품이 없을 경우 422 에러를 발생시킴.
        """
        raise NotImplementedError

    @abstractmethod
    def _upload_product_img(
            self,
            name: str,
            image_thumbnail: UploadFile,
            image_detail: List[UploadFile],
        ):
        raise NotImplementedError

    @abstractmethod
    def get_products(self, page: int, items_per_page: int) -> tuple[int, list[Product]]:
        raise NotImplementedError
    
    @abstractmethod
    def get_products_by_id(self, product_id: str) -> tuple[int, list[Product]]:
        raise NotImplementedError
    
    @abstractmethod
    def get_products_by_category(self, page: int, items_per_page: int, category_main: str, category_sub) -> tuple[int, list[Product]]:
        raise NotImplementedError
    
    @abstractmethod
    def get_products_recommended(self, user_id: str) -> tuple[int, list[Product]]:
        raise NotImplementedError

    @abstractmethod
    def update(self,
             product: Product,
             image_thumbnail: UploadFile,
             image_detail: List[UploadFile],
        ) -> Product:
        raise NotImplementedError
    
    @abstractmethod
    def find_by_id(self, id: str) -> Product:
        """
        ID로 상품 검색.
        검색한 상품이 없을 경우 422 에러 발생.
        """
        raise NotImplementedError
    
    @abstractmethod
    def delete(self, id: str):
        """
        ID로 상품 검색.
        검색한 상품이 없을 경우 422 에러 발생.
        DB 트랜잭션 도중 오류에 대해서 500 에러 발생.        
        """
        raise NotImplementedError
    
    @abstractmethod
    def _delete_img(self, name: str):
        raise NotImplementedError
    
    @abstractmethod
    def save_option_type(self, product_option_type: ProductOptionType):
        raise NotImplementedError
    
    @abstractmethod
    def get_option_types(self, product_id: str) -> tuple[int, list[ProductOptionType]]:
        raise NotImplementedError
    
    @abstractmethod
    def find_option_type_by_id(self, id: str) -> ProductOptionType:
        raise NotImplementedError

    @abstractmethod
    def update_option_type(self, product_option_type: ProductOptionType):
        raise NotImplementedError
    
    @abstractmethod
    def delete_option_type(self, product_option_type_id: str):
        raise NotImplementedError

    @abstractmethod
    def save_option(self, options: ProductOption):
        raise NotImplementedError
    
    @abstractmethod
    def get_options(self, product_id: str, product_option_type_id: str) -> tuple[int, list[ProductOption]]:
        raise NotImplementedError

    @abstractmethod
    def update_option(self, product_option: ProductOption) -> ProductOption:
        raise NotImplementedError

    @abstractmethod
    def find_by_optionid(self, id: str) -> ProductOption:
        raise NotImplementedError

    @abstractmethod
    def delete_option(self, product_option_id: str):
        raise NotImplementedError
    
    @abstractmethod
    def save_like(self, product_like: ProductLike):
        raise NotImplementedError
    
    @abstractmethod
    def get_likes(self, user_id: str) -> tuple[int, list[str], list[Product]]:
        raise NotImplementedError
    
    @abstractmethod
    def delete_like(self, product_like_id: str):
        raise NotImplementedError
    
    @abstractmethod
    def save_review(self, product_review: ProductReview, images: List[UploadFile]) -> ProductReview:
        raise NotImplementedError
    
    @abstractmethod
    def get_reviews(self, product_id: str, user_id: str) -> tuple[int, list[ProductReview]]:
        raise NotImplementedError
    
    @abstractmethod
    def delete_review(self, prouct_review_id: str):
        raise NotImplementedError
    
    @abstractmethod
    def get_option_info(self, option_type_id: str, option_id: str) -> tuple[str, str, bool]:
        raise NotImplementedError