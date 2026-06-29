# Upstream Sync Friendly Changes

## Intent

This fork syncs upstream often. Feature work should reduce merge conflicts with zashboard main.

## Guidelines

- Add new files for local logic instead of rewriting upstream components.
- Patch upstream files only at stable seams: imports, enum values, small branch conditions, and component insertion.
- Keep AnGe features that need a server out of this fork unless requested.
- Preserve upstream names and layout when possible.
- Do not run broad format over existing source.
- Before merging upstream, inspect local patches with `git diff origin/main...HEAD`.

## Preferred Pattern

1. Put feature computation in a new helper/composable.
2. Put feature UI in a new component.
3. Add one narrow call site in upstream page/control.
4. Validate with type-check and build.
