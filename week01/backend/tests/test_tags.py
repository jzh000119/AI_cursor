"""Tag CRUD 集成测试。"""
import uuid


class TestCreateTag:
    def test_create_success(self, client):
        resp = client.post("/tags/", json={"name": "bug"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "bug"
        assert "id" in data

    def test_create_duplicate_name(self, client):
        client.post("/tags/", json={"name": "duplicate"})
        resp = client.post("/tags/", json={"name": "duplicate"})
        assert resp.status_code == 409

    def test_create_empty_name(self, client):
        resp = client.post("/tags/", json={"name": ""})
        assert resp.status_code == 422

    def test_create_name_stripped(self, client):
        resp = client.post("/tags/", json={"name": "  feature  "})
        assert resp.status_code == 201
        assert resp.json()["name"] == "feature"

    def test_create_name_too_long(self, client):
        resp = client.post("/tags/", json={"name": "a" * 51})
        assert resp.status_code == 422


class TestListTags:
    def test_list_empty(self, client):
        resp = client.get("/tags/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_returns_tags(self, client):
        client.post("/tags/", json={"name": "alpha"})
        client.post("/tags/", json={"name": "beta"})

        resp = client.get("/tags/")
        assert resp.status_code == 200
        names = [t["name"] for t in resp.json()]
        assert "alpha" in names
        assert "beta" in names

    def test_list_sorted_by_name(self, client):
        client.post("/tags/", json={"name": "zebra"})
        client.post("/tags/", json={"name": "apple"})
        client.post("/tags/", json={"name": "mango"})

        resp = client.get("/tags/")
        names = [t["name"] for t in resp.json()]
        assert names == sorted(names)

    def test_list_with_ticket_count(self, client):
        tag_resp = client.post("/tags/", json={"name": "统计标签"})
        tag_id = tag_resp.json()["id"]
        ticket_resp = client.post("/tickets/", json={"title": "测试 Ticket"})
        ticket_id = ticket_resp.json()["id"]
        client.post(f"/tickets/{ticket_id}/tags", json={"tag_id": tag_id})

        resp = client.get("/tags/?with_count=true")
        assert resp.status_code == 200
        tag_data = next(t for t in resp.json() if t["id"] == tag_id)
        assert tag_data["ticket_count"] == 1


class TestDeleteTag:
    def test_delete_success(self, client):
        r = client.post("/tags/", json={"name": "待删除"})
        tag_id = r.json()["id"]

        resp = client.delete(f"/tags/{tag_id}")
        assert resp.status_code == 204

        # 确认已删除
        all_tags = client.get("/tags/").json()
        assert all(t["id"] != tag_id for t in all_tags)

    def test_delete_nonexistent_tag(self, client):
        resp = client.delete(f"/tags/{uuid.uuid4()}")
        assert resp.status_code == 404

    def test_delete_tag_cascades_ticket_tags(self, client):
        tag_resp = client.post("/tags/", json={"name": "关联标签"})
        tag_id = tag_resp.json()["id"]
        ticket_resp = client.post("/tickets/", json={"title": "关联 Ticket"})
        ticket_id = ticket_resp.json()["id"]
        client.post(f"/tickets/{ticket_id}/tags", json={"tag_id": tag_id})

        # 删除标签
        client.delete(f"/tags/{tag_id}")

        # Ticket 仍存在，但不再有该标签
        ticket_data = client.get(f"/tickets/{ticket_id}").json()
        assert all(t["id"] != tag_id for t in ticket_data["tags"])
