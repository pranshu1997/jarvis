"""Personal task board & roadmap — Streamlit GUI."""

from __future__ import annotations

from datetime import date

import streamlit as st

from storage import (
    CATEGORIES,
    PRIORITIES,
    ROADMAP_STATUSES,
    load_data,
    new_roadmap_item,
    new_task,
    save_data,
)

st.set_page_config(
    page_title="Jarvis",
    page_icon="◯",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Minimal dark palette
INK = "#080808"
SURFACE = "#0f0f0f"
LINE = "#1c1c1c"
LINE_HOVER = "#2a2a2a"
TEXT = "#ececec"
MUTED = "#5c5c5c"
GHOST = "#3a3a3a"
ACCENT = "#d4d4d4"

PRIORITY_COLORS = {
    "Urgent": "#f0f0f0",
    "High": "#b8b8b8",
    "Medium": "#787878",
    "Low": "#484848",
}

STATUS_COLORS = {
    "Planned": "#6e6e6e",
    "In Progress": "#a8a8a8",
    "Done": "#d0d0d0",
    "On Hold": "#404040",
}

st.markdown(
    f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

html, body, [class*="css"] {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
}}

.stApp {{
    background: {INK};
}}

.block-container {{
    padding: 2.5rem 2rem 4rem;
    max-width: 1080px;
}}

/* Hide Streamlit chrome */
#MainMenu, footer, header[data-testid="stHeader"] {{
    visibility: hidden;
    height: 0;
}}
.stDeployButton, [data-testid="stToolbar"] {{
    display: none !important;
}}

/* Sidebar */
div[data-testid="stSidebar"] {{
    background: {SURFACE};
    border-right: 1px solid {LINE};
}}
div[data-testid="stSidebar"] .block-container {{
    padding: 2rem 1.25rem;
}}
div[data-testid="stSidebar"] h3 {{
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: {MUTED};
    margin-bottom: 1.25rem;
}}
div[data-testid="stSidebar"] label {{
    font-size: 0.72rem;
    color: {MUTED} !important;
    letter-spacing: 0.04em;
}}
div[data-testid="stSidebar"] hr {{
    border-color: {LINE};
    margin: 1.5rem 0;
}}

/* Inputs */
.stTextInput input, .stTextArea textarea, .stSelectbox > div > div,
.stDateInput > div > div, [data-baseweb="select"] {{
    background: {INK} !important;
    border: 1px solid {LINE} !important;
    border-radius: 6px !important;
    color: {TEXT} !important;
    font-size: 0.85rem !important;
}}
.stTextInput input:focus, .stTextArea textarea:focus {{
    border-color: {LINE_HOVER} !important;
    box-shadow: none !important;
}}

/* Buttons */
.stButton > button {{
    background: transparent !important;
    color: {TEXT} !important;
    border: 1px solid {LINE} !important;
    border-radius: 6px !important;
    font-size: 0.8rem !important;
    font-weight: 500 !important;
    letter-spacing: 0.02em;
    transition: border-color 0.2s, background 0.2s;
}}
.stButton > button:hover {{
    border-color: {LINE_HOVER} !important;
    background: {SURFACE} !important;
    color: {TEXT} !important;
}}
.stButton > button[kind="primary"] {{
    background: {TEXT} !important;
    color: {INK} !important;
    border: 1px solid {TEXT} !important;
}}
.stButton > button[kind="primary"]:hover {{
    background: {ACCENT} !important;
    border-color: {ACCENT} !important;
    color: {INK} !important;
}}

/* Tabs */
.stTabs [data-baseweb="tab-list"] {{
    gap: 0;
    background: transparent;
    border-bottom: 1px solid {LINE};
    padding: 0;
}}
.stTabs [data-baseweb="tab"] {{
    background: transparent;
    color: {MUTED};
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.75rem 1.25rem;
    border: none;
    border-bottom: 1px solid transparent;
    border-radius: 0;
}}
.stTabs [aria-selected="true"] {{
    color: {TEXT} !important;
    border-bottom: 1px solid {TEXT} !important;
    background: transparent !important;
}}
.stTabs [data-baseweb="tab-panel"] {{
    padding-top: 1.75rem;
}}

/* Radio & checkbox */
.stRadio > div, .stCheckbox {{
    font-size: 0.82rem;
}}

/* Custom components */
.brand {{
    margin-bottom: 3rem;
}}
.brand-mark {{
    width: 6px;
    height: 6px;
    background: {TEXT};
    border-radius: 50%;
    display: inline-block;
    margin-bottom: 1.25rem;
}}
.brand-title {{
    font-size: 1.75rem;
    font-weight: 300;
    color: {TEXT};
    letter-spacing: -0.04em;
    margin: 0;
    line-height: 1.1;
}}
.brand-tag {{
    font-size: 0.8rem;
    font-weight: 400;
    color: {MUTED};
    margin-top: 0.5rem;
    letter-spacing: 0.01em;
}}

.stats-row {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: {LINE};
    border: 1px solid {LINE};
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 2.5rem;
}}
.stat {{
    background: {SURFACE};
    padding: 1.35rem 1.25rem;
}}
.stat-num {{
    font-size: 1.65rem;
    font-weight: 300;
    color: {TEXT};
    letter-spacing: -0.03em;
    line-height: 1;
}}
.stat-lbl {{
    font-size: 0.65rem;
    font-weight: 500;
    color: {MUTED};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.45rem;
}}

.item {{
    background: {SURFACE};
    border: 1px solid {LINE};
    border-radius: 8px;
    padding: 1rem 1.15rem;
    margin-bottom: 0.5rem;
    transition: border-color 0.2s;
}}
.item:hover {{
    border-color: {LINE_HOVER};
}}
.item.done {{
    opacity: 0.4;
}}
.item.done .item-title {{
    text-decoration: line-through;
    color: {GHOST};
}}

.item-title {{
    font-size: 0.9rem;
    font-weight: 500;
    color: {TEXT};
    letter-spacing: -0.01em;
}}
.item-desc {{
    font-size: 0.8rem;
    color: {MUTED};
    margin-top: 0.35rem;
    line-height: 1.5;
    font-weight: 400;
}}
.item-meta {{
    margin-top: 0.55rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: center;
}}
.item-meta span {{
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: {MUTED};
}}
.item-meta .dot {{
    width: 3px;
    height: 3px;
    background: {GHOST};
    border-radius: 50%;
    display: inline-block;
}}
.item-meta .due {{
    color: {GHOST};
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
}}

.roadmap-item {{
    border-left: 2px solid {LINE_HOVER};
}}

.section-label {{
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: {MUTED};
    margin: 2rem 0 0.85rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid {LINE};
}}

.empty {{
    text-align: center;
    padding: 3.5rem 2rem;
    color: {GHOST};
    font-size: 0.85rem;
    font-weight: 400;
    border: 1px solid {LINE};
    border-radius: 8px;
    background: {SURFACE};
}}

.board-col-title {{
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: {MUTED};
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid {LINE};
}}
.board-item {{
    background: {SURFACE};
    border: 1px solid {LINE};
    border-radius: 6px;
    padding: 0.65rem 0.75rem;
    margin-bottom: 0.4rem;
    font-size: 0.8rem;
    color: {TEXT};
    font-weight: 400;
}}
.board-item .pri {{
    font-size: 0.6rem;
    color: {MUTED};
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 0.25rem;
    display: block;
}}

.del-btn button {{
    min-width: 2rem !important;
    padding: 0.25rem 0.5rem !important;
    font-size: 0.75rem !important;
    color: {MUTED} !important;
    border-color: transparent !important;
}}
.del-btn button:hover {{
    color: {TEXT} !important;
    border-color: {LINE} !important;
}}

.stCaption {{
    color: {GHOST} !important;
    font-size: 0.72rem !important;
}}
</style>
""",
    unsafe_allow_html=True,
)


def init_state() -> None:
    if "data" not in st.session_state:
        st.session_state.data = load_data()


init_state()
data = st.session_state.data


def persist() -> None:
    save_data(st.session_state.data)


def meta_line(parts: list[str]) -> str:
    inner = '<span class="dot"></span>'.join(f"<span>{p}</span>" for p in parts if p)
    return f'<div class="item-meta">{inner}</div>' if inner else ""


def render_task_card(task: dict, *, key_prefix: str) -> None:
    tid = task["id"]
    done = task.get("completed", False)
    due = f"Due {task['due_date']}" if task.get("due_date") else ""
    parts = [task["priority"], task["category"]] + ([due] if due else [])

    col_check, col_body, col_del = st.columns([0.04, 0.88, 0.08])

    with col_check:
        new_done = st.checkbox(
            "done",
            value=done,
            key=f"{key_prefix}_chk_{tid}",
            label_visibility="collapsed",
        )
        if new_done != done:
            task["completed"] = new_done
            persist()
            st.rerun()

    with col_body:
        cls = "item done" if done else "item"
        desc = (
            f'<div class="item-desc">{task["description"]}</div>'
            if task.get("description")
            else ""
        )
        st.markdown(
            f"""<div class="{cls}">
                <div class="item-title">{task["title"]}</div>
                {meta_line(parts)}
                {desc}
            </div>""",
            unsafe_allow_html=True,
        )

    with col_del:
        st.markdown('<div class="del-btn">', unsafe_allow_html=True)
        if st.button("×", key=f"{key_prefix}_del_{tid}", help="Remove"):
            data["tasks"] = [t for t in data["tasks"] if t["id"] != tid]
            persist()
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)


def render_roadmap_card(item: dict, *, key_prefix: str) -> None:
    iid = item["id"]
    target = f"Target {item['target_date']}" if item.get("target_date") else ""
    parts = [item.get("status", "Planned"), item.get("category", "Roadmap")]
    if target:
        parts.append(target)

    col_body, col_actions = st.columns([0.82, 0.18])

    with col_body:
        desc = (
            f'<div class="item-desc">{item["description"]}</div>'
            if item.get("description")
            else ""
        )
        st.markdown(
            f"""<div class="item roadmap-item">
                <div class="item-title">{item["title"]}</div>
                {meta_line(parts)}
                {desc}
            </div>""",
            unsafe_allow_html=True,
        )

    with col_actions:
        statuses = list(ROADMAP_STATUSES)
        cur = item.get("status", "Planned")
        new_status = st.selectbox(
            "Status",
            statuses,
            index=statuses.index(cur) if cur in statuses else 0,
            key=f"{key_prefix}_status_{iid}",
            label_visibility="collapsed",
        )
        if new_status != cur:
            item["status"] = new_status
            persist()
            st.rerun()
        st.markdown('<div class="del-btn">', unsafe_allow_html=True)
        if st.button("×", key=f"{key_prefix}_rdel_{iid}", help="Remove"):
            data["roadmap"] = [r for r in data["roadmap"] if r["id"] != iid]
            persist()
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)


def filter_tasks(tasks: list) -> list:
    priority = st.session_state.get("filter_priority", "All")
    category = st.session_state.get("filter_category", "All")
    show = st.session_state.get("filter_show", "Active")

    out = tasks
    if priority != "All":
        out = [t for t in out if t["priority"] == priority]
    if category != "All":
        out = [t for t in out if t["category"] == category]
    if show == "Active":
        out = [t for t in out if not t.get("completed")]
    elif show == "Done":
        out = [t for t in out if t.get("completed")]
    return out


def sort_tasks(tasks: list) -> list:
    order = {p: i for i, p in enumerate(PRIORITIES)}
    return sorted(
        tasks,
        key=lambda t: (
            t.get("completed", False),
            order.get(t["priority"], 99),
            t.get("due_date") or "9999-99-99",
        ),
    )


# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("### New")
    add_mode = st.radio("Type", ["Task", "Roadmap"], horizontal=True, label_visibility="collapsed")

    if add_mode == "Task":
        q_title = st.text_input("Title", placeholder="What needs doing?")
        q_desc = st.text_area("Notes", height=72, placeholder="Optional")
        q_priority = st.selectbox("Priority", PRIORITIES, index=2)
        q_category = st.selectbox("Category", CATEGORIES)
        q_has_due = st.checkbox("Due date", value=False)
        q_due = st.date_input("Date", value=date.today(), disabled=not q_has_due, label_visibility="collapsed")
        if st.button("Add task", type="primary", use_container_width=True):
            if q_title.strip():
                data["tasks"].append(
                    new_task(
                        q_title,
                        description=q_desc,
                        priority=q_priority,
                        category=q_category,
                        due_date=q_due if q_has_due else None,
                    )
                )
                persist()
                st.rerun()
            else:
                st.warning("Enter a title.")
    else:
        r_title = st.text_input("Title", placeholder="Milestone or goal")
        r_desc = st.text_area("Notes", height=72, key="r_desc")
        r_status = st.selectbox("Status", ROADMAP_STATUSES)
        r_cat = st.selectbox("Category", CATEGORIES, index=CATEGORIES.index("Roadmap"))
        r_has_target = st.checkbox("Target date", value=False, key="r_has_target")
        r_target = st.date_input(
            "Date", value=date.today(), key="r_target", disabled=not r_has_target, label_visibility="collapsed"
        )
        if st.button("Add milestone", type="primary", use_container_width=True):
            if r_title.strip():
                data["roadmap"].append(
                    new_roadmap_item(
                        r_title,
                        description=r_desc,
                        status=r_status,
                        target_date=r_target if r_has_target else None,
                        category=r_cat,
                    )
                )
                persist()
                st.rerun()
            else:
                st.warning("Enter a title.")

    st.divider()
    st.markdown("### Filter")
    st.session_state.filter_priority = st.selectbox("Priority", ["All", *PRIORITIES], key="sb_priority")
    st.session_state.filter_category = st.selectbox("Category", ["All", *CATEGORIES], key="sb_category")
    st.session_state.filter_show = st.radio("Show", ["Active", "All", "Done"], horizontal=True)

    st.divider()
    if st.button("Clear completed", use_container_width=True):
        before = len(data["tasks"])
        data["tasks"] = [t for t in data["tasks"] if not t.get("completed")]
        removed = before - len(data["tasks"])
        persist()
        if removed:
            st.rerun()

# ── Main ──────────────────────────────────────────────────────────────────────

st.markdown(
    """
<div class="brand">
    <div class="brand-mark"></div>
    <p class="brand-title">Jarvis</p>
    <p class="brand-tag">Tasks & roadmap</p>
</div>
""",
    unsafe_allow_html=True,
)

tasks = data["tasks"]
roadmap = data["roadmap"]
active = [t for t in tasks if not t.get("completed")]
urgent = [t for t in active if t["priority"] in ("Urgent", "High")]

st.markdown(
    f"""
<div class="stats-row">
    <div class="stat"><div class="stat-num">{len(active)}</div><div class="stat-lbl">Active</div></div>
    <div class="stat"><div class="stat-num">{len(urgent)}</div><div class="stat-lbl">Priority</div></div>
    <div class="stat"><div class="stat-num">{len([t for t in tasks if t.get("completed")])}</div><div class="stat-lbl">Done</div></div>
    <div class="stat"><div class="stat-num">{len(roadmap)}</div><div class="stat-lbl">Roadmap</div></div>
</div>
""",
    unsafe_allow_html=True,
)

tab_tasks, tab_roadmap, tab_board = st.tabs(["Tasks", "Roadmap", "Board"])

with tab_tasks:
    filtered = sort_tasks(filter_tasks(tasks))
    if not filtered:
        st.markdown('<div class="empty">No tasks — add one from the sidebar</div>', unsafe_allow_html=True)
    else:
        for task in filtered:
            render_task_card(task, key_prefix="tasks")

with tab_roadmap:
    if not roadmap:
        st.markdown('<div class="empty">No milestones yet</div>', unsafe_allow_html=True)
    else:
        for status in ROADMAP_STATUSES:
            group = [r for r in roadmap if r.get("status") == status]
            if not group:
                continue
            st.markdown(f'<div class="section-label">{status}</div>', unsafe_allow_html=True)
            for item in sorted(group, key=lambda x: x.get("target_date") or "9999"):
                render_roadmap_card(item, key_prefix="roadmap")

with tab_board:
    cols = st.columns(len(CATEGORIES))
    for col, cat in zip(cols, CATEGORIES):
        with col:
            st.markdown(f'<div class="board-col-title">{cat}</div>', unsafe_allow_html=True)
            cat_tasks = [
                t for t in sort_tasks(tasks) if t["category"] == cat and not t.get("completed")
            ]
            if not cat_tasks:
                st.markdown('<div class="board-item" style="opacity:0.35;border-style:dashed">—</div>', unsafe_allow_html=True)
            for task in cat_tasks[:10]:
                st.markdown(
                    f"""<div class="board-item">
                        {task["title"]}
                        <span class="pri">{task["priority"]}</span>
                    </div>""",
                    unsafe_allow_html=True,
                )
            if len(cat_tasks) > 10:
                st.caption(f"+{len(cat_tasks) - 10}")
