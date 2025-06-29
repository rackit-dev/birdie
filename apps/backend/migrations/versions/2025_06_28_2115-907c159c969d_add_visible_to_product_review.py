"""Add visible to product review

Revision ID: 907c159c969d
Revises: c9bdc8f6f39a
Create Date: 2025-06-28 21:15:52.741370

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '907c159c969d'
down_revision: Union[str, None] = 'c9bdc8f6f39a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('ProductReview', sa.Column('visible', sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('ProductReview', 'visible')
    # ### end Alembic commands ###
