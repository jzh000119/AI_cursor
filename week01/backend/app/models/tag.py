from sqlalchemy import Column, String, func
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.ticket_tag import ticket_tag


class Tag(Base):
    __tablename__ = "tags"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    name = Column(String(50), nullable=False, unique=True)
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    tickets = relationship(
        "Ticket",
        secondary=ticket_tag,
        back_populates="tags",
        passive_deletes=True,
    )
