# Arrakis Control

A modular Discord.js v14 bot with `/ping`, `/info`, `/status`, and `/players` slash commands, plus GitHub Actions verification.

## Dune Console API

The complete supplied endpoint reference is included in [docs/dune-awakening-console-api-reference.md](docs/dune-awakening-console-api-reference.md). The bot loads that reference into a searchable endpoint catalog when `DUNE_CONSOLE_URL` is configured, covering every documented route without invoking any of them.

Only console login is wired in this phase. Add `DUNE_CONSOLE_URL` and `DUNE_CONSOLE_PASSWORD` to `.env`, then run `npm run login` to explicitly verify the session-cookie and CSRF login flow. The client logs in first, then reads `/api/auth/state` using that session to obtain its CSRF token. When the bot starts, it logs in to the console before connecting to Discord; during a clean stop (`Ctrl+C`, `SIGTERM`, or `SIGBREAK`), it logs out before closing the Discord client. No server, player, database, or admin actions have been connected to Discord commands yet.

## Setup

1. Install [Node.js 20+](https://nodejs.org/).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the values from the Discord Developer Portal.
4. Run `npm run deploy:commands` to register `/ping`. With `GUILD_ID`, it registers to that development server immediately; without it, it deploys globally (which can take up to an hour to appear).
5. Start the bot with `npm start`.

## Project layout

```text
src/
  commands/general/     General slash-command modules
  commands/server/      Dune server command modules
  commands/players/     Dune player command modules
  config/               Environment configuration
  core/                 Bot lifecycle and logging
  components/           Button, select-menu, and modal form handlers
  events/client/        Discord client event modules
  loaders/              Recursive command and event discovery
  scripts/              Command deployment and project checks
.github/workflows/ CI workflow
```

## Adding a command

Add a file in a category under `src/commands/` that exports a `data` `SlashCommandBuilder` and an async `execute(interaction)` function. Then run `npm run deploy:commands` again; every command module in that folder and its subfolders is registered automatically.

Never commit `.env`; it is intentionally ignored.

Set `LOG_LEVEL` to `DEBUG`, `INFO`, `WARN`, or `ERROR` to control the custom, color-coded logs emitted by the bot. Timestamps use America/New_York in `MM/DD/YYYY hh:mm:ss AM/PM` format. Startup logs show the number of loaded commands, component handlers, and event handlers. Each command and UI interaction is logged without exposing credentials.

## Docker releases

`VERSION` is the canonical bot version and must be a semantic version such as `1.0.0`. Updating that file and pushing it to `main` automatically synchronizes `package.json`, creates a GitHub Release tagged `v<version>`, and pushes Docker images tagged `<version>` and `latest`. Release notes group commits into features, fixes, performance, documentation, refactoring, maintenance, and other changes; they also include commit details, a changed-files summary, and a comparison link. You can run `npm run version:sync` locally to synchronize `package.json` before committing.

Before the first release, create a Docker Hub repository named `arrakis-control` and add these GitHub repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` — a Docker Hub access token with permission to push images

You can build the image locally with `docker build --build-arg BOT_VERSION=$(Get-Content VERSION) -t arrakis-control:local .`.
Run it with your configuration file using `docker run --env-file .env arrakis-control:local`.
