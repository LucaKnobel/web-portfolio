# Git Hooks

## Pre-Commit Hook

Fast local security checks before every commit.

## Installation

```bash
git config core.hooksPath .githooks
```

## Checks

1. ✅ **Vitest Tests** (required)
2. ✅ **TypeScript** (required)
3. ✅ **Semgrep SAST** (optional, if installed - scans YOUR code only)

**Note:** Trivy dependency scanning runs **only in CI**, not locally.  
(CVEs can't be fixed immediately, so blocking commits doesn't help)

**Duration:** ~5-15 seconds (depends on Semgrep installation)

## Bypass (Emergency only)

```bash
git commit --no-verify
```

**Note:** CI pipeline will still run all checks including Trivy.

## Install Semgrep (Optional)

### Semgrep (SAST - Scans your code)

```bash
# Fedora/RHEL
sudo dnf install python3-pip
pip3 install --user semgrep

# macOS
brew install semgrep

# Login for org policies
semgrep login
```

**Why Semgrep in pre-commit?**  
Finds security issues in YOUR code that you can fix immediately.

**Why NOT Trivy in pre-commit?**  
Dependency CVEs can't be fixed immediately (need upstream updates).  
Trivy runs in CI to track issues, but doesn't block commits.
