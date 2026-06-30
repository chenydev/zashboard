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
- Backend API calls live in `src/api/`; `src/assembly/` (api/assembly/view refactor) picks the backend, assembles data, and holds reactive proxy/rules/version view-state (e.g. `assembly/proxies`, `assembly/rules`, `assembly/version`).
- Remaining global UI state (settings, folders, etc.) uses module-level refs in `src/store/`.
- Proxy page components live in `src/components/proxies/`.
- Proxy page controls live in `src/components/controls/ProxiesCtrl.tsx`.

## Local Release Notes

- Local UI upgrade downloads are expected to come from the fork release configured in the Clash-compatible backend, for example `external-ui-url` in mihomo.
- The dashboard update badge should check the same release source as the configured local UI download path. In this fork the frontend prefers `chenydev/zashboard` local releases and only falls back to upstream `Zephyruso/zashboard` when the fork release check fails.
- Local release tags use `v<package-version>-local.N`. Update checks should compare these tags numerically instead of using plain string equality, so development builds on newer upstream versions do not falsely show an update when the latest local release is older.
