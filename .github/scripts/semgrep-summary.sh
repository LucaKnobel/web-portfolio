#!/usr/bin/env bash
set -euo pipefail

# Semgrep Summary: Extract and display Semgrep security findings from JSON report
# Used in GitHub Actions to create a human-readable summary in the job output

REPORT_FILE="${1:-reports/semgrep.json}"

# If report doesn't exist, print warning and exit gracefully
if [[ ! -f "$REPORT_FILE" ]]; then
  echo "Semgrep report not found at $REPORT_FILE" >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi

# Extract findings count from JSON report
FINDINGS=$(jq -r '.results | length // 0' "$REPORT_FILE" 2>/dev/null || echo "0")

# Write summary to GitHub Step Summary
{
  echo "## Semgrep"
  echo ""
  echo "| Metric | Value |"
  echo "| --- | ---: |"
  echo "| Findings | $FINDINGS |"
  echo "| Status | $([ "$FINDINGS" -eq 0 ] && echo "✅ Passed" || echo "❌ Failed") |"
} >> "$GITHUB_STEP_SUMMARY"
