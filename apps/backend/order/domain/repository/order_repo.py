from typing import List
from abc import ABCMeta, abstractmethod

from order.domain.order import Order


class IOrderRepository(metaclass=ABCMeta):
    @abstractmethod
    def save(self, order: Order):
        """
        Save a new order.
        """
        raise NotImplementedError

    @abstractmethod
    def find_by_id(self, id: str) -> Order:
        """
        Find an order by its ID.
        """
        raise NotImplementedError

    @abstractmethod
    def update(self, order: Order):
        """
        Update an existing order.
        """
        raise NotImplementedError

    @abstractmethod
    def delete(self, id: str):
        """
        Delete an order by its ID.
        """
        raise NotImplementedError

    @abstractmethod
    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[Order]]:
        """
        Get a paginated list of orders.
        """
        raise NotImplementedError
