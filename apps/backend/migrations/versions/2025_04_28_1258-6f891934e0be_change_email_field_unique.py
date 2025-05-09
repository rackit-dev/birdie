"""change email field unique

Revision ID: 6f891934e0be
Revises: 1c77e38ff8ec
Create Date: 2025-04-28 12:58:04.891733

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f891934e0be'
down_revision: Union[str, None] = '1c77e38ff8ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('email', table_name='User')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index('email', 'User', ['email'], unique=True)
    # ### end Alembic commands ###
