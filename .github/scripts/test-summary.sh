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

# Extract test statistics from JSON report (root level, not testResults)
TOTAL=$(jq -r '.numTotalTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")
PASSED=$(jq -r '.numPassedTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")
FAILED=$(jq -r '.numFailedTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")
SKIPPED=$(jq -r '.numPendingTests // 0' "$REPORT_FILE" 2>/dev/null || echo "0")

# Extract coverage metrics from coverage-final.json if available
COVERAGE_FILE="coverage/coverage-final.json"
if [[ -f "$COVERAGE_FILE" ]]; then
  # Calculate coverage percentages from v8 coverage format
  # Coverage format: { "/path/file.ts": { "s": { "0": count, ... }, "f": {...}, "b": {...} } }
  # Count executed (> 0) vs total for each type
  STATEMENTS=$(jq -r '[.[] | .s | to_entries | length as $total | [.[] | select(.value > 0)] | length as $covered | ($covered / $total * 100 | round)] | add / length | round' "$COVERAGE_FILE" 2>/dev/null || echo "-")
  BRANCHES=$(jq -r '[.[] | .b | to_entries | length as $total | if $total == 0 then 100 else [.[] | select(.value[0] > 0 or .value[1] > 0)] | length as $covered | ($covered / $total * 100 | round) end] | add / length | round' "$COVERAGE_FILE" 2>/dev/null || echo "-")
  FUNCTIONS=$(jq -r '[.[] | .f | to_entries | length as $total | if $total == 0 then 100 else [.[] | select(.value > 0)] | length as $covered | ($covered / $total * 100 | round) end] | add / length | round' "$COVERAGE_FILE" 2>/dev/null || echo "-")
  LINES=$(jq -r '[.[] | .s | to_entries | length as $total | [.[] | select(.value > 0)] | length as $covered | ($covered / $total * 100 | round)] | add / length | round' "$COVERAGE_FILE" 2>/dev/null || echo "-")
  
  # Add % symbols if valid numbers
  [[ "$STATEMENTS" != "-" ]] && STATEMENTS="${STATEMENTS}%"
  [[ "$BRANCHES" != "-" ]] && BRANCHES="${BRANCHES}%"
  [[ "$FUNCTIONS" != "-" ]] && FUNCTIONS="${FUNCTIONS}%"
  [[ "$LINES" != "-" ]] && LINES="${LINES}%"
else
  STATEMENTS="-"
  BRANCHES="-"
  FUNCTIONS="-"
  LINES="-"
fi

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
