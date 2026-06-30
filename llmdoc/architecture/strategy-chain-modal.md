# Strategy Chain Modal (Local Feature)

## Intent

Let a user inspect and drive a nested strategy-group chain (group -> sub-group -> ... ->
node) without stacking full proxy-group cards. Frontend-only, derived entirely from the
existing proxy graph. No server, no AnGe rule-strategy API, no auth/relay. This MODAL design
replaces the old 3.6 inline-panel (`ProxyStrategyChainSection.vue`, removed) entirely.

## Pieces

- `src/composables/proxyGroups.ts` - pure helpers plus page-level modal state:
  - `getChildProxyGroupNames(name)`, `getDescendantProxyGroupNames(name)`,
    `hasStrategyChain(name)` - derived from `proxyMap` / `proxyGroupList`; no server, no rules.
  - `strategyChainTarget` / `strategyChainFocus` refs; `openStrategyChain(group, focus?)` /
    `closeStrategyChain()`.
- `src/components/proxies/ProxyStrategyChainModal.vue` - a SINGLE page-level modal on
  `DialogWrapper`, mounted once in `ProxiesPage.vue`. Opens when `strategyChainTarget` is
  non-empty. Shows: a breadcrumb path (back-to-parent / back-to-root / click any layer); the
  current layer's child strategy groups (click = `handlerProxySelect` then drill in); the
  current layer's proxy nodes (click = select). Reuses `useRenderProxyList`. Because it lives
  in the modal's own scroll container it carries NONE of the old inline-panel scroll hacks.
- `src/components/proxies/ProxyGroupNow.vue` (upstream file, narrow edit) - renders the full
  selected chain as a breadcrumb (now > child > ... > final node; ellipsis-compressed when
  long; final-node tail gated by `displayFinalOutbound`), an expand button shown when
  `hasStrategyChain` is true, and clickable chain segments - all call `openStrategyChain`.
  Keeps upstream's load-balance branch and fixed-icon behavior.
- `src/views/ProxiesPage.vue` (upstream file, narrow edit) - imports and mounts
  `<ProxyStrategyChainModal />` once.
- i18n `src/i18n/{en,zh,zh-tw,ru}.ts` - 6 keys each: `strategyChain`, `backToParent`,
  `backToRoot`, `currentProxyGroup`, `childProxyGroups`, `proxyNodes`.

## Boundaries

Footprint: 2 new files + 2 narrow upstream edits + i18n. Does NOT touch `ProxyGroup.vue`,
`ProxyNodeCard.vue`, `ProxiesContent.vue`, `ProxiesByProvider.vue`, `constant/index.ts`,
`composables/proxies.ts`, or `ProxiesCtrl.tsx`. Group categorization (策略组 / 节点组) is
delegated to upstream `proxyFolders` - see `architecture/proxy-page.md`.
