from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class User(Base):
    __tablename__ = "User"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(32), nullable=False)
    provider: Mapped[str] = mapped_column(String(32), nullable=True)
    provider_id: Mapped[str] = mapped_column(String(32), nullable=True)
    email: Mapped[str] = mapped_column(String(64), nullable=False) 
    password: Mapped[str] = mapped_column(String(64), nullable=True)
    memo: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime, nullable=False) 
    updated_at: Mapped[str] = mapped_column(DateTime, nullable=False)


class UserInquiry(Base):
    __tablename__ = "UserInquiry"
    
    id = mapped_column(String(36), primary_key=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)
    product_id = mapped_column(String(36), nullable=True)
    order_id = mapped_column(String(36), nullable=True)
    type = mapped_column(String(32), nullable=False)  # 'product', 'order', 'account' 등으로 구분
    content = mapped_column(Text, nullable=False)
    answer = mapped_column(Text, nullable=True)
    status = mapped_column(String(32), default="pending")  # pending, answered, closed
    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime, nullable=False)