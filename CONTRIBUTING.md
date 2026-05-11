# Working on Speedison

## Branch strategy

```
main          ← production. Every push triggers Railway deploy.
   ↑
   PR
   ↑
dev           ← integration branch. PRs from features land here first.
   ↑
   PR
   ↑
feature/*     ← branches for individual changes.
```

**Rules:**

- **Never push directly to `main`.** Always go through a PR from `dev`.
- **Never push directly to `dev`** either, except for trivial fixes. Open
  a feature branch.
- Feature branches use the prefix `feature/<short-description>`.

## Typical flow

```bash
# Start a new feature
git checkout dev
git pull
git checkout -b feature/configurator-validation-fix

# … make changes, commit …

git push -u origin feature/configurator-validation-fix

# Open a PR on GitHub: feature/... → dev
# After review + merge, dev has the new change.

# Promote dev to main (release):
# Open a second PR on GitHub: dev → main
# When merged, Railway picks up the push to main and auto-deploys.
```

## Deploys

- Pushes to `main` → Railway auto-builds + deploys the web service.
- Pushes to `dev` → no deploy (intentional; dev is integration only).
- Manual deploys: `npx @railway/cli up --service speedison-web` (use
  sparingly — bypasses the PR flow).

## Pre-flight before opening a PR

```bash
cd web
npm test                        # vitest unit + integration
DATABASE_URL=mysql://x@l/x npm run build   # next build
```

Both must pass. CI runs the same checks on every PR via
`.github/workflows/ci.yml`.

## Repo conventions

- One logical change per commit. Commit messages start with a
  conventional-style prefix: `feat(web):`, `fix(api):`, `docs:`,
  `chore:`, `test:`, `ci:`, etc.
- Don't commit secrets. `web/.env` is gitignored; use Railway env vars
  for production.
- Don't commit generated frame WebPs — they're regenerated from
  `scener/chapter-*.mp4` by `web/scripts/extract-chapter-frames.mjs`.
