"""add product images

Revision ID: 2e740c2d5916
Revises: b6575e29e85d
Create Date: 2025-05-24 08:33:12.419155

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2e740c2d5916"
down_revision: Union[str, None] = "b6575e29e85d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the product_images table
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
            name="fk_product_images_product_id_products",
        ),
        sa.UniqueConstraint(
            "product_id", "image_url", name="uq_product_images_product_id_image_url"
        ),
    )

    # Add index on product_id for faster lookups
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the product_images table
    op.drop_table("product_images")

    # Drop the index on product_id
    op.drop_index("ix_product_images_product_id", table_name="product_images")
    # Drop the unique constraint on product_id and image_url
    op.drop_constraint(
        "uq_product_images_product_id_image_url", "product_images", type_="unique"
    )
    # Drop the foreign key constraint
    op.drop_constraint(
        "fk_product_images_product_id_products", "product_images", type_="foreignkey"
    )
