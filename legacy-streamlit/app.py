"""Jarvis — Notion-style drag board."""

from __future__ import annotations

import json
from typing import Any

import streamlit as st
from streamlit_sortables import sort_items

from storage import (
    COLUMN_LABELS,
    HEADER_TO_STATUS,
    STATUSES,
    TRASH_KEY,
    items_by_status,
    load_data,
    new_item,
    save_data,
)

LABEL_SEP = " · "

INK = "#050505"
SURFACE = "#0c0c0c"
CARD = "#111111"
LINE = "#1a1a1a"
LINE_HOVER = "#2e2e2e"
TEXT = "#ededed"
MUTED = "#5a5a5a"
GHOST = "#333333"

PAGE_CSS = f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&display=swap');

html, body, [class*="css"] {{
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
}}

.stApp {{
    background: {INK};
}}

.block-container {{
    padding: 2rem 2rem 3rem;
    max-width: 1400px;
}}

#MainMenu, footer, header[data-testid="stHeader"] {{
    visibility: hidden;
    height: 0;
}}
.stDeployButton, [data-testid="stToolbar"] {{
    display: none !important;
}}
section[data-testid="stSidebar"] {{
    display: none !important;
}}

.brand {{
    margin-bottom: 2rem;
}}
.brand-dot {{
    width: 5px;
    height: 5px;
    background: {TEXT};
    border-radius: 50%;
    margin-bottom: 1rem;
}}
.brand-title {{
    font-size: 2rem;
    font-weight: 300;
    color: {TEXT};
    letter-spacing: -0.04em;
    margin: 0;
    line-height: 1;
}}
.brand-rule {{
    height: 1px;
    background: {LINE};
    margin-top: 1.25rem;
}}

.stTextInput input {{
    background: {SURFACE} !important;
    border: 1px solid {LINE} !important;
    border-radius: 8px !important;
    color: {TEXT} !important;
    font-size: 0.9rem !important;
    padding: 0.65rem 0.85rem !important;
}}
.stTextInput input:focus {{
    border-color: {LINE_HOVER} !important;
    box-shadow: none !important;
}}

.stButton > button {{
    background: transparent !important;
    color: {TEXT} !important;
    border: 1px solid {LINE} !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
}}
.stButton > button[kind="primary"] {{
    background: {TEXT} !important;
    color: {INK} !important;
    border-color: {TEXT} !important;
}}
.stButton > button[kind="primary"]:hover {{
    background: #d4d4d4 !important;
    border-color: #d4d4d4 !important;
    color: {INK} !important;
}}

.hint {{
    color: {GHOST};
    font-size: 0.78rem;
    margin-top: 1.5rem;
    text-align: center;
    letter-spacing: 0.02em;
}}
</style>
"""

SORTABLE_CSS = f"""
.sortable-component {{
    background: transparent;
    gap: 12px;
    display: flex;
    flex-wrap: nowrap;
}}
.sortable-container {{
    background: rgba(12, 12, 12, 0.85);
    border: 1px solid {LINE};
    border-radius: 10px;
    min-height: 320px;
    flex: 1;
    backdrop-filter: blur(8px);
}}
.sortable-container:nth-child(4) {{
    border-style: dashed;
    opacity: 0.75;
}}
.sortable-container-header {{
    background: transparent;
    color: {MUTED};
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    border-bottom: 1px solid {LINE};
    padding: 0.75rem 1rem;
    font-family: 'Space Grotesk', sans-serif;
}}
.sortable-container-body {{
    background: transparent;
    padding: 0.5rem;
    min-height: 240px;
}}
.sortable-item {{
    background: {CARD};
    color: {TEXT};
    border: 1px solid {LINE};
    border-radius: 8px;
    font-size: 14px;
    cursor: grab;
    padding: 0.65rem 0.75rem;
    margin-bottom: 6px;
    font-family: 'Space Grotesk', sans-serif;
}}
.sortable-item:hover {{
    border-color: {LINE_HOVER};
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.03);
}}
.sortable-ghost {{
    opacity: 0.35;
}}
"""

st.set_page_config(
    page_title="Jarvis",
    page_icon="◯",
    layout="wide",
    initial_sidebar_state="collapsed",
)


def encode_label(item: dict[str, Any]) -> str:
    short_id = item["id"].replace("-", "")[:8]
    return f"{item['title']}{LABEL_SEP}{short_id}"


def decode_label(label: str) -> tuple[str | None, str]:
    if LABEL_SEP in label:
        title, suffix = label.rsplit(LABEL_SEP, 1)
        return suffix.strip(), title
    return None, label


def build_id_maps(items: list[dict[str, Any]]) -> tuple[dict[str, dict], dict[str, list[str]]]:
    by_suffix: dict[str, dict] = {}
    by_title: dict[str, list[str]] = {}
    for item in items:
        suffix = item["id"].replace("-", "")[:8]
        by_suffix[suffix] = item
        by_title.setdefault(item["title"], []).append(item["id"])
    return by_suffix, by_title


def resolve_item(
    label: str,
    by_suffix: dict[str, dict],
    by_title: dict[str, list[str]],
    items_by_id: dict[str, dict],
) -> dict[str, Any] | None:
    suffix, title = decode_label(label)
    if suffix and suffix in by_suffix:
        return items_by_id[by_suffix[suffix]["id"]]
    ids = by_title.get(title, [])
    if len(ids) == 1:
        return items_by_id[ids[0]]
    return None


def build_containers(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "header": COLUMN_LABELS["backlog"],
            "items": [encode_label(i) for i in items_by_status(items, "backlog")],
        },
        {
            "header": COLUMN_LABELS["in_progress"],
            "items": [encode_label(i) for i in items_by_status(items, "in_progress")],
        },
        {
            "header": COLUMN_LABELS["done"],
            "items": [encode_label(i) for i in items_by_status(items, "done")],
        },
        {
            "header": COLUMN_LABELS[TRASH_KEY],
            "items": [],
        },
    ]


def containers_equal(a: list[dict], b: list[dict]) -> bool:
    return json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)


def apply_sort_result(data: dict[str, Any], result: list[dict[str, Any]]) -> None:
    old_items = data.get("items", [])
    items_by_id = {i["id"]: i for i in old_items}
    by_suffix, by_title = build_id_maps(old_items)

    new_items: list[dict[str, Any]] = []

    for container in result:
        header = container.get("header", "")
        status_key = HEADER_TO_STATUS.get(header)
        if status_key == TRASH_KEY:
            continue

        for order_idx, label in enumerate(container.get("items", [])):
            old = resolve_item(label, by_suffix, by_title, items_by_id)
            if not old:
                continue
            new_items.append(
                {
                    "id": old["id"],
                    "title": old["title"],
                    "status": status_key,
                    "order": order_idx,
                    "created_at": old.get("created_at", ""),
                }
            )

    data["version"] = 2
    data["items"] = new_items


def handle_add(data: dict[str, Any], title: str) -> None:
    title = title.strip()
    if not title:
        st.warning("Enter a title.")
        return
    data["items"].append(new_item(title, status="backlog", items=data["items"]))
    save_data(data)
    st.session_state["new_item_input"] = ""
    st.rerun()


st.markdown(PAGE_CSS, unsafe_allow_html=True)

if "data" not in st.session_state:
    st.session_state.data = load_data()

data = st.session_state.data

st.markdown(
    """
<div class="brand">
    <div class="brand-dot"></div>
    <p class="brand-title">Jarvis</p>
    <div class="brand-rule"></div>
</div>
""",
    unsafe_allow_html=True,
)

col_input, col_btn = st.columns([5, 1])
with col_input:
    new_title = st.text_input(
        "new_item_input",
        placeholder="Add to backlog…",
        label_visibility="collapsed",
        key="new_item_input",
    )
with col_btn:
    if st.button("Add", type="primary", use_container_width=True):
        handle_add(data, new_title)

containers = build_containers(data["items"])
result = sort_items(
    containers,
    multi_containers=True,
    custom_style=SORTABLE_CSS,
    key="jarvis_board",
)

if not containers_equal(containers, result):
    apply_sort_result(data, result)
    save_data(data)
    st.rerun()

if not data["items"]:
    st.markdown(
        '<p class="hint">Drag cards between columns · drop on Trash to remove</p>',
        unsafe_allow_html=True,
    )
