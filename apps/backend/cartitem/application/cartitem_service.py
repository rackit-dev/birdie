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
        option_type_1_id: str | None = None,
        option_1_id: str | None = None,
        is_option_1_active: bool | None = None,
        option_type_2_id: str | None = None,
        option_2_id: str | None = None,
        is_option_2_active: bool | None = None,
        option_type_3_id: str | None = None,
        option_3_id: str | None = None,
        is_option_3_active: bool | None = None,
    ) -> CartItem:
        now = datetime.now(timezone.utc)
        cartitem: CartItem = CartItem(
            id=self.ulid.generate(),
            user_id=user_id,
            product_id=product_id,
            is_active=True,
            option_type_1_id=option_type_1_id,
            option_1_id=option_1_id,
            is_option_1_active=is_option_1_active,
            option_type_2_id=option_type_2_id,
            option_2_id=option_2_id,
            is_option_2_active=is_option_2_active,
            option_type_3_id=option_type_3_id,
            option_3_id=option_3_id,
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
        option_type_1_id: str | None = None,
        option_1_id: str | None = None,
        is_option_1_active: bool | None = None,
        option_type_2_id: str | None = None,
        option_2_id: str | None = None,
        is_option_2_active: bool | None = None,
        option_type_3_id: str | None = None,
        option_3_id: str | None = None,
        is_option_3_active: bool | None = None,
    ) -> CartItem:
        cartitem = None

        try:
            cartitem = self.cartitem_repo.find_by_id(cartitem_id)
        except HTTPException:
            raise HTTPException(status_code=422, detail="CartItem Does Not Exist.")
        
        now = datetime.now(timezone.utc)
        cartitem = CartItem(
            id=cartitem_id,
            user_id=user_id,
            product_id=product_id,
            is_active=True,
            option_type_1_id=option_type_1_id,
            option_1_id=option_1_id,
            is_option_1_active=is_option_1_active,
            option_type_2_id=option_type_2_id,
            option_2_id=option_2_id,
            is_option_2_active=is_option_2_active,
            option_type_3_id=option_type_3_id,
            option_3_id=option_3_id,
            is_option_3_active=is_option_3_active,
            quantity=quantity,
            created_at=cartitem.created_at,
            updated_at=now,
        )
        self.cartitem_repo.update(cartitem)


        return cartitem

    def delete_cartitem(self, cartitem_id: str):
        self.cartitem_repo.delete(cartitem_id)

    def get_cartitem_values_by_id(self, cartitem: CartItem):
        option_1_type, option_1_value, is_option_1_active = (None, None, True)
        option_2_type, option_2_value, is_option_2_active = (None, None, True)
        option_3_type, option_3_value, is_option_3_active = (None, None, True)

        if cartitem.option_type_1_id and cartitem.option_1_id:
            option_1_type, option_1_value, is_option_1_active = self.cartitem_repo.fetch_option(
                cartitem.option_type_1_id, cartitem.option_1_id
            )
        if cartitem.option_type_2_id and cartitem.option_2_id:
            option_2_type, option_2_value, is_option_2_active = self.cartitem_repo.fetch_option(
                cartitem.option_type_2_id, cartitem.option_2_id
            )
        if cartitem.option_type_3_id and cartitem.option_3_id:
            option_3_type, option_3_value, is_option_3_active = self.cartitem_repo.fetch_option(
                cartitem.option_type_3_id, cartitem.option_3_id
            )

        return {
            "id": cartitem.id,
            "user_id": cartitem.user_id,
            "product_id": cartitem.product_id,
            "is_active": cartitem.is_active,
            "option_type_1": option_1_type,
            "option_1": option_1_value,
            "is_option_1_active": is_option_1_active,
            "option_type_2": option_2_type,
            "option_2": option_2_value,
            "is_option_2_active": is_option_2_active,
            "option_type_3": option_3_type,
            "option_3": option_3_value,
            "is_option_3_active": is_option_3_active,
            "quantity": cartitem.quantity,
            "created_at": cartitem.created_at,
            "updated_at": cartitem.updated_at,
        }