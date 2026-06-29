# Reflection: AnGe Policy Tabs And Strategy Chain

Date: 2026-05-16

## Task

Port selected AnGe-ClashBoard proxy-page improvements into current zashboard without requiring the AnGe server:

- split policy groups and node groups into separate tabs
- add strategy chain for nested selected proxy groups
- preserve upstream sync ergonomics

## What Worked

- New files carried most local behavior:
  - `src/composables/proxyGroups.ts`
  - `src/components/proxies/ProxyStrategyChainSection.vue`
- Existing upstream files only needed narrow entry edits.
- Strategy chain could rely on existing `proxyMap`, `proxyGroupList`, and `getProxyGroupChains`; no server API was needed.

## Mistakes / Lessons

- Initial llmdoc files were accidentally created in parent workspace instead of repo root. Verify `pwd`/`workdir` before writing docs.
- `pnpm install` ran `prepare` and appeared to hang; `pnpm install --ignore-scripts` completed and was enough for validation.
- Avoid copying AnGe rule/domain strategy-chain server code; it pulls in `store/auth` and server endpoints, against this fork goal.

## Promotion Candidates

- Keep low-conflict feature work documented as a must-read rule.
- Keep validation notes about `--ignore-scripts` available because this repo has Husky prepare.

## Follow-Up Interaction Update

The first strategy chain implementation could feel inert because it only followed the current selected proxy chain. If a policy group selected a real node, the button had no visible expansion even when child groups existed.

Updated interaction:

- keep the button clickable and show an empty state when no child group exists
- show strategy-chain count in the closed button label
- show mode controls only after expansion
- display a path breadcrumb
- highlight the child group that will be followed next
- advance the chain when a child group is selected in the strategy-chain area

Second update after manual review:

- Replaced stacked embedded group cards with an inline scoped panel.
- Empty state no longer enters a dark active state.
- Path is sticky inside the panel, so it remains visible while scrolling a long node list.
- Current layer has a visible left accent border and separate child-group / node sections.

Third update target:

- Opening the strategy chain should jump directly into the first child layer, because showing the parent layer first costs an extra click.
- When a group selection is itself a child group with a strategy chain, the strategy-chain panel should auto-open to that child.
- Groups with no child strategy chain should have the button disabled instead of showing a clickable empty state.

Implemented in `ProxyStrategyChainSection.vue` with `openToChildStrategyGroup()` exposed to `ProxyGroup.vue`.

Scroll regression diagnosis:

- The inconsistent page jump was caused by `ProxyNodeCard` auto-centering an active card on mount.
- Switching strategy-chain layers mounts a fresh set of node cards; whichever card is active can call `scrollIntoCenter()`.
- Repeated clicks often stop jumping because the same card is already mounted.
- `ProxyNodeCard` now has `autoScrollOnActive`; the strategy-chain panel disables node-card auto-centering while normal proxy lists keep the original behavior.
- Selection of a child proxy group still intentionally scrolls to the strategy-chain panel. The panel owns that scroll via `scrollToSection()`, so every strategy-chain selection moves the user to the panel without an inner active node stealing the scroll target.
- The scroll target should be the strategy-chain row, not the whole section. This lands the breadcrumb controls in view and makes choosing another chain level immediately available.
- Do not use the shared `scrollIntoCenter()` for this path because it exits when the target is already visible. Strategy-chain group selection needs forced movement to the chain row every time.

Node group layout update:

- The grouped-row node layout made the node tab visually inconsistent with policy groups and proxy providers.
- Node groups now reuse the standard proxy group cards, so policy and node tabs share the same layout, collapse behavior, preview, and two-column rules.
- The old node-only wrapper components were removed to reduce local surface area.
- Node tab counts must use the same hidden-group filter as the page body. Otherwise configs with `hidden: true` node groups show a larger tab count than the rendered card count.

Second version chain summary:

- `ProxyGroupNow.vue` now shows the current selected strategy-group chain instead of only `proxyGroup.now`.
- The chain starts after the current card group and includes the final selected proxy node for better inspection.
- Long chains are compressed as first item, ellipsis, final item. The ellipsis and explicit expand button open the strategy-chain panel at the deepest strategy group.
- On desktop `ProxyGroup.vue` sets `chain-click-mode="strategy-chain"`; clicking a group in the summary opens the local strategy-chain panel at that layer.
- Chain clicks must open the collapse card before calling the strategy-chain panel API because the panel is only mounted inside expanded `CollapseCard` content.
- Mobile keeps the old scroll-to-group behavior because `ProxyGroupForMobile.vue` has no strategy-chain panel.

Classification refinement:

- Pure "referenced by another group means node group" classification is too coarse.
- Groups directly referenced by rules are user-facing policy entry points and should stay in the policy tab even if nested groups also reference them.
- Node groups should be referenced groups that are not direct rule targets.

Strategy-chain full-path update:

- With clickable chain summaries on group cards, separate stepwise and full-expansion controls inside the panel became redundant.
- The strategy-chain panel now always shows the full selected strategy-group chain immediately.
- The path display and the scoped content focus are separate state: clicking a path item changes the focused layer, but does not truncate the path.
- Selecting a child group recomputes the selected chain and focuses the deepest selected group, so the user can choose the next link without an extra expansion click.
- Desktop child-group click order matters: if the proxy-card click emits the local "open strategy chain" event before `handlerProxySelect()` finishes, the panel can rebuild from stale `proxyGroup.now` state and show the previous child path on the first click. Fix by awaiting the selection write first, then emitting the follow-up UI event.

README / branch update:

- The long-lived local branch was renamed to `local/personal-optimizations`, because future work may include more than the proxy-page strategy-chain feature.
- README now documents the local optimization set, credits `liandu2024/AnGe-ClashBoard` as the inspiration source for proxy-page ideas, and states this fork has local frontend-only interaction and maintenance-focused adjustments.
- `.github/workflows/local-release.yml` creates `v<package-version>-local.N` releases with only `dist-cdn-fonts.zip` and `dist-no-fonts.zip` assets when `local/personal-optimizations` is pushed or manually dispatched.

UI upgrade consistency follow-up:

- This fork now uses a split release model: the Clash-compatible backend downloads the UI from the fork release URL, while the frontend version badge used to check upstream latest releases.
- That mismatch produced false update indicators for local builds and made the badge semantics diverge from the actual upgrade button.
- The dashboard update check should prefer `chenydev/zashboard` latest release, compare `vX.Y.Z-local.N` tags numerically, and only fall back to upstream when the fork release check fails.
