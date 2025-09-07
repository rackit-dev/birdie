from typing import List
from abc import ABCMeta, abstractmethod
from fastapi import UploadFile

from user.domain.user import User, UserInquiry


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
    def get_social_user_info(self, provider: str, social_token: str, code: str | None):
        """
        social provider에 따라 유저를 외부 API를 통해 검색.
        외부 요청 도중 에러가 발생할 경우 502 에러 발생.
        """
        raise NotImplementedError
    
    @abstractmethod
    def find_by_social_token(self, provider: str, social_token: str, code: str | None) -> User:
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
    
    @abstractmethod
    def create_inquiry(self, inquiry: UserInquiry, images: List[UploadFile]) -> UserInquiry:
        """
        유저 문의 생성.
        """
        raise NotImplementedError

    @abstractmethod
    def get_inquiries_by_user(
        self, user_id: str, page: int, items_per_page: int
    ) -> tuple[int, list[UserInquiry]]:
        """
        특정 유저의 문의 목록을 페이지네이션하여 반환.
        """
        raise NotImplementedError

    @abstractmethod
    def get_inquiries_by_product(
        self, product_id: str, page: int, items_per_page: int
    ) -> tuple[int, list[UserInquiry]]:
        """
        특정 상품의 문의 목록을 페이지네이션하여 반환.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_inquiry(self, inquiry_id: str):
        """
        특정 문의 삭제.
        """
        raise NotImplementedError

    @abstractmethod
    def create_inquiry_answer(self, inquiry_id: str, answer: str) -> UserInquiry:
        """
        문의에 답변 추가.
        """
        raise NotImplementedError

    @abstractmethod
    def find_inquiry_by_id(self, inquiry_id: str) -> UserInquiry:
        """
        특정 문의를 ID로 검색.
        검색된 문의가 없을 경우 422 에러 발생.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_inquiry_answer(self, inquiry_id: str):
        """
        특정 문의의 답변 삭제.
        """
        raise NotImplementedError
    
