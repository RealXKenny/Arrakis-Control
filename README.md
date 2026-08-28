# Arrakis Control

A modular TypeScript Discord bot powered by [Sapphire Framework](https://sapphirejs.dev/).

## Included

- Slash commands (`/ping`, `/about`, `/config`) with a separate registration script
- Prefix-command support (`!ping`, `!about`) and mention prefixes
- Event listeners for startup, errors, and new guilds
- A service layer with in-memory per-guild settings, ready to replace with a database adapter
- Typed environment configuration and clean feature-oriented folders

## Run it

1. Install Node.js 20 or newer, then run `npm install`.
2. Copy `.env.example` to `.env` and add your Discord bot token and application ID.
3. In the Discord Developer Portal, enable **Message Content Intent** if you want prefix commands.
4. Run `npm run register` to publish slash commands. Set `DISCORD_GUILD_ID` during development for instant updates.
5. Start the bot with `npm run dev` (development) or `npm run build` followed by `npm start` (production).

## Add a feature

- Add commands in `src/commands/<feature>/`.
- Add gateway event listeners in `src/listeners/`.
- Put reusable domain behavior in `src/services/`.
- Add command guards in `src/preconditions/`.

Sapphire automatically discovers command, listener, and precondition classes in these folders.
