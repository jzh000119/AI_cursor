"""Ticket-Tag 关联接口集成测试。"""
import uuid


class TestAddTagToTicket:
    def _create_ticket(self, client, title="测试 Ticket"):
        r = client.post("/tickets/", json={"title": title})
        assert r.status_code == 201
        return r.json()

    def _create_tag(self, client, name="测试标签"):
        r = client.post("/tags/", json={"name": name})
        assert r.status_code == 201
        return r.json()

    def test_add_tag_by_tag_id(self, client):
        ticket = self._create_ticket(client)
        tag = self._create_tag(client)

        resp = client.post(
            f"/tickets/{ticket['id']}/tags",
            json={"tag_id": tag["id"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        tag_ids = [t["id"] for t in data["tags"]]
        assert tag["id"] in tag_ids

    def test_add_tag_by_tag_name_existing(self, client):
        ticket = self._create_ticket(client)
        self._create_tag(client, name="已存在标签")

        resp = client.post(
            f"/tickets/{ticket['id']}/tags",
            json={"tag_name": "已存在标签"},
        )
        assert resp.status_code == 200
        tag_names = [t["name"] for t in resp.json()["tags"]]
        assert "已存在标签" in tag_names

    def test_add_tag_by_tag_name_creates_new(self, client):
        ticket = self._create_ticket(client)

        resp = client.post(
            f"/tickets/{ticket['id']}/tags",
            json={"tag_name": "自动创建标签"},
        )
        assert resp.status_code == 200
        tag_names = [t["name"] for t in resp.json()["tags"]]
        assert "自动创建标签" in tag_names

        # 标签已在全局 tag 列表中
        all_tags = client.get("/tags/").json()
        assert any(t["name"] == "自动创建标签" for t in all_tags)

    def test_add_duplicate_tag_returns_409(self, client):
        ticket = self._create_ticket(client)
        tag = self._create_tag(client)

        client.post(f"/tickets/{ticket['id']}/tags", json={"tag_id": tag["id"]})
        # 再次关联同一标签
        resp = client.post(
            f"/tickets/{ticket['id']}/tags",
            json={"tag_id": tag["id"]},
        )
        assert resp.status_code == 409

    def test_add_tag_to_nonexistent_ticket(self, client):
        tag = self._create_tag(client)
        resp = client.post(
            f"/tickets/{uuid.uuid4()}/tags",
            json={"tag_id": tag["id"]},
        )
        assert resp.status_code == 404

    def test_add_nonexistent_tag_id(self, client):
        ticket = self._create_ticket(client)
        resp = client.post(
            f"/tickets/{ticket['id']}/tags",
            json={"tag_id": str(uuid.uuid4())},
        )
        assert resp.status_code == 404

    def test_add_tag_neither_id_nor_name(self, client):
        ticket = self._create_ticket(client)
        resp = client.post(f"/tickets/{ticket['id']}/tags", json={})
        assert resp.status_code == 422


class TestRemoveTagFromTicket:
    def _setup_ticket_with_tag(self, client):
        ticket = client.post("/tickets/", json={"title": "有标签的 Ticket"}).json()
        tag = client.post("/tags/", json={"name": "要移除的标签"}).json()
        client.post(f"/tickets/{ticket['id']}/tags", json={"tag_id": tag["id"]})
        return ticket, tag

    def test_remove_tag_success(self, client):
        ticket, tag = self._setup_ticket_with_tag(client)

        resp = client.delete(f"/tickets/{ticket['id']}/tags/{tag['id']}")
        assert resp.status_code == 204

        # Ticket 上的标签已移除
        ticket_data = client.get(f"/tickets/{ticket['id']}").json()
        assert all(t["id"] != tag["id"] for t in ticket_data["tags"])

    def test_remove_tag_tag_still_exists(self, client):
        ticket, tag = self._setup_ticket_with_tag(client)

        client.delete(f"/tickets/{ticket['id']}/tags/{tag['id']}")

        # 标签本身仍存在于全局列表
        all_tags = client.get("/tags/").json()
        assert any(t["id"] == tag["id"] for t in all_tags)

    def test_remove_tag_from_nonexistent_ticket(self, client):
        tag = client.post("/tags/", json={"name": "孤立标签"}).json()
        resp = client.delete(f"/tickets/{uuid.uuid4()}/tags/{tag['id']}")
        assert resp.status_code == 404

    def test_remove_multiple_tags_independently(self, client):
        ticket = client.post("/tickets/", json={"title": "多标签 Ticket"}).json()
        tag1 = client.post("/tags/", json={"name": "标签一"}).json()
        tag2 = client.post("/tags/", json={"name": "标签二"}).json()
        client.post(f"/tickets/{ticket['id']}/tags", json={"tag_id": tag1["id"]})
        client.post(f"/tickets/{ticket['id']}/tags", json={"tag_id": tag2["id"]})

        # 移除 tag1
        client.delete(f"/tickets/{ticket['id']}/tags/{tag1['id']}")

        ticket_data = client.get(f"/tickets/{ticket['id']}").json()
        tag_ids = [t["id"] for t in ticket_data["tags"]]
        assert tag1["id"] not in tag_ids
        assert tag2["id"] in tag_ids

    def test_delete_ticket_cascades_ticket_tags(self, client):
        ticket, tag = self._setup_ticket_with_tag(client)
        ticket_id = ticket["id"]
        tag_id = tag["id"]

        client.delete(f"/tickets/{ticket_id}")

        # Ticket 已不存在
        assert client.get(f"/tickets/{ticket_id}").status_code == 404
        # 标签仍存在
        all_tags = client.get("/tags/").json()
        assert any(t["id"] == tag_id for t in all_tags)
