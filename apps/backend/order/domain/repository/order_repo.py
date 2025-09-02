from typing import List
from abc import ABCMeta, abstractmethod

from order.domain.order import Order, Coupon, CouponWallet, OrderItem


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
    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[Order]]:
        """
        Get a paginated list of orders.
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
    def save_order_item(self, order_item: OrderItem):
        """
        Save a new order item.
        """
        raise NotImplementedError

    @abstractmethod
    def find_coupon_by_id(self, coupon_id: str) -> Coupon:
        """
        Find a coupon by its ID.
        """
        raise NotImplementedError

    @abstractmethod
    def save_coupon(self, coupon: Coupon):
        """
        Save a new coupon.
        """
        raise NotImplementedError

    @abstractmethod
    def update_coupon(self, coupon: Coupon):
        """
        Update an existing coupon.
        """
        raise NotImplementedError

    @abstractmethod
    def get_coupons(self, page: int, items_per_page: int) -> tuple[int, List[Coupon]]:
        """
        Get a paginated list of coupons.
        """
        raise NotImplementedError

    @abstractmethod
    def save_coupon_wallet(self, coupon_wallet: CouponWallet):
        """
        Save a new coupon wallet.
        """
        raise NotImplementedError

    @abstractmethod
    def find_coupon_wallet_by_id(self, coupon_wallet_id: str) -> CouponWallet:
        """
        Find a coupon wallet by its ID.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_coupon_wallet(self, coupon_wallet_id: str):
        """
        Delete a coupon wallet by its ID.
        """
        raise NotImplementedError

    @abstractmethod
    def get_coupon_wallets(self, page: int, items_per_page: int) -> tuple[int, List[CouponWallet]]:
        """
        Get a paginated list of coupon wallets.
        """
        raise NotImplementedError

    @abstractmethod
    def get_coupon_wallets_by_user(self, user_id: str) -> List[CouponWallet]:
        """
        Get all coupon wallets for a specific user.
        """
        raise NotImplementedError
