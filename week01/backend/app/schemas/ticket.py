import enum
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class TicketColor(str, enum.Enum):
    red = "red"
    orange = "orange"
    yellow = "yellow"
    green = "green"
    blue = "blue"
    purple = "purple"
    gray = "gray"


class TicketBase(BaseModel):
    title: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        stripped = v.strip()
        if not 1 <= len(stripped) <= 200:
            raise ValueError("title must be between 1 and 200 characters after stripping")
        return stripped


class TicketCreate(TicketBase):
    description: str | None = None
    color: TicketColor | None = None
    tag_ids: list[UUID] = []


class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    color: TicketColor | None = None
    completed: bool | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        stripped = v.strip()
        if not 1 <= len(stripped) <= 200:
            raise ValueError("title must be between 1 and 200 characters after stripping")
        return stripped


class TagInTicket(BaseModel):
    id: UUID
    name: str

    model_config = {"from_attributes": True}


class TicketResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    color: TicketColor | None
    completed: bool
    tags: list[TagInTicket]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    total: int
    limit: int
    offset: int
