from datetime import datetime
from typing import List
from fastapi import HTTPException, UploadFile
import requests
import jose.jwt as jwt

from database import SessionLocal
from utils.db_utils import row_to_dict
from common.s3_upload import upload_images_to_s3, delete_images_from_s3
from user.domain.repository.user_repo import IUserRepository
from user.domain.user import User as UserVO
from user.domain.user import UserInquiry as UserInquiryVO
from user.infra.db_models.user import User, UserInquiry


class UserRepository(IUserRepository):
    def save(self, user: UserVO):
        new_user = User(
            id=user.id,
            email=user.email,
            name=user.name,
            provider=user.provider,
            provider_id=user.provider_id,
            password=user.password,
            memo=user.memo,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

        with SessionLocal() as db:
            db.add(new_user)
            db.commit()

    def find_by_email(self, email: str) -> UserVO:
        with SessionLocal() as db:
            user = db.query(User).filter(
                User.email == email,
                User.provider == None
            ).first()
        
        if not user:
            raise HTTPException(status_code=422)
        
        return UserVO(**row_to_dict(user))
    
    def find_by_id(self, id) -> UserVO:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == id).first()
        
        if not user:
            raise HTTPException(status_code=422)

        return UserVO(**row_to_dict(user))
    
    def get_social_user_info(self, provider: str, social_token: str):
        try:
            if provider == "KAKAO":
                social_response = requests.get(
                    url="https://kapi.kakao.com/v2/user/me",
                    headers={"Authorization": f"Bearer {social_token}"}
                ).json()
                if not social_response['id'] and social_response['code'] != 200:
                    raise ValueError
            elif provider == "GOOGLE":
                social_response = requests.get(
                    url="https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {social_token}"}
                ).json()
                if not social_response['sub'] and social_response['error']:
                    raise ValueError
            elif provider == "APPLE":
                key_payload = requests.get("https://appleid.apple.com/auth/keys")
                kid = jwt.get_unverified_header(social_token)["kid"]
                jwks = key_payload.json()["keys"]
                public_key = None
                for key in jwks:
                    if key["kid"] == kid:
                        public_key = key
                        break
                social_response = jwt.decode(social_token, public_key, algorithms=["RS256"], audience="com.ung26.mobile")
                if social_response["iss"] not in ["https://appleid.apple.com", "appleid.apple.com"]:
                    raise ValueError
            else:
                raise ValueError
        except:
            raise HTTPException(status_code=502, detail="Failed to retrieve social user information")
        
        return social_response

    def find_by_social_token(self, provider: str, social_token: str) -> UserVO:
        social_response = self.get_social_user_info(provider, social_token)
        if provider == "KAKAO":
            social_id = social_response["id"]
        elif provider == "GOOGLE":
            social_id = social_response["sub"]
        elif provider == "APPLE":
            social_id = social_response["sub"]

        with SessionLocal() as db:
            user = db.query(User).filter(
                User.provider == provider,
                User.provider_id == social_id,
            ).first()

        if not user:
            return None
        
        return UserVO(**row_to_dict(user)) 
    
    def update(self, user_vo: UserVO):
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_vo.id).first()

        if not user:
            raise HTTPException(status_code=422)
        
        user.name = user_vo.name
        user.password = user_vo.password
        user.updated_at = user_vo.updated_at
        db.add(user)
        db.commit()

        return user
    
    def get_users(self, page: int = 1, items_per_page: int = 10,
    ) -> tuple[int, list[UserVO]]:
        with SessionLocal() as db:
            query = db.query(User)
            total_count = query.count()

            offset = (page - 1) * items_per_page
            users = query.limit(items_per_page).offset(offset).all()

        return total_count, [UserVO(**row_to_dict(user)) for user in users]
    
    def delete(self, id: str):
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == id).first()

            if not user:
                raise HTTPException(status_code=422)
            
            db.delete(user)
            db.commit()

    def create_inquiry(self, inquiry: UserInquiryVO, images: List[UploadFile]) -> UserInquiryVO:
        new_inquiry = UserInquiry(
            id=inquiry.id,
            user_id=inquiry.user_id,
            product_id=inquiry.product_id,
            order_id=inquiry.order_id,
            type=inquiry.type,
            content=inquiry.content,
            answer=inquiry.answer,
            status=inquiry.status,
            created_at=inquiry.created_at,
            updated_at=inquiry.updated_at,
        )

        with SessionLocal() as db:
            db.add(new_inquiry)
            db.flush()
            upload_images_to_s3(f"inquiries/{new_inquiry.id}", images)
            db.commit()

    def get_inquiries_by_user(
        self, user_id: str, page: int, items_per_page: int
    ) -> tuple[int, list[UserInquiryVO]]:
        with SessionLocal() as db:
            query = db.query(UserInquiry).filter(UserInquiry.user_id == user_id)
            total_count = query.count()

            offset = (page - 1) * items_per_page
            inquiries = query.limit(items_per_page).offset(offset).all()

        return total_count, [UserInquiryVO(**row_to_dict(inquiry)) for inquiry in inquiries]

    def get_inquiries_by_product(
        self, product_id: str, page: int, items_per_page: int
    ) -> tuple[int, list[UserInquiryVO]]:
        with SessionLocal() as db:
            query = db.query(UserInquiry).filter(UserInquiry.product_id == product_id)
            total_count = query.count()

            offset = (page - 1) * items_per_page
            inquiries = query.limit(items_per_page).offset(offset).all()

        return total_count, [UserInquiryVO(**row_to_dict(inquiry)) for inquiry in inquiries]

    def delete_inquiry(self, inquiry_id: str):
        with SessionLocal() as db:
            inquiry = db.query(UserInquiry).filter(UserInquiry.id == inquiry_id).first()

            if not inquiry:
                raise HTTPException(status_code=422, detail="Inquiry not found")

            try:
                db.delete(inquiry)
                delete_images_from_s3(f"inquiries/{inquiry_id}")
                db.commit()
            except:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to delete inquiry.")

    def create_inquiry_answer(self, inquiry_vo: UserInquiryVO) -> UserInquiryVO:
        with SessionLocal() as db:
            inquiry = db.query(UserInquiry).filter(UserInquiry.id == inquiry_vo.id).first()

            if not inquiry:
                raise HTTPException(status_code=422, detail="Inquiry not found")

            inquiry.answer = inquiry_vo.answer
            inquiry.updated_at = inquiry_vo.updated_at

            db.add(inquiry)
            db.commit()
            db.refresh(inquiry)

        return UserInquiryVO(**row_to_dict(inquiry))

    def find_inquiry_by_id(self, inquiry_id: str) -> UserInquiryVO:
        with SessionLocal() as db:
            inquiry = db.query(UserInquiry).filter(UserInquiry.id == inquiry_id).first()

            if not inquiry:
                raise HTTPException(status_code=422, detail="Inquiry not found")

        return UserInquiryVO(**row_to_dict(inquiry))

    def delete_inquiry_answer(self, inquiry_id: str):
        with SessionLocal() as db:
            inquiry = db.query(UserInquiry).filter(UserInquiry.id == inquiry_id).first()

            if not inquiry:
                raise HTTPException(status_code=422, detail="Inquiry not found")

            inquiry.answer = None
            inquiry.updated_at = datetime.now()
            db.add(inquiry)
            db.commit()