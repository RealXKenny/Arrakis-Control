# Source layout

The source tree is intentionally split by responsibility:

```text
src/
├── app/                  Discord-facing application code
│   ├── commands/         Slash commands grouped by feature
│   ├── components/       Buttons, select menus, and modal handlers
│   └── events/           Discord client event handlers
├── infrastructure/      External integrations and runtime plumbing
│   ├── api/              Console and Discord Adapter clients
│   ├── config/           Environment, version, and shared limits
│   ├── core/             Application lifecycle and logger
│   └── loaders/          Automatic module discovery and registration
├── modules/              Reusable business features
│   ├── audit/            Discord audit logging
│   ├── formatters/       API data converted into Discord-ready text
│   ├── panels/           Persistent Discord panels
│   └── validators/       Input and blueprint safety checks
├── shared/               Feature-neutral helpers
│   ├── factories/        Shared component and image builders
│   ├── utils/            Actor and interaction helpers
│   └── constants/        Shared immutable values
├── scripts/              Local checks, deployment, and release helpers
└── index.js              Application entry point
```

## Rules for new files

- Put a slash command in the closest `app/commands/<area>/` folder.
- Put button, select-menu, and modal logic in `app/components/<type>/`.
- Put reusable workflows in `modules/`.
- Keep HTTP details inside `infrastructure/api/`; commands should call a client method.
- Keep display formatting in `modules/formatters/`; do not parse API responses in panels.
- Put shared constants in `shared/constants/` and generic helpers in `shared/utils/`.
- Keep startup, shutdown, and Discord event wiring in `infrastructure/core/` and `app/events/`.

Loaders scan these folders recursively, so new modules are picked up automatically after a restart.
