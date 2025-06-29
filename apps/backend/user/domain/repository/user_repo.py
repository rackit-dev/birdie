from abc import ABCMeta, abstractmethod
from user.domain.user import User


class IUserRepository(metaclass=ABCMeta):
    @abstractmethod
    def save(self, user: User):
        raise NotImplementedError

    @abstractmethod
    def find_by_email(self, email: str) -> User:
        """
        이메일로 유저 검색.
        검색한 유저가 없을 경우 422 에러를 발생시킴.
        """
        raise NotImplementedError
    
    @abstractmethod
    def find_by_id(self, id: str) -> User:
        """
        id로 유저 검색.
        검색 유저가 없을 경우 422 에러 발생.
        """
        raise NotImplementedError
    
    @abstractmethod
    def get_social_user_info(self, provider: str, social_token: str):
        """
        social provider에 따라 유저를 외부 API를 통해 검색.
        외부 요청 도중 에러가 발생할 경우 502 에러 발생.
        """
        raise NotImplementedError
    
    @abstractmethod
    def find_by_social_token(self, provider: str, social_token: str) -> User:
        raise NotImplementedError
    
    @abstractmethod
    def update(self, user: User):
        raise NotImplementedError
    
    @abstractmethod
    def get_users(self, page: int, items_per_page: int) -> tuple[int, list[User]]:
        raise NotImplementedError
    
    @abstractmethod
    def delete(self, id: str):
        raise NotImplementedError