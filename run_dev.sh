#!/usr/bin/env bash
# Launch Jarvis dev server in your default browser.
set -euo pipefail
cd "$(dirname "$0")"

BASE_PORT="${PORT:-3000}"
PORT="${BASE_PORT}"
URL=""
LOG_FILE="${TMPDIR:-/tmp}/jarvis-dev.log"
BACKGROUND="${BACKGROUND:-0}"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display notification "Node.js / npm missing for Jarvis" with title "Jarvis launch failed"' \
    >/dev/null 2>&1 || true
  exit 1
fi

is_jarvis_running() {
  local probe_url="$1"
  local body
  body="$(curl -fsS "${probe_url}" 2>/dev/null || true)"
  [[ "${body}" == *"Jarvis"* || "${body}" == *"Personal Evolution System"* ]]
}

is_port_in_use() {
  lsof -iTCP:"${1}" -sTCP:LISTEN -Pn >/dev/null 2>&1
}

open_when_ready() {
  for _ in $(seq 1 120); do
    if curl -sf "${URL}" >/dev/null 2>&1; then
      open "${URL}"
      return 0
    fi
    sleep 0.25
  done
  return 1
}

start_server() {
  nohup npm run dev -- -p "${PORT}" >>"${LOG_FILE}" 2>&1 &
}

while true; do
  URL="http://127.0.0.1:${PORT}"
  if is_jarvis_running "${URL}"; then
    open "${URL}"
    exit 0
  fi
  if ! is_port_in_use "${PORT}"; then
    break
  fi
  PORT=$((PORT + 1))
done

if [[ ! -d node_modules ]]; then
  npm install >>"${LOG_FILE}" 2>&1
fi

if [[ "${BACKGROUND}" == "1" ]]; then
  start_server
  nohup bash -c "
    URL='${URL}'
    for _ in \$(seq 1 120); do
      if curl -sf \"\${URL}\" >/dev/null 2>&1; then
        open \"\${URL}\"
        exit 0
      fi
      sleep 0.25
    done
  " >/dev/null 2>&1 &
  disown -a 2>/dev/null || true
  exit 0
fi

start_server
open_when_ready
wait
