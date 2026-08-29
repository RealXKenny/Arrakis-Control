# Security Policy

## Supported versions

Security fixes are applied to the latest release on `main`. Older releases may not receive patches, so update before reporting an issue.

## Reporting a vulnerability

Please do not open a public GitHub issue for a security vulnerability.

Report privately through GitHub Security Advisories, or contact the project maintainer through the private contact method listed in the repository profile. Include:

- A clear description of the vulnerability
- Affected version or commit
- Reproduction steps or a minimal proof of concept
- Impact and suggested mitigation, if known

Do not include live tokens, passwords, API keys, player data, or uploaded blueprint files in a report.

You can expect an acknowledgement within seven days. Confirmed issues will be assessed, fixed, and disclosed after a patch is available.

## Secret handling

- Keep `.env` files, Discord tokens, Console passwords, Adapter tokens, and Convoy API keys out of Git.
- Use `.env.example` only as a placeholder template.
- Rotate any credential that appears in logs, screenshots, commits, tickets, or chat.
- Grant API keys the smallest required permissions and IP restrictions.
- Never log authorization headers, passwords, verification codes, or uploaded file contents.

## Operational security

- Run the bot with a non-root user where possible.
- Keep Node.js, Docker, the operating system, and npm dependencies updated.
- Restrict dashboard or management ports with a firewall or private network.
- Use HTTPS and a trusted reverse proxy before exposing management endpoints publicly.
- Limit the `/reload` command to the configured administrator role.
- Review audit logs for account links, unlinks, and blueprint imports.

## Dependency and code changes

Pull requests should pass formatting, syntax, and unused-code checks. Changes involving authentication, file uploads, API permissions, or Discord role management require additional review and should include relevant tests or validation notes.

## In-scope components

This policy covers the Discord bot, Dune Console API integration, Discord Adapter integration, Convoy API client, blueprint validation/import workflow, Docker image, and GitHub Actions release workflow.
