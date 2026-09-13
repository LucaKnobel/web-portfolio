#!/usr/bin/env bash
set -euo pipefail

# Trivy Summary: Extract and display Trivy security findings from JSON report.
# Supports both CI filesystem scans and CD/CI image scans.
# Used in GitHub Actions to create a human-readable summary in the job output.
#
# Usage:
#   trivy-summary.sh [report-file] [scan-type] [gate-mode]
#
# Arguments:
#   report-file  Path to Trivy JSON report (default: reports/trivy.json)
#   scan-type    "fs" for filesystem scan or "image" for image scan (auto-detected if omitted)
#   gate-mode    "blocking" (default) if CRITICAL findings fail the job elsewhere,
#                "non-blocking" if this scan is informational only. Only affects
#                wording, since the actual pass/fail decision lives in the workflow.

REPORT_FILE="${1:-reports/trivy.json}"
SCAN_TYPE="${2:-auto}"
GATE_MODE="${3:-blocking}"

# If report doesn't exist, print warning and exit gracefully
if [[ ! -f "$REPORT_FILE" ]]; then
  echo "Trivy report not found at $REPORT_FILE" >> "$GITHUB_STEP_SUMMARY"
  echo "Trivy report not found at $REPORT_FILE (continuing gracefully)" >&2
  exit 0
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
STATUS="✅ Passed"
if [[ "$SCAN_TYPE" == "image" ]]; then
  if [[ "$VULN_CRITICAL" -gt 0 ]]; then
    if [[ "$GATE_MODE" == "non-blocking" ]]; then
      STATUS="⚠️ Critical findings (informational, does not block this workflow)"
    else
      STATUS="❌ Failed"
    fi
  fi
else
  # Filesystem scan: show all but don't fail on HIGH/MEDIUM
  if [[ "$VULN_CRITICAL" -gt 0 ]] || [[ "$MISC_CRITICAL" -gt 0 ]]; then
    STATUS="⚠️ Critical findings"
  fi
fi

# Build a readable CRITICAL/HIGH findings table for image scans - severity
# counts alone don't say which package or CVE actually needs fixing.
MAX_FINDING_ROWS=25
FINDINGS_TABLE=""
FINDINGS_COUNT=0
if [[ "$SCAN_TYPE" == "image" ]]; then
  FINDINGS_TSV=$(jq -r '
    [.Results[]?.Vulnerabilities[]? // empty | select(.Severity == "CRITICAL" or .Severity == "HIGH")]
    | sort_by(if .Severity == "CRITICAL" then 0 else 1 end)
    | .[]
    | [.Severity, .PkgName, .InstalledVersion, (.FixedVersion // "-"), .VulnerabilityID, (.PrimaryURL // "")]
    | @tsv
  ' "$REPORT_FILE" 2>/dev/null || true)

  if [[ -n "$FINDINGS_TSV" ]]; then
    FINDINGS_COUNT=$(printf '%s\n' "$FINDINGS_TSV" | wc -l | tr -d ' ')
    ROWS=""
    ROW_INDEX=0
    while IFS=$'\t' read -r sev pkg installed fixed id url; do
      ROW_INDEX=$((ROW_INDEX + 1))
      [[ "$ROW_INDEX" -gt "$MAX_FINDING_ROWS" ]] && break
      badge="🟠 HIGH"
      [[ "$sev" == "CRITICAL" ]] && badge="🔴 CRITICAL"
      id_cell="$id"
      [[ -n "$url" ]] && id_cell="[$id]($url)"
      ROWS+="| $badge | \`$pkg\` | $installed | $fixed | $id_cell |"$'\n'
    done <<< "$FINDINGS_TSV"
    FINDINGS_TABLE="$ROWS"
  fi
fi

# Write summary to GitHub Step Summary
if [[ "$SCAN_TYPE" == "image" ]]; then
  # Container image scan summary (CD and CI)
  {
    echo "## Container Security"
    echo ""
    [[ -n "${IMAGE:-}" ]] && echo "Image: \`$IMAGE\`"
    echo ""
    echo "| Severity | Count |"
    echo "| --- | ---: |"
    echo "| Critical | $VULN_CRITICAL |"
    echo "| High | $VULN_HIGH |"
    echo "| Medium | $VULN_MEDIUM |"

    if [[ "$FINDINGS_COUNT" -gt 0 ]]; then
      echo ""
      echo "<details>"
      if [[ "$FINDINGS_COUNT" -gt "$MAX_FINDING_ROWS" ]]; then
        echo "<summary>Critical/High findings (showing $MAX_FINDING_ROWS of $FINDINGS_COUNT - full list in the uploaded report artifact)</summary>"
      else
        echo "<summary>Critical/High findings ($FINDINGS_COUNT)</summary>"
      fi
      echo ""
      echo "| Severity | Package | Installed | Fixed | ID |"
      echo "| --- | --- | --- | --- | --- |"
      printf '%s' "$FINDINGS_TABLE"
      echo ""
      echo "</details>"
    fi

    echo ""
    if [[ "$SCAN_TYPE" == "image" && "$GATE_MODE" == "non-blocking" ]]; then
      echo "**Status:** $STATUS"
    else
      echo "**Security Gate:** $STATUS"
    fi
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
