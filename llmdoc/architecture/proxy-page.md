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
- render nested strategy penetration from existing `proxyMap` and group members
- avoid server-side AnGe rule penetration APIs, auth store, and server relay

## Local Feature Files

- `src/composables/proxyGroups.ts` classifies policy groups and node groups from the existing proxy graph.
- `src/components/proxies/ProxyPenetrationSection.vue` renders stepwise/full strategy penetration for a policy group.
- Node groups reuse the same `ProxyGroup` / `ProxyGroupForMobile` card layout as policy groups instead of a special grouped-row layout.
- Proxy tab counts should match the visible group filtering rules. Hidden groups are not counted unless `manageHiddenGroup` is enabled.

## Strategy Penetration Interaction

Strategy penetration now uses an inline panel instead of stacking full proxy-group cards.

- The penetration button is disabled when no child group exists; no empty panel is opened in that case.
- Closed button text shows the number of penetrable descendant groups.
- The panel has a sticky header with path, back-to-parent, back-to-root, stepwise, and full-expansion controls.
- The current layer is rendered as a scoped view with a visible left accent border.
- Child strategy groups and proxy nodes are separated into distinct sections.
- Opening penetration starts at the first penetrable child layer, not the current parent layer, to avoid an extra click.
- Selecting a child strategy group auto-opens penetration if needed, switches the panel to that layer, and selects it in the parent group.
- Returning to parent/root is the way to inspect higher layers.
- Full expansion follows the current selected group chain, falling back to the first child group until the deepest layer.

## Low-Conflict Extension Points

Use dedicated local files for classification and penetration logic. Then integrate with narrow edits:

- add enum values in `src/constant/index.ts`
- map tab labels in i18n files
- let `ProxiesCtrl.tsx` read tab metadata from a helper instead of embedding AnGe-heavy logic
- let `ProxiesPage.vue` choose standard group or provider rendering; keep node groups as standard group cards
