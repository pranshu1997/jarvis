#!/bin/bash
# Double-click to launch Jarvis in your default browser.

cd "$(dirname "$0")" || exit 1

echo ""
echo "  Jarvis"
echo "  ─────────────────────────"
echo ""

# Create virtualenv on first run
if [ ! -d ".venv" ]; then
    echo "  First launch — setting up..."
    python3 -m venv .venv || { echo "  Error: python3 not found."; read -r -p "Press Enter to close..." _; exit 1; }
    .venv/bin/pip install -q -r requirements.txt
    echo "  Done."
    echo ""
fi

# Open default browser once the server is ready
(
    for _ in $(seq 1 40); do
        if curl -s -o /dev/null "http://127.0.0.1:8501"; then
            open "http://127.0.0.1:8501"
            exit 0
        fi
        sleep 0.25
    done
) &

echo "  Starting… browser opens automatically."
echo "  Keep this window open while you use Jarvis."
echo "  Press Ctrl+C or close this window to quit."
echo ""

.venv/bin/streamlit run app.py \
    --server.headless true \
    --browser.gatherUsageStats false

read -r -p "Press Enter to close..." _
