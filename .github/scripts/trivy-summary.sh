#!/usr/bin/env bash
set -euo pipefail

# Trivy Summary: Extract and display Trivy security findings from JSON report
# Used in GitHub Actions to create a human-readable summary in the job output

REPORT_FILE="${1:-reports/trivy.json}"

# If report doesn't exist, print warning and exit gracefully
if [[ ! -f "$REPORT_FILE" ]]; then
  echo "Trivy report not found at $REPORT_FILE" >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi

# Extract vulnerability counts from Trivy JSON report
# Trivy groups results by severity; count findings per severity level
CRITICAL=$(jq '[.Results[]?.Misconfigurations[]? // empty | select(.Severity == "CRITICAL")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")
HIGH=$(jq '[.Results[]?.Misconfigurations[]? // empty | select(.Severity == "HIGH")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")

# Count vulnerabilities separately
VULN_CRITICAL=$(jq '[.Results[]?.Vulnerabilities[]? // empty | select(.Severity == "CRITICAL")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")
VULN_HIGH=$(jq '[.Results[]?.Vulnerabilities[]? // empty | select(.Severity == "HIGH")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")

# Count secrets
SECRETS=$(jq '[.Results[]?.Secrets[]? // empty] | length' "$REPORT_FILE" 2>/dev/null || echo "0")

# Count misconfigurations
MISCONFIGS=$(jq '[.Results[]?.Misconfigurations[]? // empty] | length' "$REPORT_FILE" 2>/dev/null || echo "0")

# Determine status: Failed if any critical/high findings
STATUS="✅ Passed"
if [[ "$VULN_CRITICAL" -gt 0 ]] || [[ "$VULN_HIGH" -gt 0 ]] || [[ "$SECRETS" -gt 0 ]] || [[ "$MISCONFIGS" -gt 0 ]]; then
  STATUS="❌ Failed"
fi

# Write summary to GitHub Step Summary
{
  echo "## Trivy"
  echo ""
  echo "| Metric | Value |"
  echo "| --- | ---: |"
  echo "| Critical Vulnerabilities | $VULN_CRITICAL |"
  echo "| High Vulnerabilities | $VULN_HIGH |"
  echo "| Secrets | $SECRETS |"
  echo "| Misconfigurations | $MISCONFIGS |"
  echo "| Status | $STATUS |"
} >> "$GITHUB_STEP_SUMMARY"
