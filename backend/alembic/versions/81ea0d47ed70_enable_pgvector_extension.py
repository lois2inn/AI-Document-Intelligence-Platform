"""enable pgvector extension

Revision ID: 81ea0d47ed70
Revises: 97471653da38
Create Date: 2026-05-15 20:47:52.392973

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '81ea0d47ed70'
down_revision: Union[str, Sequence[str], None] = '97471653da38'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP EXTENSION IF EXISTS vector")
