from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from enum import StrEnum
from typing import Annotated
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from config import get_settings

settings = get_settings()

SECRET_KEY = settings.jwt_secret
ALGORITHM = "HS256"


class Role(StrEnum):
    ADMIN = "ADMIN"
    USER = "USER"


def create_access_token(
    payload: dict,
    role: Role,
    expires_delta: timedelta = timedelta(hours=6) 
):
    expire = datetime.now(tz=timezone.utc) + expires_delta
    payload.update(
        {
            "role": role,
            "exp": expire,
        }
    )
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
oauth2_pwd_scheme = OAuth2PasswordBearer(tokenUrl="/users/login", scheme_name="PasswordToken")
# oauth2_social_scheme = OAuth2PasswordBearer(tokenUrl="/users/social-login", scheme_name="SocialToken")


@dataclass
class CurrentUser:
    id: str
    role: Role


def _extract_user_from_token(token: str) -> tuple[str, str]:
    payload = decode_access_token(token)

    user_id = payload.get("user_id")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    return user_id, role


def get_current_user(token: Annotated[str, Depends(oauth2_pwd_scheme)]): #TODO -> social_scheme
    user_id, role = _extract_user_from_token(token)

    return CurrentUser(user_id, Role(role))


def get_admin_user(token: Annotated[str, Depends(oauth2_pwd_scheme)]):
    user_id, role = _extract_user_from_token(token)

    if role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    return CurrentUser(user_id, Role(role))