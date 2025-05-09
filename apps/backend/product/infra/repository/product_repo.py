from database import SessionLocal
from utils.db_utils import row_to_dict
from product.domain.repository.product_repo import IProductRepository
from product.domain.product import Product as ProductVO
from product.infra.db_models.product import Product


class ProductRepository(IProductRepository):
    def save(self, product):
        return super().save(product)
    
    def find_by_name(self, name):
        return super().find_by_name(name)
    
    def update(self, user):
        return super().update(user)
    
    def get_products(self, page, items_per_page):
        return super().get_products(page, items_per_page)
    
    def delete(self, id):
        return super().delete(id)