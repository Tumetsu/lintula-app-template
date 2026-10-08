# Changelog

Generated projects update between these releases with `copier update`. Each
release is a git tag of the same name.

## v0.1.0

First release, extracted from crossbill.

- FastAPI + async SQLAlchemy + Alembic + PostgreSQL backend in DDD/hexagonal
  layout, with import-linter contracts and an example `notes` module.
- Vite + React + TanStack Router/Query frontend, MUI or Tailwind + shadcn/ui.
- OpenAPI export and orval client generation, checked for staleness in CI.
- ruff, pyright, ESLint, Prettier, knip, dependency-cruiser, jscpd, husky.
- Multi-stage Docker image serving API and frontend; docker compose with Postgres.
- GitHub Actions CI and a weekly template-update workflow.
- Claude Code CLAUDE.md, hooks and skills.
