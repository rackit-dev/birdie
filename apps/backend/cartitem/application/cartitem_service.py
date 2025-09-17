from datetime import datetime, timezone
from dependency_injector.wiring import inject
from fastapi import HTTPException
from ulid import ULID

from cartitem.domain.cartitem import CartItem
from cartitem.domain.repository.cartitem_repo import ICartItemRepository

class CartItemService:
    @inject
    def __init__(
        self,
        cartitem_repo: ICartItemRepository,
    ):
        self.cartitem_repo = cartitem_repo
        self.ulid = ULID()

    def create_cartitem(
        self,
        user_id: str,
        product_id: str,
        quantity: int,
        option_type_1: str | None = None,
        option_1: str | None = None,
        is_option_1_active: bool | None = None,
        option_type_2: str | None = None,
        option_2: str | None = None,
        is_option_2_active: bool | None = None,
        option_type_3: str | None = None,
        option_3: str | None = None,
        is_option_3_active: bool | None = None,
    ) -> CartItem:
        _cartitem = None

        try:
            _cartitem = self.cartitem_repo.find_by_ids(
                user_id, product_id,
                option_type_1, option_1, is_option_1_active,
                option_type_2, option_2, is_option_2_active,
                option_type_3, option_3, is_option_3_active,
            )
        except HTTPException as e:
            if e.status_code != 422:
                raise e

        if _cartitem:
            raise HTTPException(status_code=422, detail="Item Already Exsists.")

        now = datetime.now(timezone.utc)
        cartitem: CartItem = CartItem(
            id=self.ulid.generate(),
            user_id=user_id,
            product_id=product_id,
            is_active=True,
            option_type_1=option_type_1,
            option_1=option_1,
            is_option_1_active=is_option_1_active,
            option_type_2=option_type_2,
            option_2=option_2,
            is_option_2_active=is_option_2_active,
            option_type_3=option_type_3,
            option_3=option_3,
            is_option_3_active=is_option_3_active,
            quantity=quantity,
            created_at=now,
            updated_at=now,
        )
        self.cartitem_repo.save(cartitem)

        return cartitem

    def get_cartitems(self, user_id: str) -> tuple[int, list[CartItem]]:
        cartitems = self.cartitem_repo.get_cartitems(user_id)
        return cartitems

    def update_cartitem(
        self,
        cartitem_id: str,
        user_id: str,
        product_id: str,
        quantity: int,
        option_type_1: str | None = None,
        option_1: str | None = None,
        is_option_1_active: bool | None = None,
        option_type_2: str | None = None,
        option_2: str | None = None,
        is_option_2_active: bool | None = None,
        option_type_3: str | None = None,
        option_3: str | None = None,
        is_option_3_active: bool | None = None,
    ) -> CartItem:
        _cartitem = None

        try:
            _cartitem = self.cartitem_repo.find_by_ids(
                user_id, product_id,
                option_type_1, option_1, is_option_1_active,
                option_type_2, option_2, is_option_2_active,
                option_type_3, option_3, is_option_3_active,
            )
        except HTTPException as e:
            if e.status_code != 422:
                raise e

        if _cartitem and cartitem_id != _cartitem.id:
            raise HTTPException(status_code=422, detail="Item Already Exsists.")

        cartitem = self.cartitem_repo.find_by_id(cartitem_id)

        cartitem.option_type_1 = option_type_1
        cartitem.option_1 = option_1
        cartitem.is_option_1_active = is_option_1_active
        cartitem.option_type_2 = option_type_2
        cartitem.option_2 = option_2
        cartitem.is_option_2_active = is_option_2_active
        cartitem.option_type_3 = option_type_3
        cartitem.option_3 = option_3
        cartitem.is_option_3_active = is_option_3_active
        cartitem.quantity = quantity
        cartitem.updated_at = datetime.now(timezone.utc)

        self.cartitem_repo.update(cartitem)

        return cartitem

    def delete_cartitem(self, cartitem_id: str):
        self.cartitem_repo.delete(cartitem_id)