# Security Scanning Guide

This documentation serves as my personal reference for running security checks during development.

Security tools help identify vulnerabilities, exposed secrets, and security misconfigurations in code before they reach production. They provide automated scanning to catch potential security issues early in the development process.

This project uses **Semgrep** ([https://semgrep.dev/](https://semgrep.dev/)) and **Trivy** ([https://trivy.dev/latest/](https://trivy.dev/latest/)) to check code, dependencies, and configurations for security issues.

## Security Tools Overview

**Semgrep** is a static analysis tool that finds bugs, security vulnerabilities, and anti-patterns in your code. It uses pattern-based rules to identify potential security issues in TypeScript, JavaScript, and configuration files. Semgrep policies are centrally managed in the Semgrep Cloud platform.

**Trivy** is a comprehensive security scanner that detects vulnerabilities in dependencies, container images, and Infrastructure as Code (IaC) configurations. It scans package.json dependencies, Docker configurations, and other security-relevant files.

## Local Development Setup

### Prerequisites

Make sure the following tools on your local machine are installed:

- **Node.js 22+** (required for Astro 5+ SSR)
- **Semgrep CLI**
- **Trivy CLI**

### VS Code Extensions

Install these VS Code extensions for optimal security development experience:

- **Semgrep** 
- **Aqua Trivy** 

## CI/CD Integration Commands

### Local Security Checks

Run these commands locally before committing:

```bash
# Install project dependencies
npm ci

# Run Semgrep with organization policies
semgrep ci

# Run Trivy scan for vulnerabilities, secrets, and misconfigurations
trivy fs --scanners vuln,secret,misconfig .

# Run tests with Vitest
npm run test:run

# Run TypeScript checks (security-relevant type validation)
npm run typecheck

# Run build to verify security configurations
npm run build
```

### Semgrep Cloud Integration

Here is the **one command** that pulls and executes **all policies from your Semgrep Cloud organization**:

```bash
semgrep ci
```

**Important Notes:**

* **Login/Token required once** (otherwise `semgrep ci` fails):
  * Interactive: `semgrep login`
  * CI/Headless: `export SEMGREP_APP_TOKEN=<your_token>`

* You can control **which products** run:
  * Code only (SAST): `semgrep ci --code`
  * Supply Chain only (SCA): `semgrep ci --supply-chain`
  * Secrets only: `semgrep ci --secrets`

* **Dry run without upload** (to check what would be pulled):
  ```bash
  semgrep ci --dry-run --verbose
  ```

* **Force FOSS analysis only** (without proprietary Cross-File-Analysis):
  ```bash
  semgrep ci --oss-only
  ```

* **Additional local rules** alongside Cloud policy (second step):
  ```bash
  semgrep scan --config .semgrep.yml .
  ```


## Advanced Semgrep Cloud Configuration

This project uses **Semgrep Cloud** for centralized policy management. The CI/CD pipeline is configured to:

- Use organization-specific rulesets defined in Semgrep Cloud
- Report scan results to the central dashboard
- Apply custom security policies for Astro SSR applications
- Block deployments when critical security issues are found

Semgrep policies include rules for:
- TypeScript/JavaScript security patterns
- Astro-specific security configurations
- Dependency vulnerability detection
- Infrastructure as Code security checks

## DevSecOps Workflow

### Automated Security Pipeline

Modular GitHub Actions workflows run on every push/PR to `main`.

#### Workflows

**1. Tests** (`.github/workflows/tests.yml`)
- Trigger: Push/PR to `main`
- Execution: `npm ci && npm run test:run`
- Duration: ~30s

**2. Semgrep** (`.github/workflows/semgrep.yml`)
- Trigger: Push/PR to `main`
- Container: `semgrep/semgrep`
- Command: `semgrep ci` (uses org policies from Semgrep Cloud)
- Token: `secrets.SEMGREP_APP_TOKEN`
- Duration: ~1-2min

**3. Trivy** (`.github/workflows/trivy.yml`)
- Trigger: Push/PR to `main`
- Scanners: `vuln,secret,misconfig`
- Severity: `CRITICAL,HIGH,MEDIUM`
- Exit code: 1 on findings (blocks merge)
- Duration: ~1min

**4. Security Gate** (`.github/workflows/security-gate.yml`)
- Trigger: After Tests, Semgrep, Trivy complete
- Purpose: Final verification checkpoint

#### Branch Protection Setup

**Settings → Branches → Add rule** for `main`:

```yaml
✅ Require pull request before merging
✅ Require status checks to pass before merging:
   - Unit Tests
   - SAST Scan
   - Security Scan
✅ Do not allow bypassing
```

All three workflows must pass before merge is allowed.

#### Local Pre-Commit Checks

Enable Git hooks:
```bash
git config core.hooksPath .githooks
```

Hook runs: Tests → TypeScript Check → (optional) Gitleaks

---

### Security Scan Overview

| Tool | Coverage | Trigger | Duration |
|------|----------|---------|----------|
| Vitest | Unit tests, XSS prevention | Push/PR | ~30s |
| Semgrep | SAST, OWASP Top 10 | Push/PR | ~1-2min |
| Trivy | CVE, Secrets, Misconfig | Push/PR | ~1min |

Total duration on PR: **~2-3min (parallel execution)**

---