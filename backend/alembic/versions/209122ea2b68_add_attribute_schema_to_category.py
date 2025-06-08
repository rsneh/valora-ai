"""add attribute_schema to category

Revision ID: 209122ea2b68
Revises: 32292ff23d37
Create Date: 2025-06-08 17:36:10.961808

"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects.postgresql import JSONB
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "209122ea2b68"
down_revision: Union[str, None] = "32292ff23d37"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "categories",  # Your table name
        sa.Column(
            "attribute_schema",
            JSONB,
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("categories", "attribute_schema")
