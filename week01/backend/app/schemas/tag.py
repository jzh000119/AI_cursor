from uuid import UUID

from pydantic import BaseModel, field_validator, model_validator


class TagCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        stripped = v.strip()
        if not 1 <= len(stripped) <= 50:
            raise ValueError("name must be between 1 and 50 characters after stripping")
        return stripped


class TagResponse(BaseModel):
    id: UUID
    name: str
    ticket_count: int | None = None

    model_config = {"from_attributes": True}


class AddTagToTicket(BaseModel):
    tag_id: UUID | None = None
    tag_name: str | None = None

    @model_validator(mode="after")
    def at_least_one(self) -> "AddTagToTicket":
        if self.tag_id is None and self.tag_name is None:
            raise ValueError("At least one of tag_id or tag_name must be provided")
        return self
