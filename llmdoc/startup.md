# Startup

Read this file first after `llmdoc/index.md`.

## Must Read

- `llmdoc/must/project-rules.md`

## Task-Oriented Reading

- Proxy page or Clash API UI work: read `llmdoc/architecture/proxy-page.md` and, for the local feature, `llmdoc/architecture/strategy-chain-modal.md`.
- Upstream merge work: read `llmdoc/guides/branch-and-sync-model.md` and `llmdoc/guides/upstream-sync-friendly-changes.md`.
- Before final handoff: read `llmdoc/reference/validation.md`.

## Current Fork Goal

This working tree tracks upstream zashboard and carries a small frontend-only feature set:

- a strategy-chain MODAL on the proxy page, derived from the existing proxy graph
- update checks pointed at the fork release (`chenydev/zashboard`)
- no AnGe server dependency, auth relay, or backend service requirement

Group categorization (策略组 / 节点组) is delegated to upstream `proxyFolders`, not the fork.
The trunk and daily driver is `main`; `local/personal-optimizations` is the archived 3.6 branch.
