# Project Rules

## Source Of Truth

- Base product: upstream `Zephyruso/zashboard` (synced often).
- Reference product: `liandu2024/AnGe-ClashBoard` (feature inspiration only; do not import its
  server/auth/relay code).
- Local changes stay small because this fork expects frequent upstream sync. See
  `guides/branch-and-sync-model.md` for remotes, branch topology, and the merge-not-rebase
  sync sequence.

## Low-Conflict Rule

Prefer new local files and narrow integration points.

- Add feature logic in dedicated helpers/components.
- Keep upstream-file edits tiny. The current fork edits only these upstream files:
  `src/components/proxies/ProxyGroupNow.vue` (chain breadcrumb + expand button) and
  `src/views/ProxiesPage.vue` (mount the strategy-chain modal once), plus i18n and
  `src/assembly/version.ts` (update-check source).
- Do not import AnGe server/auth/relay code unless explicitly requested.
- Avoid broad formatting and unrelated refactors.

## Reuse Upstream Before Re-Porting

Before re-porting a fork feature onto newer upstream, check whether upstream already added an
equivalent. Prefer extending or using the upstream feature over duplicating it. Example:
upstream `src/store/proxyFolders.ts` auto-folders (`策略组` / `节点组`) superseded the fork's
old policy/node tab-split, so the split was dropped instead of re-ported.

## Verification Rule

For non-trivial frontend changes run:

- `pnpm type-check`
- `pnpm build`

If a command cannot run, record exact reason in final handoff.
