# ShelfSaathi

ShelfSaathi is a planned mobile-first inventory and purchasing assistant for small retailers.

It aims to reduce manual stock administration by turning supplier invoices into reviewable inventory updates and helping merchants decide what to replenish.

## Features

The repository currently contains product and implementation documentation only; none of the application features below are implemented here.

Planned MVP capabilities:

- Authenticate merchants and provide store-scoped access.
- Extract product and quantity details from invoice images for merchant review; update stock only after confirmation.
- Manage product barcodes and prepare printable labels.
- Provide explainable reorder suggestions based on available, clearly identified data.
- Create editable purchase-order drafts without placing orders automatically.

Supplier ordering, Sales Booster, and multilingual assistance are described as broader product goals, but are not part of the documented MVP API.

## Tech Stack

The project documents select this intended stack; no dependencies are installed or application code is present yet:

- **Frontend:** React, Vite, JavaScript, and Tailwind CSS.
- **Backend:** Python and FastAPI, as a single modular monolith.
- **Data and identity:** Supabase PostgreSQL and Supabase Auth; private Supabase Storage is proposed for invoice images.
- **Hosting direction:** Vercel for the frontend and Render (or an equivalent managed Python host) for the backend.

The database access approach and AI provider still need to be chosen. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the documented options and boundaries.

## Project Structure

This tree reflects the files currently present:

```text
.
├── README.md
└── docs/
    ├── AGENTS.md
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    ├── DESIGN.md
    └── PRD.md
```

There are no frontend, backend, migration, or test directories yet.

## Prerequisites

There is no runnable local application at present. The documented architecture anticipates:

- Node.js and a package manager for the planned Vite frontend.
- Python for the planned FastAPI backend.
- A Supabase project for PostgreSQL, authentication, and private storage.
- An AI provider account and key if invoice extraction is implemented.

Required versions and provider choices have not been established in repository configuration.

## Getting Started

Local setup is **pending**: this repository has no application source, dependency manifests, lockfiles, `.env.example`, database migrations, or run scripts. Therefore, installation, database setup, and frontend/backend start commands cannot yet be verified or provided.

No clone command is listed because this workspace has no configured Git remote. Once the application and its setup files exist, document their verified install, environment, migration, and run commands here.

## Environment Variables

The following names are recommendations in [API.md](docs/API.md), not a verified runtime configuration. There is no `.env.example`; requiredness below reflects the API document and may change when implementation choices are finalized. Do not put secrets in source control or browser-visible `VITE_*` variables.

| Variable | Requiredness in API documentation | Purpose |
| --- | --- | --- |
| `APP_ENV` | Required | Runtime environment |
| `API_V1_PREFIX` | Optional | API prefix; defaults to `/api/v1` |
| `FRONTEND_ORIGINS` | Required | Allowed browser origins |
| `SUPABASE_URL` | Required | Supabase project URL |
| `SUPABASE_JWT_ISSUER` | Required | Expected JWT issuer/configuration |
| `SUPABASE_JWKS_URL` | Depends on verification mode | JWT public-key discovery endpoint |
| `DATABASE_URL` | Required | Server-side PostgreSQL connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Only if privileged server-side operations require it | Server-side Storage/Admin access |
| `SUPABASE_STORAGE_BUCKET` | Required | Private invoice bucket |
| `AI_PROVIDER`, `AI_PROVIDER_API_KEY`, `AI_MODEL` | Required for invoice extraction / selected provider | Provider identifier, secret, and model |
| `AI_REQUEST_TIMEOUT_SECONDS`, `AI_MAX_RETRIES` | Optional | Provider timeout and bounded retries |
| `OPEN_FOOD_FACTS_ENABLED`, `OPEN_FOOD_FACTS_BASE_URL` | Optional | Optional product lookup toggle and base URL |
| `LOG_LEVEL`, `RATE_LIMIT_ENABLED` | Optional | Logging level and API rate-limiting toggle |
| `RATE_LIMIT_STORE_URL` | Only if a shared limiter is selected | Shared rate-limit backend connection |
| `VITE_API_BASE_URL`, `VITE_SUPABASE_URL` | Required for the documented frontend | API base URL and Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Depends on the configured Supabase client | Public client key, if required by the SDK |

Never expose `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or `AI_PROVIDER_API_KEY` in frontend configuration.

## API and Documentation

- [Product requirements](docs/PRD.md)
- [Design](docs/DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE.md)
- [API contract](docs/API.md)
- [Contributor guidance](docs/AGENTS.md)

The architecture proposes FastAPI OpenAPI documentation in development, typically at `/docs`. No backend exists yet, so interactive API documentation is not currently available.

## Testing

No test files, test dependencies, or test commands are present. The architecture proposes Pytest and HTTPX for the backend and Vitest with React Testing Library for the frontend; these are plans, not currently runnable suites.

## Current Status

This is a documentation-stage project, with the PRD marked draft for implementation. The repository does not yet include a working application, database schema migrations, environment template, or automated tests. The MVP scope is documented; implementation and several decisions remain pending.

### Known Gaps

- No application code, dependency/setup manifests, migrations, or tests.
- No configured Git remote or clone URL in this workspace.
- The AI provider/model, database access implementation, and some product decisions must be finalized before setup instructions can be made concrete.