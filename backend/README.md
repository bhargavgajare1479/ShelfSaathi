# ShelfSaathi Backend

Modular monolith implemented with Python and FastAPI, backing the ShelfSaathi kirana inventory assistant.

## Architecture

Follows `docs/ARCHITECTURE.md` and `docs/API.md`:
- **Framework:** FastAPI with Pydantic v2 schemas and validation.
- **Database:** PostgreSQL accessed via SQLAlchemy 2.x and Alembic migrations.
- **Authentication:** Supabase Auth JWT validation.
- **Storage:** Private invoice storage via Supabase Storage adapter.
- **AI Vision:** Extractor adapter for vision models (Gemini / Claude).
- **Matching:** Normalization rules and RapidFuzz product matcher.

## Directory Layout

```text
backend/
├── app/
│   ├── main.py
│   ├── core/           # Configuration, logging, errors, security
│   ├── api/            # Base router, shared dependencies
│   ├── modules/        # Modular domains (auth, stores, catalogue, invoices, inventory, barcodes, buying_copilot, purchase_orders)
│   ├── integrations/   # Supabase, storage, AI vision adapter, Open Food Facts
│   ├── db/             # SQLAlchemy session, declarative models, Alembic migrations
│   ├── schemas/        # Response envelopes and shared schemas
│   └── tests/          # Pytest test suite
├── alembic.ini
├── pyproject.toml
└── requirements.txt
```

## Running Locally

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements-dev.txt
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. Run tests and linter:
   ```bash
   pytest
   ruff check .
   ```

