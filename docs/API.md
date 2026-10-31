# API.md

## 1. Purpose and Scope

This document defines the REST API contract for ShelfSaathi, a
mobile-first AI operating assistant for kirana stores and small
supermarkets.

The API is implemented by a single FastAPI modular monolith. Supabase
provides authentication, PostgreSQL, and private object storage. The
browser communicates with FastAPI over HTTPS for all business data and
mutations.

The MVP API covers only the workflows supported by the architecture and
database design:

- Store context and membership lookup.
- Product catalogue and inventory reads.
- Invoice upload, extraction status, line-item review, and
  confirmation.
- Barcode lookup and printable label data.
- Explainable reorder suggestions.
- Editable purchase-order drafts.

Supplier ordering, live supplier availability, Sales Booster,
multilingual natural-language assistant endpoints, and other roadmap
features are not part of this MVP contract unless separately approved.
Do not expose endpoints that imply these features are live.

### 1.1 API conventions

- Base path: `/api/v1`
- Transport: HTTPS only outside local development.
- Format: JSON request and response bodies, except file-upload
  requests.
- Encoding: UTF-8.
- IDs: UUID strings for application entities.
- Timestamps: ISO 8601 UTC timestamps.
- Monetary values and fractional quantities: JSON numbers with
  documented decimal precision; backend persistence uses PostgreSQL
  `numeric`.
- Authentication: Supabase Auth access token as a bearer token.
- API documentation: FastAPI OpenAPI documentation may be enabled in
  development and controlled in production.
- Versioning: breaking changes require a new API version or a planned
  compatibility window.

The backend is the authority for business rules, permissions, stock
calculations, and persistence. Frontend validation is for usability only
and never replaces server validation.

## 2. Authentication and Authorization

### 2.1 Sign-in and session management

The frontend uses the Supabase Auth client for sign-in, sign-out, and
session lifecycle. Authentication endpoints are owned by Supabase Auth
and are not duplicated by FastAPI.

For protected API calls, the frontend sends:

`Authorization: Bearer <supabase_access_token>`

FastAPI validates the token's signature, issuer, audience where
configured, expiry, and required claims using the configured
Supabase/JWT verification approach. Do not trust a user ID, email, role,
or store ID supplied in a request body as proof of identity.

### 2.2 Store access

Every protected business request must resolve the authenticated user and
verify membership in the requested store. A valid token alone does not
grant access to a store.

- Store-specific endpoints include the store identifier in the path.
- The backend verifies that the authenticated user is a member of that
  store and has the required role.
- Parent and child records must be checked for consistent store
  ownership.
- A product, invoice, inventory row, or purchase-order draft from
  another store must never be accessible by guessing its UUID.
- Use generic `404 Not Found` responses for inaccessible resources
  when revealing their existence could leak information.

### 2.3 Role policy

The MVP implements multi-user store permissions with two distinct roles in `store_members`:
- `owner`: Store owner/admin with full authority.
- `staff`: Store staff/employee with operational privileges.

Approved MVP permissions:

| Action                            | Store owner (`owner`) | Store staff (`staff`) |
| --------------------------------- | --------------------- | --------------------- |
| Read catalogue and inventory      | Yes                   | Yes                   |
| Create/edit products              | Yes                   | Yes                   |
| Upload and review invoices        | Yes                   | Yes                   |
| Confirm invoice and apply stock   | Yes                   | No (Owner required)   |
| Generate barcode labels           | Yes                   | Yes                   |
| Read reorder suggestions          | Yes                   | Yes                   |
| Create/edit purchase-order drafts | Yes                   | Yes                   |
| Manage store membership & staff   | Yes                   | No                    |

### 2.4 Unauthenticated routes

Only health/readiness endpoints and any explicitly public operational
endpoint may be unauthenticated. Business data, invoice files, AI
processing, inventory, and purchase-order drafts must require
authentication and store authorization.

## 3. Common Request and Response Conventions

### 3.1 Success responses

Return the appropriate HTTP status and a JSON object. Collection
endpoints use a consistent pagination envelope.

Example resource response:

```json
{
  "data": {
    "id": "a2c3d4e5-1111-4222-8333-123456789abc",
    "status": "draft",
    "created_at": "2026-10-30T09:00:00Z"
  },
  "request_id": "req_01J..."
}
```

Example collection response:

```json
{
  "data": [],
  "pagination": {
    "limit": 25,
    "next_cursor": null
  },
  "request_id": "req_01J..."
}
```

Do not include fields that the caller is not authorised to see. Omit
optional values or return `null` consistently according to the resource
schema.

### 3.2 Error response

All API errors use one predictable structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "quantity",
        "issue": "must_be_greater_than_zero"
      }
    ]
  },
  "request_id": "req_01J..."
}
```

- `code` is a stable machine-readable code.
- `message` is safe for display and contains no secrets or internal
  exception details.
- `details` is optional and contains field-level issues or safe
  context.
- `request_id` correlates the response with server logs. It must not
  contain user data.

Never return stack traces, SQL text, database credentials, provider
keys, raw prompts, or unredacted third-party error bodies.

### 3.3 HTTP status codes

| Status                       | Use                                                          |
| ---------------------------- | ------------------------------------------------------------ |
| `200 OK`                     | Successful read or update                                    |
| `201 Created`                | Resource created                                             |
| `202 Accepted`               | Processing accepted but not complete                         |
| `204 No Content`             | Successful operation with no response body                   |
| `400 Bad Request`            | Malformed request or invalid workflow transition             |
| `401 Unauthorized`           | Missing, invalid, or expired access token                    |
| `403 Forbidden`              | Authenticated caller lacks permission                        |
| `404 Not Found`              | Resource absent or intentionally hidden due to access policy |
| `409 Conflict`               | Duplicate operation, stale state, or conflicting update      |
| `413 Payload Too Large`      | Upload exceeds configured limit                              |
| `415 Unsupported Media Type` | Unsupported upload type                                      |
| `422 Unprocessable Entity`   | Schema or business validation failure                        |
| `429 Too Many Requests`      | Rate limit exceeded                                          |
| `502 Bad Gateway`            | Upstream provider returned an unusable response              |
| `503 Service Unavailable`    | Required dependency temporarily unavailable                  |
| `504 Gateway Timeout`        | Upstream request timed out                                   |

### 3.4 Validation conventions

- Validate request bodies and query parameters with Pydantic schemas.
- Reject unknown enum values and invalid state transitions.
- Trim user-entered text where appropriate and enforce reasonable
  length limits.
- Validate UUIDs, numeric precision, positive quantities, non-negative
  prices, and supported units.
- Validate uploaded file size, declared media type, file signature,
  and image decodability. Do not rely on the filename or
  browser-provided content type alone.
- Limit invoice image dimensions and processing cost; reject malformed
  or decompression-bomb-like files.
- Do not accept arbitrary object-storage paths from the client.
- Validate that all referenced products belong to the invoice or
  draft's store.
- Return field-level validation details without echoing full sensitive
  values.

### 3.5 Idempotency and concurrency

For state-changing operations that may be retried, support an
`Idempotency-Key` header where specified. Store the key, authenticated
user/store scope, operation, and result for a bounded retention period.
Reusing a key with a different request body must return `409 Conflict`.

Invoice confirmation must be idempotent even if the client retries
without a key: the same invoice cannot apply its stock movements more
than once. Use a database transaction, a persisted invoice state
transition, and a uniqueness constraint on the invoice-line stock
application.

For editable resources, use an `updated_at` precondition or version
field to prevent silent overwrites. If the submitted version is stale,
return `409 Conflict`.

## 4. Endpoint Catalogue

All endpoints below are under `/api/v1`. Unless marked public, they
require a valid bearer token and store-level authorization.

### 4.1 Operational endpoints

| Method | Endpoint  | Purpose                                         | Auth                        |
| ------ | --------- | ----------------------------------------------- | --------------------------- |
| `GET`  | `/health` | Liveness check; confirms the process is running | Public                      |
| `GET`  | `/ready`  | Readiness check for required dependencies       | Operational/internal policy |

Health endpoints must return minimal status only. Do not reveal
connection strings, dependency credentials, database details, or
provider configuration.

### 4.2 Store context

| Method | Endpoint             | Purpose                                                     |
| ------ | -------------------- | ----------------------------------------------------------- |
| `GET`  | `/me/stores`         | List stores the authenticated user can access               |
| `GET`  | `/stores/{store_id}` | Read store profile and current user's effective permissions |

`GET /me/stores` is scoped to the authenticated user and does not accept
a user ID query parameter.

Example response:

```json
{
  "data": [
    {
      "id": "a2c3d4e5-1111-4222-8333-123456789abc",
      "name": "Demo Kirana",
      "role": "owner"
    }
  ],
  "request_id": "req_01J..."
}
```

The role value must use the final approved role vocabulary. Do not
return membership records for other users unless a separately approved
membership-management feature requires it.

### 4.3 Product catalogue

| Method  | Endpoint                                           | Purpose                                                       |
| ------- | -------------------------------------------------- | ------------------------------------------------------------- |
| `GET`   | `/stores/{store_id}/products`                      | List and search products                                      |
| `POST`  | `/stores/{store_id}/products`                      | Create a product when manual product creation is in MVP scope |
| `GET`   | `/stores/{store_id}/products/{product_id}`         | Read a product                                                |
| `PATCH` | `/stores/{store_id}/products/{product_id}`         | Update permitted product fields                               |
| `GET`   | `/stores/{store_id}/products/by-barcode/{barcode}` | Find a product by barcode                                     |

Product creation/editing is included only to support catalogue
correction and manual fallback where approved. Do not add product
deletion unless the product requirements define its behaviour and
inventory-history implications.

Product list query parameters:

| Parameter | Type    | Description                                                      |
| --------- | ------- | ---------------------------------------------------------------- |
| `q`       | string  | Optional search across supported product name/description fields |
| `barcode` | string  | Exact barcode filter                                             |
| `limit`   | integer | Page size, default `25`, maximum `100`                           |
| `cursor`  | string  | Opaque cursor returned by the previous page                      |
| `sort`    | enum    | Supported stable sort, default `name`                            |

The store ID is always enforced server-side. Search results must not
cross store boundaries.

Example product:

```json
{
  "data": {
    "id": "a2c3d4e5-1111-4222-8333-123456789abc",
    "name": "Packaged Product",
    "barcode": "8901234567890",
    "unit": "piece",
    "pack_size": 1,
    "created_at": "2026-10-30T09:00:00Z",
    "updated_at": "2026-10-30T09:00:00Z"
  },
  "request_id": "req_01J..."
}
```

The exact product fields and allowed units must match `DATABASE.md` and
the final product requirements. Do not generate a barcode that could be
mistaken for a valid manufacturer barcode. Any internal/generated
barcode must use a documented supported format and uniqueness policy.

### 4.4 Inventory

| Method | Endpoint                                              | Purpose                          |
| ------ | ----------------------------------------------------- | -------------------------------- |
| `GET`  | `/stores/{store_id}/inventory`                        | List current stock by product    |
| `GET`  | `/stores/{store_id}/inventory/{product_id}`           | Read current stock for a product |
| `GET`  | `/stores/{store_id}/inventory/{product_id}/movements` | Read stock movement history      |

Inventory is changed by approved business operations such as invoice
confirmation, not by an unrestricted generic stock-update endpoint. This
preserves the stock movement audit trail and avoids bypassing workflow
validation.

Inventory query parameters:

| Parameter      | Type    | Description                                                                                  |
| -------------- | ------- | -------------------------------------------------------------------------------------------- |
| `q`            | string  | Search by product name                                                                       |
| `stock_status` | enum    | Optional filter supported by the UI, such as `low` or `out`; calculate from configured rules |
| `limit`        | integer | Default `25`, maximum `100`                                                                  |
| `cursor`       | string  | Opaque pagination cursor                                                                     |

Movement history should be ordered by `created_at` descending with a
stable tie-breaker. Filter parameters may include `from`, `to`, and
`movement_type` if these filters are required by the UI.

Example inventory response:

```json
{
  "data": {
    "product_id": "a2c3d4e5-1111-4222-8333-123456789abc",
    "quantity_on_hand": 12,
    "unit": "piece",
    "updated_at": "2026-10-30T09:00:00Z"
  },
  "request_id": "req_01J..."
}
```

### 4.5 Invoice upload and extraction

| Method   | Endpoint                                                   | Purpose                                                             |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `POST`   | `/stores/{store_id}/invoices`                              | Upload an invoice image and create an invoice record                |
| `GET`    | `/stores/{store_id}/invoices`                              | List invoices and processing/review states                          |
| `GET`    | `/stores/{store_id}/invoices/{invoice_id}`                 | Read invoice metadata and current state                             |
| `GET`    | `/stores/{store_id}/invoices/{invoice_id}/lines`           | Read extracted lines in source order                                |
| `PATCH`  | `/stores/{store_id}/invoices/{invoice_id}/lines/{line_id}` | Correct extracted values or product match before confirmation       |
| `POST`   | `/stores/{store_id}/invoices/{invoice_id}/process`         | Start or retry extraction when allowed by the invoice state         |
| `POST`   | `/stores/{store_id}/invoices/{invoice_id}/confirm`         | Confirm reviewed invoice and atomically apply stock changes         |
| `DELETE` | `/stores/{store_id}/invoices/{invoice_id}`                 | Delete/cancel an unconfirmed invoice only if retention rules permit |

#### Upload request

Use `multipart/form-data` with one invoice image file and optional
non-sensitive metadata. Do not accept an arbitrary storage key or public
file URL.

The backend validates the upload, stores it in a private bucket, creates
the invoice record, and starts extraction. If extraction runs
synchronously and reliably within request limits, the endpoint may
return the completed state; otherwise return `202 Accepted`.

Example `202` response:

```json
{
  "data": {
    "id": "a2c3d4e5-1111-4222-8333-123456789abc",
    "status": "processing",
    "review_status": "pending",
    "created_at": "2026-10-30T09:00:00Z"
  },
  "request_id": "req_01J..."
}
```

Supported media types must be configured explicitly. The current
architecture discusses invoice images; PDF support must not be assumed
until confirmed in product scope.

#### Invoice states

Use the final state vocabulary defined by the application schema. At
minimum, distinguish upload/processing, ready for review, failed
processing, confirmed, and cancelled/deleted where applicable. State
transitions must be enforced by the backend.

The extraction result should include, where available:

- Line number and extracted description.
- Quantity and unit/pack information.
- Unit price and line total.
- Matched product ID, if confidently matched.
- Confidence or review indicator.
- Validation warnings requiring merchant attention.

AI output is untrusted input. Validate it against a strict schema and
normalise it before persistence. Never let AI output directly execute
SQL or update stock.

#### Line correction

`PATCH` accepts only editable, approved fields such as description,
quantity, unit, unit price, line total, or matched product ID. Reject
changes after confirmation. Recalculate dependent totals
deterministically on the backend. Verify any selected product belongs to
the same store.

#### Confirm invoice

The request may include the reviewed invoice version or `updated_at`
value and an optional `Idempotency-Key`.

On confirmation, the backend must:

1.  Verify store membership and invoice state.
2.  Verify all required lines and product matches are valid.
3.  Validate quantities, units, and monetary values.
4.  In a single database transaction, mark the invoice confirmed, apply
    inventory changes, and insert corresponding stock movements.
5.  Enforce uniqueness so a line cannot apply stock twice.
6.  Commit only if all required changes succeed.

If the invoice is already confirmed, return the existing confirmed
result or a deterministic `409` response without applying any further
stock changes. Do not hold a database transaction open while calling the
AI provider.

### 4.6 Barcode and label workflow

| Method | Endpoint                                           | Purpose                                                                             |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `GET`  | `/stores/{store_id}/products/by-barcode/{barcode}` | Look up an existing product barcode                                                 |
| `POST` | `/stores/{store_id}/barcodes/labels`               | Create label data for selected unbarcoded products or approved internal identifiers |

Barcode scanning is primarily performed in the browser using a
ZXing-compatible library. The API is needed for store-scoped lookup and
label data, not for camera access.

Label request example:

```json
{
  "product_ids": ["a2c3d4e5-1111-4222-8333-123456789abc"],
  "format": "code128"
}
```

Response contains the product names, barcode values, and label metadata
required by the frontend to render a print layout or PDF. The frontend
may use JsBarcode for rendering where appropriate. The API must verify
that every product belongs to the store.

Only generate labels for products that need an internal barcode or where
the product workflow explicitly permits label generation. Existing
manufacturer barcodes should be preserved and not replaced.

If a barcode lookup finds no match, return `404` with a stable
`PRODUCT_NOT_FOUND` error code. Do not create a product automatically
from an unknown scan unless a separate approved workflow explicitly
requests it.

### 4.7 Buying Copilot reorder suggestions

| Method | Endpoint                                 | Purpose                                              |
| ------ | ---------------------------------------- | ---------------------------------------------------- |
| `GET`  | `/stores/{store_id}/reorder-suggestions` | Calculate and return explainable reorder suggestions |

Optional query parameters:

| Parameter | Type    | Description                                                                                  |
| --------- | ------- | -------------------------------------------------------------------------------------------- |
| `limit`   | integer | Default `25`, maximum `100`                                                                  |
| `cursor`  | string  | Opaque pagination cursor                                                                     |
| `urgency` | enum    | Optional filter such as `low_stock` or `out_of_stock`, if supported by the implemented rules |

The backend calculates suggestions from actual current inventory and
available, explicitly supported product-level sales history. If reliable
sales history is unavailable, the response must say that the suggestion
is based on limited data or clearly labelled demo data. Do not fabricate
demand, supplier availability, prices, or delivery times.

Each suggestion should expose the inputs and reason used, such as
current quantity, estimated days of stock remaining when sufficient
sales data exists, recommended quantity, and a human-readable
explanation. AI may phrase an explanation, but deterministic code owns
all quantities and calculations.

Example:

```json
{
  "data": [
    {
      "product_id": "a2c3d4e5-1111-4222-8333-123456789abc",
      "product_name": "Packaged Product",
      "quantity_on_hand": 4,
      "recommended_quantity": 12,
      "reason_code": "LOW_STOCK",
      "explanation": "Stock is below the configured reorder threshold.",
      "data_quality": "inventory_only"
    }
  ],
  "pagination": {
    "limit": 25,
    "next_cursor": null
  },
  "request_id": "req_01J..."
}
```

The fields above are illustrative. Use only values that can be derived
from persisted or clearly labelled data. Do not present a suggestion as
a supplier-confirmed order.

### 4.8 Purchase-order drafts

| Method   | Endpoint                                              | Purpose                                                                |
| -------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `POST`   | `/stores/{store_id}/purchase-order-drafts`            | Create an editable draft from selected reorder suggestions or products |
| `GET`    | `/stores/{store_id}/purchase-order-drafts`            | List drafts                                                            |
| `GET`    | `/stores/{store_id}/purchase-order-drafts/{draft_id}` | Read draft and lines                                                   |
| `PATCH`  | `/stores/{store_id}/purchase-order-drafts/{draft_id}` | Edit draft metadata or lines where supported                           |
| `DELETE` | `/stores/{store_id}/purchase-order-drafts/{draft_id}` | Delete/cancel a draft if allowed by lifecycle rules                    |

Draft creation accepts selected products and quantities. The backend
verifies store ownership and positive quantities, then creates the draft
and its lines transactionally.

Example request:

```json
{
  "lines": [
    {
      "product_id": "a2c3d4e5-1111-4222-8333-123456789abc",
      "quantity": 12,
      "unit_cost": null
    }
  ]
}
```

A draft may contain a nullable estimated unit cost, but it must not be
represented as a verified supplier price. The response must identify the
resource as a `draft`.

The MVP does not send orders to suppliers, confirm supplier acceptance,
or track fulfilment. Do not expose a `send`, `place-order`, `accepted`,
or `fulfilled` API until a real integration and its approval workflow
are implemented.

## 5. Pagination, Filtering, and Sorting

Use cursor-based pagination for collection endpoints that can grow over
time.

- Default `limit`: `25`.
- Maximum `limit`: `100`.
- `cursor`: opaque, URL-safe token generated by the API.
- Use a stable sort key plus a unique tie-breaker, such as
  `(created_at, id)`.
- Cursors must be scoped to the query and store; reject malformed or
  incompatible cursors.
- Do not return total counts by default if obtaining them adds
  unnecessary query cost.
- Apply store authorization before filters and pagination.
- Validate date ranges and maximum query windows.
- Whitelist supported sort fields and directions. Never interpolate
  arbitrary client-supplied sort expressions into SQL.

If a collection is small and pagination is unnecessary, keep the
endpoint simple rather than implementing unused filters.

## 6. External Services and Integrations

### 6.1 Supabase Auth

**Purpose:** User authentication and session management.

- The frontend uses the Supabase client to sign in and refresh
  sessions.
- FastAPI verifies access tokens before protected operations.
- Never accept an unsigned or unverified JWT.
- Do not store passwords in ShelfSaathi tables.
- Keep privileged Supabase keys and database credentials server-side.
- Handle expired tokens with `401`; the frontend may refresh its
  session and retry once.

### 6.2 Supabase PostgreSQL

**Purpose:** Store products, inventory, invoices, invoice lines, stock
movements, and purchase-order drafts.

- Access business tables through FastAPI by default.
- Use explicit transactions for invoice confirmation and related
  inventory updates.
- Use parameterised queries or ORM expressions.
- Enforce database constraints in addition to API validation.
- Keep connection strings server-side and use TLS where supported.
- Do not expose direct database access to the browser.

### 6.3 Private object storage

**Purpose:** Store uploaded invoice images.

- Use a private Supabase Storage bucket or the approved compatible
  private object store.
- Generate storage keys on the backend.
- Authorise every upload, read, and delete.
- If the frontend must retrieve an image directly, issue a short-lived
  signed URL only after checking store membership.
- Never store public invoice URLs or accept client-supplied arbitrary
  object keys.
- A failed extraction should not make the original image publicly
  accessible.
- Apply configured upload size, file type, and retention limits.

If a signed URL expires, the client requests a new authorised URL rather
than reusing a long-lived link.

### 6.4 Vision-capable AI provider

**Purpose:** Extract structured fields from invoice images and
optionally assist with product matching or explanation wording.

The architecture permits one selected provider, such as Gemini or
Claude, behind a provider adapter. Configure only the provider actually
selected for deployment.

- Call the provider only from FastAPI.
- Send only the minimum image and context needed for extraction.
- Require schema-constrained structured output where supported, then
  validate it locally.
- Treat all provider output as untrusted and potentially incomplete.
- Use explicit connect/read timeouts, bounded retries for transient
  errors, and request-size limits.
- Do not retry invalid requests, authentication failures, or
  schema-invalid output indefinitely.
- Do not expose raw provider responses to the browser.
- Do not log full invoice images, extracted sensitive content,
  prompts, or provider credentials.
- Do not update inventory based on extraction alone.
- If the provider fails, mark the invoice processing state as
  failed/retryable and allow a controlled retry or manual correction
  path.
- Confirm provider data retention and training policies before
  processing real merchant invoices.

### 6.5 Open Food Facts

**Purpose:** Optional external product lookup to assist catalogue entry.

This integration is non-critical and must not block invoice review,
barcode lookup for existing store products, or manual product entry.

- Query only when the merchant workflow requests external lookup or
  when the implementation explicitly enables it.
- Use the documented public API and respect its current usage policy
  and identification requirements.
- Apply a short timeout, bounded retry policy, and cache successful
  results where appropriate.
- Treat returned product information as external, potentially stale
  data.
- Show the source and let the merchant review imported fields before
  saving.
- If the service is unavailable or no match exists, fall back to
  manual entry.
- Do not imply that a product is stocked by a supplier or available
  for purchase based on Open Food Facts data.

No webhook is required for the integrations defined for the MVP.

## 7. Webhooks and Callback Verification

The MVP does not require inbound webhooks for invoice extraction,
inventory, barcode generation, reorder suggestions, or purchase-order
drafts.

If a future external provider requires webhooks:

1.  Add a dedicated endpoint only for that integration.
2.  Verify the provider signature using the raw request body and the
    documented signature algorithm.
3.  Verify timestamps or nonces where supported to limit replay attacks.
4.  Reject invalid signatures before processing the event.
5.  Persist an event identifier and enforce idempotent processing.
6.  Return quickly after safely accepting the event; move lengthy
    processing to an appropriate background mechanism only when the
    architecture warrants it.
7.  Never trust a callback merely because it contains a known object ID.
8.  Keep webhook secrets server-side and support rotation.
9.  Log event IDs and processing outcomes, not secret headers or
    sensitive payloads.

Do not implement speculative webhook endpoints before a real integration
requires them.

## 8. Rate Limiting and Resource Limits

Apply limits at the API layer and, where available, at the hosting or
edge layer. Use a shared/distributed limiter if multiple backend
instances are deployed; an in-memory limiter alone is not sufficient
across instances.

Initial configurable defaults to tune during pilot testing:

| Operation                      | Suggested limit                                          |
| ------------------------------ | -------------------------------------------------------- |
| General authenticated reads    | 120 requests/minute/user                                 |
| Catalogue search               | 60 requests/minute/user                                  |
| Invoice upload                 | 10 uploads/hour/store and a configured maximum file size |
| AI extraction/retry            | 10 starts/hour/store, with a per-invoice retry cap       |
| Barcode label generation       | 30 requests/minute/user                                  |
| Reorder calculation            | 30 requests/minute/store                                 |
| Authentication/token endpoints | Governed by Supabase Auth and its configured limits      |

These are proposed starting values, not measured capacity guarantees.
Configure stricter limits if provider quotas, hosting limits, or abuse
patterns require them.

For rate-limited responses, return `429 Too Many Requests`, a stable
error code, and `Retry-After` where the reset time is known. Avoid
exposing internal quota or provider-account details.

Also enforce:

- Maximum request body and upload sizes.
- Maximum invoice image dimensions and page/line count supported by
  processing.
- AI provider token, image, and cost budgets.
- Request timeouts and concurrency limits.
- Bounded pagination limits.
- Per-store limits on repeated extraction failures.

## 9. Required Environment Variables

The exact names must match the implementation's configuration module and
`.env.example`. The following names are recommended.

### 9.1 Backend

| Variable                     | Required                                  | Purpose                                                            |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `APP_ENV`                    | Yes                                       | Environment, such as `development`, `test`, or `production`        |
| `API_V1_PREFIX`              | No                                        | API prefix; default `/api/v1`                                      |
| `FRONTEND_ORIGINS`           | Yes                                       | Explicit comma-separated allowed browser origins                   |
| `SUPABASE_URL`               | Yes                                       | Supabase project URL                                               |
| `SUPABASE_JWT_ISSUER`        | Yes                                       | Expected JWT issuer or issuer configuration                        |
| `SUPABASE_JWKS_URL`          | Depends on verification mode              | Public key discovery endpoint if using JWKS verification           |
| `DATABASE_URL`               | Yes                                       | Server-side PostgreSQL connection string                           |
| `SUPABASE_SERVICE_ROLE_KEY`  | Only if server-side operations require it | Privileged Supabase Storage/Admin key; never expose to the browser |
| `SUPABASE_STORAGE_BUCKET`    | Yes                                       | Private invoice bucket name                                        |
| `AI_PROVIDER`                | Yes for invoice extraction                | Selected provider identifier                                       |
| `AI_PROVIDER_API_KEY`        | Yes for selected provider                 | Server-side provider secret                                        |
| `AI_MODEL`                   | Yes for selected provider                 | Explicit model identifier                                          |
| `AI_REQUEST_TIMEOUT_SECONDS` | No                                        | Provider timeout                                                   |
| `AI_MAX_RETRIES`             | No                                        | Bounded retry count                                                |
| `OPEN_FOOD_FACTS_ENABLED`    | No                                        | Enable or disable optional lookup                                  |
| `OPEN_FOOD_FACTS_BASE_URL`   | No                                        | API base URL if configurable                                       |
| `LOG_LEVEL`                  | No                                        | Structured logging level                                           |
| `RATE_LIMIT_ENABLED`         | No                                        | Enable API rate limiting                                           |
| `RATE_LIMIT_STORE_URL`       | Only if using a shared limiter            | Shared limiter backend connection, if selected                     |

If the application uses a Supabase publishable/anon key for client
authentication, it belongs in the frontend environment only if the
client SDK requires it. The publishable/anon key is not a substitute for
access control. Never put `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`,
`AI_PROVIDER_API_KEY`, or other privileged secrets in frontend
variables.

`SUPABASE_JWKS_URL` and `SUPABASE_JWT_ISSUER` should be derived from the
configured Supabase project, not guessed. Use the verification mode
supported by the project configuration and test token validation
explicitly.

### 9.2 Frontend

| Variable                 | Required                              | Purpose                                               |
| ------------------------ | ------------------------------------- | ----------------------------------------------------- |
| `VITE_API_BASE_URL`      | Yes                                   | Public HTTPS base URL for FastAPI                     |
| `VITE_SUPABASE_URL`      | Yes                                   | Supabase project URL                                  |
| `VITE_SUPABASE_ANON_KEY` | Depends on configured Supabase client | Public/publishable client key, if required by the SDK |

Vite exposes `VITE_*` values in the built browser bundle. Store only
public configuration there. Never place secrets in any `VITE_*`
variable.

### 9.3 Configuration rules

- Keep a committed `.env.example` containing variable names and safe
  placeholders only.
- Keep real values in the hosting provider's secret manager or local
  untracked environment files.
- Validate required configuration at application startup.
- Fail startup for missing mandatory production configuration instead
  of silently disabling security.
- Rotate secrets after suspected exposure.
- Do not print environment values in logs or health responses.

## 10. Privacy, Security, and Auditability

- Require HTTPS in deployed environments.
- Verify identity and store authorization on every protected request.
- Use least-privilege database credentials and private storage.
- Validate all user and provider input.
- Use parameterised database access.
- Configure CORS with explicit frontend origins; do not use a wildcard
  origin with credentialed requests.
- Apply request-size limits and upload content inspection.
- Avoid logging access tokens, session cookies, API keys, invoice
  images, full invoice text, or unnecessary personal/business data.
- Redact sensitive fields in exception reports.
- Use short-lived signed URLs for private files when needed.
- Do not return internal storage keys unless the client has a defined
  need.
- Preserve stock movement history. Corrections should create
  compensating movements rather than silently rewriting history.
- Do not allow AI-generated content to perform side effects without
  validation and explicit merchant confirmation.
- Define retention and deletion policies for invoice files and
  extracted data before production use.
- Ensure application logs and error-monitoring tools have appropriate
  access controls and retention.

## 11. Failure Handling and Reliability

### 11.1 External provider failures

For AI and Open Food Facts requests:

- Set explicit connection and response timeouts.
- Retry only transient failures such as rate limits or selected
  server/network errors, using bounded exponential backoff and jitter.
- Respect `Retry-After` when returned.
- Do not retry invalid credentials, unsupported inputs, or permanent
  validation errors.
- Use a provider adapter to keep provider-specific error handling out
  of business logic.
- Return safe, actionable errors to the frontend without exposing
  provider response bodies.
- Allow manual correction or fallback when optional lookup fails.

### 11.2 Invoice processing failures

- Persist the invoice record and its processing state before or
  alongside starting processing according to the chosen request
  execution strategy.
- Distinguish retryable provider failure from invalid file,
  unsupported file type, and invalid extraction output.
- Do not discard the uploaded source document on a transient AI
  failure.
- Permit retries only from valid states and enforce retry limits.
- Preserve merchant corrections where safe; a retry must not silently
  overwrite reviewed fields.
- Do not apply inventory until the merchant confirms the reviewed
  invoice.

### 11.3 Database and transaction failures

- If invoice confirmation fails, roll back the invoice state change,
  inventory changes, and stock movements together.
- Do not report success until the database transaction commits.
- Enforce idempotency and unique constraints to prevent duplicate
  stock application.
- Use bounded connection acquisition and query timeouts.
- Return `503` for temporary database unavailability and log the
  request ID with a redacted diagnostic.
- Do not automatically retry non-idempotent mutations unless the
  operation is protected by an idempotency mechanism.

### 11.4 Client retry behaviour

- The frontend may retry safe `GET` requests on transient network
  failures.
- The frontend may retry a mutation only when it has an idempotency
  key or the endpoint guarantees idempotency.
- For `401`, attempt a single session refresh where supported, then
  require re-authentication.
- For `409`, refresh the resource and ask the user to resolve stale
  changes.
- For `422`, show field-level corrections.
- For `429`, respect `Retry-After`.
- Do not retry `4xx` errors automatically except for the explicit
  authentication-refresh flow.

### 11.5 Observability

Record structured logs with timestamp, severity, request ID, route
template, status code, latency, and a safe user/store reference where
necessary. Do not log raw invoice content, access tokens, signed URLs,
or secrets.

Monitor at minimum:

- API error rates and latency.
- Authentication and authorization failures.
- Invoice upload and extraction outcomes.
- AI provider latency, timeouts, and rate-limit responses.
- Invoice confirmation failures and duplicate attempts.
- Database connectivity and transaction failures.
- Rate-limit events.

## 12. API Contract Testing

Tests must cover:

- Missing, expired, malformed, and invalid bearer tokens.
- Store A attempting to read or mutate Store B's records.
- Product IDs from another store in invoice lines or purchase-order
  drafts.
- Invalid units, negative values, invalid decimal precision, and
  invalid state transitions.
- Upload size, media type, file signature, and malformed-image
  rejection.
- AI provider timeout, rate limiting, invalid JSON/schema output, and
  unavailable service.
- Invoice correction followed by confirmation.
- Duplicate confirmation and concurrent confirmation attempts.
- Atomic rollback when any stock update or stock-movement insert
  fails.
- Barcode uniqueness and unknown barcode lookup.
- Reorder suggestions when sales history is absent or demo-only.
- Purchase-order draft validation and the absence of supplier-send
  side effects.
- Pagination cursor validation, stable ordering, and maximum limits.
- Consistent error response format and request ID propagation.
- Rate limiting and secret redaction in logs.

Use Pytest and HTTPX for backend tests. Use provider mocks in automated
tests; do not make live AI or external product API calls as a test
prerequisite.

## 13. MVP Boundaries and Open Decisions

The following must be confirmed against the final `PRD.md` before
implementation:

1.  Final role names and the precise permissions of owner/admin/staff.
2.  Whether invoice uploads support images only or PDFs as well.
3.  Whether invoice processing is synchronous or returns `202 Accepted`
    for background processing.
4.  Exact invoice and invoice-line lifecycle state values.
5.  Supported units, pack-size conversions, and decimal precision.
6.  Whether manual product create/edit is part of the MVP.
7.  Whether label generation returns structured label data, a PDF, or
    both.
8.  The selected AI provider/model and its data-retention policy.
9.  Whether Open Food Facts lookup is enabled in the MVP.
10. The selected rate-limit implementation and production thresholds.
11. The retention and deletion policy for invoices and extracted
    records.
12. Whether any future messaging integration is in scope. No WhatsApp
    sending endpoint is defined here; the current MVP only creates
    editable purchase-order drafts.

Do not implement endpoints for roadmap features solely because they
appear in earlier concept material. The PRD must approve their scope,
data requirements, permissions, and failure behaviour first.

## 14. Definition of Done

The API is ready for MVP implementation when:

- All endpoints map to approved workflows and database entities.
- Request and response schemas are documented and validated.
- Supabase access tokens are verified server-side.
- Every business endpoint enforces store membership and role
  permissions.
- Cross-store resource references are rejected.
- Invoice confirmation is transactional and idempotent.
- AI output is schema-validated and cannot directly mutate inventory.
- Uploads and invoice images remain private.
- Pagination, validation, error, and rate-limit conventions are
  consistent.
- Secrets are server-side and absent from browser bundles and logs.
- External integrations have timeouts, bounded retries, and fallback
  behaviour.
- API contract and authorization tests pass.
- Roadmap-only integrations are not represented as live capabilities.
