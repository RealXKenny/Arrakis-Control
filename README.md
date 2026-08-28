# Arrakis Control

A modular Discord.js v14 bot starter with a `/ping` slash command and GitHub Actions verification.

## Setup

1. Install [Node.js 20+](https://nodejs.org/).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the values from the Discord Developer Portal.
4. Run `npm run deploy:commands` to register `/ping`. With `GUILD_ID`, it registers to that development server immediately; without it, it deploys globally (which can take up to an hour to appear).
5. Start the bot with `npm start`.

## Project layout

```text
src/
  commands/       Slash-command modules
  events/         Discord event modules
  handlers/       Automatic command and event loading
  utils/          Shared helpers
scripts/          Command deployment and project checks
.github/workflows/ CI workflow
```

## Adding a command

Add a file in `src/commands/` that exports a `data` `SlashCommandBuilder` and an async `execute(interaction)` function. Then run `npm run deploy:commands` again; every command module in that folder is registered automatically.

Never commit `.env`; it is intentionally ignored.
