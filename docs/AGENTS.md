# AGENTS.md

## 1. Purpose and Authority

This file defines mandatory rules for AI coding agents and human
contributors working on ShelfSaathi.

Before planning or changing code, read the project documents that are
present in the repository:

1.  `PRD.md` defines product scope, user journeys, roles, functional
    requirements, constraints, and acceptance criteria.
2.  `DESIGN.md` defines interface design, visual tokens, UX behaviour,
    responsive layouts, and accessibility.
3.  `ARCHITECTURE.md` defines the approved technical architecture and
    technology choices.
4.  `DATABASE.md` defines persisted entities, relationships,
    constraints, ownership, and data lifecycle.
5.  `API.md` defines HTTP endpoints, request/response contracts,
    authentication, authorization, errors, and integration behaviour.
6.  `AGENTS.md` defines the working rules that apply throughout
    development.

These documents are the project's source of truth. Follow their
requirements together. Do not silently replace, reinterpret, or expand
them.

If a document is missing, contradictory, or unclear, inspect the
repository and related documents first. Do not invent a consequential
product decision. Record the conflict or assumption and ask for
clarification when it affects scope, security, data integrity,
architecture, or user-visible behaviour.

If the existing code differs from the documents, do not automatically
rewrite the code or disregard the documents. Identify the discrepancy,
determine whether it is intentional, and make the smallest safe change
consistent with the approved direction.

## 2. Mandatory Workflow Before Every Change

Before editing:

1.  Inspect the repository structure and relevant files.
2.  Read the applicable sections of the project documents.
3.  Check the existing implementation, conventions, tests, and
    dependencies.
4.  Trace the complete affected path, including callers, API schemas,
    database access, UI states, and tests.
5.  Identify the smallest coherent change that satisfies the
    requirement.
6.  Check the working tree and preserve unrelated user changes.

Never assume a file, function, endpoint, table, component, or dependency
exists. Verify it first.

Before declaring work complete:

1.  Review the diff for accidental or unrelated changes.
2.  Run relevant tests, linting, formatting, and build/type checks that
    are available.
3.  Fix regressions caused by the change.
4.  Update documentation and tests where behaviour or contracts changed.
5.  Report what changed, which checks ran, their results, and any checks
    that could not be run.

Do not claim that a check passed unless it was actually executed
successfully.

## 3. Product Scope and Decision Discipline

-   Implement only requirements in `PRD.md` or features explicitly
    approved by the product owner.
-   Use `DESIGN.md` for UI appearance and interaction behaviour.
-   Use `ARCHITECTURE.md`, `DATABASE.md`, and `API.md` for
    implementation boundaries and contracts.
-   Do not add new screens, roles, permissions, endpoints, tables,
    integrations, or workflows merely because they seem useful.
-   Do not implement roadmap features as if they are live MVP
    capabilities.
-   Do not fabricate inventory, sales, prices, suppliers, availability,
    delivery times, or business outcomes.
-   Clearly label demo or seeded data wherever it is shown to a user.
-   Keep merchant approval in workflows that change stock or represent a
    purchasing decision.
-   AI may extract, match, or explain information. Deterministic
    application logic must validate data, calculate quantities, enforce
    rules, and perform database mutations.
-   Do not let an AI model directly execute SQL, bypass authorization,
    or perform unapproved side effects.
-   If requirements are ambiguous, prefer the least surprising,
    reversible behaviour and document the assumption. Ask for approval
    before consequential decisions.

## 4. Code Quality and Naming

-   Write code that is readable, explicit, modular, and easy for a small
    team to maintain.
-   Prefer straightforward solutions over clever abstractions.
-   Follow established naming, formatting, and error-handling patterns
    in the affected part of the codebase.
-   Use descriptive names that communicate intent.
-   Avoid unexplained abbreviations, single-letter names outside short
    local scopes, and vague names such as `data`, `item`, `manager`, or
    `helper` when a domain-specific name is clearer.
-   Use `snake_case` for Python modules, functions, variables, and
    fields where appropriate; use `PascalCase` for Python classes.
-   Use `camelCase` for JavaScript variables and functions, and
    `PascalCase` for React components.
-   Use consistent naming for API fields, database columns, state
    values, and domain concepts. Follow the existing contract rather
    than renaming fields for personal preference.
-   Keep functions focused and reasonably small. Extract a helper only
    when it clarifies meaningful logic or removes genuine duplication.
-   Avoid deeply nested conditionals, hidden side effects, global
    mutable state, and unnecessary indirection.
-   Prefer early validation and clear failure paths.
-   Add comments to explain intent, constraints, or non-obvious
    decisions, not to narrate obvious code.
-   Remove dead code only when it is directly related to the task and
    safe to remove. Do not perform unrelated cleanup.
-   Do not leave temporary debugging output, commented-out
    implementations, placeholder behaviour, or unexplained `TODO`
    markers in completed work.
-   Do not suppress warnings or exceptions merely to make checks pass.

## 5. Project Structure and Architecture

Follow the structure already established in the repository. Do not
reorganise directories solely to match a preferred template.

### Frontend

The approved direction is Vite + React + JavaScript + Tailwind CSS. Do
not introduce Next.js or shadcn/ui.

Keep responsibilities separated where the current project structure
supports it:

-   Route/page components compose screens and coordinate page-level
    state.
-   Shared UI components implement reusable visual patterns.
-   Feature components contain workflow-specific presentation and
    interaction.
-   API client modules handle HTTP requests, token attachment, and
    consistent error parsing.
-   Domain utilities contain pure formatting, validation, and
    presentation helpers.
-   Shared design tokens define colour, spacing, typography, radii, and
    other reusable visual decisions.

Do not put database credentials, privileged Supabase keys, AI provider
calls, or business-critical calculations in the browser.

### Backend

The approved direction is a single FastAPI modular monolith, not
microservices.

Organise code around clear application modules and responsibilities,
such as authentication/authorization, products/catalogue,
invoices/extraction, inventory, barcodes, reorder suggestions, and
purchase-order drafts, according to actual MVP scope.

Keep clear boundaries between:

-   HTTP routing and transport schemas.
-   Business rules and workflow orchestration.
-   Database access and transaction management.
-   External provider adapters.
-   Configuration and shared infrastructure.

Route handlers should remain thin. Do not place complex business rules,
large database workflows, or provider-specific logic directly in route
handlers.

Do not split modules into separate services or introduce queues,
brokers, agent frameworks, vector databases, Kubernetes, or other
infrastructure without an approved requirement.

### Cross-layer changes

When changing a feature, inspect all affected layers. A change to an API
field may require updates to its Pydantic schema, service logic,
database mapping, frontend API client, UI, tests, and documentation.

Keep module boundaries explicit. Avoid circular imports and avoid
exposing persistence implementation details to unrelated modules.

## 6. Component Reuse and UI Rules

-   Inspect existing components before creating new ones.
-   Reuse shared components and established patterns where they fit the
    requirement.
-   Create a reusable component when the pattern is genuinely shared or
    its behaviour is complex enough to benefit from isolation.
-   Do not build a generic component framework for one-off use.
-   Do not duplicate a shared button, form control, modal, alert, badge,
    table pattern, or loading state without a clear reason.
-   Keep domain-specific behaviour in feature components rather than
    making shared UI components aware of unrelated business rules.
-   Use design tokens rather than scattering raw colours, spacing,
    radius, and typography values throughout the interface.
-   Use **Outfit as the sole product typeface**. Do not add a second
    font.
-   Follow the palette and visual patterns in `DESIGN.md`; treat
    proposed values as defaults if the document says they still need
    approval.
-   Do not introduce dark mode, gradients, ornamental animation, new
    icon libraries, or unapproved visual patterns without a product
    requirement.
-   Build responsive layouts for small screens first where that suits
    the workflow. Do not assume hover is available on touch devices.
-   Use semantic HTML, accessible names, visible focus, correctly
    associated labels and errors, and keyboard-operable interactions.
-   Target WCAG 2.2 Level AA as defined by `DESIGN.md`.
-   Implement applicable loading, empty, no-results, success,
    validation, permission, and error states.
-   Never show success before the corresponding operation has actually
    succeeded.
-   Confirm destructive or high-impact actions when appropriate and
    explain their consequences.
-   Use direct, clear microcopy and consistent product terminology.

## 7. Dependencies and Tooling

-   Inspect `package.json`, lockfiles, Python dependency manifests, and
    existing tooling before adding or changing a dependency.
-   Prefer the standard library and packages already included in the
    approved stack.
-   Add a dependency only when it solves a real, approved requirement
    that cannot be handled cleanly with existing tools.
-   Do not add a package to avoid writing a small, straightforward
    helper.
-   Do not add duplicate libraries for the same responsibility.
-   Do not upgrade unrelated packages or perform broad dependency
    refreshes as part of a feature task.
-   Do not change package managers or regenerate lockfiles without a
    clear reason.
-   Pin or constrain dependencies using the repository's existing policy
    and keep lockfiles consistent with manifest changes.
-   Check maintenance, compatibility, licence, security, and runtime
    cost before adding a production dependency.
-   Do not introduce paid or hosted services as mandatory dependencies
    without approval.
-   Keep the MVP deployable within the constraints in `ARCHITECTURE.md`.
-   Do not commit generated build output, local caches, virtual
    environments, credentials, or local configuration unless the
    repository explicitly requires a tracked artifact.
-   Use the existing formatter, linter, test runner, and build commands.
    Do not add new tooling just to enforce a personal preference.

## 8. Type Safety and Validation

The frontend uses JavaScript, so maintain contract safety through clear
schemas, JSDoc where useful, small pure functions, and consistent API
response handling. Do not migrate the project to TypeScript without
approval.

The backend uses Python and FastAPI:

-   Use Pydantic request and response schemas for external API
    contracts.
-   Add Python type annotations to public functions, service boundaries,
    and important data transformations.
-   Use explicit return types where they improve clarity.
-   Avoid `Any`, unchecked casts, and broad dictionaries when a defined
    schema is practical.
-   Validate all external input at the boundary, including query
    parameters, path parameters, uploads, and provider responses.
-   Treat browser input, uploaded documents, barcode values, and AI
    output as untrusted.
-   Use explicit enums or constrained values for finite states and
    supported options.
-   Keep request/response schemas aligned with `API.md`.
-   Validate business invariants in the service/domain layer as well as
    at the API boundary where necessary.
-   Never rely on frontend validation as the only protection for
    business rules.
-   Do not use floating-point arithmetic for money. Follow `DATABASE.md`
    and use suitable decimal/numeric types.
-   Use timezone-aware UTC timestamps consistently.
-   Reject invalid units, quantities, ownership references, workflow
    states, and unsupported values.
-   Avoid silent coercion or lossy conversion of business data.

## 9. Error Handling and Logging

-   Follow the error response envelope and HTTP status conventions in
    `API.md`.
-   Return stable, machine-readable error codes and safe user-facing
    messages.
-   Use appropriate status codes, including `401` for invalid
    authentication, `403` for insufficient permission, `404` for absent
    or intentionally hidden resources, `409` for conflicts, `422` for
    validation errors, and `429` for rate limits.
-   Do not expose stack traces, SQL statements, internal paths, secrets,
    raw provider responses, or implementation details to clients.
-   Catch exceptions only when the code can handle them, add useful
    context, or translate them at a defined boundary.
-   Do not silently swallow exceptions or return fabricated success
    responses.
-   Avoid broad `except Exception` blocks unless they are used at a
    deliberate top-level boundary with proper logging and safe error
    translation.
-   Use structured logging consistent with existing project practices.
-   Include a request/correlation ID where supported.
-   Never log access tokens, passwords, API keys, signed URLs, full
    invoice images, or unnecessary sensitive business data.
-   Log enough safe context to diagnose failures without disclosing
    private information.
-   Distinguish expected validation/business errors from unexpected
    system failures.
-   Ensure failure states are visible and actionable in the UI.
-   Do not retry permanent failures. Use bounded retries and timeouts
    for transient external-service failures only.

## 10. Security and Secrets

Security requirements are mandatory and cannot be bypassed to simplify
implementation.

### Authentication and authorization

-   Use the authentication provider defined by `ARCHITECTURE.md`; do not
    build a separate password system.
-   Validate access tokens server-side, including signature and relevant
    claims.
-   Authentication and authorization are separate checks.
-   Enforce store membership, role permissions, and target-resource
    ownership on every protected business request.
-   Never trust a user ID, role, store ID, product ID, invoice ID, or
    other ownership claim from the client without server-side
    verification.
-   Prevent cross-store reads, writes, and references between records
    belonging to different stores.
-   Prefer a generic `404` for inaccessible resources where revealing
    their existence would leak information, consistent with `API.md`.
-   Test authorization failures, not only successful access.
-   Apply least privilege to database access, storage access, and
    external integrations.

### Secrets and configuration

-   Never hard-code secrets or commit them to the repository.
-   Never expose database URLs, service-role keys, AI provider keys,
    private signing keys, or other privileged credentials in frontend
    code or `VITE_*` variables.
-   Browser-visible configuration must be treated as public.
-   Use environment variables or the deployment secret manager as
    specified by the project documents.
-   Keep `.env.example` values safe and illustrative. Never copy real
    credentials into examples.
-   Do not print environment values or secrets in logs, test snapshots,
    error messages, screenshots, or generated documentation.
-   If a secret is discovered in the repository, do not repeat it in
    output. Flag the exposure and recommend rotation.
-   Do not weaken CORS, JWT verification, TLS, storage privacy, or
    authorization to get a local test working.
-   Validate uploads by size, allowed type, file signature, and actual
    decodability where applicable.
-   Keep invoice files in private storage and use short-lived signed
    URLs only when authorised access requires them.
-   Protect against SQL injection, path traversal, insecure direct
    object references, unsafe file handling, and untrusted AI output.
-   Do not add arbitrary SQL execution, unrestricted file access, or
    public access to private business records.

## 11. Database and Migration Rules

Follow `DATABASE.md` as the schema source of truth and `ARCHITECTURE.md`
for the approved database access pattern.

-   Use the chosen database access pattern consistently. Do not mix
    SQLAlchemy and direct-driver patterns without an approved reason.
-   Keep database credentials on the backend.
-   Use parameterised queries or ORM expressions. Never build SQL by
    concatenating untrusted input.
-   Use explicit transaction boundaries for multi-step business
    operations.
-   Use Alembic migrations for schema changes.
-   Never modify a deployed schema manually as a substitute for a
    migration.
-   Make migrations reviewable, deterministic, and safe for existing
    data.
-   Inspect the current schema and migration history before generating a
    migration.
-   Do not rewrite, reorder, or delete already-applied migrations.
-   Consider existing records, defaults, nullability, indexes,
    constraints, locks, and rollback implications.
-   Do not use destructive schema changes or data deletion without
    explicit approval and a safe migration plan.
-   Preserve foreign keys, unique constraints, check constraints, and
    store-ownership invariants.
-   Ensure cross-store references are rejected by application logic and
    database constraints where feasible.
-   Keep money in appropriate decimal/numeric types and timestamps
    timezone-aware.
-   Do not add columns, tables, indexes, or persisted state without a
    product or technical need.
-   Use seed data only for development/test/demo purposes and label demo
    data clearly.
-   Never seed fake records into production without explicit approval.
-   Do not access another store's rows through broad queries or unscoped
    repository methods.
-   Use least-privilege database credentials and explicit Row Level
    Security policies if RLS is enabled.
-   Test migration upgrade paths and important constraints against a
    disposable test database where possible.

### Inventory integrity

-   Inventory changes must follow approved business workflows and create
    corresponding stock-movement history.
-   Invoice extraction or editing alone must never change inventory.
-   Invoice confirmation must validate the reviewed invoice and update
    the invoice state, inventory, and stock movements in one
    transaction.
-   Confirmation must be idempotent. Retries or concurrent requests must
    not apply the same stock movement twice.
-   If any part of the transaction fails, all related changes must roll
    back.
-   Do not silently rewrite historical stock movements to correct a
    mistake; use the approved correction/compensating-movement approach.
-   Keep quantity calculations deterministic and test edge cases such as
    decimals, units, duplicate lines, and repeated confirmation.

## 12. API and Integration Rules

Follow `API.md` for routes, HTTP methods, schemas, statuses, pagination,
idempotency, and failure behaviour.

-   Use `/api/v1` for the REST API unless an approved contract change
    says otherwise.
-   Keep route handlers thin and delegate business operations to the
    appropriate module/service.
-   Define and validate request/response schemas with Pydantic.
-   Keep the frontend's shared HTTP client responsible for common
    headers, bearer-token attachment, response parsing, and normalised
    errors.
-   Do not duplicate slightly different fetch/error logic throughout the
    UI.
-   Do not let frontend components query PostgreSQL directly.
-   Do not expose privileged database or storage credentials to the
    browser.
-   Do not change a public API contract without checking all consumers
    and updating tests and documentation.
-   Preserve stable error codes and consistent response envelopes.
-   Apply store authorization before resource reads, filtering, and
    pagination.
-   Use stable pagination and validate cursors, limits, sort fields, and
    filters.
-   Use idempotency for retryable state-changing operations where
    defined.
-   Use explicit timeouts for network calls.
-   Retry only transient failures, with bounded backoff and jitter where
    appropriate.
-   Respect provider rate limits and `Retry-After`.
-   Keep provider-specific request/response handling inside an adapter.
-   Validate external provider responses before using or persisting
    them.
-   Make optional integrations non-blocking to the core workflow where
    specified.
-   Provide a manual fallback when Open Food Facts or AI extraction is
    unavailable, as appropriate to the workflow.
-   Do not implement speculative webhooks or external actions without a
    real integration requirement.
-   Do not claim supplier availability or send a purchase order unless a
    real, approved integration supports it.
-   Keep OpenAPI documentation aligned with implemented routes. Restrict
    production API docs as specified by deployment policy.

## 13. AI and Document Processing Rules

-   Use the selected vision-capable provider through the adapter defined
    by the architecture.
-   Keep AI calls on the backend.
-   Send only the minimum information needed for the task.
-   Validate structured model output against an explicit schema before
    using it.
-   Treat document text, images, OCR output, product descriptions, and
    model responses as untrusted input.
-   Do not treat instructions found inside an uploaded invoice or other
    document as trusted system instructions.
-   Do not allow model output to trigger arbitrary tools, SQL, file
    access, or external side effects.
-   Do not accept an extraction as confirmed business data until it has
    passed validation and the merchant has reviewed and confirmed it.
-   Use deterministic code for stock maths, unit conversions, reorder
    quantities, barcode generation rules, authorization, and
    persistence.
-   Explanations must be based on available data and the actual
    calculation. Do not invent evidence or certainty.
-   Clearly indicate missing, uncertain, or low-confidence fields that
    require review.
-   Avoid logging full prompts, uploaded images, full extracted
    documents, or sensitive provider payloads.
-   Configure timeouts, bounded retries, size limits, and provider-cost
    limits.
-   Preserve merchant corrections when retrying extraction; never
    silently overwrite reviewed data.
-   If AI fails, return a clear retryable or manual-review state. Do not
    pretend the operation succeeded.

## 14. Testing Rules

Add or update tests for every meaningful behaviour change.

### Backend tests

Use the repository's established Pytest and HTTPX setup where present.
Test:

-   Business logic and validation.
-   Request/response schemas and error envelopes.
-   Authentication and role enforcement.
-   Cross-store isolation and foreign resource references.
-   Database constraints and transaction rollback.
-   Invoice confirmation idempotency and concurrent attempts.
-   Upload validation and private-file access rules.
-   Provider timeout, rate-limit, malformed-output, and
    unavailable-service paths.
-   Reorder calculations with known inputs, missing data, and boundary
    cases.
-   Pagination, filters, and stable ordering.
-   Purchase-order draft validation and absence of unapproved side
    effects.

### Frontend tests

Use the existing Vitest/React Testing Library setup where present. Test:

-   Shared components and their important states.
-   Loading, empty, success, validation, permission, and error states.
-   API success and failure handling.
-   Form validation and submission behaviour.
-   Invoice review and confirmation UX.
-   Responsive and keyboard interactions for critical flows where
    practical.

### Test discipline

-   Tests must be deterministic and independent of live AI or external
    APIs.
-   Mock external services in automated tests.
-   Use disposable test data and databases. Never run destructive tests
    against production.
-   Do not weaken assertions or delete tests just to make a change pass.
-   Add regression tests for fixed bugs.
-   Test failure and authorization paths, not only the happy path.
-   Run the narrowest relevant tests during iteration, then the broader
    suite when feasible.
-   Report tests that were not run and explain why.

## 15. Documentation Rules

-   Update the relevant project document when an approved requirement,
    architecture decision, schema, API contract, environment variable,
    setup step, or operational behaviour changes.
-   Keep `PRD.md` focused on product requirements, `DESIGN.md` on
    UX/design, `ARCHITECTURE.md` on system structure, `DATABASE.md` on
    persistence, `API.md` on API contracts, and `AGENTS.md` on
    development rules.
-   Do not silently make documents contradict the implementation or each
    other.
-   Do not rewrite whole documents for a small implementation change.
-   Document new environment variables in the appropriate setup
    instructions and `.env.example`, using placeholders only.
-   Document migrations and deployment implications.
-   Keep API examples consistent with actual schemas and avoid real
    customer data.
-   Explain important non-obvious decisions and operational limitations.
-   Do not claim unimplemented functionality is available.
-   If a decision needs product-owner approval, record it as unresolved
    rather than presenting it as final.

## 16. Git and Change Discipline

-   Inspect `git status` and the current diff before making changes.
-   Preserve uncommitted user work. Never reset, discard, overwrite, or
    reformat unrelated changes.
-   Make the smallest coherent set of changes that solves the requested
    task.
-   Do not change unrelated files, rename broad sections, reformat the
    entire repository, or perform opportunistic cleanup.
-   Do not use destructive Git commands such as `reset --hard`,
    `clean -fd`, or force-push unless the user explicitly requests the
    exact action and its consequences are understood.
-   Do not commit, push, create branches, merge, or tag releases unless
    asked or explicitly authorised by the established workflow.
-   Do not rewrite Git history without explicit approval.
-   Do not include `.env` files, credentials, private keys, local
    databases, generated secrets, or sensitive uploads in commits.
-   Review staged changes before committing.
-   Use concise commit messages that describe the actual change when a
    commit is requested.
-   If a task unexpectedly requires a broad or destructive change, stop
    and ask for confirmation.
-   Keep generated files and lockfile changes only when they are
    required by the task and repository conventions.

## 17. Performance and Reliability

-   Keep the MVP simple enough to run within the deployment constraints
    in `ARCHITECTURE.md`.
-   Avoid unnecessary network calls, repeated database queries,
    unbounded loops, and loading entire collections when pagination is
    appropriate.
-   Add indexes only when supported by query patterns or constraints.
-   Avoid premature caching and complex background processing.
-   Do not block a database transaction while waiting for an AI or
    external HTTP call.
-   Use timeouts and bounded retries for external services.
-   Keep critical database workflows restart-safe and idempotent where
    required.
-   Handle partial failures explicitly.
-   Do not report a mutation as successful before persistence succeeds.
-   Avoid expensive work on the UI thread and unnecessary full-page
    loading states.
-   Keep loading and error feedback local to the part of the interface
    affected when possible.
-   Do not introduce a new queue, scheduler, or workflow engine without
    an approved requirement.

## 18. Accessibility and UX Completion Checklist

Before completing a UI task, verify the applicable items:

-   Outfit is used for all interface text.
-   Shared colour, typography, spacing, border, and radius tokens are
    used.
-   The screen works at supported small, medium, and large widths.
-   Primary actions remain reachable on mobile.
-   Touch targets are practical and interactions do not rely on hover.
-   Forms have labels, instructions, and associated validation messages.
-   Keyboard focus is visible and correctly managed.
-   Icon-only controls have accessible names.
-   Colour is not the only signal for status.
-   Dialogs support keyboard use and appropriate focus behaviour.
-   Dynamic updates are announced when needed.
-   Reduced-motion preferences are respected.
-   Loading, empty, error, success, and permission states are
    implemented where applicable.
-   The UI never implies that a server-side change succeeded before
    confirmation.
-   The screen follows the approved PRD journey and does not add
    unapproved functionality.

## 19. Definition of Done

A task is complete only when all applicable criteria are met:

-   The implementation satisfies an approved requirement.
-   Existing code and conventions were inspected before editing.
-   The change is minimal, coherent, and consistent with the
    architecture.
-   Relevant frontend, backend, and database contracts remain aligned.
-   Authentication, authorization, store isolation, and secret handling
    are preserved.
-   Validation and failure cases are handled.
-   Important business logic has automated tests.
-   Relevant tests, linting, formatting, and build checks have been run
    where available.
-   The UI follows `DESIGN.md` and accessibility requirements where
    applicable.
-   Required documentation and migration files are updated.
-   The diff contains no unrelated changes, debug output, secrets, or
    accidental generated files.
-   Any unresolved assumptions, limitations, and unrun checks are
    reported clearly.

## 20. Final Agent Response

When reporting completed work, be concise and factual. Include:

1.  A summary of the change.
2.  The main files changed.
3.  Tests and checks run, with their actual results.
4.  Any known limitations, unresolved decisions, or checks not run.

Do not claim deployment, integration, testing, or production readiness
unless it has been verified.
