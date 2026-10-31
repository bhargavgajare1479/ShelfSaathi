# ShelfSaathi

ShelfSaathi is a mobile-first inventory and purchasing assistant for kirana stores and small retailers.

It reduces manual stock administration by turning supplier invoices into reviewable inventory updates, managing barcodes and labels, and helping merchants decide what to replenish through explainable reorder recommendations.

## Tech Stack

The project foundation is initialized according to the approved architecture in [ARCHITECTURE.md](docs/ARCHITECTURE.md):

- **Frontend:** React 18, Vite, JavaScript, and Tailwind CSS.
- **Design System:** Outfit typography (sole product typeface per `DESIGN.md`), custom token palette, accessible reusable components.
- **Backend:** Python (>=3.9) and FastAPI, structured as a modular monolith.
- **Data and Persistence:** Supabase PostgreSQL with SQLAlchemy 2.x and Alembic migrations.
- **Authentication:** Supabase Auth JWT verification.
- **AI Extraction:** Google Gemini Vision API (`gemini-1.5-flash`) via integration adapter.
- **Access Control:** Multi-user store permissions with `owner` and `staff` roles.
- **Matching:** Normalization pipeline and RapidFuzz matcher.
- **Testing & Quality:** Vitest and React Testing Library for frontend; Pytest, HTTPX, and Ruff for backend.

## Project Structure

```text
.
├── .env.example                       # Root environment variable template
├── .gitignore                          # Git ignore rules for node, python, venv, secrets
├── package.json                        # Monorepo/workspace scripts
├── README.md                           # Project documentation and status
├── docs/                               # Source of truth specifications
│   ├── AGENTS.md                       # Contributor & agent engineering rules
│   ├── API.md                          # REST API contract and specifications
│   ├── ARCHITECTURE.md                 # Technical architecture
│   ├── DATABASE.md                     # Persisted entities and schemas
│   ├── DESIGN.md                       # Design system and UX rules
│   └── PRD.md                          # Product requirements document
├── frontend/                           # React + Vite client application
│   ├── .env.example                    # Frontend environment template (VITE_* only)
│   ├── .eslintrc.cjs                   # ESLint configuration
│   ├── index.html                      # HTML entry with Outfit typography
│   ├── package.json                    # Frontend dependencies and scripts
│   ├── postcss.config.js               # PostCSS configuration
│   ├── tailwind.config.js              # Tailwind design tokens from DESIGN.md
│   ├── vite.config.js                  # Vite configuration and test setup
│   ├── public/
│   │   ├── assets/                     # Static assets
│   │   └── fonts/outfit/               # Outfit font assets documentation
│   └── src/
│       ├── main.jsx                    # Application bootstrap
│       ├── app/                        # Root App, router, and providers
│       │   ├── App.jsx
│       │   ├── providers.jsx
│       │   └── router.jsx
│       ├── components/                 # Shared UI components & design system
│       │   ├── feedback/               # LoadingSpinner, Skeleton, Toast
│       │   ├── forms/                  # FormField, Label, ErrorMessage
│       │   ├── layout/                 # AppLayout, Header, Navigation, nav-items
│       │   └── ui/                     # Button, Input, Card, Badge, Alert
│       ├── features/                   # Domain features & route screens
│       │   ├── auth/                   # LoginPage
│       │   ├── barcodes/               # BarcodesPage
│       │   ├── buying-copilot/         # BuyingCopilotPage
│       │   ├── catalogue/              # CataloguePage
│       │   ├── dashboard/              # DashboardPage, NotFoundPage
│       │   ├── inventory/              # InventoryPage
│       │   ├── invoices/               # InvoicesPage
│       │   └── purchase-orders/        # PurchaseOrdersPage
│       ├── hooks/                      # Shared hooks (useAuth)
│       ├── lib/                        # api-client, supabase-client, formatting, validation
│       ├── styles/                     # Tailwind index.css
│       └── test/                       # Setup and smoke tests
└── backend/                            # FastAPI modular monolith web service
    ├── .env.example                    # Backend environment template
    ├── alembic.ini                     # Alembic migration configuration
    ├── pyproject.toml                  # Backend project manifest and ruff/pytest config
    ├── README.md                       # Backend documentation
    ├── requirements.txt                # Production dependencies
    ├── requirements-dev.txt            # Development and test dependencies
    └── app/
        ├── main.py                     # FastAPI application factory and endpoints
        ├── api/                        # API dependencies and v1 modular router
        │   ├── dependencies.py
        │   └── router.py
        ├── core/                       # Core configuration, errors, logging, security
        │   ├── config.py
        │   ├── errors.py
        │   ├── logging.py
        │   └── security.py
        ├── db/                         # Database connection, models, migrations
        │   ├── base.py
        │   ├── session.py
        │   ├── migrations/             # Alembic migration environment and versions
        │   │   ├── env.py
        │   │   ├── script.py.mako
        │   │   └── versions/
        │   │       └── 0001_initial_schema.py
        │   ├── models/                 # SQLAlchemy declarative models (all DATABASE.md tables)
        │   │   ├── inventory.py
        │   │   ├── invoice.py
        │   │   ├── product.py
        │   │   ├── purchase_order.py
        │   │   ├── sales_record.py
        │   │   ├── stock_movement.py
        │   │   ├── store.py
        │   │   └── store_member.py
        │   └── repositories/           # Base and domain data repositories
        ├── integrations/               # External adapters (Supabase, Gemini vision, storage, OFF)
        │   ├── open_food_facts.py
        │   ├── storage.py
        │   ├── supabase_auth.py
        │   └── vision_provider.py
        ├── modules/                    # Modular domain routers
        │   ├── auth/
        │   ├── barcodes/
        │   ├── buying_copilot/
        │   ├── catalogue/
        │   ├── inventory/
        │   ├── invoices/
        │   ├── purchase_orders/
        │   └── stores/
        ├── schemas/                    # Standard API response envelopes and schemas
        │   └── common.py
        └── tests/                      # Pytest suite
            ├── conftest.py
            ├── test_config.py
            ├── test_health.py
            └── test_store_roles.py
```

## Prerequisites

- **Node.js:** v20.x or higher with `npm`
- **Python:** 3.9+ with `venv` and `pip`
- **Supabase Account:** for PostgreSQL, Supabase Auth, and private Storage
- **AI Provider Key:** (e.g., Google Gemini) for invoice extraction

## Getting Started

### 1. Environment Setup

Copy example environment configurations:

```bash
# Root template
cp .env.example .env

# Frontend environment
cp frontend/.env.example frontend/.env

# Backend environment
cp backend/.env.example backend/.env
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run locally on `http://localhost:5173`.

### 3. Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

The backend API will run on `http://localhost:8000`. Interactive OpenAPI documentation is available in development at `http://localhost:8000/docs`.

### 4. Convenient Root Workspace Scripts

From the repository root:

| Command | Action |
| --- | --- |
| `npm run dev:frontend` | Launch Vite frontend development server |
| `npm run dev:backend` | Launch FastAPI development server |
| `npm run build` | Build static frontend production bundle |
| `npm run lint` | Run ESLint on frontend and Ruff on backend |
| `npm run test` | Run Vitest unit tests and Pytest suite |

## Quality & Verification

All quality gates are verified and pass:

- **Frontend Build:** `npm --prefix frontend run build` completes successfully.
- **Frontend Tests:** `npm --prefix frontend run test` passes with Vitest.
- **Frontend Linting:** `npm --prefix frontend run lint` passes with ESLint.
- **Backend Tests:** `pytest` passes with HTTPX async fixtures covering `/health`, `/ready`, and error envelopes.
- **Backend Linting:** `ruff check .` passes with zero warnings.

## API and Documentation

- [Product requirements (PRD)](docs/PRD.md)
- [Design system (DESIGN)](docs/DESIGN.md)
- [Architecture (ARCHITECTURE)](docs/ARCHITECTURE.md)
- [Database design (DATABASE)](docs/DATABASE.md)
- [API contract (API)](docs/API.md)
- [Contributor guidance (AGENTS)](docs/AGENTS.md)
