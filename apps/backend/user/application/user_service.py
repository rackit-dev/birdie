from typing import List
from datetime import datetime, timezone
from dependency_injector.wiring import inject
from fastapi import HTTPException, status, UploadFile
from ulid import ULID

from common.auth import Role, create_access_token
from utils.crypto import Crypto
from utils.name_generator import generate_random_name
from user.domain.user import User, UserInquiry, UserAddress
from user.domain.repository.user_repo import IUserRepository


class UserService:
    @inject
    def __init__(
        self,
        user_repo: IUserRepository,
    ):
        self.user_repo = user_repo
        self.ulid = ULID()
        self.crypto = Crypto()

    def create_user(
        self, 
        name: str,
        email: str,
        password: str,
    ) -> User:
        _user = None

        try:
            _user = self.user_repo.find_by_email(email)
        except HTTPException as e:
            if e.status_code != 422:
                raise e

        if _user:
            raise HTTPException(status_code=422)
        
        now = datetime.now(timezone.utc)
        user: User = User(
            id=self.ulid.generate(),
            name=name,
            provider=None,
            provider_id=None,
            email=email,
            password=self.crypto.encrypt(password),
            memo=None,
            created_at=now,
            updated_at=now,
        )
        self.user_repo.save(user)

        return user
    
    def _create_social_user(self, provider: str, social_token: str) -> User:
        social_response = self.user_repo.get_social_user_info(provider, social_token)

        try:
            now = datetime.now(timezone.utc)
            if provider == "KAKAO":
                user: User = User(
                    id=self.ulid.generate(),
                    name=social_response["kakao_account"]["profile"]["nickname"],
                    provider=provider,
                    provider_id=social_response["id"],
                    email=social_response["kakao_account"]["email"],
                    password=None,
                    memo=None,
                    created_at=now,
                    updated_at=now,
                )
            elif provider == "GOOGLE":
                user: User = User(
                    id=self.ulid.generate(),
                    name=social_response["name"],
                    provider=provider,
                    provider_id=social_response["sub"],
                    email=social_response["email"],
                    password=None,
                    memo=None,
                    created_at=now,
                    updated_at=now,
                )
            elif provider == "APPLE":
                user: User = User(
                    id=self.ulid.generate(),
                    name=generate_random_name(),
                    provider=provider,
                    provider_id=social_response["sub"],
                    email=social_response["email"],
                    password=None,
                    memo=None,
                    created_at=now,
                    updated_at=now,
                )
        except KeyError:
            raise HTTPException(status_code=422, detail="Failed to retrieve social user information")
        
        self.user_repo.save(user)

        return user
    
    def update_user(
        self,
        user_id: str,
        name: str | None = None,
        password: str | None = None,
        memo: str | None = None,
    ) -> User:
        user = self.user_repo.find_by_id(user_id)

        if name:
            user.name = name
        if password:
            user.password = self.crypto.encrypt(password)
        if memo:
            user.memo = memo

        user.updated_at = datetime.now(timezone.utc)
        self.user_repo.update(user)

        return user
    
    def get_users(self, page: int, items_per_page: int) -> tuple[int, list[User]]:
        users = self.user_repo.get_users(page, items_per_page)

        return users
    
    def get_user(self, user_id: str) -> User:
        user = self.user_repo.find_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def delete_user(self, user_id: str):
        self.user_repo.delete(user_id)

    def login(self, email: str, password: str):
        user = self.user_repo.find_by_email(email)

        if not self.crypto.verify(password, user.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        
        access_token = create_access_token(
            payload={"user_id": user.id},
            role=Role.ADMIN,
        )

        return access_token
    
    def social_login(self, provider: str, social_token: str):
        # Check for active user
        user = self.user_repo.find_by_social_token(provider, social_token, is_deleted=False)
        now = datetime.now(timezone.utc)

        if user:  # Active user exists
            user_status = "EXISTING"
        else:  # No active user, check for withdrawn user
            withdrawn_user = self.user_repo.find_by_social_token(provider, social_token, is_deleted=True)
            if withdrawn_user:
                days_since_withdrawal = (now - withdrawn_user.updated_at.replace(tzinfo=timezone.utc)).days
                if days_since_withdrawal < 30:  # 30 days restriction
                    raise HTTPException(status_code=422, detail="You can rejoin after 30 days from withdrawal.")

            user = self._create_social_user(provider, social_token)
            user_status = "NEW" if not withdrawn_user else "REJOINED"

        access_token = create_access_token(
            payload={"user_id": user.id},
            role=Role.USER,
        )

        return access_token, user_status
    
    def create_user_inquiry(
        self,
        user_id: str,
        product_id: str | None,
        order_id: str | None,
        type: str,
        content: str,
        images: List[UploadFile] = [],
    ):
        try:
            self.user_repo.find_by_id(user_id)
        except HTTPException as e:
            if e.status_code == 422:
                raise HTTPException(status_code=422, detail=f"User id does not exist.")
            raise e

        now = datetime.now(timezone.utc)
        inquiry = UserInquiry(
            id=self.ulid.generate(),
            user_id=user_id,
            product_id=product_id,
            order_id=order_id,
            type=type,
            content=content,
            answer=None,
            status="PENDING",
            created_at=now,
            updated_at=now,
        )
        self.user_repo.create_inquiry(inquiry, images)

        return inquiry
    
    def get_inquiries(self, page: int, items_per_page: int) -> tuple[int, list[UserInquiry]]:
        total_count, inquiries = self.user_repo.get_inquiries(page, items_per_page)
        return total_count, inquiries

    def get_user_inquiries(
        self,
        identifier: str,
        page: int,
        items_per_page: int,
        by_user: bool = True,
    ):
        if by_user:
            total_count, inquiries = self.user_repo.get_inquiries_by_user(
                user_id=identifier, page=page, items_per_page=items_per_page
            )
        else:
            total_count, inquiries = self.user_repo.get_inquiries_by_product(
                product_id=identifier, page=page, items_per_page=items_per_page
            )
        return {"total_count": total_count, "inquiries": inquiries}

    def delete_user_inquiry(self, inquiry_id: str):
        self.user_repo.delete_inquiry(inquiry_id)

    def answer_inquiry(self, inquiry_id: str, answer: str) -> UserInquiry:
        inquiry = self.user_repo.find_inquiry_by_id(inquiry_id)
        
        inquiry.answer = answer
        inquiry.updated_at = datetime.now(timezone.utc)

        self.user_repo.create_inquiry_answer(inquiry)

        return inquiry

    def delete_inquiry_answer(self, inquiry_id: str):
        self.user_repo.delete_inquiry_answer(inquiry_id)

    def create_user_address(
        self,
        user_id: str,
        recipient_name: str,
        phone_number: str,
        zipcode: str,
        address_line1: str,
        address_line2: str | None = None,
        order_memo: str | None = None,
    ) -> UserAddress:
        now = datetime.now(timezone.utc)
        address = UserAddress(
            id=self.ulid.generate(),
            user_id=user_id,
            recipient_name=recipient_name,
            phone_number=phone_number,
            zipcode=zipcode,
            address_line1=address_line1,
            address_line2=address_line2,
            order_memo=order_memo,
            created_at=now,
            updated_at=now,
        )
        self.user_repo.save_address(address)

        return address
    
    def get_user_addresses(self, user_id: str) -> List[UserAddress]:
        addresses = self.user_repo.get_addresses_by_user(user_id)
        return addresses
    
    def update_user_address(self, user_address_id: str, **kwargs) -> UserAddress:
        address = self.user_repo.find_address_by_id(user_address_id)
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        
        for key, value in kwargs.items():
            if hasattr(address, key) and value is not None:
                setattr(address, key, value)
        address.updated_at = datetime.now(timezone.utc)

        self.user_repo.update_address(address)

        return address
    
    def delete_user_address(self, address_id: str):
        self.user_repo.delete_address(address_id)