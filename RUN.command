#!/bin/bash
# Double-click to launch Jarvis in browser, then close Terminal.
set -euo pipefail

cd "$(dirname "$0")" || exit 1

BASE_PORT="${PORT:-3000}"
PORT="${BASE_PORT}"
URL=""
LOG_FILE="${TMPDIR:-/tmp}/jarvis-dev.log"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    osascript -e 'display notification "Node.js / npm missing for Jarvis" with title "Jarvis launch failed"'
    exit 1
fi

is_jarvis_running() {
    local probe_url="$1"
    local body
    body="$(curl -fsS "${probe_url}" 2>/dev/null || true)"
    [[ "${body}" == *"Jarvis"* || "${body}" == *"Personal Evolution System"* ]]
}

is_port_in_use() {
    local probe_url="$1"
    curl -fsS "${probe_url}" >/dev/null 2>&1
}

while true; do
    URL="http://127.0.0.1:${PORT}"
    if is_jarvis_running "${URL}"; then
        open "${URL}"
        osascript -e 'tell application "Terminal" to close front window' >/dev/null 2>&1 || true
        exit 0
    fi
    if ! is_port_in_use "${URL}"; then
        break
    fi
    PORT=$((PORT + 1))
done

if [ ! -d "node_modules" ]; then
    nohup npm install >>"${LOG_FILE}" 2>&1
fi

nohup npm run dev -- -p "${PORT}" >>"${LOG_FILE}" 2>&1 &

(
    for _ in $(seq 1 120); do
        if curl -s -o /dev/null "${URL}"; then
            open "${URL}"
            exit 0
        fi
        sleep 0.5
    done
) >/dev/null 2>&1 &

osascript -e 'tell application "Terminal" to close front window' >/dev/null 2>&1 || true
exit 0
