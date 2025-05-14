from abc import ABCMeta, abstractmethod
from fastapi import UploadFile

from product.domain.product import Product


class IProductRepository(metaclass=ABCMeta):
    @abstractmethod
    def save(self, product: Product):
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
            image_detail: UploadFile,
        ):
        raise NotImplementedError
    
    @abstractmethod
    def update(self, user: Product):
        raise NotImplementedError
    
    @abstractmethod
    def get_products(self, page: int, items_per_page: int) -> tuple[int, list[Product]]:
        raise NotImplementedError
    
    @abstractmethod
    def delete(self, id: str):
        raise NotImplementedError