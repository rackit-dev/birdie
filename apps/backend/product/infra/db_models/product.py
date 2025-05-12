from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Product(Base):
    __tablename__ = "Product"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    product_number: Mapped[int] = mapped_column(Integer, autoincrement=True, unique=True) # 상품번호
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    price_whole: Mapped[int] = mapped_column(Integer, nullable=False)
    price_sell: Mapped[int] = mapped_column(Integer, nullable=False)
    discount_rate: Mapped[int] = mapped_column(Integer, nullable=False)  # 0~100
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    category_main: Mapped[str] = mapped_column(String(32), nullable=False)
    category_sub: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime, nullable=False)
