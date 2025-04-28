from fastapi import HTTPException
import requests

from database import SessionLocal
from utils.db_utils import row_to_dict
from user.domain.repository.user_repo import IUserRepository
from user.domain.user import User as UserVO
from user.infra.db_models.user import User


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
    
    def get_social_user_info(self, provider, social_token):
        try:
            if provider == "KAKAO":
                social_response = requests.get(
                    url="https://kapi.kakao.com/v2/user/me",
                    headers={"Authorization": f"Bearer {social_token}"}
                ).json()
            elif provider == "GOOGLE":
                pass
            elif provider == "APPLE":
                pass
        except:
            raise HTTPException(status_code=422)
        
        return social_response

    def find_by_social_token(self, provider, social_token) -> UserVO:
        social_response = self.get_social_user_info(provider, social_token)
        social_id = social_response["id"]

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
    
    def get_users(
            self,
            page: int = 1,
            items_per_page: int = 10,
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