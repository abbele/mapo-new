# Contributing & Development Workflow

## Prerequisites

- Node.js >= 20
- pnpm >= 8

```bash
pnpm install
```

---

## Git Hooks (Husky)

Two hooks run automatically on every commit.

### pre-commit — Prettier + focused tests

lint-staged runs two commands on the staged files:

1. **`prettier --write`** — formats all staged `.ts`, `.tsx`, `.vue`, `.json`, `.md` files in place.
2. **`vitest related --run`** — runs only the tests that cover the staged `.ts`/`.tsx`/`.vue` files.

`vitest related` inspects the import graph and executes only the subset of tests that directly or transitively import the changed files. If you modify `src/deepMerge.ts`, only `deepMerge.test.ts` runs — not the entire test suite.

### commit-msg — commitlint

Every commit message is validated against the [Conventional Commits](https://www.conventionalcommits.org/) spec. Invalid messages are rejected before the commit is recorded.

```
feat(core): add useMapoAuth composable      ✔
fix(form): correct nested accessor path     ✔
wip: stuff                                  ✘
```

---

## Running Tests

```bash
# All packages (via Turborepo)
pnpm test

# Single package
pnpm --filter @mapo/utils test

# Watch mode (during development)
pnpm --filter @mapo/utils exec vitest
```

---

## Building

```bash
# All packages (respects dependency order)
pnpm build

# Single package
pnpm --filter @mapo/utils build
```

---

## CI Pipeline

The GitHub Actions pipeline mirrors local checks and runs in this order:

```
lint & typecheck → test → release
```

The `release` job only runs on push to `main` after both previous jobs pass.
See [Release Process](./release-process.md) for full details.
