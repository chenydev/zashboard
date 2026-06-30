# Branch And Sync Model

## Remotes

- `origin` = `git@github.com:chenydev/zashboard.git` - the fork (push here).
- `upstream` = `https://github.com/Zephyruso/zashboard.git` - upstream (push DISABLED).

## Branches

- `main` - personal trunk and daily driver = latest upstream release + carried-forward fork
  patches. (Rebuild baseline: upstream 3.12.0 `d88b7bed` + fork patches on top.) Previously
  `main` was just an upstream mirror; it was fast-forwarded 3.6.0 -> 3.12.0 non-destructively,
  then fork patches were committed on top.
- `upstream-main` - pure upstream mirror, tracks `upstream/main`, ONLY ever fast-forwarded.
  NEVER commit here.
- `feat/strategy-chain` - feature branch off `main` where the strategy-chain rework lives.
- `local/personal-optimizations` - old 3.6.0-based branch kept as ARCHIVE until the rework is
  verified, then deletable.

## Sync Workflow (merge, not rebase)

```
git fetch upstream --prune
git checkout upstream-main && git merge --ff-only upstream/main
git checkout main && git merge upstream-main      # resolve conflicts only in fork patches
git push origin main
```

Use MERGE for the long-lived trunk, never rebase: `main` is shared and pushed, so rebasing
would rewrite published history.

## Carried-Forward Fork Patches On main

Expect merge conflicts only inside these patches:

- `llmdoc/` docs.
- `.github/workflows/local-release.yml`.
- README "Local fork features" section.
- UI-update-check sync: `src/assembly/version.ts` (prefer chenydev/zashboard release, numeric
  `vX.Y.Z-local.N` compare) plus `ZashboardSettings.vue` link -> chenydev/zashboard.
