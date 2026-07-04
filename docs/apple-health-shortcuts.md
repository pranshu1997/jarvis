# Apple Health Auto-Sync via Shortcuts

Push daily health metrics to Jarvis automatically using iOS Shortcuts.

## Prerequisites

- Jarvis running locally (or deployed) with session cookie active
- iOS Shortcuts app

## Shortcut: Daily Health Push

1. Open **Shortcuts** → **New Shortcut**
2. Add **Find Health Samples**:
   - Type: Steps
   - Date: Today
3. Add **Find Health Samples**:
   - Type: Sleep Analysis
   - Date: Last Night
4. Add **Get Contents of URL**:
   - URL: `https://YOUR-JARVIS-HOST/api/health/import`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Request Body (JSON):

```json
{
  "date": "{{Current Date formatted as yyyy-MM-dd}}",
  "steps": {{Steps count}},
  "sleep_hours": {{Sleep hours}},
  "weight_kg": {{Weight if available}}
}
```

5. Add **Automation** → **Time of Day** → 7:00 AM → Run shortcut

## Google Fit / Health Connect

Use `/api/health/google-fit` with batch export:

```json
{
  "fitnessData": [
    { "date": "2026-06-07", "steps": 8432, "sleep_hours": 7.2, "weight_kg": 75.5 }
  ]
}
```

## Notes

- Session cookies must be present — run shortcut while logged into Jarvis in Safari first, or use a personal API token (future).
- Data feeds readiness score and sleep ↔ perfect-day analytics.
