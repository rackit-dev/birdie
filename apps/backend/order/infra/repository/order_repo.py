from typing import List
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from utils.db_utils import row_to_dict
from order.domain.repository.order_repo import IOrderRepository
from order.domain.order import Order as OrderVO
from order.domain.order import Coupon as CouponVO
from order.domain.order import CouponWallet as CouponWalletVO
from order.domain.order import OrderItem as OrderItemVO
from order.domain.order import Payment as PaymentVO
from order.infra.db_models.order import Order, Coupon, CouponWallet, OrderItem, Payment


class OrderRepository(IOrderRepository):
    def save(self, order: OrderVO):
        new_order = Order(
            id=order.id,
            user_id=order.user_id,
            status=order.status,
            subtotal_price=order.subtotal_price,
            coupon_discount_price=order.coupon_discount_price,
            point_discount_price=order.point_discount_price,
            total_price=order.total_price,
            recipient_name=order.recipient_name,
            phone_number=order.phone_number,
            zipcode=order.zipcode,
            address_line1=order.address_line1,
            address_line2=order.address_line2,
            order_memo=order.order_memo,
            created_at=order.created_at,
            updated_at=order.updated_at,
        )
        with SessionLocal() as db:
            db.add(new_order)
            db.commit()

    def find_by_id(self, id: str) -> OrderVO:
        with SessionLocal() as db:
            order = db.query(Order).filter(Order.id == id).first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            return OrderVO(**row_to_dict(order))

    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[OrderVO]]:
        with SessionLocal() as db:
            query = db.query(Order)
            total_count = query.count()
            offset = (page - 1) * items_per_page
            orders = query.limit(items_per_page).offset(offset).all()
            return total_count, [OrderVO(**row_to_dict(order)) for order in orders]

    def update(self, order_vo: OrderVO):
        with SessionLocal() as db:
            order = db.query(Order).filter(Order.id == order_vo.id).first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            order.status = order_vo.status
            order.updated_at = order_vo.updated_at
            db.add(order)
            db.commit()

    def delete(self, id: str):
        with SessionLocal() as db:
            order = db.query(Order).filter(Order.id == id).first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            db.delete(order)
            db.commit()

    def save_order_item(self, order_item: OrderItemVO):
        new_order_item = OrderItem(
            id=order_item.id,
            order_id=order_item.order_id,
            product_id=order_item.product_id,
            coupon_wallet_id=order_item.coupon_wallet_id,
            status=order_item.status,
            quantity=order_item.quantity,
            unit_price=order_item.unit_price,
            coupon_discount_price=order_item.coupon_discount_price,
            point_discount_price=order_item.point_discount_price,
            final_price=order_item.final_price,
            created_at=order_item.created_at,
            updated_at=order_item.updated_at,
        )
        with SessionLocal() as db:
            db.add(new_order_item)
            db.commit()

    def find_coupon_by_id(self, coupon_id: str) -> CouponVO:
        with SessionLocal() as db:
            coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
            if not coupon:
                raise HTTPException(status_code=400, detail="Invalid or inactive coupon")
            return CouponVO(**row_to_dict(coupon))

    def save_coupon(self, coupon: CouponVO):
        new_coupon = Coupon(
            id=coupon.id,
            code=coupon.code,
            description=coupon.description,
            discount_type=coupon.discount_type,
            discount_rate=coupon.discount_rate,
            discount_amount=coupon.discount_amount,
            min_order_amount=coupon.min_order_amount,
            max_discount_amount=coupon.max_discount_amount,
            valid_from=coupon.valid_from,
            valid_until=coupon.valid_until,
            is_active=coupon.is_active,
            created_at=coupon.created_at,
            updated_at=coupon.updated_at,
        )
        with SessionLocal() as db:
            db.add(new_coupon)
            db.commit()

    def update_coupon(self, coupon: CouponVO):
        with SessionLocal() as db:
            existing_coupon = db.query(Coupon).filter(Coupon.id == coupon.id).first()
            if not existing_coupon:
                raise HTTPException(status_code=404, detail="Coupon not found")
            existing_coupon.is_active = coupon.is_active
            existing_coupon.updated_at = coupon.updated_at
            db.add(existing_coupon)
            db.commit()

    def get_coupons(self, page: int, items_per_page: int) -> tuple[int, List[CouponVO]]:
        with SessionLocal() as db:
            query = db.query(Coupon)
            total_count = query.count()
            offset = (page - 1) * items_per_page
            coupons = query.limit(items_per_page).offset(offset).all()
            return total_count, [CouponVO(**row_to_dict(coupon)) for coupon in coupons]

    def save_coupon_wallet(self, coupon_wallet: CouponWalletVO):
        new_coupon_wallet = CouponWallet(
            id=coupon_wallet.id,
            user_id=coupon_wallet.user_id,
            coupon_id=coupon_wallet.coupon_id,
            is_used=coupon_wallet.is_used,
            used_at=coupon_wallet.used_at,
            created_at=coupon_wallet.created_at,
            updated_at=coupon_wallet.updated_at,
        )
        with SessionLocal() as db:
            try:
                db.add(new_coupon_wallet)
                db.commit()
            except IntegrityError as e:
                db.rollback()
                if "foreign key constraint fails" in str(e.orig):
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid foreign key: user_id or coupon_id does not exist"
                    )
                raise HTTPException(
                    status_code=500,
                    detail="An error occurred while saving the coupon wallet"
                )

    def find_coupon_wallet_by_id(self, coupon_wallet_id: str) -> CouponWalletVO:
        with SessionLocal() as db:
            coupon_wallet = db.query(CouponWallet).filter(CouponWallet.id == coupon_wallet_id).first()
            if not coupon_wallet:
                raise HTTPException(status_code=404, detail="CouponWallet not found")
            return CouponWalletVO(**row_to_dict(coupon_wallet))

    def delete_coupon_wallet(self, coupon_wallet_id: str):
        with SessionLocal() as db:
            coupon_wallet = db.query(CouponWallet).filter(CouponWallet.id == coupon_wallet_id).first()
            if not coupon_wallet:
                raise HTTPException(status_code=404, detail="CouponWallet not found")
            db.delete(coupon_wallet)
            db.commit()

    def get_coupon_wallets(self, page: int, items_per_page: int) -> tuple[int, List[CouponWalletVO]]:
        with SessionLocal() as db:
            query = db.query(CouponWallet)
            total_count = query.count()
            offset = (page - 1) * items_per_page
            coupon_wallets = query.limit(items_per_page).offset(offset).all()
            return total_count, [CouponWalletVO(**row_to_dict(cw)) for cw in coupon_wallets]

    def get_coupon_wallets_by_user(self, user_id: str) -> List[CouponWalletVO]:
        with SessionLocal() as db:
            coupon_wallets = db.query(CouponWallet).filter(CouponWallet.user_id == user_id).all()
            return [CouponWalletVO(**row_to_dict(cw)) for cw in coupon_wallets]
        
    def save_payment(self, payment: PaymentVO):
        new_payment = Payment(
            id=payment.id,
            order_id=payment.order_id,
            status=payment.status,
            method=payment.method,
            amount=payment.amount,
            paid_at=payment.paid_at,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
        )
        with SessionLocal() as db:
            try:
                db.add(new_payment)
                db.commit()
            except Exception as e:
                db.rollback()
                raise e
