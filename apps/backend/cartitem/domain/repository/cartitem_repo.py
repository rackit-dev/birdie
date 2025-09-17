from abc import ABCMeta, abstractmethod

from cartitem.domain.cartitem import CartItem


class ICartItemRepository(metaclass=ABCMeta):
    @abstractmethod
    def save(self, cartitem: CartItem):
        raise NotImplementedError
    
    @abstractmethod
    def find_by_id(self, cartitem_id: str) -> CartItem:
        raise NotImplementedError
    
    @abstractmethod
    def get_cartitems(self, user_id: str) -> tuple[int, list[CartItem]]:
        raise NotImplementedError
    
    @abstractmethod
    def update(self, cartitem: CartItem):
        raise NotImplementedError
    
    @abstractmethod
    def delete(self, cartitem_id: str):
        raise NotImplementedError