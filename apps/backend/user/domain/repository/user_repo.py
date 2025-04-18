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
        raise NotImplementedError
    
    @abstractmethod
    def update(self, user: User):
        raise NotImplementedError
    
    @abstractmethod
    def get_users(self) -> list[User]:
        raise NotImplementedError