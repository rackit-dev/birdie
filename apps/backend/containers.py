from dependency_injector import containers, providers

from user.application.user_service import UserService
from user.infra.repository.user_repo import UserRepository
from product.application.product_service import ProductService
from product.infra.repository.product_repo import ProductRepository
from cartitem.application.cartitem_service import CartItemService
from cartitem.infra.repository.cartitem_repo import CartItemRepository

class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        packages=["user", "product", "cartitem"],
    )

    user_repo = providers.Factory(UserRepository)
    user_service = providers.Factory(UserService, user_repo=user_repo)
    product_repo = providers.Factory(ProductRepository)
    product_service = providers.Factory(ProductService, product_repo=product_repo)
    cartitem_repo = providers.Factory(CartItemRepository)
    cartitem_service = providers.Factory(CartItemService, cartitem_repo=cartitem_repo)