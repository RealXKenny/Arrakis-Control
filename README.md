# Arrakis Control

A modular Discord.js v14 bot and Next.js dashboard for Dune: Awakening.

## Overview

Arrakis Control consists of two applications:

* **Bot** — Discord.js v14 bot written in TypeScript.
* **Dashboard** — Next.js web dashboard for managing and monitoring the bot and Dune: Awakening services.

## Features

### Discord Bot

* `/ping`, `/info`, `/status`, `/players`, `/profile`, and `/backups`.
* Player linking and verification.
* Blueprint imports.
* Components V2 panels.
* Audit logging.
* Dune Console integration.
* Console session recovery.
* Server status and player information.
* Moderation and administration commands.

### Dashboard

* Web-based control panel.
* Player and server information.
* Dune: Awakening map and markers.
* Server status.
* Statistics.
* Discord authentication.
* Bot control and restart functionality.

## Project Structure

```text
Arrakis-Control/
├── Bot/
│   ├── app/              # Commands, components, and events
│   ├── infrastructure/  # APIs, configuration, loaders, and core services
│   ├── modules/          # Application modules and panels
│   ├── scripts/          # Build and maintenance scripts
│   ├── shared/           # Shared utilities and factories
│   ├── types/            # TypeScript declarations
│   └── index.ts          # Bot entry point
│
├── Dashboard/
│   ├── app/              # Next.js application and API routes
│   ├── public/           # Static assets
│   ├── next.config.mjs
│   └── package.json
│
├── .gitignore
├── README.md
├── SECURITY.md
└── ...
```

## Requirements

* Node.js 24+
* A Dune: Awakening Console instance
* A Discord application/bot
* Appropriate Dune Console and Discord credentials

## Local Setup

### Bot

```bash
cd Bot
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the required credentials in `.env`, then start the bot:

```bash
npm start
```

### Dashboard

```bash
cd Dashboard
npm install
```

Configure the dashboard environment variables in `.env`, then start the development server:

```bash
npm run dev
```

The dashboard will be available at the local address shown by Next.js.

## Configuration

Each application has its own configuration and environment variables.

Copy `.env.example` to `.env` where provided and configure the required values, including:

* Discord credentials
* Dune Console credentials
* Adapter token
* Panel and audit channel IDs
* Dashboard authentication settings
* Console/API URLs
* `LOG_LEVEL`

**Never commit credentials, API keys, bot tokens, OAuth secrets, or other sensitive information.**

## Development

### Bot

From `/Bot`:

```bash
npm install
npm start
```

### Dashboard

From `/Dashboard`:

```bash
npm install
npm run dev
```

### Linting

Run the appropriate lint command from the application directory:

```bash
npm run lint
```

## Documentation

* [Dune Console API reference](Bot/docs/dune-awakening-console-api-reference.md)
* [Advin Convoy API reference](Bot/docs/advin-convoy-api-reference.md)
* [Security policy](SECURITY.md)
* [Release history](Bot/CHANGELOG.json)

## Releases

1. Update `Bot/VERSION`.
2. Add release details to `Bot/CHANGELOG.json`.
3. Update the relevant package version.
4. Run tests/linting and verify both applications.
5. Push the changes to `main`.
6. Create the GitHub release.

Release automation may synchronize package versions and generate release notes from the changelog.

## Deployment

Docker is no longer used by Arrakis Control.

The bot and dashboard should be deployed directly to the target server/VPS using Node.js. Keep the applications configured with their respective environment variables and run them as managed Node.js processes.

For production deployments, use an appropriate process manager or service such as `systemd`, PM2, or another process supervisor to automatically restart services and manage logs.

## Security

Never commit `.env` files, credentials, Discord bot tokens, API keys, OAuth secrets, or other sensitive configuration.