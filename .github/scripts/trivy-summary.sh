#!/usr/bin/env bash
set -euo pipefail

# Trivy Summary: Extract and display Trivy security findings from JSON report.
# Supports both CI filesystem scans and CD image scans.
# Used in GitHub Actions to create a human-readable summary in the job output.
# 
# Usage:
#   trivy-summary.sh [report-file] [scan-type]
# 
# Arguments:
#   report-file  Path to Trivy JSON report (default: reports/trivy.json)
#   scan-type    "fs" for filesystem scan or "image" for image scan (auto-detected if omitted)

REPORT_FILE="${1:-reports/trivy.json}"
SCAN_TYPE="${2:-auto}"

# If report doesn't exist, print warning and exit gracefully
if [[ ! -f "$REPORT_FILE" ]]; then
  echo "Trivy report not found at $REPORT_FILE" >> "$GITHUB_STEP_SUMMARY"  echo "⚠️ Trivy report not found at $REPORT_FILE (continuing gracefully)" >&2  exit 0
fi

# Auto-detect scan type from report filename if not specified
if [[ "$SCAN_TYPE" == "auto" ]]; then
  if [[ "$REPORT_FILE" == *"image"* ]]; then
    SCAN_TYPE="image"
  else
    SCAN_TYPE="fs"
  fi
fi

# Extract vulnerability counts by severity
VULN_CRITICAL=$(jq '[.Results[]?.Vulnerabilities[]? // empty | select(.Severity == "CRITICAL")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")
VULN_HIGH=$(jq '[.Results[]?.Vulnerabilities[]? // empty | select(.Severity == "HIGH")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")
VULN_MEDIUM=$(jq '[.Results[]?.Vulnerabilities[]? // empty | select(.Severity == "MEDIUM")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")

# Extract misconfigurations (filesystem scan)
MISC_CRITICAL=$(jq '[.Results[]?.Misconfigurations[]? // empty | select(.Severity == "CRITICAL")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")
MISC_HIGH=$(jq '[.Results[]?.Misconfigurations[]? // empty | select(.Severity == "HIGH")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")
MISC_MEDIUM=$(jq '[.Results[]?.Misconfigurations[]? // empty | select(.Severity == "MEDIUM")] | length' "$REPORT_FILE" 2>/dev/null || echo "0")

# Extract secrets (filesystem scan)
SECRETS=$(jq '[.Results[]?.Secrets[]? // empty] | length' "$REPORT_FILE" 2>/dev/null || echo "0")

# Determine overall status based on scan type
# Image scan: only CRITICAL vulnerabilities block deployment
# Filesystem scan: all findings are informational for summary
STATUS="✅ Passed"
if [[ "$SCAN_TYPE" == "image" ]]; then
  if [[ "$VULN_CRITICAL" -gt 0 ]]; then
    STATUS="❌ Failed"
  fi
else
  # Filesystem scan: show all but don't fail on HIGH/MEDIUM
  if [[ "$VULN_CRITICAL" -gt 0 ]] || [[ "$MISC_CRITICAL" -gt 0 ]]; then
    STATUS="⚠️ Critical findings"
  fi
fi

# Write summary to GitHub Step Summary
if [[ "$SCAN_TYPE" == "image" ]]; then
  # Container image scan summary (CD)
  {
    echo "## Container Security"
    echo ""
    [[ -n "${IMAGE:-}" ]] && echo "Image: $IMAGE"
    echo ""
    echo "| Severity | Count |"
    echo "| --- | ---: |"
    echo "| Critical | $VULN_CRITICAL |"
    echo "| High | $VULN_HIGH |"
    echo "| Medium | $VULN_MEDIUM |"
    echo ""
    echo "**Security Gate:** $STATUS"
  } >> "$GITHUB_STEP_SUMMARY"
else
  # Filesystem scan summary (CI)
  {
    echo "## Trivy Filesystem Scan"
    echo ""
    echo "### Vulnerabilities"
    echo "| Severity | Count |"
    echo "| --- | ---: |"
    echo "| Critical | $VULN_CRITICAL |"
    echo "| High | $VULN_HIGH |"
    echo "| Medium | $VULN_MEDIUM |"
    
    if [[ "$SECRETS" -gt 0 ]] || [[ "$MISC_CRITICAL" -gt 0 ]] || [[ "$MISC_HIGH" -gt 0 ]]; then
      echo ""
      echo "### Other Findings"
      echo "| Category | Count |"
      echo "| --- | ---: |"
      [[ "$SECRETS" -gt 0 ]] && echo "| Secrets | $SECRETS |"
      [[ "$MISC_CRITICAL" -gt 0 || "$MISC_HIGH" -gt 0 ]] && echo "| Misconfigurations | $((MISC_CRITICAL + MISC_HIGH)) |"
    fi
    
    echo ""
    echo "**Status:** $STATUS"
  } >> "$GITHUB_STEP_SUMMARY"
fi
