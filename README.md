# Arrakis Control

[![Docker Pulls](https://img.shields.io/docker/pulls/realxkenny/arrakis-control)](https://hub.docker.com/r/realxkenny/arrakis-control)
[![Docker Image Version](https://img.shields.io/docker/v/realxkenny/arrakis-control?sort=semver)](https://hub.docker.com/r/realxkenny/arrakis-control)

A modular Discord.js v14 bot for Dune: Awakening Docker Console.

## Features

- `/ping`, `/info`, `/status`, `/players`, `/profile`, and `/backups`.
- Player linking, blueprint imports, Components V2 panels, audit logs, and Console session recovery.

## Local setup

Requirements: Node.js 24+ and a Dune Console instance.

```bash
npm install
cp .env.example .env
npm start
```

Fill in `.env` before starting. Never commit credentials.

## VPS Docker setup

Create `docker-compose.yml`:

```yaml
services:
  arrakis-control:
    image: realxkenny/arrakis-control:latest
    container_name: arrakis-control
    restart: unless-stopped
    env_file:
      - .env
```

Start or update:

```bash
docker compose pull
docker compose up -d
```

View logs with `docker compose logs -f arrakis-control`.

The bot must reach the Console URL from inside the container. If both containers share a Docker network, use the Console service name in `CONSOLE_URL`.

## Releases

1. Update `VERSION`.
2. Add release details to `CHANGELOG.json`.
3. Push to `main`.

GitHub Actions synchronizes `package.json`, generates notes from `CHANGELOG.json`, creates the GitHub Release, and publishes versioned and `latest` Docker images.

## Configuration

Copy `.env.example` to `.env` and configure Discord credentials, Dune Console credentials, Adapter token, panel/audit channel IDs, and `LOG_LEVEL`.

## Documentation

- [Dune Console API reference](docs/dune-awakening-console-api-reference.md)
- [Advin Convoy API reference](docs/advin-convoy-api-reference.md)
- [Source architecture](src/README.md)
- [Security policy](SECURITY.md)

## GitHub Container Registry

Every release publishes the Docker image to GitHub Packages as well as Docker Hub:

```bash
docker pull ghcr.io/realxkenny/arrakis-control:latest
docker pull ghcr.io/realxkenny/arrakis-control:1.0.9
```

For a private package, authenticate first with a GitHub token that has `read:packages`:

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

- [Release history](CHANGELOG.json)

```bash
npm run lint
```
