from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class CartItem(Base):
    __tablename__ = "CartItem"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    product_id: Mapped[str] = mapped_column(String(36), nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    option_type_1: Mapped[str] = mapped_column(String(32), nullable=True)
    option_1: Mapped[str] = mapped_column(String(32), nullable=True)
    is_option_1_active: Mapped[bool] = mapped_column(nullable=True, default=True)
    option_type_2: Mapped[str] = mapped_column(String(32), nullable=True)
    option_2: Mapped[str] = mapped_column(String(32), nullable=True)
    is_option_2_active: Mapped[bool] = mapped_column(nullable=True, default=True)
    option_type_3: Mapped[str] = mapped_column(String(32), nullable=True)
    option_3: Mapped[str] = mapped_column(String(32), nullable=True)
    is_option_3_active: Mapped[bool] = mapped_column(nullable=True, default=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime, nullable=False)