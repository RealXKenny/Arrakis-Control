# Arrakis Control

A modular Discord.js v14 bot with `/ping`, `/info`, `/status`, and `/players` slash commands, plus GitHub Actions verification.

## Dune Console API

The complete supplied endpoint reference is included in [docs/dune-awakening-console-api-reference.md](docs/dune-awakening-console-api-reference.md). The bot loads that reference into a searchable endpoint catalog when `DUNE_CONSOLE_URL` is configured, covering every documented route without invoking any of them.

Only console login is wired in this phase. Add `DUNE_CONSOLE_URL` and `DUNE_CONSOLE_PASSWORD` to `.env`, then run `npm run login` to explicitly verify the session-cookie and CSRF login flow. The client logs in first, then reads `/api/auth/state` using that session to obtain its CSRF token. When the bot starts, it logs in to the console before connecting to Discord; during a clean stop (`Ctrl+C`, `SIGTERM`, or `SIGBREAK`), it logs out before closing the Discord client. No server, player, database, or admin actions have been connected to Discord commands yet.

## Discord Adapter player linking

Enable the experimental adapter in the Dune Docker Console, then configure `DUNE_DISCORD_ADAPTER_TOKEN`, `DUNE_DISCORD_LINK_PANEL_CHANNEL_ID`, and `DUNE_DISCORD_BLUEPRINT_PANEL_CHANNEL_ID`. On startup, the bot posts or refreshes a Components V2 player-link panel and a separate blueprint-import panel.

Linking opens a Discord modal for the in-game character name. The adapter sends an `ACP-` verification code to the online character in-game, then returns a private **Verify Code** button for that player to enter it within five minutes. All adapter requests use bearer authentication and include the Discord actor context required by the adapter.

## Blueprint uploads

The separate **Import Blueprint** panel opens a file-upload modal. It accepts exactly one `.json` blueprint up to 32 MB, requires a linked character, and only imports after the character has been offline for at least one minute. Before upload, the bot validates JSON syntax, expected blueprint collections, record shape, size, nesting, string/object limits, finite numeric values, and unsafe object keys. It uses the Discord Adapter's `/api/integrations/discord/players/me` route with the Discord actor context to retrieve the linked character, then uploads the validated file as `multipart/form-data` to the Console API's `/api/blueprints/import` route. The adapter is never used to import the blueprint.

Set `DUNE_DISCORD_AUDIT_CHANNEL_ID` to receive Components V2 audit entries for link requests, completed links, unlinks, and blueprint imports. Blueprint audit entries include the uploaded blueprint file.

## Setup

1. Install [Node.js 20+](https://nodejs.org/).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the values from the Discord Developer Portal.
4. Run `npm run deploy:commands` to register `/ping`, `/info`, `/status`, `/players`, `/profile`, and `/backups`. With `GUILD_ID`, they register to that development server immediately; without it, they deploy globally (which can take up to an hour to appear).
5. Start the bot with `npm start`.

## Project layout

```text
src/
  app/                  Discord-facing application code
    commands/           Slash commands grouped by feature
    components/         Buttons, select menus, and modal handlers
    events/              Discord client event handlers
  infrastructure/       External integrations and runtime plumbing
    api/                Console and Discord Adapter clients
    config/             Environment, version, and shared limits
    core/               Application lifecycle and logging
    loaders/            Automatic module discovery
  modules/              Reusable business features
    audit/              Discord audit logging
    formatters/         API response formatting
    panels/             Persistent Discord panels
    validators/         Input and blueprint safety validation
  shared/               Feature-neutral helpers
  scripts/              Deployment and project checks
  index.js              Application entry point
.github/workflows/ CI workflow
```

Each folder is organized by responsibility: commands only coordinate interactions, API clients handle HTTP, services handle reusable workflows, formatters prepare display data, and validators reject unsafe input before it reaches an API.

## Adding a command

Add a file in a category under `src/app/commands/` that exports a `data` `SlashCommandBuilder` and an async `execute(interaction)` function. Then run `npm run deploy:commands` again; every command module in that folder and its subfolders is registered automatically.

Never commit `.env`; it is intentionally ignored.

Set `LOG_LEVEL` to `DEBUG`, `INFO`, `WARN`, or `ERROR` to control the custom, color-coded logs emitted by the bot. Timestamps use America/New_York in `MM/DD/YYYY hh:mm:ss AM/PM` format. Startup logs show the number of loaded commands, component handlers, and event handlers. Each command and UI interaction is logged without exposing credentials.

## Docker releases

Before each release, update `CHANGELOG.json` with the new version, date, summary, and detailed changes. Keep the newest release first. This file is the user-readable release history and should be committed with the version update.

`VERSION` is the canonical bot version and must be a semantic version such as `1.0.0`. Updating that file and pushing it to `main` automatically synchronizes `package.json`, creates a GitHub Release tagged `v<version>`, and pushes Docker images tagged `<version>` and `latest`. Release notes are generated exclusively from the matching, human-written `CHANGELOG.json` entry, keeping every release clean and user-friendly. You can run `npm run version:sync` locally to synchronize `package.json` before committing.

Before the first release, create a Docker Hub repository named `arrakis-control` and add these GitHub repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` — a Docker Hub access token with permission to push images

You can build the image locally with `docker build --build-arg BOT_VERSION=$(Get-Content VERSION) -t arrakis-control:local .`.
Run it with your configuration file using `docker run --env-file .env arrakis-control:local`.
