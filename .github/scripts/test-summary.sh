#!/usr/bin/env bash
set -euo pipefail

# Test Summary: Extract and display test results and coverage from Vitest JSON report
# Used in GitHub Actions to create a human-readable summary in the job output

REPORT_FILE="${1:-reports/vitest.json}"

# If report doesn't exist, print warning and exit gracefully (allows summary to still run)
if [[ ! -f "$REPORT_FILE" ]]; then
  echo "Test report not found at $REPORT_FILE" >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi

# Extract test statistics from JSON report
TOTAL=$(jq -r '.testResults[0].numTotalTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")
PASSED=$(jq -r '.testResults[0].numPassingTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")
FAILED=$(jq -r '.testResults[0].numFailingTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")
SKIPPED=$(jq -r '.testResults[0].numPendingTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")

# Extract coverage metrics from JSON report
STATEMENTS=$(jq -r '.coverage[0].statements.percentage // "-"' "$REPORT_FILE" 2>/dev/null || echo "-")
BRANCHES=$(jq -r '.coverage[0].branches.percentage // "-"' "$REPORT_FILE" 2>/dev/null || echo "-")
FUNCTIONS=$(jq -r '.coverage[0].functions.percentage // "-"' "$REPORT_FILE" 2>/dev/null || echo "-")
LINES=$(jq -r '.coverage[0].lines.percentage // "-"' "$REPORT_FILE" 2>/dev/null || echo "-")

# Write summary to GitHub Step Summary
{
  echo "## Tests"
  echo ""
  echo "| Total | Passed | Failed | Skipped |"
  echo "| ---: | ---: | ---: | ---: |"
  echo "| $TOTAL | $PASSED | $FAILED | $SKIPPED |"
  echo ""
  echo "### Coverage"
  echo ""
  echo "| Statements | Branches | Functions | Lines |"
  echo "| ---: | ---: | ---: | ---: |"
  echo "| $STATEMENTS | $BRANCHES | $FUNCTIONS | $LINES |"
} >> "$GITHUB_STEP_SUMMARY"
