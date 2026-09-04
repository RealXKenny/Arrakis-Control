---
name: Arrakis-Control Architecture
description: Repository architecture, directory structure, coding boundaries, deployment architecture, and local AI development standards for Arrakis-Control
---

# Project Architecture: Arrakis-Control

Arrakis-Control is a monorepo containing a modular Discord bot and a Next.js web dashboard for managing and monitoring Dune: Awakening services.

The project is designed around a clear separation between Discord application logic, external API integrations, dashboard functionality, shared infrastructure, and local AI development infrastructure.

The GitHub repository is:

`RealXKenny/Arrakis-Control`

---

# 1. Repository Overview

```text
Arrakis-Control/
├── Bot/                    # Discord.js v14 bot
├── Dashboard/              # Next.js web dashboard
├── .github/                # GitHub configuration and workflows
├── .gitignore
├── README.md
└── SECURITY.md
```

The repository contains two primary applications:

* **Bot** — TypeScript Discord.js v14 application responsible for Discord interactions, administration, moderation, player features, Dune: Awakening integrations, panels, and audit logging.
* **Dashboard** — Next.js web application providing browser-based management, monitoring, player information, statistics, authentication, and map functionality.

The Bot and Dashboard are separate applications and should maintain clear application boundaries while communicating with required APIs and services.

---

# 2. Bot Architecture

The Bot is a TypeScript-based Discord.js v14 application.

```text
Bot/
├── app/
│   ├── commands/
│   │   ├── administration/
│   │   ├── general/
│   │   ├── moderation/
│   │   ├── players/
│   │   └── server/
│   │
│   ├── components/
│   │   ├── buttons/
│   │   ├── menus/
│   │   ├── modals/
│   │   └── selectMenus/
│   │
│   └── events/
│       └── client/
│           ├── guildMemberAdd.ts
│           ├── guildMemberRemove.ts
│           ├── interactionCreate.ts
│           └── ready.ts
│
├── infrastructure/
│   ├── api/
│   ├── config/
│   ├── core/
│   └── loaders/
│
├── modules/
│   ├── audit/
│   ├── formatters/
│   ├── panels/
│   └── validators/
│
├── shared/
│   ├── constants/
│   ├── factories/
│   └── utils/
│
├── types/
├── docs/
├── .env.example
├── index.ts
├── package.json
└── tsconfig.json
```

The Bot should follow this separation when adding new features.

---

# 2.1 Application Layer — `Bot/app`

The `app` directory contains Discord-facing application behavior.

This layer should contain:

* Discord commands
* Discord interactive components
* Discord client events
* Interaction routing
* Discord-specific request/response handling

Discord-specific behavior should remain inside this layer whenever practical.

Complex business logic and external service communication should be delegated to modules and infrastructure services.

---

# 2.2 Commands — `Bot/app/commands`

Commands are organized by responsibility:

```text
Bot/app/commands/
├── administration/
├── general/
├── moderation/
├── players/
└── server/
```

Responsibilities include:

* Administration commands
* General utility commands
* Moderation commands
* Player commands
* Dune: Awakening commands
* Server management commands

Command implementations should remain focused on handling Discord interactions.

Commands should not contain large amounts of:

* HTTP implementation
* Database implementation
* External API implementation
* Complex reusable business logic
* Infrastructure configuration

Instead, commands should call the appropriate service, module, validator, or API client.

---

# 2.3 Components — `Bot/app/components`

Discord interactive components are separated by component type:

```text
Bot/app/components/
├── buttons/
├── menus/
├── modals/
└── selectMenus/
```

These components handle Discord UI interactions such as:

* Buttons
* Menus
* Modals
* Select menus

Components should remain focused on interaction handling and presentation.

External API communication and complex processing should be delegated to the appropriate service or infrastructure layer.

---

# 2.4 Events — `Bot/app/events`

Discord client events are organized under:

```text
Bot/app/events/
└── client/
    ├── guildMemberAdd.ts
    ├── guildMemberRemove.ts
    ├── interactionCreate.ts
    └── ready.ts
```

The event layer receives Discord events and routes them into the appropriate application functionality.

Keep Discord event handling separate from:

* API clients
* Telemetry adapters
* External service implementations
* Database implementations
* AI model communication

---

# 3. Bot Infrastructure

```text
Bot/infrastructure/
├── api/
├── config/
├── core/
└── loaders/
```

The infrastructure layer contains services required to run the Bot and communicate with external systems.

Infrastructure code should encapsulate technical implementation details so the application layer does not need to understand low-level APIs.

---

# 3.1 External APIs — `Bot/infrastructure/api`

External API and service integrations belong here.

This layer may contain clients and adapters for:

* Dune: Awakening APIs
* Dune Console
* Convoy
* Discord APIs and adapters
* HTTP services
* Other external integrations

API clients should encapsulate:

* HTTP requests
* Authentication
* Request construction
* Response parsing
* Error handling
* API-specific data transformations
* Retry behavior where appropriate

Commands, components, and events should use these clients rather than implementing API calls directly.

---

# 3.2 Configuration — `Bot/infrastructure/config`

Centralized configuration and environment handling.

Configuration should:

* Load environment variables
* Validate required configuration
* Provide typed configuration values
* Keep secrets outside source control
* Avoid scattering `process.env` access throughout the application
* Provide safe defaults where appropriate

Never hard-code credentials, API tokens, passwords, or private keys.

---

# 3.3 Core Infrastructure — `Bot/infrastructure/core`

Core runtime infrastructure and application services belong here.

This layer should contain functionality required by multiple parts of the Bot but which does not belong specifically to a Discord command, component, or event.

Avoid putting feature-specific business logic into core infrastructure.

---

# 3.4 Loaders — `Bot/infrastructure/loaders`

Loaders are responsible for discovering and registering application resources.

Examples include:

* Commands
* Components
* Events

The loader system keeps the Bot startup process organized and prevents `index.ts` from becoming a large registration file.

---

# 4. Bot Modules

```text
Bot/modules/
├── audit/
├── formatters/
├── panels/
└── validators/
```

The modules layer contains reusable application functionality that sits between Discord-facing application code and lower-level infrastructure.

---

# 4.1 Audit — `Bot/modules/audit`

Audit logging and forwarding.

Responsibilities may include:

* Recording administrative actions
* Formatting audit information
* Forwarding audit events
* Maintaining consistent audit records
* Providing reusable audit functionality

Audit functionality should not be duplicated across individual commands.

---

# 4.2 Formatters — `Bot/modules/formatters`

Shared formatting logic for Discord and application output.

Examples include:

* Embeds
* Status messages
* Player information
* Server information
* Error messages
* Panel content
* API response formatting

Formatting logic should be reused rather than duplicated between commands.

---

# 4.3 Panels — `Bot/modules/panels`

Rich Discord UI panels and Components V2 interfaces.

Panels should be responsible for composing user-facing Discord interfaces.

Panels should delegate:

* Data retrieval
* API communication
* Business logic
* Validation

to the appropriate service or module.

---

# 4.4 Validators — `Bot/modules/validators`

Reusable validation logic.

Validators may be used for:

* User input
* Command arguments
* API responses
* Configuration
* Dune/server data
* Permissions
* Application-level constraints

External and untrusted data must be validated before being used by application logic.

---

# 5. Shared Bot Code

```text
Bot/shared/
├── constants/
├── factories/
└── utils/
```

The shared layer contains small, reusable pieces of code that do not belong to a specific feature.

## `Bot/shared/constants`

Shared application constants.

## `Bot/shared/factories`

Object, client, component, or service factories.

## `Bot/shared/utils`

Generic utility functions.

Shared utilities should remain generic and should not become a dumping ground for feature-specific business logic.

---

# 6. TypeScript Types

```text
Bot/types/
```

The `types` directory contains shared TypeScript declarations and type definitions.

Type safety should be maintained throughout the Bot package.

Prefer:

* Explicit interfaces
* Type aliases
* Narrow unions
* Generics
* Typed API responses
* Runtime validation for external data

Avoid:

* Unnecessary `any`
* Unsafe type assertions
* Untyped external API responses
* Duplicate type definitions

Use `any` only when there is a documented and justified reason.

---

# 7. Bot Entry Point

```text
Bot/index.ts
```

`index.ts` is the primary Bot entry point.

It should remain responsible for bootstrapping the application rather than implementing feature-specific logic.

The startup flow should generally follow:

```text
index.ts
   │
   ├── Load configuration
   │
   ├── Initialize core services
   │
   ├── Initialize API clients
   │
   ├── Load commands
   ├── Load components
   ├── Load events
   │
   └── Start Discord client
```

Keep `index.ts` small and focused on application initialization.

---

# 8. Dashboard Architecture

The Dashboard is a Next.js application providing the web interface for Arrakis-Control.

```text
Dashboard/
├── app/
├── css/
├── debug/
├── public/
├── .env.example
├── next.config.mjs
└── package.json
```

The Dashboard uses the Next.js App Router.

---

# 9. Dashboard Application — `Dashboard/app`

The Dashboard application is organized around functional portals and views.

```text
Dashboard/app/
├── auth/
├── bases/
├── control/
├── dune/
├── portal/
├── server/
├── stats/
├── map/
└── api/
```

Route-specific functionality should remain inside the appropriate route or supporting component/module.

Avoid placing unrelated application functionality into a single route.

---

# 9.1 Authentication — `/app/auth`

Responsible for dashboard authentication and authorization.

Authentication-related logic should remain isolated from general dashboard UI and game/server functionality.

Authentication must be enforced before accessing protected functionality.

---

# 9.2 Bases — `/app/bases`

Contains base-related dashboard views and functionality.

Base functionality may include:

* Base information
* Base locations
* Base management
* Base-related map data

---

# 9.3 Control — `/app/control`

Provides administrative control functionality for managing Bot and Dune: Awakening services.

Potential responsibilities include:

* Bot control
* Service status
* Restart operations
* Server management
* Administrative actions
* Service health

Sensitive control operations must require authentication and authorization.

---

# 9.4 Dune — `/app/dune`

Dune: Awakening-specific dashboard functionality.

This area should contain game-specific views and functionality that does not belong to generic server management.

---

# 9.5 Portal — `/app/portal`

The primary dashboard and portal experience for users.

The portal should provide access to relevant dashboard functionality without duplicating implementation from individual feature areas.

---

# 9.6 Server — `/app/server`

Server monitoring and management.

Examples include:

* Server status
* Player counts
* Server information
* Service health
* Server controls
* Runtime information

---

# 9.7 Statistics — `/app/stats`

Statistics and analytics views.

Examples include:

* Player statistics
* Server statistics
* Historical metrics
* Activity information
* Aggregated data

Statistics calculations should be kept separate from presentation code when practical.

---

# 10. Dashboard API — `Dashboard/app/api`

```text
Dashboard/app/api/
```

The Dashboard API layer provides server-side endpoints used by the web application.

API routes should be responsible for:

* Authentication checks
* Authorization checks
* Request validation
* Calling backend services
* Returning structured responses
* Handling API errors
* Protecting sensitive operations

API routes should not contain unnecessary duplicated business logic.

The preferred flow is:

```text
Dashboard UI
     │
     ▼
Dashboard API Route
     │
     ├── Authentication
     ├── Authorization
     ├── Validation
     │
     ▼
Service / Adapter
     │
     ▼
External API / Backend
```

---

# 11. Dashboard Map System

The Dashboard contains an interactive Dune: Awakening map system.

Conceptually:

```text
Map System
│
├── Map rendering
├── Player/location data
├── Markers
├── Bases
├── Markets
├── Telemetry
└── Map API data
```

Map functionality should remain modular and separated from unrelated dashboard views.

Local reference/map response data may be used where appropriate for static or cached map information.

Examples include:

```text
deep-desert-map-response.json
hagga-basin-map-response.json
```

Map components should consume structured data rather than embedding large datasets directly into UI components.

---

# 12. Dashboard Supporting Directories

## `Dashboard/css`

Global and application-specific styling.

Keep reusable styling centralized where practical.

Avoid unnecessary duplicated CSS.

## `Dashboard/debug`

Development and debugging utilities.

Debug functionality must not expose:

* Secrets
* Credentials
* Tokens
* Private API responses
* Sensitive production information

## `Dashboard/public`

Static assets served directly by Next.js.

Examples include:

* Images
* Icons
* Fonts
* Static map assets
* Other public resources

---

# 13. Application Boundaries

Arrakis-Control should maintain clear boundaries between the Discord Bot, Dashboard, APIs, external services, and AI infrastructure.

```text
                         ┌─────────────────────┐
                         │      Discord        │
                         │   Users / Events    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Bot           │
                         │ Commands            │
                         │ Components          │
                         │ Events              │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Bot Modules      │
                         │ Panels              │
                         │ Audit               │
                         │ Formatters          │
                         │ Validators          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Infrastructure    │
                         │ APIs                │
                         │ Core                │
                         │ Config              │
                         │ Loaders             │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
          Dune Services        Convoy/API        Discord API


                         ┌─────────────────────┐
                         │     Dashboard       │
                         │      Next.js        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Dashboard API     │
                         │ Authentication      │
                         │ Authorization       │
                         │ Validation          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Backend / Services  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Local AI Services   │
                         └─────────────────────┘
```

The Bot and Dashboard are separate applications.

Do not tightly couple Discord-specific code to Dashboard-specific code.

---

# 14. API and Telemetry Boundaries

External APIs and telemetry adapters must remain isolated from Discord event handling and Dashboard presentation code.

Do not directly implement external API calls inside:

```text
commands/
components/
events/
Dashboard UI components
```

Instead use:

```text
Discord Event / Dashboard Request
             │
             ▼
      Application Handler
             │
             ▼
       Module / Service
             │
             ▼
    Infrastructure Adapter
             │
             ▼
       External Service
```

This makes integrations easier to:

* Test
* Replace
* Mock
* Maintain
* Debug

---

# 15. Local AI Development Infrastructure

Arrakis-Control uses multiple self-hosted language and embedding models.

The models are distributed across two AI inference nodes.

All AI services are accessed through their configured API endpoints.

## AI Model Fleet

| Model                | Runtime Name              | Endpoint              | Primary Role                                            |
| -------------------- | ------------------------- | --------------------- | ------------------------------------------------------- |
| Qwen3-Coder Next 80B | `Qwen3-Coder-Next-Q4_K_M` | `5.175.213.112:11434` | Primary high-performance coding and agentic development |
| GPT-OSS 120B         | `gpt-oss-120b-Q4_K_M`     | `5.175.213.112:11434` | Secondary high-capacity reasoning and coding            |
| Qwen3.8 27B          | `qwen3.8-27b`             | `5.249.165.206:11434` | General-purpose instruction and development             |
| GPT-OSS 20B          | `gpt-oss-20b-Q3_K_M`      | `5.249.165.206:11434` | Fast edits, autocomplete, and lightweight tasks         |
| Qwen3 Embedding 8B   | `qwen3-embedding-8b`      | `5.249.165.206:11434` | Code embeddings, indexing, and semantic search          |

---

# 16. AI Model Responsibilities

## Qwen3-Coder Next 80B

Runtime:

```text
Qwen3-Coder-Next-Q4_K_M
```

Endpoint:

```text
5.175.213.112:11434
```

This is the **primary development model**.

Prefer this model for:

* Complex coding
* Multi-file changes
* Repository-wide refactoring
* Agentic development
* Architectural changes
* Difficult debugging
* Large feature implementation
* Tool-assisted development
* Complex code reviews

This should generally be the first-choice model for difficult development tasks.

---

## GPT-OSS 120B

Runtime:

```text
gpt-oss-120b-Q4_K_M
```

Endpoint:

```text
5.175.213.112:11434
```

This is the **secondary high-capacity model**.

Use it for:

* Complex reasoning
* Difficult debugging
* Architectural review
* Large refactoring
* Fallback coding tasks
* Reviewing changes produced by another model
* Independent second opinions

It can be used when Qwen3-Coder Next 80B is unavailable or when an independent review is beneficial.

---

## Qwen3.8 27B

Runtime:

```text
qwen3.8-27b
```

Endpoint:

```text
5.249.165.206:11434
```

This is the **general-purpose development model**.

Use it for:

* General coding
* Documentation
* Code explanations
* Medium-sized changes
* Debugging
* Planning
* Routine development tasks
* Standard repository questions

---

## GPT-OSS 20B

Runtime:

```text
gpt-oss-20b-Q3_K_M
```

Endpoint:

```text
5.249.165.206:11434
```

This is the **fast development model**.

Use it for:

* Small edits
* Simple bug fixes
* Autocomplete
* Boilerplate
* Formatting
* Straightforward code changes
* Quick questions

Avoid assigning large repository-wide refactors to this model when a larger coding model is available.

---

## Qwen3 Embedding 8B

Runtime:

```text
qwen3-embedding-8b
```

Endpoint:

```text
5.249.165.206:11434
```

This is the **embedding and code-search model**.

Use it for:

* Code indexing
* Semantic code search
* Repository retrieval
* Similarity search
* Context retrieval
* Documentation indexing

This model is not a replacement for the coding/instruction models.

---

# 17. AI Model Routing

Use the following general routing strategy:

```text
                         Continue
                            │
                            ▼
                  ┌───────────────────┐
                  │ Determine Task    │
                  └─────────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       Complex Task     Normal Task     Quick Task
             │              │              │
             ▼              ▼              ▼
   Qwen3-Coder Next      Qwen3.8 27B   GPT-OSS 20B
          80B
             │
             ▼
      GPT-OSS 120B
   Review / fallback
```

For repository search and semantic retrieval:

```text
Repository
    │
    ▼
Qwen3 Embedding 8B
    │
    ▼
Vector / Semantic Search
    │
    ▼
Relevant Context
    │
    ▼
Coding Model
```

The embedding model should be configured separately from chat/completion models where supported.

---

# 18. Continue Integration

Continue is the primary developer-assistance interface for the local AI infrastructure.

AI models should be selected according to task complexity.

Recommended usage:

| Task                     | Preferred Model                     |
| ------------------------ | ----------------------------------- |
| Repository-wide refactor | Qwen3-Coder Next 80B                |
| Complex feature          | Qwen3-Coder Next 80B                |
| Agentic coding           | Qwen3-Coder Next 80B                |
| Difficult debugging      | Qwen3-Coder Next 80B / GPT-OSS 120B |
| Architecture review      | GPT-OSS 120B                        |
| Independent code review  | GPT-OSS 120B                        |
| Normal development       | Qwen3.8 27B                         |
| Documentation            | Qwen3.8 27B                         |
| Medium-sized changes     | Qwen3.8 27B                         |
| Small edits              | GPT-OSS 20B                         |
| Autocomplete             | GPT-OSS 20B                         |
| Simple fixes             | GPT-OSS 20B                         |
| Code indexing            | Qwen3 Embedding 8B                  |
| Semantic code search     | Qwen3 Embedding 8B                  |
| Repository retrieval     | Qwen3 Embedding 8B                  |

AI agents should not automatically use the largest model for every task.

Choose the smallest model that can reliably complete the task.

---

# 19. AI-Assisted Development Rules

AI-generated changes must follow the existing repository architecture.

Before modifying code, AI agents should:

1. Inspect the relevant files.
2. Inspect related implementations.
3. Understand existing patterns.
4. Check existing utilities and services.
5. Check existing tests.
6. Follow the existing directory structure.
7. Identify dependencies and side effects.
8. Make the smallest reasonable change.

AI agents should:

* Reuse existing utilities and services.
* Avoid creating duplicate implementations.
* Maintain TypeScript type safety.
* Preserve existing API boundaries.
* Validate external data.
* Avoid unnecessary dependencies.
* Avoid unnecessary architectural changes.
* Keep changes focused.
* Run appropriate tests.
* Run linting/type-checking when appropriate.
* Review multi-file changes for unintended side effects.

AI agents must never expose or commit:

* API keys
* Discord tokens
* Passwords
* OAuth secrets
* Database credentials
* Private keys
* AI service credentials
* `.env` contents

---

# 20. Coding Standards

## TypeScript

Use strict TypeScript practices.

Prefer:

```text
Explicit types
Typed interfaces
Type-safe API clients
Discriminated unions
Generics
Runtime validation
Narrow types
Reusable type definitions
```

Avoid:

```text
Unnecessary any
Unsafe type assertions
Implicit external data
Unchecked API responses
Duplicated types
Large monolithic functions
```

---

# 21. Separation of Concerns

Discord-specific behavior belongs in:

```text
Bot/app/
```

Reusable application functionality belongs in:

```text
Bot/modules/
```

External services and infrastructure belong in:

```text
Bot/infrastructure/
```

Reusable utilities belong in:

```text
Bot/shared/
```

Type definitions belong in:

```text
Bot/types/
```

Dashboard functionality belongs in:

```text
Dashboard/app/
```

Dashboard server-side endpoints belong in:

```text
Dashboard/app/api/
```

This separation should be maintained when adding new features.

---

# 22. Testing Architecture

Tests should follow the existing project's testing framework and conventions.

Before adding tests:

1. Inspect `package.json`.
2. Identify the existing test framework.
3. Inspect existing test files.
4. Reuse existing fixtures and mocks.
5. Follow existing naming conventions.
6. Avoid introducing a second testing framework unnecessarily.

Unit tests should be:

* Deterministic
* Isolated
* Repeatable
* Fast
* Maintainable
* Independent of network connectivity
* Independent of production services

Do not make unit tests depend on:

* Real Discord APIs
* Real Dune APIs
* Real databases
* Real AI endpoints
* Production credentials
* External network availability

Mock external services appropriately.

---

# 23. Security Requirements

Never commit:

```text
.env
.env.local
.env.production
```

or any other file containing secrets.

Never commit:

* Discord bot tokens
* API keys
* OAuth secrets
* Database credentials
* Service credentials
* Private authentication tokens
* AI service credentials
* Private keys

Use environment variables for sensitive configuration.

External APIs must be treated as untrusted input.

Validate external data before passing it into application logic.

Dashboard control endpoints must enforce:

```text
Authentication
       │
       ▼
Authorization
       │
       ▼
Request Validation
       │
       ▼
Administrative Action
```

Never assume that a request reaching an API route is automatically trusted.

---

# 24. Deployment Architecture

Arrakis-Control is deployed directly to target VPS/server infrastructure using Node.js.

Docker is not part of the current deployment architecture.

Production services should run under an appropriate process supervisor such as:

```text
systemd
PM2
```

or another suitable process supervisor.

Conceptually:

```text
Production Infrastructure
│
├── Arrakis-Control Bot
│   └── Node.js
│
├── Arrakis-Control Dashboard
│   └── Next.js / Node.js
│
└── AI Infrastructure
    │
    ├── Node A
    │   ├── Qwen3-Coder Next 80B
    │   └── GPT-OSS 120B
    │
    └── Node B
        ├── Qwen3.8 27B
        ├── GPT-OSS 20B
        └── Qwen3 Embedding 8B
```

---

# 25. AI Infrastructure Network

The current AI infrastructure consists of two inference nodes.

## Node A

```text
5.175.213.112:11434
```

Models:

```text
Qwen3-Coder-Next-Q4_K_M
gpt-oss-120b-Q4_K_M
```

Primary purpose:

```text
High-performance coding
Complex reasoning
Agentic development
Large refactoring
Architecture work
```

## Node B

```text
5.249.165.206:11434
```

Models:

```text
qwen3.8-27b
gpt-oss-20b-Q3_K_M
qwen3-embedding-8b
```

Primary purpose:

```text
General development
Fast coding tasks
Autocomplete
Code indexing
Semantic retrieval
```

AI endpoints should not be exposed publicly unless explicitly required.

Access should be restricted through appropriate firewall and network controls.

---

# 26. Development Principles

Arrakis-Control should follow these architectural principles:

* **Separation of concerns** — Discord, Dashboard, business logic, infrastructure, and AI services remain separated.
* **Modularity** — Features should be isolated into maintainable modules.
* **Type safety** — TypeScript types should be used throughout the Bot.
* **Reuse** — Existing services, utilities, factories, validators, and components should be reused instead of duplicated.
* **Testability** — Business logic and infrastructure should be separable from Discord-specific behavior.
* **Security** — Secrets and credentials must never be committed to source control.
* **Maintainability** — Prefer clear and understandable code over unnecessary abstraction.
* **AI-friendly architecture** — Directory boundaries and responsibilities should remain predictable so AI coding agents can safely navigate and modify the repository.
* **Minimal duplication** — Shared behavior should have one authoritative implementation.
* **Controlled dependencies** — New dependencies should only be introduced when they provide meaningful value.
* **Focused changes** — Avoid unrelated modifications when implementing a feature or fixing a bug.
* **Backward compatibility** — Preserve existing functionality unless a breaking change is explicitly required.

---

# 27. AI-Friendly Repository Map

When working on Arrakis-Control, AI coding agents should use the following mental model:

```text
Arrakis-Control/
│
├── Bot/
│   │
│   ├── app/
│   │   ├── commands/
│   │   │   ├── administration/
│   │   │   ├── general/
│   │   │   ├── moderation/
│   │   │   ├── players/
│   │   │   └── server/
│   │   │
│   │   ├── components/
│   │   │   ├── buttons/
│   │   │   ├── menus/
│   │   │   ├── modals/
│   │   │   └── selectMenus/
│   │   │
│   │   └── events/
│   │       └── client/
│   │
│   ├── infrastructure/
│   │   ├── api/          → External APIs and integrations
│   │   ├── config/       → Configuration and environment
│   │   ├── core/         → Core runtime services
│   │   └── loaders/      → Commands, components, and event loading
│   │
│   ├── modules/
│   │   ├── audit/        → Audit logging
│   │   ├── formatters/   → Output formatting
│   │   ├── panels/       → Discord panels and UI
│   │   └── validators/   → Validation
│   │
│   ├── shared/
│   │   ├── constants/    → Shared constants
│   │   ├── factories/    → Factories
│   │   └── utils/        → Generic utilities
│   │
│   ├── types/            → TypeScript definitions
│   └── index.ts          → Bot entry point
│
├── Dashboard/
│   │
│   ├── app/
│   │   ├── auth/         → Authentication
│   │   ├── bases/        → Base functionality
│   │   ├── control/      → Administrative controls
│   │   ├── dune/         → Dune functionality
│   │   ├── portal/       → Main portal
│   │   ├── server/       → Server management
│   │   ├── stats/        → Statistics
│   │   ├── map/          → Interactive map
│   │   └── api/          → Server-side API routes
│   │
│   ├── css/              → Styling
│   ├── debug/            → Development/debug tools
│   └── public/           → Static assets
│
└── .continue/
    └── rules/            → Continue AI development rules
```

---

# 28. How AI Agents Should Navigate the Repository

When given a task, AI agents should first determine which application and architectural layer owns the functionality.

Use this decision process:

```text
Task
 │
 ├── Discord command?
 │       └── Bot/app/commands/
 │
 ├── Discord button/menu/modal?
 │       └── Bot/app/components/
 │
 ├── Discord event?
 │       └── Bot/app/events/
 │
 ├── External API?
 │       └── Bot/infrastructure/api/
 │
 ├── Configuration?
 │       └── Bot/infrastructure/config/
 │
 ├── Reusable Bot functionality?
 │       └── Bot/modules/
 │
 ├── Generic helper?
 │       └── Bot/shared/
 │
 ├── Type definition?
 │       └── Bot/types/
 │
 ├── Dashboard page/feature?
 │       └── Dashboard/app/
 │
 ├── Dashboard server endpoint?
 │       └── Dashboard/app/api/
 │
 ├── Map functionality?
 │       └── Dashboard/app/map/
 │
 └── AI/code retrieval?
         └── Qwen3 Embedding 8B
```

Do not place functionality in a directory simply because it is convenient.

Place code according to its architectural responsibility.

---

# 29. Change Management Rules

Before making a significant architectural change:

1. Inspect the existing implementation.
2. Identify affected applications and modules.
3. Identify existing abstractions that can be reused.
4. Determine whether the change belongs in the current architectural layer.
5. Avoid unnecessary file movement.
6. Avoid unnecessary dependency additions.
7. Preserve existing behavior.
8. Update tests.
9. Run validation after the change.
10. Update this architecture rule if the architecture itself changes.

Do not perform broad refactoring when a focused change is sufficient.

---

# 30. Source of Truth

The GitHub repository is the authoritative source for the current implementation.

Repository:

```text
RealXKenny/Arrakis-Control
```

This architecture document describes the intended architectural boundaries and development standards.

When this document differs from the actual implementation:

1. Inspect the repository.
2. Determine whether the code or documentation is outdated.
3. Do not blindly force the repository to match this document.
4. Update the architecture documentation when the implementation intentionally changes.

The actual repository structure and implementation take precedence over assumptions made by an AI model.

When making intentional architectural changes, update this document so it remains synchronized with the codebase.
