# Arrakis Control – Project Guide

Use this guide when editing the project outside Codex.

## Project roots

- `Dashboard/` – Next.js dashboard frontend and proxy API routes.
- `console/` – Dune server console/backend services.
- `Dashboard/public/items/` – complete in-game item image library.
- `Dashboard/public/maps/` – map backgrounds and marker images.
- `Dashboard/debug/` – saved API response snapshots for reference.
- `Dashboard/.next/` – generated build output; never edit manually.

## Dashboard application files

```text
Dashboard/app/page.js                         Landing page
Dashboard/app/layout.js                      Global layout
Dashboard/app/dashboard/page.js              Dashboard screen
Dashboard/app/components/tabs/PortalTabs.js Shared portal tab navigation

Dashboard/app/portal/page.js                  Player portal container
Dashboard/app/portal/components/BaseCard.js  Single base card
Dashboard/app/portal/components/BaseSection.js Base list, tabs, import control
Dashboard/app/portal/components/CharacterHeader.js Player identity and guild
Dashboard/app/portal/components/CharacterVitals.js Player stats and progression
Dashboard/app/portal/components/InventoryAssets.js Inventory/resource display
Dashboard/app/portal/components/LoadingState.js Loading state
Dashboard/app/portal/components/MarketBoard.js Market summary and listings
Dashboard/app/portal/components/ProgressBar.js Reusable progress bar
Dashboard/app/portal/components/TelemetryMetric.js Reusable metric
Dashboard/app/portal/components/UnlinkedState.js Unlinked-player state
Dashboard/app/portal/components/VehicleCard.js Single vehicle card
Dashboard/app/portal/components/VehicleSection.js Vehicle list
Dashboard/app/portal/config/colors.js Portal colors/styles
Dashboard/app/portal/config/progression.js XP and fuel constants
Dashboard/app/portal/hooks/usePlayerData.js Player data hook
Dashboard/app/portal/utils/bases.js Base and generator calculations
Dashboard/app/portal/utils/formatting.js Display formatting helpers
Dashboard/app/portal/utils/player.js Player normalization
Dashboard/app/portal/utils/progression.js Level/XP calculations
Dashboard/app/portal/utils/telemetry.js Telemetry normalization
Dashboard/app/portal/utils/vehicles.js Vehicle normalization

Dashboard/app/map/page.js                     Map page
Dashboard/app/map/components/MapCanvas.js     Map image and markers
Dashboard/app/map/components/MapMarker.js     Individual marker
Dashboard/app/map/components/MapStatusBar.js  Map status/footer
Dashboard/app/map/components/MapToolbar.js    Map controls
Dashboard/app/map/components/MapWindow.js     Map terminal and selector
Dashboard/app/map/components/MarkerDetails.js Selected marker details
Dashboard/app/map/config/mapConfig.js         Map definitions
Dashboard/app/map/config/markerConfig.js      Marker definitions
Dashboard/app/map/hooks/useMapData.js         Map API data hook
Dashboard/app/map/hooks/useMapDrag.js         Map pan hook
Dashboard/app/map/hooks/useMapWindow.js       Window state hook
Dashboard/app/map/hooks/useMapZoom.js         Zoom hook
Dashboard/app/map/map.module.css              Map styling
Dashboard/app/map/utils/coordinates.js        Coordinate conversion
Dashboard/app/map/utils/mapData.js            Map response normalization
Dashboard/app/map/utils/markers.js            Marker filtering/grouping
Dashboard/app/map/utils/zoom.js               Zoom calculations
```

## Dashboard API files

```text
Dashboard/app/api/_utils/session.js            Shared dashboard session lookup
Dashboard/app/api/_utils/responses.js          Shared API response helpers
Dashboard/app/api/auth/login/route.js         Login
Dashboard/app/api/auth/callback/route.js      Auth callback
Dashboard/app/api/auth/logout/route.js        Logout
Dashboard/app/api/auth/utils/oauth.js          OAuth configuration and URL helpers
Dashboard/app/api/dune/route.js               Shared Dune client/proxy
Dashboard/app/api/dune/client.js              Dune service import boundary
Dashboard/app/api/player/route.js             Player endpoint and guild lookup
Dashboard/app/api/player/utils/helpers.js     Player API helpers
Dashboard/app/api/player/utils/guilds.js      Guild response and member helpers
Dashboard/app/api/map/route.js                 Map endpoint
Dashboard/app/api/map/utils/bases.js          Base marker queries
Dashboard/app/api/map/utils/markers.js        Marker queries/normalization
Dashboard/app/api/map/utils/players.js        Player marker queries
Dashboard/app/api/map/utils/vehicles.js       Vehicle marker queries
Dashboard/app/api/market/route.js              Market stats/items endpoint
Dashboard/app/api/market/config/route.js       Buyback percentage endpoint
Dashboard/app/api/market/utils/market.js       Market response helpers
Dashboard/app/api/stats/route.js               Dashboard stats
Dashboard/app/api/stats/utils/stats.js          Stats response helpers
Dashboard/app/api/server/status/route.js      Server status
Dashboard/app/api/server/utils/status.js       Server count helpers
Dashboard/app/api/control/restart/route.js    Restart control
Dashboard/app/api/bases/[baseId]/export/route.js Blueprint export download
Dashboard/app/api/bases/utils/export.js        Blueprint download helpers
Dashboard/app/api/utils.test.js                 API utility tests
```

## Editing rules for ChatGPT

Preserve existing JSX, styles, API contracts, authentication, and business logic unless the request explicitly changes them. Inspect files before editing, make the smallest focused change, keep imports relative and valid, and do not edit `.next` or generated files. Reuse existing helpers and colors. Add defensive fallbacks for missing API fields. Run `npm run build` from `Dashboard` after changes and report changed files plus build results.

## Useful commands

```text
cd D:\\Arrakis-Control\\Dashboard
npm run build
```

## Feature request prompt

Copy this prompt into ChatGPT whenever you need a new feature:

```text
Read PROJECT_GUIDE.md first.

I want to add this feature:
[describe the feature]

Relevant API:
[method and endpoint]
[example response or API documentation]

Before editing:
- Identify the files that should change.
- Explain how the API data flows into the UI.
- Preserve existing styling and behavior.
- Do not rewrite unrelated files.

Then implement the feature, verify imports, and run:
npm run build

Report every changed file and explain what changed.
```

The `public/items` and `public/maps` directories contain all image files and should be treated as asset libraries; use existing filenames rather than adding duplicates.
