# Reflection: Strategy Chain Rebuild On Upstream 3.12

Date: 2026-06-30

Continuation of [[2026-05-16-ange-policy-tabs-strategy-chain]]. The original
fork feature was built on upstream 3.6.0; this task re-implemented it on top of
3.12.0 and migrated the branch model.

## Task

- Re-port the "proxy strategy chain / 链式穿透" feature onto upstream 3.12.0.
- Re-port the policy/node tab-split that shipped with it.
- Migrate the fork branch model to a personal-trunk layout.

## What Worked

- Branch-model migration was non-destructive. Old `main` was a clean upstream
  mirror at 3.6.0, an ancestor of upstream 3.12.0, so promoting it to personal
  trunk was a fast-forward plus additive commits: no history rewrite, no
  force-push. See [[branch-and-sync-model]].
- The strategy-chain rebuild as a single page-level modal kept the upstream-file
  footprint to 2 edits.

## Mistakes / Lessons

- Inline drill-in panel was the wrong shape. The 3.6 design embedded the
  strategy-chain panel INSIDE each policy card and re-rendered child node lists
  inside a scrollable card list. That spawned a long tail of scroll-fighting
  bugs (`autoScrollOnActive`, `forceScrollIntoCenter`, `collapseGroupMap`
  force-open) and touched ~6 upstream files. The 3.12 rebuild moved it to a
  single page-level modal (`ProxyStrategyChainModal.vue` on `DialogWrapper`,
  opened via `strategyChainTarget` in `composables/proxyGroups.ts`); the modal
  owns its own scroll, so the entire scroll-hack class disappeared and the
  upstream footprint dropped to 2 edits (`ProxyGroupNow.vue` breadcrumb,
  `ProxiesPage.vue` mount). Lesson: when a drill-in interaction fights the
  surrounding scroll container, give it its own scroll context (modal/drawer)
  instead of nesting it inline. It is both simpler and lower-conflict.

- Re-ported a fork feature upstream had already subsumed. I rebuilt the
  policy/node tab-split before diffing what upstream had ADDED in the version
  gap. Upstream 3.12 shipped a folder feature (`src/store/proxyFolders.ts`) that
  already provides 策略组/节点组 categorization via built-in auto-folders. The
  rebuilt tab-split collided with it: same names, different membership, both
  rendered at once. After the user flagged it, the whole tab-split was removed
  and categorization delegated to upstream folders. Lesson: before re-porting a
  long-lived fork feature onto newer upstream, diff what upstream ADDED in the
  gap first; an upstream feature may now subsume the fork feature, so prefer
  using/extending it over duplicating. This wasted a build-then-revert cycle.

- "Policy vs node" has no single correct definition. The removed fork classifier
  was SEMANTIC (a group is policy if it is a rule target). Upstream folders are
  STRUCTURAL (`hasGroup` = contains a sub-group → 策略组; `nodeOnly` → 节点组).
  They disagree: `广告拦截` (`[REJECT, DIRECT]`, no sub-group) is 节点组 to
  upstream but policy to the user because rules route to it. Lesson: structural
  and semantic rules give different answers; document the chosen rule explicitly
  so users know why a group lands where it does, and offer manual override
  (upstream folders expose `manualIncludes`/`excludeRegex`).

- Async-data classification flickered. The semantic classifier depended on
  `rules` from `assembly/rules`, which loads asynchronously. Before rules
  arrived, every rule-target group was transiently misclassified and counts
  visibly fluctuated. Lesson: a reactive classification keyed on async-loaded
  data needs a stable fallback for the not-yet-loaded state (e.g. do not split
  until the data is present) to avoid flicker. The code was removed, but the
  rule stands.

## Promotion Candidates

- `guides/upstream-sync-friendly-changes.md`: add "diff upstream's added
  features across the version gap before re-porting a fork feature; prefer
  extending an upstream equivalent over duplicating it."
- `guides/` (UI): "give drill-in interactions their own scroll context
  (modal/drawer) rather than nesting them inside a scrolling card list."
- Promote the branch-model layout (`main` = personal trunk, `upstream-main` =
  ff-only mirror, `feat/*` off main, `local/personal-optimizations` archived)
  into a stable [[branch-and-sync-model]] doc, with the fast-forward-vs-rewrite
  check ("verify main is a clean ancestor of upstream before promoting").

## Follow-Up

- Confirm the upstream folder auto-classification (`策略组`/`节点组`) matches
  user expectation for edge groups like `广告拦截`; if not, document a
  `manualIncludes`/`excludeRegex` override recipe instead of reviving the split.
- Write the stable `branch-and-sync-model` doc so this layout is no longer only
  in memory.
