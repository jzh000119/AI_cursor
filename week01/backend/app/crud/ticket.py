from uuid import UUID

from sqlalchemy import exists
from sqlalchemy.orm import Session, selectinload

from app.models.ticket import Ticket
from app.models.ticket_tag import ticket_tag
from app.schemas.ticket import TicketCreate, TicketUpdate


def get_ticket(db: Session, ticket_id: UUID) -> Ticket | None:
    return (
        db.query(Ticket)
        .options(selectinload(Ticket.tags))
        .filter(Ticket.id == ticket_id)
        .first()
    )


def get_tickets(
    db: Session,
    q: str | None = None,
    completed: bool | None = None,
    tag_ids: list[UUID] | None = None,
    no_tags: bool = False,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Ticket], int]:
    query = db.query(Ticket)

    if q:
        query = query.filter(Ticket.title.ilike(f"%{q}%"))
    if completed is not None:
        query = query.filter(Ticket.completed == completed)
    if tag_ids:
        for tag_id in tag_ids:
            query = query.filter(
                exists().where(
                    ticket_tag.c.ticket_id == Ticket.id,
                    ticket_tag.c.tag_id == tag_id,
                )
            )
    if no_tags:
        query = query.filter(~Ticket.tags.any())

    total = query.count()
    items = (
        query.options(selectinload(Ticket.tags))
        .order_by(Ticket.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def create_ticket(db: Session, data: TicketCreate) -> Ticket:
    from app.models.tag import Tag

    ticket = Ticket(
        title=data.title,
        description=data.description,
        color=data.color.value if data.color else None,
    )
    if data.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()
        ticket.tags = tags

    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    # reload tags after commit
    db.query(Ticket).options(selectinload(Ticket.tags)).filter(Ticket.id == ticket.id).first()
    return ticket


def update_ticket(db: Session, ticket: Ticket, data: TicketUpdate) -> Ticket:
    update_data = data.model_dump(exclude_unset=True)
    if "color" in update_data and update_data["color"] is not None:
        # TicketColor inherits from str, but store explicit value for clarity
        update_data["color"] = update_data["color"].value
    for key, value in update_data.items():
        setattr(ticket, key, value)
    db.commit()
    db.refresh(ticket)
    return ticket


def delete_ticket(db: Session, ticket: Ticket) -> None:
    db.delete(ticket)
    db.commit()
