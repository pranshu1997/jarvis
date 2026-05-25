"""Local JSON persistence for Jarvis board items."""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

DATA_FILE = Path(__file__).parent / "data" / "tasks.json"
DATA_VERSION = 2

STATUSES = ("backlog", "in_progress", "done")
TRASH_KEY = "trash"

COLUMN_LABELS = {
    "backlog": "Backlog",
    "in_progress": "In Progress",
    "done": "Done",
    TRASH_KEY: "Trash",
}

HEADER_TO_STATUS = {
    COLUMN_LABELS["backlog"]: "backlog",
    COLUMN_LABELS["in_progress"]: "in_progress",
    COLUMN_LABELS["done"]: "done",
    COLUMN_LABELS[TRASH_KEY]: TRASH_KEY,
}

ROADMAP_STATUS_MAP = {
    "Planned": "backlog",
    "In Progress": "in_progress",
    "Done": "done",
    "On Hold": "backlog",
}


def _default_data() -> dict[str, Any]:
    return {"version": DATA_VERSION, "items": []}


def _now_iso() -> str:
    return datetime.now().isoformat()


def _normalize_status(status: str) -> str:
    if status in STATUSES:
        return status
    return "backlog"


def next_order(items: list[dict[str, Any]], status: str) -> int:
    column = [i for i in items if i.get("status") == status]
    if not column:
        return 0
    return max(i.get("order", 0) for i in column) + 1


def items_by_status(items: list[dict[str, Any]], status: str) -> list[dict[str, Any]]:
    return sorted(
        (i for i in items if _normalize_status(i.get("status", "backlog")) == status),
        key=lambda x: x.get("order", 0),
    )


def new_item(title: str, *, status: str = "backlog", items: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    status = _normalize_status(status)
    existing = items or []
    return {
        "id": str(uuid.uuid4()),
        "title": title.strip()[:200],
        "status": status,
        "order": next_order(existing, status),
        "created_at": _now_iso(),
    }


def migrate_legacy_data(raw: dict[str, Any]) -> dict[str, Any]:
    if raw.get("version") == DATA_VERSION and "items" in raw and "tasks" not in raw and "roadmap" not in raw:
        items = raw.get("items", [])
        for item in items:
            item["status"] = _normalize_status(item.get("status", "backlog"))
        return {"version": DATA_VERSION, "items": items}

    items: list[dict[str, Any]] = []
    order_counters = {s: 0 for s in STATUSES}

    for task in raw.get("tasks", []):
        status = "done" if task.get("completed") else "backlog"
        items.append(
            {
                "id": task.get("id") or str(uuid.uuid4()),
                "title": (task.get("title") or "Untitled").strip()[:200],
                "status": status,
                "order": order_counters[status],
                "created_at": task.get("created_at") or _now_iso(),
            }
        )
        order_counters[status] += 1

    for entry in raw.get("roadmap", []):
        status = _normalize_status(ROADMAP_STATUS_MAP.get(entry.get("status", "Planned"), "backlog"))
        items.append(
            {
                "id": entry.get("id") or str(uuid.uuid4()),
                "title": (entry.get("title") or "Untitled").strip()[:200],
                "status": status,
                "order": order_counters[status],
                "created_at": entry.get("created_at") or _now_iso(),
            }
        )
        order_counters[status] += 1

    return {"version": DATA_VERSION, "items": items}


def load_data() -> dict[str, Any]:
    if not DATA_FILE.exists():
        return _default_data()
    try:
        with DATA_FILE.open(encoding="utf-8") as f:
            raw = json.load(f)
    except (json.JSONDecodeError, OSError):
        return _default_data()

    if raw.get("version") == DATA_VERSION and "items" in raw and "tasks" not in raw and "roadmap" not in raw:
        data = {"version": DATA_VERSION, "items": raw.get("items", [])}
        for item in data["items"]:
            item["status"] = _normalize_status(item.get("status", "backlog"))
        return data

    migrated = migrate_legacy_data(raw)
    save_data(migrated)
    return migrated


def save_data(data: dict[str, Any]) -> None:
    payload = {
        "version": DATA_VERSION,
        "items": data.get("items", []),
    }
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
