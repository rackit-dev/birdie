from typing import List
from abc import ABCMeta, abstractmethod
from fastapi import UploadFile

from product.domain.product import Product, ProductOption


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
    def _upload_img(
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
    def save_options(self, options: List[ProductOption]) -> tuple[int, list[ProductOption]]:
        raise NotImplementedError
    
    @abstractmethod
    def get_product_options(self, product_id: str) -> tuple[int, list[ProductOption]]:
        raise NotImplementedError

    """
    @abstractmethod
    def update_product_options(self, ):
        raise NotImplementedError
    """