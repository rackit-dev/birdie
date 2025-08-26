from dependency_injector import containers, providers

from user.application.user_service import UserService
from user.infra.repository.user_repo import UserRepository
from product.application.product_service import ProductService
from product.infra.repository.product_repo import ProductRepository
from order.application.order_service import OrderService
from order.infra.repository.order_repo import OrderRepository
from cartitem.application.cartitem_service import CartItemService
from cartitem.infra.repository.cartitem_repo import CartItemRepository

class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        packages=["user", "product", "order", "cartitem"],
    )

    user_repo = providers.Factory(UserRepository)
    user_service = providers.Factory(UserService, user_repo=user_repo)
    product_repo = providers.Factory(ProductRepository)
    product_service = providers.Factory(ProductService, product_repo=product_repo)
    order_repo = providers.Factory(OrderRepository)
    order_service = providers.Factory(OrderService, order_repo=order_repo)
    cartitem_repo = providers.Factory(CartItemRepository)
    cartitem_service = providers.Factory(CartItemService, cartitem_repo=cartitem_repo)