"""Local JSON persistence for tasks and roadmap items."""

from __future__ import annotations

import json
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Any

DATA_FILE = Path(__file__).parent / "data" / "tasks.json"

PRIORITIES = ("Urgent", "High", "Medium", "Low")
CATEGORIES = ("Work", "Personal", "Health", "Learning", "Finance", "Roadmap", "Other")
ROADMAP_STATUSES = ("Planned", "In Progress", "Done", "On Hold")


def _default_data() -> dict[str, Any]:
    return {"tasks": [], "roadmap": []}


def load_data() -> dict[str, Any]:
    if not DATA_FILE.exists():
        return _default_data()
    with DATA_FILE.open(encoding="utf-8") as f:
        data = json.load(f)
    data.setdefault("tasks", [])
    data.setdefault("roadmap", [])
    return data


def save_data(data: dict[str, Any]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


def new_task(
    title: str,
    *,
    description: str = "",
    priority: str = "Medium",
    category: str = "Personal",
    due_date: date | None = None,
) -> dict[str, Any]:
    return {
        "id": str(uuid.uuid4()),
        "title": title.strip(),
        "description": description.strip(),
        "priority": priority,
        "category": category,
        "due_date": due_date.isoformat() if due_date else None,
        "completed": False,
        "created_at": datetime.now().isoformat(),
    }


def new_roadmap_item(
    title: str,
    *,
    description: str = "",
    status: str = "Planned",
    target_date: date | None = None,
    category: str = "Roadmap",
) -> dict[str, Any]:
    return {
        "id": str(uuid.uuid4()),
        "title": title.strip(),
        "description": description.strip(),
        "status": status,
        "target_date": target_date.isoformat() if target_date else None,
        "category": category,
        "created_at": datetime.now().isoformat(),
    }
