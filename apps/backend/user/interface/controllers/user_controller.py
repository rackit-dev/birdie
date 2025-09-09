from datetime import datetime
from typing import Annotated, List, Optional
from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends, UploadFile, File, Form
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
    provider: str | None
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


@router.get("/all", response_model=GetUsersResponse)
@inject
def get_users(
    current_user: Annotated[CurrentUser, Depends(get_admin_user)],
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


@router.get("", response_model=UserResponse)
@inject
def get_user(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user = user_service.get_user(current_user.id)
    return user


@router.delete("", status_code=204)
@inject
def delete_for_user(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_service.update_user(
        user_id=current_user.id,
        name="탈퇴유저",
        memo="탈퇴유저"
    )


@router.delete("/admin", status_code=204)
@inject
def delete_for_admin(
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
    access_token, user_status = user_service.social_login(
        provider=form_data.username,
        social_token=form_data.password,
    )

    return {"user_status": user_status, "access_token": access_token, "token_type": "bearer"}


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
    product_id: Optional[str] = Form(None, min_length=10, max_length=36),
    order_id: Optional[str] = Form(None, min_length=10, max_length=36),
    images: Optional[List[UploadFile]] = File(None),
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    if images:
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


class GetUserInquiriesResponse(BaseModel):
    total_count: int
    inquiries: list[UserInquiryResponse]


@router.get("/inquiry", response_model=GetUserInquiriesResponse)
@inject
def get_user_inquiries(
    current_user: Annotated[CurrentUser, Depends(get_admin_user)],
    page: int = 1,
    items_per_page: int = 5,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    total_count, inquiries = user_service.get_inquiries(page, items_per_page)
    return {
        "total_count": total_count,
        "inquiries": inquiries,
    }


@router.get("/inquiry/by_user", response_model=GetUserInquiriesResponse)
@inject
def get_user_inquiries_by_user(
    user_id: str,
    page: int = 1,
    items_per_page: int = 5,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    result = user_service.get_user_inquiries(
        identifier=user_id, page=page, items_per_page=items_per_page, by_user=True
    )
    return result


@router.get("/inquiry/by_product", response_model=GetUserInquiriesResponse)
@inject
def get_user_inquiries_by_product(
    product_id: str,
    page: int = 1,
    items_per_page: int = 5,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    result = user_service.get_user_inquiries(
        identifier=product_id, page=page, items_per_page=items_per_page, by_user=False
    )
    return result


@router.delete("/inquiry", status_code=204)
@inject
def delete_user_inquiry(
    inquiry_id: str,
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_service.delete_user_inquiry(inquiry_id)


class AnswerInquiryBody(BaseModel):
    inquiry_id: str
    answer: str = Field(min_length=1, max_length=500)


@router.post("/inquiry/answer", response_model=UserInquiryResponse)
@inject
def post_inquiry_answer(
    body: AnswerInquiryBody,
    #current_user: Annotated[CurrentUser, Depends(get_admin_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    inquiry = user_service.answer_inquiry(
        inquiry_id=body.inquiry_id,
        answer=body.answer,
    )
    return inquiry


@router.delete("/inquiry/answer", status_code=204)
@inject
def delete_inquiry_answer(
    inquiry_id: str,
    #current_user: Annotated[CurrentUser, Depends(get_admin_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_service.delete_inquiry_answer(inquiry_id)


class CreateUserAddressRequest(BaseModel):
    recipient_name: str = Field(min_length=1, max_length=32)
    phone_number: str = Field(min_length=9, max_length=15)
    zipcode: str = Field(min_length=5, max_length=10)
    address_line1: str = Field(min_length=1, max_length=100)
    address_line2: str | None
    order_memo: str | None = Field(max_length=200)


class UpdateUserAddressRequest(BaseModel):
    user_address_id: str = Field(min_length=10, max_length=36)
    recipient_name: str = Field(min_length=1, max_length=32)
    phone_number: str = Field(min_length=9, max_length=15)
    zipcode: str = Field(min_length=5, max_length=10)
    address_line1: str = Field(min_length=1, max_length=100)
    address_line2: str | None
    order_memo: str | None = Field(max_length=200, default=None)


class UserAddressResponse(BaseModel):
    id: str
    user_id: str
    recipient_name: str
    phone_number: str
    zipcode: str
    address_line1: str
    address_line2: str | None
    order_memo: str | None
    created_at: datetime
    updated_at: datetime


@router.post("/user_address", status_code=201, response_model=UserAddressResponse)
@inject
def create_user_address(
    body: CreateUserAddressRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_address = user_service.create_user_address(
        user_id=current_user.id,
        recipient_name=body.recipient_name,
        phone_number=body.phone_number,
        zipcode=body.zipcode,
        address_line1=body.address_line1,
        address_line2=body.address_line2,
        order_memo=body.order_memo,
    )
    return user_address


@router.get("/user_address", response_model=List[UserAddressResponse])
@inject
def get_user_addresses(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_addresses = user_service.get_user_addresses(user_id=current_user.id)
    return user_addresses


@router.put("/user_address", response_model=UserAddressResponse)
@inject
def update_user_address(
    body: UpdateUserAddressRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_address = user_service.update_user_address(
        user_address_id=body.user_address_id,
        recipient_name=body.recipient_name,
        phone_number=body.phone_number,
        zipcode=body.zipcode,
        address_line1=body.address_line1,
        address_line2=body.address_line2,
        order_memo=body.order_memo,
    )
    return user_address


@router.delete("/user_address", status_code=204)
@inject
def delete_user_address(
    user_address_id: str,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    user_service.delete_user_address(user_address_id)