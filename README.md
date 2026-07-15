# Playwright TypeScript Test Automation Framework

[![CI](https://github.com/MSagiroglu/playwright-typescript-oop-framework-zero-from-scratch/actions/workflows/ci.yml/badge.svg)](https://github.com/MSagiroglu/playwright-typescript-oop-framework-zero-from-scratch/actions/workflows/ci.yml)

A clean, portable end-to-end test automation framework built with **Playwright** and **TypeScript**, showcasing the patterns used in large real-world suites: an OOP Page Object Model, a fixture/hooks layer, a reusable interaction wrapper, environment-aware config, session reuse, per-shard user distribution, Excel/PDF/email reporting, a download lifecycle, and sharded CI.

It runs entirely against **public demo sites**, so anyone can clone and run it with **zero credentials or setup**. Every source file carries **bilingual (English + Turkish) comments** explaining what the code does.

> **Test targets:** [saucedemo.com](https://www.saucedemo.com) (UI) · [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) (API)

## Table of Contents

- [Highlights](#highlights)
- [Tech Stack](#tech-stack)
- [How a Test Flows Through the Layers](#how-a-test-flows-through-the-layers)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Tag Rules](#tag-rules)
- [Reporting Pipeline (Excel / PDF / Email)](#reporting-pipeline-excel--pdf--email)
- [Download Lifecycle](#download-lifecycle)
- [Sharding & Per-Shard Users](#sharding--per-shard-users)
- [CI Pipeline](#ci-pipeline)
- [Configuration & Config Files](#configuration--config-files)
- [Design Decisions](#design-decisions)
- [Extending the Framework](#extending-the-framework)

## Highlights

- **OOP Page Object Model** — one class per page over an abstract `BasePage` (inheritance, encapsulation, abstraction)
- **Reusable interaction layer** — a comprehensive `ReusableMethods` wrapper every page uses; waits/retries/logging live in one place
- **Hooks fixture layer** — a single `tests/hooks/hooks.ts` entry point that injects Page Objects + an API context and picks the session by tag
- **Environment-aware config** — a `ConfigReader` singleton with named environments, overridable by env vars
- **Session reuse** — a `setup` project logs in once; the whole suite reuses the saved `storageState`
- **Per-shard user distribution** — each shard authenticates as its own pooled account (`userIdentity`) to avoid shared-session contention
- **Tag-driven behaviour** — `@Login`, `@smoke`, `@regression`, `@critical` control both selection _and_ session handling
- **UI + API** — browser flows plus REST tests with `zod` schema validation
- **Data-driven from Excel** — negative-login scenarios read at runtime from an `.xlsx` workbook
- **Excel + PDF + Email reporting** — export a run summary (ExcelJS + pdf-lib) and email it (nodemailer)
- **Download lifecycle** — download an artifact, verify it, then delete it
- **Orchestration scripts** — a local shard runner and a dynamic worker-pool runner
- **Cross-browser + parallel** — Chromium, Firefox, WebKit across parallel workers
- **Sharded CI** — GitHub Actions fans out across shards, then merges into one HTML report + Excel/PDF + email
- **Portable** — env-var config with safe public defaults; no absolute paths; pinned dependencies; bilingual comments

## Tech Stack

Playwright · TypeScript (strict) · ExcelJS · pdf-lib · Nodemailer · zod · Faker · tsx · ESLint · Prettier · GitHub Actions

## How a Test Flows Through the Layers

```
spec (tests/**)                    "what to verify" — business intent, no selectors
  │  imports test/expect from
  ▼
hooks (tests/hooks/hooks.ts)       injects Page Objects + apiRequest; picks session by tag
  │  gives the spec
  ▼
Page Object (pages/**)             "how to interact with one page" — locators + actions
  │  calls
  ▼
ReusableMethods (utils/…)          "how the suite waits & acts" — one place for all actions
  │  drives
  ▼
Playwright                         the browser / API
```

A spec never imports raw Playwright, never instantiates a page object, and never touches a
selector — each layer has exactly one job.

## Folder Structure

```
.
├─ pages/                    # Page Objects — BasePage + one class per page
│  ├─ BasePage.ts            #   abstract base: navigation + the shared ReusableMethods handle
│  ├─ LoginPage.ts
│  ├─ InventoryPage.ts
│  ├─ CartPage.ts
│  └─ CheckoutPage.ts
├─ tests/
│  ├─ hooks/hooks.ts         # Fixture layer: injects page objects/api, tag-based session
│  ├─ setup/auth.setup.ts    # Logs in once (per-shard user), saves storageState
│  ├─ ui/                    # UI specs (login, login-negative, cart, checkout, sort)
│  └─ api/                   # API specs (posts, download)
├─ utils/
│  ├─ configReader.ts        # Environment-aware config singleton
│  ├─ userIdentity.ts        # Per-shard account resolution
│  ├─ reusableMethods.ts     # Shared interaction wrapper used by every page
│  ├─ constants.ts           # No magic strings/numbers
│  ├─ data-generator.ts      # Faker-based test data
│  ├─ schemas.ts             # zod response schemas
│  ├─ excel/excelHelper.ts   # Read data-driven rows / write run summary (ExcelJS)
│  └─ pdf/pdfReporter.ts     # Render a PDF run summary (pdf-lib)
├─ test-data/                # JSON source + generated .xlsx test data
├─ downloads/                # Files downloaded by tests (git-kept, contents ignored)
├─ scripts/
│  ├─ run-sharded.ts         # Local shard orchestrator (CI-equivalent)
│  ├─ run-dynamic.ts         # Dynamic worker-pool runner
│  ├─ generate-test-data.ts  # JSON → .xlsx test data
│  ├─ export-report.ts       # results.json → Excel + PDF
│  └─ send-report-email.ts   # Email the summary (guarded)
├─ .github/workflows/ci.yml  # Sharded CI pipeline
├─ playwright.config.ts
├─ tsconfig.json             # strict: true
├─ eslint.config.mjs
├─ .prettierrc.json
└─ .env.example              # Configurable vars with safe defaults
```

## Getting Started

Requires **Node.js 18+**.

```bash
npm install            # install dependencies
npx playwright install # install browsers
npm test               # run the full suite
```

That's it — no `.env`, no credentials, no local services.

## Running Tests

```bash
# By tag
npm run test:smoke        # @smoke only
npm run test:regression   # @regression only
npm run test:critical     # @critical only

# By type
npm run test:ui           # UI suite
npm run test:api          # API suite

# Orchestration
npm run test:sharded      # run in shards locally, then merge into one HTML report
npm run test:dynamic      # run every spec through a dynamic worker pool

# Direct Playwright
npx playwright test --project=chromium
npx playwright test --shard=1/3
npx playwright test tests/ui/login.spec.ts
```

## Tag Rules

Tags drive both **which** tests run and **how** their session is set up.

| Tag             | Meaning                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `@Login`        | Runs in a **clean, unauthenticated** context — for login flows themselves |
| _(no `@Login`)_ | Reuses the authenticated `storageState` from the setup project            |
| `@smoke`        | Fast, critical-path checks                                                |
| `@regression`   | Broader coverage                                                          |
| `@critical`     | Business-critical end-to-end flow (checkout)                              |

## Reporting Pipeline (Excel / PDF / Email)

A `json` reporter always writes `test-results/results.json`. From there:

```bash
npm test                # produces results.json (+ HTML report)
npm run export:report   # results.json → reports/summary.xlsx + reports/summary.pdf
npm run email:report    # emails the summary with attachments (skips unless SMTP env is set)
```

- **Excel** (`utils/excel/excelHelper.ts`, ExcelJS) — a _Summary_ sheet (totals) and a _Details_ sheet (one row per test).
- **PDF** (`utils/pdf/pdfReporter.ts`, pdf-lib) — a one-page summary with pass rate and per-test results.
- **Email** (`scripts/send-report-email.ts`, nodemailer) — mails the two files; **no-ops safely** when SMTP env vars are absent, so a fresh clone never breaks.

## Download Lifecycle

`tests/api/download.spec.ts` demonstrates the **download → verify → delete** pattern:

1. Download a payload into the `downloads/` folder.
2. Verify the file exists and is schema-valid.
3. **Delete it after verification**, so downloaded artifacts never linger. The `downloads/`
   folder is kept in git via `.gitkeep`; its contents are git-ignored.

## Sharding & Per-Shard Users

- **Workers** — within one machine, Playwright runs tests across parallel workers.
- **Shards** — across machines/runners, the suite is split with `--shard=i/N`; each shard runs an independent slice.
- **Per-shard users** (`utils/userIdentity.ts`) — each shard authenticates as its own pooled
  account, resolved from `PW_USER` (explicit) or `SHARD_INDEX` (round-robin over the pool).
  This mirrors why large suites distribute accounts: a single account shared across many
  concurrent shards can hit server-side session locks or rate limits.

`scripts/run-sharded.ts` reproduces the CI shard-and-merge flow locally;
`scripts/run-dynamic.ts` shows a dynamic worker-pool alternative that keeps every runner busy.

## CI Pipeline

`.github/workflows/ci.yml` runs on every push/PR to `main`:

1. **`test` job (matrix of 3 shards)** — installs deps + browsers, runs its shard, and each
   shard authenticates as its own account (`PW_USER` per matrix entry). Uploads a `blob` report.
2. **`report` job** — downloads all shard blobs, merges them into one **HTML report**, exports
   **Excel + PDF** summaries, **emails** them (guarded by secrets), and uploads the artifacts.

## Configuration & Config Files

Everything works with no `.env`. Override via env vars (or a copied `.env`):

| Variable                                                                          | Purpose                                        |
| --------------------------------------------------------------------------------- | ---------------------------------------------- |
| `BASE_URL`                                                                        | UI under test (default: saucedemo)             |
| `API_BASE_URL`                                                                    | API under test (default: jsonplaceholder)      |
| `TEST_ENV`                                                                        | Named environment to load (default: `demo`)    |
| `PW_USER`                                                                         | Force a specific account (else per-shard pool) |
| `SHARD_INDEX`                                                                     | Shard number, used to pick the shard's account |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_TO` / `EMAIL_FROM` | Email reporting (optional)                     |

Config files (JSON files can't hold comments, so they're documented here):

| File                   | What it does                                                                     |
| ---------------------- | -------------------------------------------------------------------------------- |
| `package.json`         | Dependencies (pinned) and the npm scripts listed above                           |
| `playwright.config.ts` | Projects, setup dependency, reporters, retries, sharding — fully commented       |
| `tsconfig.json`        | Strict TypeScript compiler options — commented                                   |
| `eslint.config.mjs`    | Flat ESLint config (JS + typescript-eslint) — commented                          |
| `.prettierrc.json`     | Prettier style: single quotes, trailing commas, 100-col width, LF endings        |
| `.gitignore`           | Ignores `node_modules`, reports, `.auth`, `downloads/*` (keeps `.gitkeep`), etc. |
| `.gitattributes`       | Normalises line endings to LF for reproducible checkouts                         |

## Design Decisions

- **Page Object Model + reusable layer** — selectors live in page classes; pages act only
  through `ReusableMethods`, so the wait/retry strategy is defined once and applied everywhere.
- **Hooks as the only fixture surface** — specs stay declarative and free of setup boilerplate;
  the session (fresh vs authenticated) is chosen from tags.
- **Log in once, per shard** — a `setup` project saves `storageState`; browser projects depend
  on it, so no test repeats the login, and each shard uses its own account.
- **Web-first assertions only** — no `waitForTimeout` anywhere; auto-retrying assertions wait
  exactly as long as needed, eliminating sleep-driven flakiness.
- **Safe-by-default side effects** — Excel/PDF/email and downloads all no-op or clean up when
  their inputs/secrets are missing, so the repo stays clean and a clone always runs green.

## Extending the Framework

- **New page** — add a class under `pages/` extending `BasePage`, then register a fixture in
  `tests/hooks/hooks.ts`.
- **New environment** — add an entry to `ENVIRONMENTS` in `utils/configReader.ts`.
- **New reusable action** — add it once to `utils/reusableMethods.ts`, then use it from pages.
- **New Excel-driven data** — extend `test-data/login-scenarios.json` and run `npm run generate:data`.

## License

MIT
