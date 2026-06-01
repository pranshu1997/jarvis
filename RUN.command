#!/bin/bash
# Double-click to launch Jarvis in browser, then close Terminal.
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=../scripts/schedule_terminal_close.sh
source "$(dirname "$0")/../scripts/schedule_terminal_close.sh"

BACKGROUND=1 ./run_dev.sh

schedule_terminal_close
exit 0
