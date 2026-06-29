# Validation

## Standard Gates

Run from repo root:

```bash
pnpm type-check
pnpm build
```

If dependencies are missing and `pnpm install` hangs during lifecycle scripts, use:

```bash
pnpm install --ignore-scripts
```

Then rerun the standard gates.

## Focused Checks

- `git status --short --branch` - confirm branch and changed files.
- `git diff --stat` - confirm change scope stays small.
- `rg "fetchServerApi|store/auth|server relay|useServerProxy" src` - ensure no AnGe server dependency was introduced.

## Browser Check

For UI-sensitive changes, run `pnpm dev` and inspect `/proxies` against a configured backend. Automated build only proves compile and bundling, not real backend data behavior.
