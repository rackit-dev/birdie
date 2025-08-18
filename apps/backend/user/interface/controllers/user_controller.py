from datetime import datetime
from typing import Annotated, List
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends, UploadFile, File, Form  # Import Form for annotated usage
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field

from containers import Container
from common.auth import CurrentUser, get_current_user, get_admin_user
from user.application.user_service import UserService
from utils.val_image import validate_images

router = APIRouter(prefix="/users")


class CreateUserBody(BaseModel):
    name: str = Field(min_length=2, max_length=8)
    email: EmailStr = Field(max_length=64)
    password: str = Field(min_length=8, max_length=32)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    updated_at: datetime


@router.post("", status_code=201, response_model=UserResponse)
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
    name: str | None = Field(min_length=2, max_length=8, default=None)


@router.put("", response_model=UserResponse)
@inject
def update_user(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    body: UpdateUserBody,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user = user_service.update_user(
        user_id=current_user.id,
        name=body.name,
    )

    return user


class UpdateAdminBody(BaseModel):
    name: str | None = Field(min_length=2, max_length=8, default=None)
    password: str | None = Field(min_length=8, max_length=32, default=None)


@router.put("/admin", response_model=UserResponse)
@inject
def update_admin(
    current_user: Annotated[CurrentUser, Depends(get_admin_user)],
    body: UpdateAdminBody,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user = user_service.update_user(
        user_id=current_user.id,
        name=body.name,
        password=body.password,
    )
    
    return user


class GetUsersResponse(BaseModel):
    total_count: int
    page: int
    users: list[UserResponse]


@router.get("", response_model=GetUsersResponse)
@inject
def get_users(
    page: int = 1,
    itmes_per_page: int = 10,
    current_user: CurrentUser = Depends(get_admin_user),
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
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_service.delete_user(current_user.id)


@router.delete("/admin", status_code=204)
@inject
def delete_admin(
    current_user: Annotated[CurrentUser, Depends(get_admin_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_service.delete_user(current_user.id)


@router.post("/login")
@inject
def user_login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    access_token = user_service.login(
        email=form_data.username,
        password=form_data.password,
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/social-login")
@inject
def social_login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    access_token = user_service.social_login(
        provider=form_data.username,
        social_token=form_data.password
    )

    return {"access_token": access_token, "token_type": "bearer"}


class UserInquiryResponse(BaseModel):
    id: str
    user_id: str
    product_id: str | None
    order_id: str | None
    type: str
    content: str
    answer: str | None
    status: str
    created_at: datetime
    updated_at: datetime


@router.post("/inquiry", status_code=201, response_model=UserInquiryResponse)
@inject
def create_user_inquiry(
    user_id: Annotated[str, Form(..., min_length=10, max_length=36)],
    type: Annotated[str, Form(..., min_length=1, max_length=32)],
    content: Annotated[str, Form(..., min_length=1, max_length=500)],
    images: List[UploadFile] = File(...),
    user_service: UserService = Depends(Provide[Container.user_service]),
    product_id: Annotated[str | None, Form(min_length=10, max_length=36)] = None,
    order_id: Annotated[str | None, Form(min_length=10, max_length=36)] = None,
):
    validate_images(images)
    inquiry = user_service.create_user_inquiry(
        user_id=user_id,
        product_id=product_id,
        order_id=order_id,
        type=type,
        content=content,
        images=images,
    )

    return inquiry


@router.get("/inquiry/by_user", response_model=list[UserInquiryResponse])
@inject
def get_user_inquiries(
    user_id: str,
    page: int = 1,
    items_per_page: int = 5,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    inquiries = user_service.get_user_inquiries(user_id, page, items_per_page)

    return inquiries


@router.get("/inquiry/by_product", response_model=list[UserInquiryResponse])
@inject
def get_user_inquiries(
    product_id: str,
    page: int = 1,
    items_per_page: int = 5,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    inquiries = user_service.get_user_inquiries(product_id, page, items_per_page)

    return inquiries


@router.delete("/inquiry", status_code=204)
@inject
def delete_user_inquiry(
    inquiry_id: str,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_service.delete_user_inquiry(inquiry_id)