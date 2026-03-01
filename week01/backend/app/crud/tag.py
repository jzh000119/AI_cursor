from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.tag import Tag
from app.models.ticket_tag import ticket_tag
from app.schemas.tag import TagCreate


def get_tag(db: Session, tag_id: UUID) -> Tag | None:
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tag_by_name(db: Session, name: str) -> Tag | None:
    return db.query(Tag).filter(Tag.name == name).first()


def get_tags(db: Session, with_count: bool = False) -> list[Tag]:
    if with_count:
        count_subq = (
            db.query(
                ticket_tag.c.tag_id.label("tag_id"),
                func.count(ticket_tag.c.ticket_id).label("ticket_count"),
            )
            .group_by(ticket_tag.c.tag_id)
            .subquery()
        )
        rows = (
            db.query(Tag, count_subq.c.ticket_count)
            .outerjoin(count_subq, Tag.id == count_subq.c.tag_id)
            .order_by(Tag.name)
            .all()
        )
        result = []
        for tag, count in rows:
            tag.ticket_count = count if count is not None else 0
            result.append(tag)
        return result
    return db.query(Tag).order_by(Tag.name).all()


def create_tag(db: Session, data: TagCreate) -> Tag:
    tag = Tag(name=data.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag: Tag) -> None:
    db.delete(tag)
    db.commit()


def add_tag_to_ticket(db: Session, ticket, tag: Tag) -> None:
    if tag in ticket.tags:
        raise ValueError("Tag already associated with this ticket")
    ticket.tags.append(tag)
    db.commit()


def remove_tag_from_ticket(db: Session, ticket, tag_id: UUID) -> None:
    ticket.tags = [t for t in ticket.tags if t.id != tag_id]
    db.commit()


def get_or_create_tag(db: Session, name: str) -> tuple[Tag, bool]:
    tag = get_tag_by_name(db, name)
    if tag:
        return tag, False
    tag = Tag(name=name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag, True
