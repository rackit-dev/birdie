from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
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

    options: Mapped[list["ProductOption"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan"
    )


class ProductOption(Base):
    __tablename__ = "ProductOption"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("Product.id", ondelete="CASCADE"),
        nullable=False
    )
    option: Mapped[str] = mapped_column(String(32), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[str] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime, nullable=False)
    product: Mapped["Product"] = relationship(back_populates="options")


class ProductLike(Base):
    __tablename__ = "ProductLike"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_user_product_like"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("Product.id", ondelete="CASCADE"),
        nullable=False
    )
    created_at: Mapped[str] = mapped_column(DateTime, nullable=False)

    product: Mapped["Product"] = relationship(back_populates="likes")


class ProductReview(Base):
    __tablename__ = "ProductReview"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("Product.id", ondelete="CASCADE"),
        nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 ~ 5
    content: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime, nullable=False)

    product: Mapped["Product"] = relationship(back_populates="reviews")