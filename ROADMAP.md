# Arrakis Control — Development Roadmap

> Roadmap for [Arrakis Control](https://github.com/RealXKenny/Arrakis-Control), a modular Discord.js v14 bot and Next.js dashboard for Dune: Awakening.

## Project Context

Arrakis Control currently consists of two applications:

```text
Arrakis-Control/
├── Bot/
│   ├── app/              # Commands, components, and events
│   ├── infrastructure/  # APIs, configuration, loaders, and core services
│   ├── modules/          # Application modules and panels
│   ├── scripts/          # Build and maintenance scripts
│   ├── shared/           # Shared utilities and factories
│   ├── types/            # TypeScript declarations
│   └── index.ts
│
├── Dashboard/
│   ├── app/              # Next.js application and API routes
│   ├── public/
│   ├── next.config.mjs
│   └── package.json
│
├── .github/
├── README.md
├── SECURITY.md
└── ...
```

The bot is Node.js + TypeScript + Discord.js v14, while the dashboard is Next.js. The existing project already includes Discord authentication, bot control, server/player information, audit logging, and Dune: Awakening integrations.

---

# Architecture Goals

The next stage should add:

- PostgreSQL for persistent application data
- Redis for caching, locks, rate limits, and temporary state
- Sentry for error monitoring
- A complete ticket system
- Ticket transcripts
- Dashboard management for tickets and configuration
- A clean service/repository architecture shared between bot and dashboard

## Core Architecture Rule

> **PostgreSQL = source of truth**  
> **Redis = cache, temporary state, and coordination**  
> **Sentry = error visibility**  
> **Discord = bot interface**  
> **Next.js = web interface**

The dashboard should not directly expose PostgreSQL to the browser. Server-side dashboard code should call the application/service layer or a protected API.

---

# 🔴 P0 — Foundation

P0 items are required before the new systems should be considered production-ready.

## 1. Configuration & Environment

**Priority:** P0  
**Dependencies:** None

- [ ] Audit existing `Bot` and `Dashboard` environment configuration
- [ ] Add `DATABASE_URL`
- [ ] Add `REDIS_URL`
- [ ] Add `SENTRY_DSN`
- [ ] Add `SENTRY_ENVIRONMENT`
- [ ] Validate required environment variables at startup
- [ ] Keep secrets out of Git
- [ ] Update `.env.example` files
- [ ] Document local development configuration
- [ ] Document production configuration

Suggested configuration:

```env
DISCORD_TOKEN=
DATABASE_URL=
REDIS_URL=

SENTRY_DSN=
SENTRY_ENVIRONMENT=development
```

---

# 🔴 P0 — PostgreSQL

## 2. Database Integration

**Priority:** P0  
**Dependencies:** Configuration

Use PostgreSQL as the permanent data store.

### Tasks

- [ ] Choose database ORM/query layer
- [ ] Add PostgreSQL driver
- [ ] Create database service
- [ ] Configure connection pooling
- [ ] Add connection health checks
- [ ] Add graceful shutdown
- [ ] Add migration system
- [ ] Create development database
- [ ] Create production database
- [ ] Add database error handling
- [ ] Add transaction helpers

### Recommended Options

**Drizzle ORM**

Best fit if you want a lightweight, SQL-oriented TypeScript architecture.

**Prisma**

Good alternative if you prefer a more opinionated ORM and generated client.

> Recommendation: **Drizzle + PostgreSQL** for Arrakis Control.

---

## 3. Database Layer

**Priority:** P0  
**Dependencies:** PostgreSQL

Do not allow Discord commands or dashboard pages to contain raw database queries.

Recommended flow:

```text
Discord Command
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
PostgreSQL
```

Dashboard:

```text
Next.js
   │
   ▼
Server/API Layer
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
PostgreSQL
```

Suggested Bot structure:

```text
Bot/
└── infrastructure/
    └── database/
        ├── client.ts
        ├── schema/
        ├── migrations/
        ├── repositories/
        └── index.ts
```

---

# 🔴 P0 — Redis

## 4. Redis Integration

**Priority:** P0  
**Dependencies:** Configuration

- [ ] Add Redis client
- [ ] Create Redis service
- [ ] Add connection/reconnection handling
- [ ] Add health check
- [ ] Add graceful shutdown
- [ ] Create `get/set/delete` helpers
- [ ] Create TTL helpers
- [ ] Create distributed lock helper
- [ ] Add structured Redis logging

Suggested structure:

```text
Bot/
└── infrastructure/
    └── redis/
        ├── client.ts
        ├── cache.ts
        ├── locks.ts
        └── index.ts
```

### Redis Responsibilities

Use Redis for:

```text
Guild configuration cache
Cooldowns
Rate limits
Ticket creation locks
Ticket interaction locks
Temporary sessions
Temporary dashboard state
Short-lived data
```

Do NOT use Redis as the permanent source of truth for:

```text
Users
Guild configuration
Tickets
Ticket history
Audit history
Transcripts
```

If Redis goes down, the bot should continue operating using PostgreSQL wherever possible.

---

# 🔴 P0 — Sentry

## 5. Error Monitoring

**Priority:** P0  
**Dependencies:** Configuration

Sentry should cover both applications.

### Bot

- [ ] Install/configure Sentry
- [ ] Capture uncaught exceptions
- [ ] Capture unhandled promise rejections
- [ ] Capture Discord command errors
- [ ] Capture component interaction errors
- [ ] Capture PostgreSQL errors
- [ ] Capture Redis errors
- [ ] Add guild/user/command context
- [ ] Configure production environment
- [ ] Test error reporting

### Dashboard

- [ ] Install/configure Sentry
- [ ] Capture server-side errors
- [ ] Capture API errors
- [ ] Capture authentication failures where appropriate
- [ ] Add request context
- [ ] Configure production environment
- [ ] Test error reporting

Never send secrets, bot tokens, OAuth secrets, passwords, or database credentials to Sentry.

---

# 🟠 P1 — Shared Data Model

## 6. Core Database Schema

**Priority:** P1  
**Dependencies:** PostgreSQL

Start with the following entities.

### `guilds`

```text
guilds
├── id
├── discord_id
├── name
├── created_at
└── updated_at
```

### `users`

```text
users
├── id
├── discord_id
├── username
├── created_at
└── updated_at
```

### `guild_config`

```text
guild_config
├── guild_id
├── ticket_enabled
├── ticket_category_id
├── support_role_id
├── ticket_log_channel_id
├── transcript_channel_id
├── created_at
└── updated_at
```

Use Discord snowflakes safely. `BIGINT` is recommended for Discord IDs.

---

# 🟠 P1 — Guild Configuration

## 7. Configuration Service

**Priority:** P1  
**Dependencies:** PostgreSQL + Redis

Build a single service responsible for retrieving guild configuration.

```text
getGuildConfig(guildId)
updateGuildConfig(guildId, changes)
invalidateGuildConfig(guildId)
```

### Cache Flow

```text
Request Guild Config
        │
        ▼
      Redis
      /   \
   HIT    MISS
    │       │
    ▼       ▼
 Return  PostgreSQL
             │
             ▼
           Redis
             │
             ▼
           Return
```

When configuration changes:

```text
Dashboard / Discord
        │
        ▼
PostgreSQL
        │
        ▼
Invalidate Redis cache
```

Suggested Redis key:

```text
guild:config:{guildId}
```

---

# 🟠 P1 — Ticket System

## 8. Ticket Database

**Priority:** P1  
**Dependencies:** Core database layer + guild configuration

### `tickets`

```text
tickets
├── id
├── guild_id
├── channel_id
├── creator_id
├── claimed_by
├── status
├── created_at
├── claimed_at
├── closed_at
└── updated_at
```

Recommended statuses:

```text
OPEN
CLAIMED
CLOSED
ARCHIVED
```

### `ticket_events`

```text
ticket_events
├── id
├── ticket_id
├── event_type
├── actor_id
├── metadata
└── created_at
```

Event types:

```text
TICKET_CREATED
TICKET_CLAIMED
TICKET_UNCLAIMED
TICKET_CLOSED
TICKET_REOPENED
TRANSCRIPT_CREATED
TRANSCRIPT_FAILED
```

---

# 🟠 P1 — Ticket Service

## 9. Ticket Lifecycle

**Priority:** P1  
**Dependencies:** Ticket database + Discord.js

Recommended lifecycle:

```text
Create
  ↓
Open
  ↓
Claimed
  ↓
Active
  ↓
Closed
  ↓
Transcript
  ↓
Archived
```

### Core Features

- [ ] Ticket creation button/panel
- [ ] Create ticket channel
- [ ] Apply correct Discord permissions
- [ ] Assign ticket category
- [ ] Add support role access
- [ ] Prevent duplicate open tickets
- [ ] Ticket claiming
- [ ] Ticket unclaiming
- [ ] Ticket closing
- [ ] Close confirmation
- [ ] Ticket metadata persistence
- [ ] Ticket event logging

---

# 🟠 P1 — Redis Ticket Protection

## 10. Prevent Race Conditions

**Priority:** P1  
**Dependencies:** Redis + ticket service

Ticket creation needs protection against double-clicks and simultaneous requests.

Suggested lock:

```text
lock:ticket:create:{guildId}:{userId}
```

Flow:

```text
Interaction
    │
    ▼
Acquire Redis Lock
    │
    ▼
Check PostgreSQL
    │
    ├── Existing ticket → Return existing ticket
    │
    └── No ticket
          │
          ▼
      Create ticket
          │
          ▼
      Release lock
```

Also use Redis for:

```text
ticket:cooldown:{guildId}:{userId}
ticket:interaction:{ticketId}:{interactionId}
```

PostgreSQL must still enforce the final uniqueness rules.

---

# 🟠 P1 — Discord Ticket UI

## 11. Discord.js Implementation

**Priority:** P1  
**Dependencies:** Ticket service

Implement using the existing Discord.js component architecture.

- [ ] Ticket panel
- [ ] Create ticket button
- [ ] Claim button
- [ ] Close button
- [ ] Reopen button (optional)
- [ ] Close confirmation modal
- [ ] Staff-only controls
- [ ] Ticket status display
- [ ] Ticket metadata display
- [ ] Error responses for failed operations

Suggested module location:

```text
Bot/
└── modules/
    └── tickets/
        ├── commands/
        ├── components/
        ├── services/
        ├── repositories/
        ├── events/
        └── types/
```

Adapt names to the existing module conventions rather than duplicating infrastructure already present in the repository.

---

# 🟡 P2 — Dashboard Ticket Management

## 12. Dashboard Integration

**Priority:** P2  
**Dependencies:** Ticket service + authentication

The Next.js dashboard should expose ticket management.

### Dashboard Features

- [ ] View open tickets
- [ ] View closed tickets
- [ ] Search tickets
- [ ] Filter by status
- [ ] Filter by user
- [ ] Filter by staff member
- [ ] View ticket metadata
- [ ] View ticket events
- [ ] View transcript
- [ ] Configure ticket system
- [ ] Configure support role
- [ ] Configure ticket category
- [ ] Configure transcript channel

### Authorization

Dashboard access should verify:

```text
Discord User
      ↓
Authenticated Session
      ↓
Selected Guild
      ↓
User has required Discord permissions
      ↓
Allow dashboard action
```

Do not rely solely on the fact that a user is logged into the dashboard.

---

# 🟡 P2 — Ticket API

## 13. Dashboard API / Server Layer

**Priority:** P2  
**Dependencies:** Dashboard authentication + service layer

Potential endpoints/actions:

```text
GET    /api/guilds/:guildId/tickets
GET    /api/guilds/:guildId/tickets/:ticketId
GET    /api/guilds/:guildId/tickets/:ticketId/events

POST   /api/guilds/:guildId/tickets/:ticketId/claim
POST   /api/guilds/:guildId/tickets/:ticketId/close
POST   /api/guilds/:guildId/tickets/:ticketId/reopen

GET    /api/guilds/:guildId/ticket-config
PATCH  /api/guilds/:guildId/ticket-config
```

Use the existing Next.js routing conventions in the repository.

---

# 🟡 P2 — Ticket Transcripts

## 14. Transcript Generation

**Priority:** P2  
**Dependencies:** Ticket closing

Generate a transcript when a ticket is closed.

### Requirements

- [ ] Fetch ticket messages
- [ ] Include usernames
- [ ] Include Discord IDs
- [ ] Include timestamps
- [ ] Include message content
- [ ] Handle embeds
- [ ] Handle attachments
- [ ] Handle replies
- [ ] Handle large tickets
- [ ] Handle Discord API errors
- [ ] Log transcript failures
- [ ] Generate HTML transcript
- [ ] Provide text fallback

### Example

```text
Ticket #1234
Created by: User
Created: 2026-09-02

────────────────────────

User
10:32 AM
I'm having an issue with...

Support
10:34 AM
What seems to be happening?

────────────────────────

Closed by: Moderator
Closed: 2026-09-02
```

---

# 🟡 P2 — Transcript Storage

## 15. Transcript Persistence

**Priority:** P2  
**Dependencies:** Transcript generation

### Initial implementation

Send transcript to the configured Discord transcript/log channel.

### Future scalable implementation

```text
Discord
   │
   ▼
Generate Transcript
   │
   ▼
Object Storage
   │
   ▼
Save metadata
   │
   ▼
PostgreSQL
   │
   ▼
Dashboard / Discord
```

PostgreSQL should store transcript metadata rather than large transcript bodies where practical.

Potential metadata:

```text
ticket_id
storage_provider
storage_key
created_at
file_size
checksum
```

---

# 🟡 P2 — Auditing

## 16. Ticket Audit System

**Priority:** P2  
**Dependencies:** Ticket events

Track all important ticket actions.

```text
TICKET_CREATED
TICKET_CLAIMED
TICKET_UNCLAIMED
TICKET_CLOSED
TICKET_REOPENED
TRANSCRIPT_CREATED
TRANSCRIPT_FAILED
CONFIG_UPDATED
```

Each event should record:

```text
Actor
Timestamp
Ticket
Guild
Event type
Relevant metadata
```

This should integrate with the existing Arrakis Control audit logging rather than creating an entirely separate logging system if the current implementation can be extended.

---

# 🟡 P2 — Reliability

## 17. Production Hardening

- [ ] PostgreSQL reconnect handling
- [ ] Redis reconnect handling
- [ ] Discord API failure handling
- [ ] Dashboard API error handling
- [ ] Graceful bot shutdown
- [ ] Graceful dashboard shutdown
- [ ] Startup health checks
- [ ] Database health check
- [ ] Redis health check
- [ ] Sentry health/error testing
- [ ] Structured application logging
- [ ] PostgreSQL backup strategy
- [ ] PostgreSQL restore testing
- [ ] Rate-limit handling
- [ ] Retry strategy for transient failures

---

# 🟡 P2 — Testing

## 18. Automated Tests

### Database

- [ ] Guild creation
- [ ] Guild configuration
- [ ] User creation
- [ ] Ticket creation
- [ ] Ticket claiming
- [ ] Ticket closing
- [ ] Ticket event creation
- [ ] Transaction rollback

### Redis

- [ ] Cache hit
- [ ] Cache miss
- [ ] TTL expiration
- [ ] Lock acquisition
- [ ] Lock expiration
- [ ] Lock contention

### Tickets

- [ ] Create ticket
- [ ] Duplicate ticket prevention
- [ ] Claim ticket
- [ ] Close ticket
- [ ] Transcript generation
- [ ] Permission failures
- [ ] Discord API failure

### Dashboard

- [ ] Authentication
- [ ] Guild authorization
- [ ] Ticket listing
- [ ] Ticket actions
- [ ] Configuration updates
- [ ] Unauthorized access

---

# Dependency Map

```text
Configuration
     │
     ├───────────────┐
     ▼               ▼
PostgreSQL         Redis
     │               │
     └───────┬───────┘
             ▼
      Database / Cache
        Services
             │
             ▼
      Guild Configuration
             │
             ▼
        Ticket Service
             │
       ┌─────┴─────┐
       ▼           ▼
   Discord       Dashboard
       │           │
       └─────┬─────┘
             ▼
        Ticket Events
             │
             ▼
        Transcripts
```

Sentry should sit across every layer:

```text
Bot ───────────────┐
                   │
Database ──────────┤
                   ├──► Sentry
Redis ─────────────┤
                   │
Dashboard ─────────┘
```

---

# Redis Key Strategy

Use predictable namespaced keys.

```text
guild:config:{guildId}

ticket:lock:create:{guildId}:{userId}
ticket:lock:action:{ticketId}

ticket:cooldown:{guildId}:{userId}

ticket:state:{ticketId}

dashboard:session:{sessionId}
```

### Key Rules

- [ ] Use consistent prefixes
- [ ] Always define TTLs for temporary keys
- [ ] Never store permanent application state only in Redis
- [ ] Document every Redis key
- [ ] Avoid unbounded cache growth
- [ ] Invalidate cache when PostgreSQL data changes

---

# Suggested Bot Structure

Build on the repository's existing structure rather than replacing it.

```text
Bot/
├── app/
│   ├── commands/
│   ├── components/
│   └── events/
│
├── infrastructure/
│   ├── database/
│   │   ├── client.ts
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── repositories/
│   │
│   ├── redis/
│   │   ├── client.ts
│   │   ├── cache.ts
│   │   └── locks.ts
│   │
│   ├── sentry/
│   └── ...
│
├── modules/
│   ├── tickets/
│   │   ├── commands/
│   │   ├── components/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── types/
│   │
│   └── ...
│
├── shared/
├── types/
└── index.ts
```

---

# Suggested Dashboard Structure

Build on the existing Next.js `app` structure.

```text
Dashboard/
├── app/
│   ├── api/
│   │   └── guilds/
│   │       └── [guildId]/
│   │           └── tickets/
│   │
│   ├── dashboard/
│   │   └── [guildId]/
│   │       ├── tickets/
│   │       ├── settings/
│   │       └── ...
│   │
│   └── ...
│
├── components/
├── lib/
│   ├── auth/
│   ├── api/
│   └── permissions/
└── ...
```

Keep database access server-side.

---

# Priority Summary

## 🔴 P0 — Infrastructure

- [ ] Environment/configuration
- [ ] PostgreSQL
- [ ] Database migrations
- [ ] Database service/repository layer
- [ ] Redis
- [ ] Redis cache/lock helpers
- [ ] Sentry for Bot
- [ ] Sentry for Dashboard
- [ ] Global error handling
- [ ] Graceful shutdown

## 🟠 P1 — Core Ticket System

- [ ] Core database schema
- [ ] Guild configuration
- [ ] Guild configuration caching
- [ ] Ticket database
- [ ] Ticket events
- [ ] Ticket service
- [ ] Ticket creation
- [ ] Ticket permissions
- [ ] Ticket claiming
- [ ] Ticket closing
- [ ] Redis ticket locks
- [ ] Discord ticket UI

## 🟡 P2 — Dashboard, Transcripts & Production

- [ ] Dashboard ticket management
- [ ] Ticket API/server actions
- [ ] Dashboard authorization
- [ ] Transcript generation
- [ ] Transcript storage
- [ ] Ticket auditing
- [ ] Structured logging
- [ ] Automated testing
- [ ] PostgreSQL backups
- [ ] Restore testing
- [ ] Health checks
- [ ] Production hardening

---

# Recommended Implementation Order

## Phase 1 — Infrastructure

```text
1. Environment/configuration
2. PostgreSQL
3. Database migrations
4. Repository/service architecture
5. Redis
6. Redis cache + locks
7. Sentry
8. Error handling
9. Health checks
```

## Phase 2 — Persistent Configuration

```text
10. Guild model
11. User model
12. Guild configuration
13. Configuration service
14. Redis configuration cache
15. Dashboard configuration access
```

## Phase 3 — Ticket Core

```text
16. Ticket schema
17. Ticket event schema
18. Ticket service
19. Ticket creation
20. Ticket permissions
21. Ticket claiming
22. Ticket closing
23. Redis ticket locks
24. Discord ticket UI
```

## Phase 4 — Dashboard

```text
25. Ticket API/server layer
26. Dashboard authorization
27. Ticket list
28. Ticket details
29. Ticket actions
30. Ticket configuration UI
31. Ticket audit/event history
```

## Phase 5 — Transcripts

```text
32. Message collection
33. Transcript generation
34. Attachment/embed handling
35. Transcript storage
36. Transcript logging
37. Dashboard transcript viewer
```

## Phase 6 — Production

```text
38. Automated tests
39. Failure/retry handling
40. PostgreSQL backups
41. Restore testing
42. Redis failure testing
43. Sentry verification
44. Health monitoring
45. Deployment documentation
```

---

# Definition of Done

The roadmap should be considered complete when:

- [ ] PostgreSQL is the persistent source of truth
- [ ] Redis can be restarted without data loss
- [ ] Sentry receives production errors from both applications
- [ ] Guild configuration works from Discord and Dashboard
- [ ] Users cannot create duplicate tickets
- [ ] Tickets can be created, claimed, closed, and archived
- [ ] Ticket actions are audited
- [ ] Closing a ticket reliably generates a transcript
- [ ] Transcripts are accessible to authorized staff
- [ ] Dashboard permissions are enforced server-side
- [ ] PostgreSQL backups can be restored successfully
- [ ] Bot and Dashboard handle database/Redis failures gracefully
- [ ] Automated tests cover the critical ticket/database paths

---

# Architecture Summary

```text
                         ┌─────────────────┐
                         │     Discord     │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌────────────────────────┐
                    │     Bot / Discord.js   │
                    │     Node.js + TS       │
                    └───────────┬────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
              ┌───────────┐           ┌───────────┐
              │ PostgreSQL│           │   Redis   │
              │           │           │           │
              │ Source of │           │ Cache     │
              │ Truth     │           │ Locks     │
              │ Tickets   │           │ Rate      │
              │ Config    │           │ Limits    │
              └─────┬─────┘           └───────────┘
                    │
                    │
                    ▼
              ┌─────────────┐
              │ Service /   │
              │ Repository  │
              │ Layer       │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   Next.js   │
              │  Dashboard  │
              └─────────────┘

              ┌─────────────┐
              │   Sentry    │
              │ Bot + Web   │
              └─────────────┘
```

## Final Principle

**Keep the existing Arrakis Control structure. Add infrastructure underneath it rather than rewriting the project around the new features.**

The bot and dashboard should share the same domain concepts and persistence model, while Discord-specific behavior remains in the Bot application and web-specific behavior remains in Dashboard.
