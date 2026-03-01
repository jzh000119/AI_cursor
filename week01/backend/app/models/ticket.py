from sqlalchemy import Boolean, Column, Index, String, Text, func
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.ticket_tag import ticket_tag


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(20), nullable=True)
    completed = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    tags = relationship(
        "Tag",
        secondary=ticket_tag,
        back_populates="tickets",
        passive_deletes=True,
    )

    __table_args__ = (
        Index("idx_tickets_title", "title"),
        Index("idx_tickets_completed", "completed"),
    )
