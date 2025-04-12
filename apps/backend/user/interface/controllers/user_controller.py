from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/users")


class CreateUserBody(BaseModel):
    name: str
    email: str
    password: str


@router.post("")
def create_user(user: CreateUserBody):
    return user