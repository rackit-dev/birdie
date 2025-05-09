from abc import ABCMeta, abstractmethod
from product.domain.product import Product


class IProductRepository(metaclass=ABCMeta):
    @abstractmethod
    def save(self, product: Product):
        raise NotImplementedError
    
    @abstractmethod
    def find_by_name(self, name: str) -> Product:
        """
        이름으로 유저 검색
        """
    
    @abstractmethod
    def update(self, user: Product):
        raise NotImplementedError
    
    @abstractmethod
    def get_products(self, page: int, items_per_page: int) -> tuple[int, list[Product]]:
        raise NotImplementedError
    
    @abstractmethod
    def delete(self, id: str):
        raise NotImplementedError