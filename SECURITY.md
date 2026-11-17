# Security Policy

## Supported versions

SheenUI is pre-1.0 and is distributed as source you copy into your app (there is no npm package), so security fixes land on `main` and in the next tagged release.

| Version | Supported |
|---|---|
| `main` and the latest `0.x` release | Yes |
| Older `0.x` releases | No. Update to the latest release |

Because you own the copied files, a fix only reaches your app when you copy the changed files again. Each security fix is called out under **Security** in the release notes on GitHub Releases, with the components it touches.

## Reporting a vulnerability

**Please do not open a public issue, discussion or pull request for a security problem.**

Report it privately through GitHub Security Advisories:

1. Go to the [Security tab](https://github.com/lokendra-builds/sheenui/security) of the repository.
2. Choose **Report a vulnerability** (or open <https://github.com/lokendra-builds/sheenui/security/advisories/new> directly).
3. Describe the problem: which component or script, the version or commit, steps to reproduce, and the impact you see. A minimal proof of concept helps.

What to expect:

- an acknowledgement within **5 working days**;
- a first assessment (accepted, needs more information, or not a vulnerability) within **10 working days**;
- a fix and a coordinated disclosure through a published advisory. You are credited in the advisory unless you ask us not to be.

This is a one-person open-source project, so these are goals, not guarantees. Please give a reasonable time to fix before you disclose publicly.

## What is in scope

- The code in `theme/src` that you copy into your app, for example script injection through a component prop, unsafe HTML rendering, or an unsafe URL handler.
- The demo site's build scripts and the GitHub Actions workflows in this repository (for example a workflow that could leak a secret).
- A secret or personal data committed to the repository by mistake.

Out of scope: vulnerabilities in third-party packages (report them upstream; we update dependencies regularly and run `pnpm audit`), issues that need a compromised browser or device, and missing security headers on the GitHub Pages demo, which GitHub controls.

## Secrets in this repository

No key, token or password belongs in the repository. A pre-commit hook (`scripts/pre-commit-secret-scan`, installed with `bash scripts/install-git-hooks.sh`) and gitleaks in CI check for them. If you find a secret in the history, report it privately as above so it can be rotated; deleting it from the latest commit is not enough.
