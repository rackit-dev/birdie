from datetime import datetime, timezone
from typing import List, Optional
from dependency_injector.wiring import inject
from fastapi import HTTPException, Request
from ulid import ULID
import portone_server_sdk as portone
from dateutil import parser

from order.domain.order import Order, Coupon, CouponWallet, OrderItem, Payment, Refund
from order.domain.repository.order_repo import IOrderRepository
from config import get_settings


class OrderService:
    @inject
    def __init__(
        self,
        order_repo: IOrderRepository,
    ):
        self.settings = get_settings()
        self.order_repo = order_repo
        self.ulid = ULID()
        self.portone_client = portone.PaymentClient(secret=self.settings.iamport_payment_secret)

    def create_order(
        self,
        user_id: str,
        subtotal_price: int,
        coupon_discount_price: int,
        point_discount_price: int,
        total_price: int,
        recipient_name: str,
        phone_number: str,
        zipcode: str,
        address_line1: str,
        address_line2: Optional[str],
        order_memo: Optional[str],
        items: List[dict],
    ) -> Order:
        now = datetime.now(timezone.utc)

        # Validate items and prepare order items
        order_items = []
        for item in items:
            order_items.append(
                OrderItem(
                    id=self.ulid.generate(),
                    order_id="None",  # Will be set after order creation
                    product_id=item.product_id,
                    product_name=item.product_name,
                    coupon_wallet_id=item.coupon_wallet_id,
                    status="주문완료",
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    coupon_discount_price=item.coupon_discount_price,
                    point_discount_price=item.point_discount_price,
                    final_price=item.final_price,
                    option_1_type=item.option_1_type,
                    option_1_value=item.option_1_value,
                    option_2_type=item.option_2_type,
                    option_2_value=item.option_2_value,
                    option_3_type=item.option_3_type,
                    option_3_value=item.option_3_value,
                    created_at=now,
                    updated_at=now,
                )
            )

        # Create order
        order = Order(
            id=self.ulid.generate(),
            user_id=user_id,
            status="결제대기",
            subtotal_price=subtotal_price,
            coupon_discount_price=coupon_discount_price,
            point_discount_price=point_discount_price,
            total_price=total_price,
            recipient_name=recipient_name,
            phone_number=phone_number,
            zipcode=zipcode,
            address_line1=address_line1,
            address_line2=address_line2,
            order_memo=order_memo,
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save(order)

        # Save order items
        for item in order_items:
            item.order_id = order.id
            self.order_repo.save_order_item(item)

        return order

    def get_order(self, order_id: str) -> tuple[Order, List[OrderItem]]:
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order_items = self.order_repo.get_order_items(order_id)
        if not order_items:
            raise HTTPException(status_code=404, detail="Order items not found")
        
        return order, order_items

    def get_orders(self, page: int, items_per_page: int) -> tuple[int, List[Order]]:
        total_count, orders = self.order_repo.get_orders(page, items_per_page)
        return total_count, orders
    
    def get_orders_by_user(self, user_id: str) -> tuple[int, List[Order]]:
        total_count, orders = self.order_repo.get_orders_by_user(user_id)
        return total_count, orders

    def create_coupon(
        self,
        code: str | None,
        description: str | None,
        discount_type: str,
        discount_rate: int | None,
        discount_amount: int | None,
        min_order_amount: int,
        max_discount_amount: int,
        valid_from: datetime,
        valid_until: datetime,
    ) -> Coupon:
        now = datetime.now(timezone.utc)  # Ensure `now` is timezone-aware

        # Validation logic
        if discount_type not in ["비율", "정액"]:
            raise HTTPException(status_code=400, detail="Invalid discount type. Must be '비율' or '정액'.")

        if discount_type == "비율":
            if discount_rate is None or not (0 < discount_rate <= 99):
                raise HTTPException(status_code=400, detail="Discount rate must be between 1 and 99 for '비율' type.")
            if discount_amount is not None:
                raise HTTPException(status_code=400, detail="Discount amount must be None for '비율' type.")

        if discount_type == "정액":
            if discount_amount is None or discount_amount <= 0:
                raise HTTPException(status_code=400, detail="Discount amount must be greater than 0 for '정액' type.")
            if discount_rate is not None:
                raise HTTPException(status_code=400, detail="Discount rate must be None for '정액' type.")

        if valid_from >= valid_until:
            raise HTTPException(status_code=400, detail="valid_from must be earlier than valid_until.")

        if valid_until <= now:
            raise HTTPException(status_code=400, detail="valid_until must be a future date.")

        # Create coupon
        coupon = Coupon(
            id=self.ulid.generate(),
            code=code,
            description=description,
            discount_type=discount_type,
            discount_rate=discount_rate,
            discount_amount=discount_amount,
            min_order_amount=min_order_amount,
            max_discount_amount=max_discount_amount,
            valid_from=valid_from,
            valid_until=valid_until,
            is_active=True,
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save_coupon(coupon)
        return coupon

    def get_coupon(self, coupon_id: str) -> Coupon:
        coupon = self.order_repo.find_coupon_by_id(coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return coupon

    def get_coupons(self, page: int, items_per_page: int) -> tuple[int, List[Coupon]]:
        total_count, coupons = self.order_repo.get_coupons(page, items_per_page)
        return total_count, coupons
    
    def mark_coupon_inactive(self, coupon_id: str) -> Coupon:
        coupon = self.order_repo.find_coupon_by_id(coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        coupon.is_active = False
        coupon.updated_at = datetime.now(timezone.utc)
        self.order_repo.update_coupon(coupon)
        return coupon

    def create_coupon_wallet(self, user_id: str, coupon_id: str) -> CouponWallet:
        now = datetime.now(timezone.utc)
        coupon_wallet = CouponWallet(
            id=self.ulid.generate(),
            user_id=user_id,
            coupon_id=coupon_id,
            is_used=False,
            used_at=None,
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save_coupon_wallet(coupon_wallet)
        return coupon_wallet
    
    def create_coupon_wallet_by_code(self, user_id: str, coupon_code: str) -> CouponWallet:
        coupon = self.order_repo.find_coupon_by_code(coupon_code)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        if not coupon.is_active:
            raise HTTPException(status_code=400, detail="Coupon is inactive")
        
        now = datetime.now(timezone.utc)
        valid_from = coupon.valid_from.replace(tzinfo=timezone.utc)
        valid_until = coupon.valid_until.replace(tzinfo=timezone.utc)
        
        if not (valid_from <= now <= valid_until):
            raise HTTPException(status_code=400, detail="Coupon is not valid at this time")
        
        existing_wallet = self.order_repo.find_coupon_wallet_by_user_and_coupon(user_id, coupon.id)
        if existing_wallet:
            raise HTTPException(status_code=400, detail="Coupon already in wallet")
        
        coupon_wallet = CouponWallet(
            id=self.ulid.generate(),
            user_id=user_id,
            coupon_id=coupon.id,
            is_used=False,
            used_at=None,
            created_at=now,
            updated_at=now,
        )
        self.order_repo.save_coupon_wallet(coupon_wallet)
        return coupon_wallet

    def get_coupon_wallet(self, coupon_wallet_id: str) -> CouponWallet:
        total_count, coupon_wallet = self.order_repo.find_coupon_wallet_by_id(coupon_wallet_id)
        if not coupon_wallet:
            raise HTTPException(status_code=404, detail="CouponWallet not found")
        return total_count, coupon_wallet

    def get_coupon_wallets(self, page: int, items_per_page: int) -> tuple[int, List[CouponWallet]]:
        total_count, coupon_wallets = self.order_repo.get_coupon_wallets(page, items_per_page)
        return total_count, coupon_wallets

    def get_coupon_wallets_by_user(self, user_id: str) -> List[CouponWallet]:
        coupon_wallets = self.order_repo.get_coupon_wallets_by_user(user_id)
        return coupon_wallets
    
    def use_coupon_wallet(self, coupon_wallet_id: str) -> CouponWallet:
        coupon_wallet = self.order_repo.find_coupon_wallet_by_id(coupon_wallet_id)
        if not coupon_wallet:
            raise HTTPException(status_code=404, detail="CouponWallet not found")
        if coupon_wallet.is_used:
            raise HTTPException(status_code=400, detail="CouponWallet is already used")
        coupon_wallet.is_used = True
        coupon_wallet.used_at = datetime.now(timezone.utc)
        coupon_wallet.updated_at = datetime.now(timezone.utc)
        self.order_repo.update_coupon_wallet(coupon_wallet)
        return coupon_wallet

    def delete_coupon_wallet(self, coupon_wallet_id: str):
        coupon_wallet = self.order_repo.find_coupon_wallet_by_id(coupon_wallet_id)
        if not coupon_wallet:
            raise HTTPException(status_code=404, detail="CouponWallet not found")
        self.order_repo.delete_coupon_wallet(coupon_wallet_id)

    async def handle_webhook(self, request: Request, is_test: bool):
        if is_test == True:
            secrets = self.settings.iamport_webhook_secret_test
        else:
            secrets = self.settings.iamport_webhook_secret
        body_bytes = await request.body()
        payload_string = body_bytes.decode('utf-8')
        try:
            webhook = portone.webhook.verify(
                secret=secrets,
                payload=payload_string,
                headers=request.headers
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

        if isinstance(webhook, portone.webhook.WebhookTransactionPaid): # 결제 승인
            try:
                iamport_payment_response = await self.portone_client.get_payment_async(payment_id=webhook.data.payment_id)
                if not iamport_payment_response:
                    raise ValueError
                
                order_id = iamport_payment_response.custom_data[1:-1]
                order = self.order_repo.find_by_id(order_id)
                if not order:
                    raise ValueError

                now = datetime.now(timezone.utc)
                payment = Payment(
                    id=self.ulid.generate(),
                    order_id=order_id,
                    merchant_id=webhook.data.payment_id,
                    status="성공",
                    method=iamport_payment_response.method.provider,
                    amount=iamport_payment_response.amount.total,
                    paid_at=parser.isoparse(iamport_payment_response.paid_at),
                    created_at=now,
                    updated_at=now,
                )
                self.order_repo.save_payment(payment)
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))
        else:
            return {"status": "ignored", "message": "Unhandled webhook type"}

    def refund_payment(self, order_id: str, payment_id: str, merchant_id: str, amount: int, memo: str | None) -> Refund:
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        payment = self.order_repo.find_payment_by_id(payment_id)
        if not payment or payment.status != "성공":
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if amount <= 0 or amount != payment.amount:
            raise HTTPException(status_code=400, detail="Invalid refund amount")

        try:
            response = self.portone_client.cancel_payment(
                payment_id=merchant_id,
                amount=amount,
                reason=memo,
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        if isinstance(response.cancellation, portone.payment.SucceededPaymentCancellation): # 취소 성공
            order_items = self.order_repo.get_order_items(order_id)
            now = datetime.now(timezone.utc)
            refund = Refund(
                id=self.ulid.generate(),
                order_id=order_id,
                payment_id=payment_id,
                merchant_id=merchant_id,
                status="완료",
                amount=amount,
                restore_point_amount=0,
                created_at=now,
                updated_at=now,
                memo=memo,
            )
            self.order_repo.make_refund(order, order_items, payment, refund)
            return refund