"""product seller fields

Revision ID: 8103a19724e6
Revises: 2e740c2d5916
Create Date: 2025-05-27 17:06:10.959823

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8103a19724e6"
down_revision: Union[str, None] = "2e740c2d5916"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "products",
        sa.Column("seller_name", sa.String(), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column("seller_phone", sa.String(), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column(
            "seller_allowed_to_contact",
            sa.Boolean(),
            default=False,
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("products", "seller_name")
    op.drop_column("products", "seller_phone")
    op.drop_column("products", "seller_allowed_to_contact")
