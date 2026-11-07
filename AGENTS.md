# AGENTS.md — Strict AI Vibe-Coding Guardrails Contract

> **MANAGED BY `polyglot-guardrails` — Single Source of Truth (DO NOT EDIT MANUALLY).**
> Load `.agents/skills/vibe-guardrails/SKILL.md` before writing or modifying any code.

## 1. Mandatory Universal Command Interface (`task`)
You MUST interact with the repository **exclusively** through the universal `task` runner (`go-task`).
**Direct execution of underlying package managers or linters (`pnpm`, `npm`, `npx`, `uv`, `pip`, `poetry`, `pytest`, `ruff`, `mypy`, `gradle`, `./gradlew`, `detekt`, `composer`, `eslint`, `vitest`, `wrangler`, `jupyter`) is strictly FORBIDDEN.**

| Action | Allowed Command |
| :--- | :--- |
| Run full meta-framework verification | `task verify` |
| Run automated end-to-end integration self-test | `task self-test` |
| Tier 1 (< 3s): Fast inner-loop AST + lint check | `task check:quick` |
| Tier 1 (< 3s): Fast unit test check | `task test:quick` |
| Tier 2 (< 10s): Pre-commit verification gate | `task check:commit` |
| Tier 3: Pre-push full architectural fortress gate | `task check:push` / `task verify` |
| Run cross-language static typechecking | `task typecheck` |
| Run cross-language WCAG 2.2 AA / UI accessibility | `task a11y` |
| Run cross-language i18n locale parity & literal check | `task i18n` |
| Run cross-language branch & line coverage verification | `task coverage` |
| Run cross-language mutation testing | `task mutate` |
| Initialize or bootstrap a project | `task init MODULES=<m1,m2>` / `task bootstrap` |
| Verify config lock | `task guard:check` |
| Sync guardrails | `task guard:sync` |
| Sign / regenerate `.guardrails.lock` checksums | `task guard:sign` / `task guard:lock` |
| Update devkit, mise toolchain & dependencies | `task update` |
| Add module/addon | `task feature:add -- <mod>` |

---

## 2. Anti-Tamper & Zero Config Drift Policy (`.guardrails.lock`)
All configuration files tracked in `.guardrails.lock` are cryptographically locked via SHA-256 checksums:
- Core foundation files: `.gitignore`, `.gitattributes`, `Taskfile.yml`, `mise.toml`, `lefthook.yml`, `AGENTS.md`
- Everything inside `.guardrails/**` and `.agents/**`
- Module-specific configuration files installed by active modules in `.guardrails/manifest.json`

---

## 3. Zero Linter / Typechecker Bypass Policy (`.guardrails/ast/no-linter-bypass.yml`)
Suppressing errors via comments or annotations (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `# noqa`, `# type: ignore`, `@SuppressWarnings`, `@Suppress`, `@file:Suppress`, `@phpstan-ignore`, `nosemgrep`) is strictly forbidden.

---

## 4. Active Module Quality Gates

### `lang:ts` — TypeScript Functional Purity & Total Functions (Lock 1)
- **Locked Configs**: `tsconfig.base.json`, `eslint.config.mjs`, `knip.json`, `vitest.config.ts`, `.dependency-cruiser.cjs`, `.prettierrc.mjs`, `commitlint.config.mjs`, `.secretlintrc.json`, `.jscpd.json`.
- **Lock 1 (`src/`)**: `complexity <= 3`, `max-depth <= 1`, `max-lines <= 150`, `max-lines-per-function <= 28`, `max-params <= 3`. Bans `let`/`var`, mutation, imperative loops, `else`, `as T`, `x!`, `is T` type predicates, `throw`/`try-catch` in pure modules, and wildcard `export *`.
- **Coverage Gate**: `vitest.config.ts` enforces `>= 95%` per-file lines, functions, branches, and statements.

### `addon:ui-guardrails` — Cross-Language UI i18n Parity & Accessibility
- **Quality Gates**: Enforces 100% locale JSON key parity (`locales/`, `i18n/`, `assets/<modid>/lang/`), WCAG 2.2 AA JSX/Astro/HTML/Twig checks, Flet/NiceGUI semantic tooltips, and Minecraft Screen Narrator (`Component.translatable`).

### `fw:astro` — Astro Island Architecture & WCAG 2.2 AA
- **Locked Configs**: `.size-limit.json`, `.guardrails/eslint/astro.mjs`, `.guardrails/depcruise/astro.cjs`.
- **Quality Gates**: Enforces `astro check`, explicit client hydration directives, and WCAG 2.2 AA accessibility.

### `fw:react` — React Strict i18n (Lock 2) & Stateless Atomic Purity (Lock 4)
- **Locked Configs**: `.size-limit.json`, `.guardrails/eslint/react.mjs`, `.guardrails/depcruise/react.cjs`.
- **Lock 2 (Strict i18n)**: Bans raw user-facing string literals in JSX and functions; requires `src/i18n/strings.ts`.
- **Lock 4 (True Atomic Purity)**: Max 150 lines per `.tsx` component; bans raw HTML (`<div>`), `<panda.div>`, `style={}`, Tailwind classes, `useEffect` in UI/routes, and all `use*` hooks in `src/components/atoms/`.

### `addon:cloudflare` — Cloudflare Workers, D1 & R2 Edge Fortress
- **Quality Gates**: Enforces valid `wrangler.toml` (`compatibility_date`), zero hardcoded credentials, and edge-safe Worker bindings.

### `addon:content-md` — Markdown & MDX Structural Purity
- **Locked Configs**: `.remarkrc.mjs`.
- **Quality Gates**: Enforces Markdown structural integrity, zero inline styling in `.mdx`, and validated course/simulation registries.

### `addon:design-system` — M3 Token Purity (Lock 3) & Panda CSS Recipes (Lock 5)
- **Locked Configs**: `panda.config.ts`, `.guardrails/eslint/design-system.mjs`, `.guardrails/depcruise/design-system.cjs`.
- **Lock 3 & Lock 5**: Bans hardcoded colors/durations/radii/fonts, enforces MD3 `bg` ↔ `color` semantic token pairing, limits JSX containers to max 3 inline layout props, and requires `defaultVariants` + commutative recipe deduplication.

### `addon:testing-fortress` — Polyglot Test Assertion Purity & Mutation (Lock 6)
- **Locked Configs**: `.guardrails/scripts/validate-testing-fortress.sh` (plus `playwright.config.ts` and `stryker.config.mjs` when `lang:ts` is active).
- **Lock 6**: Bans skipped/focused tests (`it.skip`, `test.only`, `pytest.skip`, `@Disabled`, `->skip()`), weak/tautological matchers (`toBeTruthy`, `toMatchSnapshot`, `assert True`, `assertTrue(true)`), and `vi.mock()`. Requires 1:1 `.test.ts(x)` companions and enforces cross-language mutation thresholds (`StrykerJS >= 95%`, `mutmut >= 90%`, `PITest >= 85%`, `Infection >= 85%`).
