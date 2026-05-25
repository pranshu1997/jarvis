"""Storage migration and sync helpers tests."""

from storage import migrate_legacy_data, items_by_status, new_item, next_order


def test_migrate_completed_task_to_done():
    raw = {
        "tasks": [
            {
                "id": "b69b802e-41fa-4e8c-8855-361543541e38",
                "title": "Take a shower",
                "completed": True,
                "created_at": "2026-05-25T19:02:35",
            }
        ],
        "roadmap": [],
    }
    data = migrate_legacy_data(raw)
    assert data["version"] == 2
    assert len(data["items"]) == 1
    assert data["items"][0]["status"] == "done"
    assert data["items"][0]["title"] == "Take a shower"


def test_migrate_roadmap_status_map():
    raw = {
        "tasks": [],
        "roadmap": [
            {"id": "1", "title": "Launch", "status": "In Progress", "created_at": "2026-01-01"},
            {"id": "2", "title": "Plan Q2", "status": "On Hold", "created_at": "2026-01-02"},
        ],
    }
    data = migrate_legacy_data(raw)
    by_title = {i["title"]: i["status"] for i in data["items"]}
    assert by_title["Launch"] == "in_progress"
    assert by_title["Plan Q2"] == "backlog"


def test_new_item_order():
    items = [
        {"id": "a", "title": "A", "status": "backlog", "order": 0, "created_at": ""},
        {"id": "b", "title": "B", "status": "backlog", "order": 1, "created_at": ""},
    ]
    item = new_item("C", status="backlog", items=items)
    assert item["order"] == 2


def test_items_by_status_sort():
    items = [
        {"id": "a", "title": "A", "status": "backlog", "order": 2, "created_at": ""},
        {"id": "b", "title": "B", "status": "backlog", "order": 0, "created_at": ""},
    ]
    ordered = items_by_status(items, "backlog")
    assert [i["title"] for i in ordered] == ["B", "A"]
