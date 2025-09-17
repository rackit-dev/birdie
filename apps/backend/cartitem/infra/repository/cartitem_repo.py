from fastapi import HTTPException
import requests

from database import SessionLocal
from utils.db_utils import row_to_dict
from cartitem.domain.repository.cartitem_repo import ICartItemRepository
from cartitem.domain.cartitem import CartItem as CartItemVO
from cartitem.infra.db_models.cartitem import CartItem


class CartItemRepository(ICartItemRepository):
    def save(self, cartitem: CartItemVO):
        new_cartitem = CartItem(
            id=cartitem.id,
            user_id=cartitem.user_id,
            product_id=cartitem.product_id,
            is_active=cartitem.is_active,
            option_type_1_id=cartitem.option_type_1_id,
            option_1_id=cartitem.option_1_id,
            is_option_1_active=cartitem.is_option_1_active,
            option_type_2_id=cartitem.option_type_2_id,
            option_2_id=cartitem.option_2_id,
            is_option_2_active=cartitem.is_option_2_active,
            option_type_3_id=cartitem.option_type_3_id,
            option_3_id=cartitem.option_3_id,
            is_option_3_active=cartitem.is_option_3_active,
            quantity=cartitem.quantity,
            created_at=cartitem.created_at,
            updated_at=cartitem.updated_at,
        )

        with SessionLocal() as db:
            db.add(new_cartitem)
            db.commit()

    def find_by_id(self, cartitem_id):
        with SessionLocal() as db:
            cartitem = db.query(CartItem).filter(
                CartItem.id == cartitem_id,
            ).first()

        if not cartitem:
            raise HTTPException(status_code=422)

        return CartItemVO(**row_to_dict(cartitem))

    def get_cartitems(self, user_id: str) -> tuple[int, list[CartItemVO]]:
        with SessionLocal() as db:
            query = db.query(CartItem).filter(
                CartItem.user_id == user_id
            )

            total_count = query.count()
            cartitems = query.all()

        return total_count, [CartItemVO(**row_to_dict(cartitem)) for cartitem in cartitems]

    def update(self, cartitem_vo: CartItemVO):
        with SessionLocal() as db:
            cartitem = db.query(CartItem).filter(CartItem.id == cartitem_vo.id).first()

            if not cartitem:
                raise HTTPException(status_code=422)

            cartitem.option_type_1_id = cartitem_vo.option_type_1_id
            cartitem.option_1_id = cartitem_vo.option_1_id
            cartitem.is_option_1_active = cartitem_vo.is_option_1_active
            cartitem.option_type_2_id = cartitem_vo.option_type_2_id
            cartitem.option_2_id = cartitem_vo.option_2_id
            cartitem.is_option_2_active = cartitem_vo.is_option_2_active
            cartitem.option_type_3_id = cartitem_vo.option_type_3_id
            cartitem.option_3_id = cartitem_vo.option_3_id
            cartitem.is_option_3_active = cartitem_vo.is_option_3_active
            cartitem.quantity = cartitem_vo.quantity
            cartitem.updated_at = cartitem_vo.updated_at
            db.add(cartitem)
            db.commit()

        return cartitem

    def delete(self, cartitem_id: str):
        with SessionLocal() as db:
            cartitem = db.query(CartItem).filter(
                CartItem.id == cartitem_id
            ).first()

            if not cartitem:
                raise HTTPException(status_code=422, detail="CartItem Not Exsists")

            db.delete(cartitem)
            db.commit()

    #def 