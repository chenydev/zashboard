# Project Rules

## Source Of Truth

- Base product: upstream `Zephyruso/zashboard`.
- Reference product: `liandu2024/AnGe-ClashBoard`.
- Local changes should stay small because this fork expects frequent upstream sync.

## Low-Conflict Rule

Prefer new local files and narrow integration points.

- Add feature logic in dedicated helpers/components where possible.
- Keep edits to upstream-hot files small: `src/views/ProxiesPage.vue`, `src/components/controls/ProxiesCtrl.tsx`, `src/constant/index.ts`, i18n files.
- Do not import AnGe server/auth/relay code unless explicitly requested.
- Avoid broad formatting and unrelated refactors.

## Verification Rule

For non-trivial frontend changes run:

- `pnpm type-check`
- `pnpm build`

If a command cannot run, record exact reason in final handoff.
