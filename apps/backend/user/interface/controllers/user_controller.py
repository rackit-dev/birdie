from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from containers import Container
from user.application.user_service import UserService

router = APIRouter(prefix="/users")


class CreateUserBody(BaseModel):
    name: str
    email: str
    password: str


@router.post("", status_code=201)
@inject
def create_user(
    user: CreateUserBody,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    created_user = user_service.create_user(
        name=user.name,
        email=user.email,
        password=user.password
    )
    return created_user


class UpdateUserBody(BaseModel):
    name: str | None = None
    password: str | None = None


@router.put("/{user_id}")
@inject
def update_user(
    user_id: str,
    user: UpdateUserBody,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user = user_service.update_user(
        user_id=user_id,
        name=user.name,
        password=user.password,
    )

    return user


@router.get("")
@inject
def get_users(
    page: int = 1,
    itmes_per_page: int = 10,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    total_count, users = user_service.get_users(page, itmes_per_page)

    return {
        "total_count": total_count,
        "page": page,
        "users": users,
    }

@router.delete("", status_code=204)
@inject
def delete_user(
    user_id: str,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    # TODO: 다른 유저를 삭제할 수 없도록 토큰에서 유저 아이디를 추출한다.

    user_service.delete_user(user_id)