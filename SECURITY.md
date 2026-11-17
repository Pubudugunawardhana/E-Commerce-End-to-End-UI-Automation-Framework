# Security Policy

## Supported versions

This project is maintained on a rolling basis. Only the latest version on the `main` branch receives security fixes.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Older commits | ❌ |

## Reporting a vulnerability

**Please do not report security issues in public GitHub issues, discussions or pull requests.**

Report them privately with GitHub's private vulnerability reporting instead:

1. Go to the **[Security tab](https://github.com/Pubudugunawardhana/E-Commerce-End-to-End-UI-Automation-Framework/security)** of this repository.
2. Click **Report a vulnerability**.
3. Fill in as much as you can:
   - a description of the issue and its possible impact
   - the affected file(s), with a commit hash if possible
   - the steps to reproduce it, or a proof of concept
   - a suggested fix, if you have one

### What to expect

| Step | Target time |
|---|---|
| Acknowledgement of your report | within 3 business days |
| First assessment | within 7 days |
| Fix or mitigation for confirmed issues | depends on severity, usually within 30 days |

You will be kept updated as the report is investigated. With your permission, you will be credited in the fix.

## Scope

This repository is a test automation framework. It does not run a production service. The following are **in scope**:

- secrets or credentials committed to the repository or its history
- weaknesses in the GitHub Actions workflow, such as secret exposure or unsafe triggers
- vulnerable dependencies that affect how this framework is used

The following are **out of scope**:

- the [Sauce Demo](https://www.saucedemo.com) website itself. It is a third-party demo application, so report issues with it to Sauce Labs.
- the public demo credentials for Sauce Demo, which Sauce Labs publishes on the site's login page

## Security practices in this project

- **No secrets in code.** Credentials are loaded from a git-ignored `.env` file locally, and from GitHub Secrets in CI.
- **Least-privilege CI.** The workflow only requests the permissions it needs (`contents: read`, `pages: write`, `id-token: write`).
- **No deployments from pull requests.** Reports are published only from pushes to the main branch.
- **Pinned dependencies.** `package-lock.json` is committed, and CI installs with `npm ci` for reproducible builds.
