# Proxy Page Architecture

## Entry Points

- `src/views/ProxiesPage.vue` renders the proxy page body.
- `src/components/controls/ProxiesCtrl.tsx` renders proxy page tabs, search, mode, sort, and bulk actions.
- `src/composables/proxies.ts` computes which groups/providers render for the active tab.
- `src/store/proxies.ts` fetches `/proxies` and `/providers/proxies`, stores proxy maps, provider lists, latency state, and selection actions.

## Existing Upstream Model

Upstream has two proxy tabs:

- `PROXY_TAB_TYPE.PROXIES`
- `PROXY_TAB_TYPE.PROVIDER`

Search mode is handled by `src/composables/proxySearch.ts` and settings in `src/store/settings.ts`.

## Local Feature Target

Keep local AnGe-derived features frontend-only:

- split proxy display into policy groups and node groups
- render nested strategy chain from existing `proxyMap` and group members
- avoid server-side AnGe rule strategy-chain APIs, auth store, and server relay

## Local Feature Files

- `src/composables/proxyGroups.ts` classifies policy groups and node groups from the existing proxy graph.
- Groups directly referenced by rules are classified as policy groups even when other groups also reference them.
- `src/components/proxies/ProxyStrategyChainSection.vue` renders strategy chain for a policy group.
- Node groups reuse the same `ProxyGroup` / `ProxyGroupForMobile` card layout as policy groups instead of a special grouped-row layout.
- Proxy tab counts should match the visible group filtering rules. Hidden groups are not counted unless `manageHiddenGroup` is enabled.

## Strategy Chain Interaction

Strategy chain now uses an inline panel instead of stacking full proxy-group cards.

- The strategy-chain button is disabled when no child group exists; no empty panel is opened in that case.
- Closed button text shows the number of child strategy groups.
- The panel has a sticky header with full group-chain path, back-to-parent, and back-to-root controls.
- The current layer is rendered as a scoped view with a visible left accent border.
- Child strategy groups and proxy nodes are separated into distinct sections.
- Opening the strategy chain shows the full current selected group chain immediately and focuses the deepest group.
- Selecting a child strategy group auto-opens the strategy chain if needed, selects it in the parent group, recomputes the full selected chain, and focuses the deepest group.
- Desktop proxy card clicks that target a child strategy group must await the parent `selectProxyAPI` write before opening or refreshing the strategy-chain panel. Otherwise the first click can reopen the panel with the previous selected child path and only the second click reflects the new path.
- Group card summaries display the current selected strategy-group chain and the final selected proxy node.
- Long summary chains are compressed to first item, ellipsis, and final item, with the full chain in the title.
- The summary expansion button opens the strategy-chain panel at the deepest current group.
- Clicking a strategy-group item in the desktop chain summary opens the strategy-chain panel and positions it at that chain layer.
- Clicking any group in the strategy-chain panel path switches the scoped content to that group while preserving the full path display.
- Returning to parent/root switches the focused layer without truncating the full path.

## Low-Conflict Extension Points

Use dedicated local files for classification and strategy-chain logic. Then integrate with narrow edits:

- add enum values in `src/constant/index.ts`
- map tab labels in i18n files
- let `ProxiesCtrl.tsx` read tab metadata from a helper instead of embedding AnGe-heavy logic
- let `ProxiesPage.vue` choose standard group or provider rendering; keep node groups as standard group cards
