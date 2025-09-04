from typing import List
from datetime import datetime
from dependency_injector.wiring import inject
from fastapi import HTTPException, status, UploadFile
from ulid import ULID

from common.auth import Role, create_access_token
from utils.crypto import Crypto
from user.domain.user import User, UserInquiry
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
        
        now = datetime.now()
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
            now = datetime.now()
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
                pass
        except KeyError:
            raise HTTPException(status_code=422, detail="Failed to retrieve social user information")
        
        self.user_repo.save(user)

        return user
    
    def update_user(
        self,
        user_id: str,
        name: str | None = None,
        password: str | None = None,
    ) -> User:
        user = self.user_repo.find_by_id(user_id)

        if name:
            user.name = name
        if password:
            user.password = self.crypto.encrypt(password)
        user.updated_at = datetime.now()

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
        user = self.user_repo.find_by_social_token(provider, social_token)
        
        user_status = ""
        if not user:
            user = self._create_social_user(provider, social_token)
            user_status = "NEW"
        else:
            user_status = "EXISTING"

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

        now = datetime.now()
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
        inquiry.updated_at = datetime.now()

        self.user_repo.create_inquiry_answer(inquiry)

        return inquiry

    def delete_inquiry_answer(self, inquiry_id: str):
        self.user_repo.delete_inquiry_answer(inquiry_id)