# AI web project template

A [Copier](https://copier.readthedocs.io/) template that generates a full-stack
web application with the stack, architecture and quality tooling of
[crossbill](https://github.com/Crossbill-App/crossbill-web), minus crossbill's
own domain. Generated projects can pull later template improvements with
`copier update`.

## What a generated project contains

| Area | What you get |
|---|---|
| Backend | Python 3.13, FastAPI, async SQLAlchemy 2, Alembic, PostgreSQL, dependency-injector, structlog |
| Architecture | DDD with hexagonal boundaries: `domain/`, `application/` (commands, queries, ports), `infrastructure/`, enforced by import-linter contracts; CQRS-lite read models |
| Example module | `notes`: aggregate, command and query use cases, repository, query adapter, router, API tests, and a frontend page. No migrations: you generate the first one from your own models |
| Frontend | Vite, React 19, TanStack Router (file-based) + TanStack Query, and your choice of **MUI** or **Tailwind CSS v4 + shadcn/ui** |
| API contract | `backend/openapi.json` exported without a running server; orval generates typed TanStack Query hooks; CI fails when either is stale |
| Quality | ruff, pyright (strict), import-linter, ESLint, Prettier, tsc, knip, dependency-cruiser, jscpd with ratchet thresholds, husky + lint-staged pre-commit |
| Tests | pytest API tests against in-memory SQLite; Vitest browser-mode route tests in Chromium against MSW |
| Docker | Multi-stage image: the frontend is built with Node, then served by FastAPI with the API; migrations run on start. `docker-compose.yml` adds Postgres |
| CI | GitHub Actions: frontend, backend, duplication, and a Docker smoke test against Postgres; a weekly job opens a PR when the template has a new release |
| Claude Code | `CLAUDE.md`, hooks that format on edit and run the architecture, knip, dependency-cruiser and duplication checks at the end of each turn, skills for tests and new domain modules |

Authentication is out of scope for now.

## Generate a project

Requirements: [uv](https://docs.astral.sh/uv/), Node.js 24, git, and Docker for
the database.

```bash
uvx copier copy --trust gh:<org>/ai-web-project-template my-app
```

Copier asks:

| Question | Default |
|---|---|
| `project_name` | My App |
| `project_slug` | derived from the name (packages, containers, database) |
| `description`, `author_name`, `author_email` | |
| `ui` | `mui` (or `shadcn`) |

`--trust` is required because the template runs setup tasks after rendering:
`git init`, `npm install`, `uv lock` / `uv sync`, OpenAPI export and client
generation, route-tree generation, and the MSW worker script. Add
`--skip-tasks` to skip them.

Then follow the printed next steps, or the generated `README.md`.

## Update a generated project

Copier records the answers and template version in `.copier-answers.yml`. In the
generated project:

```bash
make template-update      # = uvx copier update --trust --conflict rej
```

Copier re-renders the old version, diffs it against your project and applies
the template's changes on top. Changes that collide with your own edits are
written to `*.rej` files to merge by hand. The generated project's
`template-update.yml` workflow does this weekly and opens a pull request.

Updates resolve against git tags of this repository, so **tag every release**
(`v0.2.0`, ...) and record it in `CHANGELOG.md`.

## Developing the template

```
copier.yml          questions, derived values, setup tasks
template/           the project skeleton (rendered with Jinja)
scripts/            check-generated.sh (full check suite), test-update.sh
.github/workflows/  template-ci.yml: renders every `ui` choice and checks it
```

Conventions:

- Only files ending in `.jinja` are rendered; everything else is copied as is.
  Keep Jinja out of source files where possible, so they stay normal code.
  Project-specific values reach the frontend through `src/lib/appInfo.ts.jinja`.
- Variant code is selected by **conditional paths**, not `{% if %}` blocks inside
  components: `frontend/src/{% if ui == 'mui' %}components{% endif %}/...` and
  its shadcn twin both render to `frontend/src/components/`, and Copier skips a
  path that renders empty. Shared code (routes, hooks, api, tests) imports only
  what both variants export.
- Generated outputs (lockfiles, `openapi.json`, the API client, the route tree)
  are never committed to the template; the tasks produce them.

Test a change locally:

```bash
uvx copier copy --trust --defaults --vcs-ref HEAD --data ui=shadcn . /tmp/check-shadcn
(cd /tmp/check-shadcn/frontend && npx playwright install chromium)
scripts/check-generated.sh /tmp/check-shadcn --docker
scripts/test-update.sh shadcn /tmp/update-check
```

`--vcs-ref HEAD` renders committed files only; drop it to render your working tree.

## Adding a question

1. Add it to `copier.yml` with a `default`, so `--defaults` still works.
2. Prefer whole files or folders selected by conditional paths.
3. Add the new values to the matrix in `.github/workflows/template-ci.yml`.
4. If existing projects need a one-off change when they update across the
   release, add a `_migrations` entry in `copier.yml`.
