# Project Overview

zashboard is a Vue 3 + Vite dashboard for Clash-compatible APIs.

## Stack

- Vue 3 SFC and TSX components
- Vite
- Tailwind CSS and daisyUI
- VueUse storage helpers for persisted UI state
- Heroicons
- pnpm

## Main Scripts

- `pnpm dev` - local dev server
- `pnpm type-check` - TypeScript/Vue type check
- `pnpm build` - production build
- `pnpm lint` - ESLint with fix
- `pnpm format` - Prettier for `src/`

## App Shape

- Views live in `src/views/`.
- Route constants live in `src/constant/index.ts`.
- API wrappers live in `src/api/`.
- Global reactive state uses module-level refs in `src/store/`.
- Proxy page components live in `src/components/proxies/`.
- Proxy page controls live in `src/components/controls/ProxiesCtrl.tsx`.
