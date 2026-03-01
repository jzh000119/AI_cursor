"""Pydantic Schema 校验逻辑单元测试（无需数据库）。"""
import pytest
from app.schemas.tag import AddTagToTicket, TagCreate
from app.schemas.ticket import TicketCreate, TicketUpdate
from pydantic import ValidationError


class TestTicketCreateSchema:
    def test_valid_title(self):
        t = TicketCreate(title="合法标题")
        assert t.title == "合法标题"

    def test_title_stripped(self):
        t = TicketCreate(title="  有空格  ")
        assert t.title == "有空格"

    def test_empty_title_raises(self):
        with pytest.raises(ValidationError):
            TicketCreate(title="")

    def test_whitespace_only_title_raises(self):
        with pytest.raises(ValidationError):
            TicketCreate(title="   ")

    def test_title_too_long_raises(self):
        with pytest.raises(ValidationError):
            TicketCreate(title="a" * 201)

    def test_title_exactly_200_chars(self):
        t = TicketCreate(title="a" * 200)
        assert len(t.title) == 200

    def test_valid_color(self):
        t = TicketCreate(title="Ticket", color="red")
        assert t.color.value == "red"

    def test_invalid_color_raises(self):
        with pytest.raises(ValidationError):
            TicketCreate(title="Ticket", color="pink")

    def test_color_none_is_valid(self):
        t = TicketCreate(title="Ticket", color=None)
        assert t.color is None

    def test_all_valid_colors(self):
        colors = ["red", "orange", "yellow", "green", "blue", "purple", "gray"]
        for color in colors:
            t = TicketCreate(title="Ticket", color=color)
            assert t.color.value == color


class TestTicketUpdateSchema:
    def test_all_fields_optional(self):
        t = TicketUpdate()
        assert t.title is None
        assert t.color is None
        assert t.completed is None

    def test_title_none_skips_validation(self):
        t = TicketUpdate(title=None)
        assert t.title is None

    def test_title_empty_raises(self):
        with pytest.raises(ValidationError):
            TicketUpdate(title="")

    def test_title_too_long_raises(self):
        with pytest.raises(ValidationError):
            TicketUpdate(title="b" * 201)


class TestTagCreateSchema:
    def test_valid_name(self):
        t = TagCreate(name="bug")
        assert t.name == "bug"

    def test_empty_name_raises(self):
        with pytest.raises(ValidationError):
            TagCreate(name="")

    def test_whitespace_name_raises(self):
        with pytest.raises(ValidationError):
            TagCreate(name="  ")

    def test_name_stripped(self):
        t = TagCreate(name="  feature  ")
        assert t.name == "feature"


class TestAddTagToTicketSchema:
    def test_tag_id_only_valid(self):
        import uuid
        t = AddTagToTicket(tag_id=str(uuid.uuid4()))
        assert t.tag_id is not None

    def test_tag_name_only_valid(self):
        t = AddTagToTicket(tag_name="backend")
        assert t.tag_name == "backend"

    def test_both_none_raises(self):
        with pytest.raises(ValidationError):
            AddTagToTicket()

    def test_both_provided_valid(self):
        import uuid
        t = AddTagToTicket(tag_id=str(uuid.uuid4()), tag_name="bug")
        assert t.tag_id is not None
        assert t.tag_name == "bug"
