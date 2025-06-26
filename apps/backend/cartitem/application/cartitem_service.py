from datetime import datetime
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
        product_option_id: str,
        quantity: int,
    ) -> CartItem:
        _cartitem = None
        
        try:
            _cartitem = self.cartitem_repo.find_by_ids(user_id, product_id, product_option_id)
        except HTTPException as e:
            if e.status_code != 422:
                raise e
        
        if _cartitem:
            raise HTTPException(status_code=422, detail="Item Already Exsists.")
        
        now = datetime.now()
        cartitem: CartItem = CartItem(
            id=self.ulid.generate(),
            user_id=user_id,
            product_id=product_id,
            product_option_id=product_option_id,
            quantity=quantity,
            created_at=now,
            updated_at=now,
        )
        self.cartitem_repo.save(cartitem)
        
        return cartitem
    
    def get_cartitems(self, user_id: str) -> tuple[int, list[CartItem]]:
        cartitems = self.cartitem_repo.get_cartitems(user_id)

        return cartitems
    
    def delete_cartitem(self, cartitem_id: str):
        self.cartitem_repo.delete(cartitem_id)