# GariKoi (গাড়ী কই?)

A utilitarian, high-contrast ride-sharing Progressive Web App (PWA) demo tailored for Dhaka, built with Next.js, tRPC, Prisma/SQLite, MapLibre GL JS, and the Gemini API.

## Core Features

- **Dual-Role Simulation**: Instant Rider and Driver modes with zero authentication barriers.
- **Flexible Pickup Location**: Geolocation GPS, text search (Nominatim), or direct map pin selection.
- **AI-Powered Search**: Natural language Dhaka landmark resolution powered by Google Gemini.
- **Realistic Driver Movement**: Server-side simulation following verified Dhaka road waypoints.
- **Driver Demand Heatmap**: Live density map showing high-demand pickup clusters.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **API & Realtime**: tRPC v11 with event-driven subscriptions
- **Database**: SQLite via Prisma ORM
- **Maps**: MapLibre GL JS with OpenFreeMap vector tiles
- **Styling**: Tailwind CSS (utilitarian dark `#000000` with emerald green accents `#006a4e`)
- **Testing**: Vitest

## Getting Started

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run development server
pnpm dev
```
