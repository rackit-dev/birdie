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
            product_option_id=cartitem.product_option_id,
            quantity=cartitem.quantity,
            created_at=cartitem.created_at,
            updated_at=cartitem.updated_at,
        )
        
        with SessionLocal() as db:
            db.add(new_cartitem)
            db.commit()
    
    def find_by_ids(self, user_id: str, product_id: str, product_option_id: str) -> CartItemVO:
        with SessionLocal() as db:
            cartitem = db.query(CartItem).filter(
                CartItem.user_id == user_id,
                CartItem.product_id == product_id,
                CartItem.product_option_id == product_option_id,
            ).first()
        
        if not cartitem:
            raise HTTPException(status_code=422)
        
        return CartItem(**row_to_dict(cartitem))
    
    def get_cartitems(self, user_id: str):
        with SessionLocal() as db:
            query = db.query(CartItem).filter(
                CartItem.user_id == user_id
            )
            
            total_count = query.count()
            cartitems = query.all()

        return total_count, [CartItemVO(**row_to_dict(cartitem)) for cartitem in cartitems]
    
    def delete(self, cartitem_id: str):
        with SessionLocal() as db:
            cartitem = db.query(CartItem).filter(
                CartItem.id == cartitem_id
            ).first()

            if not cartitem:
                raise HTTPException(status_code=422, detail="CartItem Not Exsists")
            
            db.delete(cartitem)
            db.commit()