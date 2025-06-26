from abc import ABCMeta, abstractmethod
from fastapi import UploadFile

from cartitem.domain.cartitem import CartItem


class ICartItemRepository(metaclass=ABCMeta):
    @abstractmethod
    def save(self, cartitem: CartItem):
        raise NotImplementedError
    
    @abstractmethod
    def find_by_ids(
        self,
        user_id: str,
        product_id: str,
        product_option_id: str
    ) -> CartItem:
        raise NotImplementedError