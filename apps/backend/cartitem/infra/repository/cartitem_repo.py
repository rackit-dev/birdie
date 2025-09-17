from fastapi import HTTPException

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
            option_type_1=cartitem.option_type_1,
            option_1=cartitem.option_1,
            is_option_1_active=cartitem.is_option_1_active,
            option_type_2=cartitem.option_type_2,
            option_2=cartitem.option_2,
            is_option_2_active=cartitem.is_option_2_active,
            option_type_3=cartitem.option_type_3,
            option_3=cartitem.option_3,
            is_option_3_active=cartitem.is_option_3_active,
            quantity=cartitem.quantity,
            created_at=cartitem.created_at,
            updated_at=cartitem.updated_at,
        )

        with SessionLocal() as db:
            db.add(new_cartitem)
            db.commit()

    def find_by_ids(
        self,
        user_id: str,
        product_id: str,
        option_type_1: str | None = None,
        option_1: str | None = None,
        is_option_1_active: bool | None = None,
        option_type_2: str | None = None,
        option_2: str | None = None,
        is_option_2_active: bool | None = None,
        option_type_3: str | None = None,
        option_3: str | None = None,
        is_option_3_active: bool | None = None,
    ) -> CartItemVO:
        with SessionLocal() as db:
            query = db.query(CartItem).filter(
                CartItem.user_id == user_id,
                CartItem.product_id == product_id,
                CartItem.option_type_1 == option_type_1,
                CartItem.option_1 == option_1,
                CartItem.is_option_1_active == is_option_1_active,
                CartItem.option_type_2 == option_type_2,
                CartItem.option_2 == option_2,
                CartItem.is_option_2_active == is_option_2_active,
                CartItem.option_type_3 == option_type_3,
                CartItem.option_3 == option_3,
                CartItem.is_option_3_active == is_option_3_active,
            )
            cartitem = query.first()

        if not cartitem:
            raise HTTPException(status_code=422)

        return CartItemVO(**row_to_dict(cartitem))

    def find_by_id(self, cartitem_id):
        with SessionLocal() as db:
            cartitem = db.query(CartItem).filter(
                CartItem.id == cartitem_id,
            ).first()

        if not cartitem:
            raise HTTPException(status_code=422)

        return CartItemVO(**row_to_dict(cartitem))

    def get_cartitems(self, user_id: str):
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

            cartitem.option_type_1 = cartitem_vo.option_type_1
            cartitem.option_1 = cartitem_vo.option_1
            cartitem.is_option_1_active = cartitem_vo.is_option_1_active
            cartitem.option_type_2 = cartitem_vo.option_type_2
            cartitem.option_2 = cartitem_vo.option_2
            cartitem.is_option_2_active = cartitem_vo.is_option_2_active
            cartitem.option_type_3 = cartitem_vo.option_type_3
            cartitem.option_3 = cartitem_vo.option_3
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