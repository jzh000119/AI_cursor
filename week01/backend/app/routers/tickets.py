from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models.ticket import Ticket
from app.schemas.tag import AddTagToTicket
from app.schemas.ticket import TicketCreate, TicketListResponse, TicketResponse, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["tickets"])


def get_ticket_or_404(ticket_id: UUID, db: Session = Depends(get_db)) -> Ticket:
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.get("/", response_model=TicketListResponse)
def list_tickets(
    q: str | None = None,
    completed: bool | None = None,
    tag_ids: Annotated[list[UUID] | None, Query()] = None,
    no_tags: bool = False,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> TicketListResponse:
    items, total = crud.get_tickets(
        db,
        q=q,
        completed=completed,
        tag_ids=tag_ids,
        no_tags=no_tags,
        limit=limit,
        offset=offset,
    )
    return TicketListResponse(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(data: TicketCreate, db: Session = Depends(get_db)) -> TicketResponse:
    return crud.create_ticket(db, data)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket: Ticket = Depends(get_ticket_or_404)) -> TicketResponse:
    return ticket


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    data: TicketUpdate,
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
) -> TicketResponse:
    return crud.update_ticket(db, ticket, data)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
) -> None:
    crud.delete_ticket(db, ticket)


@router.post("/{ticket_id}/tags", response_model=TicketResponse)
def add_tag(
    data: AddTagToTicket,
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
) -> TicketResponse:
    if data.tag_id:
        tag = crud.get_tag(db, data.tag_id)
        if not tag:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    else:
        tag, _ = crud.get_or_create_tag(db, data.tag_name)

    try:
        crud.add_tag_to_ticket(db, ticket, tag)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tag is already associated with this ticket",
        )

    db.refresh(ticket)
    return ticket


@router.delete("/{ticket_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag(
    tag_id: UUID,
    ticket: Ticket = Depends(get_ticket_or_404),
    db: Session = Depends(get_db),
) -> None:
    crud.remove_tag_from_ticket(db, ticket, tag_id)
