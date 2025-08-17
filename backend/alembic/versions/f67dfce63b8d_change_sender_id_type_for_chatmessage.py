"""Change sender_id type for ChatMessage

Revision ID: f67dfce63b8d
Revises: 6ca7348e2043
Create Date: 2025-08-17 08:00:21.167755

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f67dfce63b8d"
down_revision: Union[str, None] = "6ca7348e2043"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.execute("TRUNCATE chat_messages")

    op.alter_column(
        "chat_messages",
        "sender_id",
        existing_type=sa.String(),
        type_=sa.INTEGER(),
        existing_nullable=True,
        postgresql_using="sender_id::integer",
    )

    op.drop_index(op.f("ix_chat_messages_sender_id"), table_name="chat_messages")


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "chat_messages",
        "sender_id",
        existing_type=sa.INTEGER(),
        type_=sa.String(),
        existing_nullable=True,
    )
