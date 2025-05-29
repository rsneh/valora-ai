"""add pending_sale enum to products

Revision ID: 32292ff23d37
Revises: 8103a19724e6
Create Date: 2025-05-29 13:05:08.748112

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "32292ff23d37"
down_revision: Union[str, None] = "8103a19724e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE product_status_enum ADD VALUE 'PENDING_SALE'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
