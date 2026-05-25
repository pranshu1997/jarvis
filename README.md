# Jarvis

A personal task board and roadmap manager with a polished Streamlit GUI.

## Features

- **Tasks** — title, notes, priority (Urgent → Low), category, optional due date
- **Roadmap** — longer-term milestones with status and target dates
- **Board** — kanban-style view grouped by category
- **Filters** — priority, category, active/done in the sidebar
- **Persistence** — everything saved to `data/tasks.json` on your machine

## Run

**Double-click** `Start Jarvis.command` in Finder. It opens Jarvis in your default browser and keeps a small Terminal window running in the background.

Or from the terminal:

```bash
cd jarvis
source .venv/bin/activate
streamlit run app.py
```

## Quick use

1. Use the **sidebar** to add tasks or roadmap items.
2. Check the box on a task to mark it done.
3. Click **🗑** to remove any task or roadmap item.
4. Use **Clear completed tasks** in the sidebar to bulk-remove finished work.
