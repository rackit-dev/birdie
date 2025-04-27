from datetime import datetime
from dependency_injector.wiring import inject
from fastapi import HTTPException, status
from ulid import ULID

from common.auth import Role, create_access_token
from utils.crypto import Crypto
from user.domain.user import User
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
    ):
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
    
    def update_user(
        self,
        user_id: str,
        name: str | None = None,
        password: str | None = None,
    ):
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
        #user = self.user_repo.find_by_social_token(provider, social_access_token)
        test = self.user_repo.find_by_social_token(provider, social_token)

        """
        access_token = create_access_token(
            payload={"user_id": user.id},
            role=Role.USER,
        )
        """

        return test