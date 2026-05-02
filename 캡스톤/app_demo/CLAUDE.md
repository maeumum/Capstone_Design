# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm i          # Install dependencies
npm run dev    # Start dev server at http://localhost:5173
npm run build  # Production build → dist/
```

No lint, test, or type-check scripts are configured.

## Architecture

This is a **React + Vite + TypeScript** kiosk simulation app (카페키오스크 / 민원키오스크 / 교통 예약 등). It was generated from a Figma Make file.

### Routing & Entry

- `src/main.tsx` — mounts `<App />`
- `src/app/App.tsx` — wraps a splash screen then hands off to React Router
- `src/app/routes.ts` — route definitions; each route maps to a page component

### Pages (`src/app/components/`)

| File | Purpose |
|---|---|
| `Home.tsx` | 2-column navigation grid linking to all services |
| `CafePage.tsx` | Multi-step cafe kiosk (category → item → cart → payment) |
| `BusPage.tsx` | Bus ticket reservation (terminal → schedule → seat → payment) |
| `KTXPage.tsx` | KTX train booking with interactive seat map |
| `BankPage.tsx` | Banking transaction demo |
| `LotteriaPage.tsx` | Restaurant ordering |
| `TableOrderPage.tsx` | Table-based ordering |
| `PublicPage.tsx` | Government document issuing kiosk |
| `SplashScreen.tsx` | Startup splash |

### UI Components (`src/app/components/ui/`)

50+ shadcn/ui components (Radix UI primitives + Tailwind). Add new ones via the shadcn CLI or by copying the existing pattern. Do not modify generated component internals — extend via props or composition.

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.ts` needed)
- Design tokens live in `src/styles/theme.css` as CSS variables (OKLCH colors, radius, etc.)
- Dark mode is supported via the `.dark` class on `:root`
- Path alias: `@` → `src/` (configured in `vite.config.ts`)

### Key Libraries

- **React Router v7** — client-side routing
- **React Hook Form** — form state management
- **React DnD** — drag-and-drop interactions
- **Motion** (Framer Motion fork) — animations
- **Recharts** — charts
- **Sonner** — toast notifications
- **Embla Carousel / react-slick** — carousels
