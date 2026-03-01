"""Ticket CRUD 集成测试。"""
import uuid


class TestCreateTicket:
    def test_create_success(self, client):
        resp = client.post("/tickets/", json={"title": "测试 Ticket"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "测试 Ticket"
        assert data["completed"] is False
        assert data["color"] is None
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert data["tags"] == []

    def test_create_with_color(self, client):
        resp = client.post("/tickets/", json={"title": "彩色 Ticket", "color": "blue"})
        assert resp.status_code == 201
        assert resp.json()["color"] == "blue"

    def test_create_with_description(self, client):
        resp = client.post("/tickets/", json={"title": "有描述", "description": "这是描述"})
        assert resp.status_code == 201
        assert resp.json()["description"] == "这是描述"

    def test_create_empty_title(self, client):
        resp = client.post("/tickets/", json={"title": ""})
        assert resp.status_code == 422

    def test_create_whitespace_title(self, client):
        resp = client.post("/tickets/", json={"title": "   "})
        assert resp.status_code == 422

    def test_create_title_too_long(self, client):
        resp = client.post("/tickets/", json={"title": "a" * 201})
        assert resp.status_code == 422

    def test_create_invalid_color(self, client):
        resp = client.post("/tickets/", json={"title": "Ticket", "color": "pink"})
        assert resp.status_code == 422

    def test_create_title_stripped(self, client):
        resp = client.post("/tickets/", json={"title": "  有空格  "})
        assert resp.status_code == 201
        assert resp.json()["title"] == "有空格"


class TestListTickets:
    def test_list_empty(self, client):
        resp = client.get("/tickets/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["limit"] == 20
        assert data["offset"] == 0

    def test_list_returns_created_ticket(self, client):
        client.post("/tickets/", json={"title": "列表测试"})
        resp = client.get("/tickets/")
        assert resp.status_code == 200
        assert resp.json()["total"] == 1
        assert resp.json()["items"][0]["title"] == "列表测试"

    def test_list_filter_completed_true(self, client):
        client.post("/tickets/", json={"title": "未完成"})
        r = client.post("/tickets/", json={"title": "已完成"})
        ticket_id = r.json()["id"]
        client.patch(f"/tickets/{ticket_id}", json={"completed": True})

        resp = client.get("/tickets/?completed=true")
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert all(t["completed"] is True for t in items)
        assert len(items) == 1
        assert items[0]["title"] == "已完成"

    def test_list_filter_completed_false(self, client):
        client.post("/tickets/", json={"title": "未完成"})
        r = client.post("/tickets/", json={"title": "已完成"})
        ticket_id = r.json()["id"]
        client.patch(f"/tickets/{ticket_id}", json={"completed": True})

        resp = client.get("/tickets/?completed=false")
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert all(t["completed"] is False for t in items)

    def test_list_search_by_keyword(self, client):
        client.post("/tickets/", json={"title": "前端开发任务"})
        client.post("/tickets/", json={"title": "后端 API 设计"})

        resp = client.get("/tickets/?q=前端")
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert len(items) == 1
        assert items[0]["title"] == "前端开发任务"

    def test_list_search_case_insensitive(self, client):
        client.post("/tickets/", json={"title": "Fix Bug"})
        client.post("/tickets/", json={"title": "Add Feature"})

        resp = client.get("/tickets/?q=fix")
        assert resp.status_code == 200
        assert resp.json()["total"] == 1

    def test_list_no_tags_filter(self, client):
        # 创建一个有标签的 Ticket 和一个无标签的
        client.post("/tickets/", json={"title": "无标签"})
        r2 = client.post("/tickets/", json={"title": "有标签"})
        # 先创建标签，再关联
        tag_resp = client.post("/tags/", json={"name": "测试标签"})
        tag_id = tag_resp.json()["id"]
        client.post(f"/tickets/{r2.json()['id']}/tags", json={"tag_id": tag_id})

        resp = client.get("/tickets/?no_tags=true")
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert len(items) == 1
        assert items[0]["title"] == "无标签"

    def test_list_pagination(self, client):
        for i in range(5):
            client.post("/tickets/", json={"title": f"Ticket {i}"})

        resp = client.get("/tickets/?limit=2&offset=0")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 5
        assert len(data["items"]) == 2
        assert data["limit"] == 2
        assert data["offset"] == 0


class TestGetTicket:
    def test_get_existing_ticket(self, client):
        r = client.post("/tickets/", json={"title": "获取测试"})
        ticket_id = r.json()["id"]

        resp = client.get(f"/tickets/{ticket_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == ticket_id

    def test_get_nonexistent_ticket(self, client):
        resp = client.get(f"/tickets/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestUpdateTicket:
    def test_update_title(self, client):
        r = client.post("/tickets/", json={"title": "原标题"})
        ticket_id = r.json()["id"]

        resp = client.patch(f"/tickets/{ticket_id}", json={"title": "新标题"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "新标题"

    def test_update_completed(self, client):
        r = client.post("/tickets/", json={"title": "待完成"})
        ticket_id = r.json()["id"]

        resp = client.patch(f"/tickets/{ticket_id}", json={"completed": True})
        assert resp.status_code == 200
        assert resp.json()["completed"] is True

    def test_update_color_to_null(self, client):
        r = client.post("/tickets/", json={"title": "有颜色", "color": "red"})
        ticket_id = r.json()["id"]

        resp = client.patch(f"/tickets/{ticket_id}", json={"color": None})
        assert resp.status_code == 200
        assert resp.json()["color"] is None

    def test_update_nonexistent_ticket(self, client):
        resp = client.patch(f"/tickets/{uuid.uuid4()}", json={"title": "不存在"})
        assert resp.status_code == 404

    def test_update_empty_title_fails(self, client):
        r = client.post("/tickets/", json={"title": "正常标题"})
        ticket_id = r.json()["id"]

        resp = client.patch(f"/tickets/{ticket_id}", json={"title": ""})
        assert resp.status_code == 422


class TestDeleteTicket:
    def test_delete_success(self, client):
        r = client.post("/tickets/", json={"title": "待删除"})
        ticket_id = r.json()["id"]

        resp = client.delete(f"/tickets/{ticket_id}")
        assert resp.status_code == 204

        # 再次获取应返回 404
        resp2 = client.get(f"/tickets/{ticket_id}")
        assert resp2.status_code == 404

    def test_delete_nonexistent_ticket(self, client):
        resp = client.delete(f"/tickets/{uuid.uuid4()}")
        assert resp.status_code == 404

    def test_delete_cascades_ticket_tags(self, client):
        r = client.post("/tickets/", json={"title": "待级联删除"})
        ticket_id = r.json()["id"]
        tag_resp = client.post("/tags/", json={"name": "级联标签"})
        tag_id = tag_resp.json()["id"]
        client.post(f"/tickets/{ticket_id}/tags", json={"tag_id": tag_id})

        client.delete(f"/tickets/{ticket_id}")

        # 标签本身仍存在
        tag_check = client.get("/tags/")
        tag_names = [t["name"] for t in tag_check.json()]
        assert "级联标签" in tag_names

    def test_list_tag_filter_by_tag_ids(self, client):
        r1 = client.post("/tickets/", json={"title": "Ticket A"})
        r2 = client.post("/tickets/", json={"title": "Ticket B"})

        tag_resp = client.post("/tags/", json={"name": "共同标签"})
        tag_id = tag_resp.json()["id"]

        client.post(f"/tickets/{r1.json()['id']}/tags", json={"tag_id": tag_id})
        client.post(f"/tickets/{r2.json()['id']}/tags", json={"tag_id": tag_id})

        resp = client.get(f"/tickets/?tag_ids={tag_id}")
        assert resp.status_code == 200
        assert resp.json()["total"] == 2
