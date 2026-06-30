# Proxy Page Architecture

## Where Proxy State Lives (post 3.x refactor)

Upstream isolated api/assembly/view (commit `75b79edb`). The old `src/store/proxies.ts`
and `src/store/rules.ts` are GONE. Current owners:

- `src/assembly/proxies/index.ts` - proxy data domain: `proxyMap`, `proxyGroupList`,
  `proxyProviederList`, `proxiesTabShow`, plus derivations `getProxyGroupChains(name)`,
  `getNowProxyNodeName(name)`, and the selection action `handlerProxySelect(group, name)`
  (awaits the select-API write before resolving).
- `src/assembly/rules.ts` - exports `rules`.
- `src/composables/proxies.ts` (`renderProxiesPageItems`) - which groups/providers render
  for the active tab. Upstream-owned; the fork does not touch it.

## Tabs And Rendering

- `src/components/controls/ProxiesCtrl.tsx` renders proxy tabs as a `SegmentedControl` over
  `Object.values(PROXY_TAB_TYPE)` - only `PROXIES` and `PROVIDER`. Upstream-owned; the fork
  no longer adds tabs.
- `src/views/ProxiesPage.vue` chooses group vs provider rendering and mounts the page-level
  strategy-chain modal once.
- `ProxyGroup.vue` renders one group card via `CollapseCard` (title = `ProxyGroupHeader` /
  `ProxyGroupHeaderForMobile`, content = `ProxiesContent` / `ProxiesByProvider`).
  `ProxyGroupNow.vue` (inside the header) shows the selected outbound chain.

## Group Categorization Is Upstream's, Not The Fork's

策略组 / 节点组 categorization is owned by upstream's folder feature
`src/store/proxyFolders.ts`, NOT by the fork. The built-in auto-folders are STRUCTURAL:

- `策略组` folder = `auto:hasGroup` (group contains at least one sub-group).
- `节点组` folder = `auto:nodeOnly` (all members are nodes).

The fork's old policy/node tab-split was deliberately dropped: re-adding fork tabs with the
same names collided with these folders (duplicate names plus mismatched membership shown at
once). Delegate categorization to `proxyFolders`; do not reintroduce a fork tab-split.

## Fork Surface

The only fork feature on this page is the strategy-chain MODAL - see
`architecture/strategy-chain-modal.md`. It edits just `ProxyGroupNow.vue` and the
`ProxiesPage.vue` mount, plus two new files and i18n.
