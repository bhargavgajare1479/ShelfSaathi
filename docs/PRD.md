# ShelfSaathi — Product Requirements Document (PRD)

**Project:** ShelfSaathi  
**Team:** NC3  
**Hackathon Track:** Track 1 — Merchant Growth AI  
**Document Type:** Product Requirements Document  
**Status:** Draft for implementation  
**Version:** 1.0

---

## 1. Product Overview

### 1.1 What Is ShelfSaathi?

ShelfSaathi is an AI-powered operating assistant for kirana stores, small supermarkets, and other small retailers.

It simplifies inventory management and purchasing by converting supplier invoice photographs into structured product records, updating stock levels after merchant confirmation, generating barcode labels for products that need them, and recommending which products to reorder.

The product is designed to reduce repetitive administrative work and help retailers make better purchasing decisions without requiring advanced technical knowledge.

ShelfSaathi is a mobile-first web application that combines inventory operations, AI-assisted purchasing, supplier discovery, promotional content generation, and multilingual assistance in one interface.

### 1.2 Product Vision

Help small retailers spend less time managing inventory and more time running their businesses.

### 1.3 Value Proposition

ShelfSaathi enables retailers to:

- Convert supplier invoices into structured inventory updates.
- Reduce manual product entry and barcode-label creation.
- Understand which products need replenishment.
- Make purchasing decisions using available stock and sales data.
- Discover alternative suppliers when their usual wholesaler cannot fulfil an order.
- Generate promotional content for slow-moving and near-expiry products.
- Interact with the application in a familiar language.
- Retain control over inventory changes and purchasing decisions through explicit confirmation and approval.

### 1.4 Product Principles

1. **Merchant control:** AI-generated suggestions must not silently modify confirmed business records or place purchase orders.
2. **Explainability:** Recommendations should show the data and reasoning supporting them.
3. **Simplicity:** Common tasks should require minimal steps and technical knowledge.
4. **Practical automation:** Automate repetitive data processing while keeping the merchant involved in consequential decisions.
5. **Compatibility:** Support existing billing workflows rather than requiring retailers to replace their billing systems.
6. **Mobile-first usability:** Prioritise the needs of merchants using smartphones in busy retail environments.
7. **Honest data handling:** Clearly distinguish extracted values, confirmed records, estimates, and unavailable information.

---

## 2. Problem Statement

Small retailers frequently rely on billing applications for sales but continue to perform inventory administration and purchasing decisions manually.

### 2.1 Problems and Their Impact

| Problem | Current Situation | Business Impact |
|---|---|---|
| Manual inventory setup | Retailers manually enter products and quantities from supplier invoices. | Time-consuming stock updates and increased risk of data-entry errors. |
| Barcode administration | Retailers must identify products without usable barcodes and prepare labels for them. | Additional manual work and unnecessary label creation. |
| Gut-feel purchasing | Reorder decisions depend heavily on personal experience rather than structured recommendations. | Potential stockouts, overstocking, and inefficient use of working capital. |
| Supplier gaps | Retailers contact suppliers manually when products are unavailable. | Delayed purchasing and additional effort. |
| Limited inventory visibility | Incomplete or outdated stock records make it difficult to identify fast-moving and low-stock products. | Lost sales, excess inventory, and poor purchasing decisions. |
| Manual marketing | Retailers manually prepare promotional messages and social media content. | Inconsistent customer outreach and additional administrative work. |
| Language barriers | Interfaces that do not support a merchant's preferred language can be difficult to use. | Reduced usability and adoption. |

The pain points above are the problems identified in the ShelfSaathi concept. Their prevalence and financial impact must be validated with actual merchants.

### 2.2 Core Problem to Solve

The initial product must make the transition from receiving supplier stock to maintaining usable inventory records significantly faster and less error-prone.

The central workflow is:

**Supplier invoice → Structured product data → Merchant confirmation → Updated inventory → Barcode labels → Reorder recommendations → Approved purchase order draft**

Secondary capabilities should support this workflow rather than distract from it.

---

## 3. Target Users

### 3.1 Primary User: Kirana Store Owner

**Profile**

- Owns or operates a small neighbourhood grocery store.
- Receives supplier invoices regularly.
- Manages inventory alongside customer-facing responsibilities.
- May already use a billing application.
- Has limited time for manual data entry.
- May prefer Hindi, Marathi, Gujarati, or English.

**Needs**

- Update inventory quickly.
- Understand current stock levels.
- Identify products that need replenishment.
- Review recommendations before acting.
- Use the application without extensive training.

**Primary success outcome:** Less time spent on stock administration and more reliable purchasing decisions.

### 3.2 Secondary User: Small Supermarket Operator

**Profile**

- Manages a larger product catalogue.
- Processes invoices containing many line items.
- Needs a consistent process for stock updates and barcode management.

**Needs**

- Efficient bulk invoice processing.
- Accurate product matching.
- Reliable stock updates.
- Printable barcode labels.
- Data-backed reorder recommendations.

**Primary success outcome:** Faster inventory processing with fewer manual corrections.

### 3.3 Secondary User: Store Employee

**Profile**

- Performs inventory-related tasks on behalf of the owner.
- May have limited purchasing authority.

**Needs**

- Enter or review invoice information.
- Update inventory within assigned permissions.
- Generate labels where permitted.
- Escalate purchasing decisions to the owner.

**Assumption A-01:** Employee accounts may be supported in the initial product, but the minimum viable implementation may use a single store-owner account. The team must approve whether separate employee roles are required for the hackathon MVP.

### 3.4 Future Stakeholder: Supplier or Distributor

Suppliers may eventually benefit from purchase-order workflows and product availability discovery.

However, the initial product does not require a supplier-facing portal. Supplier discovery must work with whatever data sources are available and must not imply verified supplier availability when no such verification exists.

---

## 4. Product Goals and Non-Goals

### 4.1 Goals

The MVP must:

1. Allow a merchant to upload or photograph a supplier invoice.
2. Extract structured product information using AI.
3. Match extracted products against the existing product catalogue where possible.
4. Allow the merchant to review and correct extracted information.
5. Update inventory only after confirmation.
6. Scan existing product barcodes and generate labels for products that need them.
7. Recommend products for replenishment using available inventory and sales data.
8. Explain the data behind each reorder recommendation.
9. Allow the merchant to review recommendations and prepare a purchase-order draft.
10. Provide a mobile-friendly interface.
11. Demonstrate the central workflow reliably using realistic sample data.

### 4.2 Non-Goals

The MVP is not intended to:

- Replace a complete point-of-sale or billing system.
- Replace accounting, taxation, or financial-management software.
- Automatically purchase products without merchant approval.
- Guarantee supplier stock availability or pricing.
- Provide a full supplier marketplace.
- Implement a comprehensive customer relationship management system.
- Send unsolicited promotional messages to customers.
- Predict demand using sophisticated forecasting models before sufficient data exists.
- Implement multi-warehouse logistics.
- Support franchise-level management across many stores.
- Provide autonomous financial transactions.
- Guarantee invoice extraction accuracy for every supplier format.
- Claim measurable business improvements before testing them with merchants.

---

## 5. Scope and Priorities

Requirements use the following priority levels:

- **P0 — Essential:** Required for the MVP to demonstrate the core product.
- **P1 — Important:** Valuable functionality that should be implemented if time permits.
- **P2 — Future:** Not required for the initial demonstration.

| Capability | Priority | MVP Expectation |
|---|---|---|
| Authentication and store access | P0 | Secure access to the merchant's workspace. |
| Product catalogue | P0 | View, create, edit, and search products. |
| Invoice upload | P0 | Upload a supported invoice image or document. |
| AI invoice extraction | P0 | Extract structured invoice and line-item information. |
| Product matching | P0 | Match extracted products to existing catalogue records where possible. |
| Invoice review and confirmation | P0 | Correct extracted information before inventory changes. |
| Inventory updates | P0 | Update stock quantities from confirmed invoice data. |
| Barcode scanning | P0 | Read supported existing product barcodes. |
| Barcode generation | P0 | Generate printable labels for products requiring them. |
| Buying Copilot | P0 | Recommend reorders from available stock and sales data. |
| Recommendation explanations | P0 | Show relevant stock and sales information supporting each suggestion. |
| Purchase-order draft | P0 | Prepare an order from merchant-approved recommendations. |
| Supplier Finder | P1 | Search available supplier information and prepare an order draft. |
| Sales Booster | P1 | Generate promotional content for selected products. |
| Multilingual assistance | P1 | Support Hindi, Marathi, Gujarati, and English for agreed MVP interactions. |
| Billing-data import | P1 | Import supported catalogue or sales exports if the format is defined. |
| Persistent employee roles | P2 | Separate employee accounts and granular permissions. |
| Automated supplier integrations | P2 | Retrieve verified availability or pricing from integrated suppliers. |
| WhatsApp API integration | P2 | Send purchase orders or promotions through an authorised integration. |
| Advanced demand forecasting | P2 | Forecast future demand using sufficient historical data. |

**Scope rule:** A P1 or P2 feature must not delay completion of the P0 invoice-to-reorder workflow.

---

## 6. Core User Journeys

### 6.1 Journey A: First-Time Store Setup

**Objective:** Allow a merchant to create a workspace and prepare an initial product catalogue.

#### Steps

1. The merchant opens ShelfSaathi.
2. The merchant signs in or creates an account.
3. The application creates or loads the merchant's store workspace.
4. The merchant opens the product catalogue.
5. The merchant adds products manually or imports a supported file if import functionality is available.
6. The merchant verifies product names, units, identifiers, and opening stock quantities.
7. The merchant can begin processing invoices.

#### Requirements

- The application must associate store data with the correct authenticated account.
- The catalogue must distinguish individual products consistently.
- Missing optional information must not prevent a merchant from saving an otherwise valid product.
- An empty catalogue must explain how to add the first product.

**Assumption A-02:** The initial implementation supports one store per account unless the team approves multi-store support.

### 6.2 Journey B: Invoice-to-Stock

**Objective:** Convert a supplier invoice into confirmed inventory updates.

#### Steps

1. The merchant opens the invoice or stock-receiving workflow.
2. The merchant uploads or photographs a supplier invoice.
3. The application validates the file.
4. The AI service extracts invoice metadata and line items.
5. The application attempts to match extracted items against the product catalogue.
6. The application displays the extracted information and matching results.
7. The merchant reviews quantities, product identities, and other relevant fields.
8. The merchant corrects uncertain or incorrect values.
9. The merchant confirms the invoice.
10. The application applies inventory changes.
11. The application displays a summary of successfully updated products.
12. The merchant can proceed to barcode generation and reorder recommendations.

#### Requirements

- Extraction results must remain editable until confirmation.
- Low-confidence or unmatched products must be visibly identified.
- The application must not treat an unreviewed extraction as a confirmed stock update.
- The application must prevent duplicate processing of the same invoice from unintentionally adding stock twice.
- The merchant must be able to identify which products were updated.
- Failed updates must not produce a misleading success message.

### 6.3 Journey C: Barcode Management

**Objective:** Identify products that already have barcodes and generate labels for those that do not.

#### Steps

1. The merchant opens barcode management or the relevant product record.
2. The merchant scans an existing barcode or enters a product identifier.
3. The application attempts to match the barcode to a product.
4. If the product exists, the application displays its details.
5. If a product requires a barcode, the merchant initiates barcode generation.
6. The application generates a label suitable for printing.
7. The merchant prints the label using a supported browser print workflow.

#### Requirements

- The application must not generate a replacement barcode unnecessarily when a valid existing identifier can be reused.
- Unmatched barcodes must produce a clear result rather than silently associating them with an unrelated product.
- Generated identifiers must be unique within the store.
- The printed label must contain the barcode and sufficient product identification for practical use.
- Barcode generation must not silently change inventory quantities.

**Assumption A-03:** The MVP uses browser-based printing or printable label sheets. Direct printer-device integrations are not required.

### 6.4 Journey D: Buying Copilot

**Objective:** Help the merchant decide what to reorder.

#### Steps

1. The merchant opens Buying Copilot.
2. The merchant requests reorder recommendations.
3. The application retrieves the available stock and sales information.
4. The recommendation logic identifies products that may require replenishment.
5. The application displays suggested products and quantities.
6. Each recommendation includes the supporting data available to the system.
7. The merchant accepts, modifies, or rejects individual suggestions.
8. The merchant reviews the proposed order.
9. The merchant approves creation of a purchase-order draft.
10. The application displays the resulting draft and its status.

#### Requirements

- Recommendations must use actual available records, not fabricated sales history.
- The application must distinguish unavailable data from zero values.
- Suggested quantities must be traceable to the inputs and rules used.
- The merchant must be able to modify quantities.
- Generating recommendations must not automatically place an order.
- If insufficient data exists, the application must explain the limitation and offer a reasonable manual workflow.

### 6.5 Journey E: Supplier Discovery

**Objective:** Help the merchant identify potential alternatives when a usual supplier cannot provide an item.

#### Steps

1. The merchant selects a product or purchase-order line item.
2. The merchant opens Supplier Finder.
3. The application searches the supplier information available to it.
4. The application displays relevant matches and the data supporting them.
5. The merchant reviews the available options.
6. The merchant prepares or updates a purchase-order draft.

#### Requirements

- The application must distinguish known supplier information from verified live availability.
- Missing prices or availability must be labelled as unknown.
- The application must not invent suppliers, prices, stock levels, or delivery estimates.
- Supplier discovery must not result in an order being placed without approval.

**Assumption A-04:** A curated sample supplier dataset is acceptable for the hackathon demonstration. Live supplier integrations are not required for the initial implementation.

### 6.6 Journey F: Promotional Content Generation

**Objective:** Help the merchant create promotional content for selected products.

#### Steps

1. The merchant opens Sales Booster.
2. The merchant selects a product.
3. The merchant selects an intended promotion or provides a short instruction.
4. The AI generates promotional content.
5. The merchant reviews and edits the result.
6. The merchant copies or exports the content for use in an external channel.

#### Requirements

- Generated content must be editable.
- The application must not invent discounts, product properties, or expiry dates.
- Product information must come from available records or merchant-provided inputs.
- The application must not send promotional messages automatically in the MVP.

**Assumption A-05:** Copying generated content is sufficient for the MVP. Automated publishing and messaging integrations are deferred.

### 6.7 Journey G: Multilingual Assistance

**Objective:** Allow merchants to interact with ShelfSaathi in a supported language.

#### Requirements

- The application should support Hindi, Marathi, Gujarati, and English for agreed MVP interactions.
- The language-selection control must be accessible from the primary interface.
- Language selection must not alter underlying product identifiers, quantities, or stored business data.
- Critical quantities, currency values, and product identifiers must remain unambiguous.
- If an interaction is not supported in the selected language, the application must provide a clear fallback.

**Assumption A-06:** Full translation of every interface element and every AI response may exceed MVP capacity. The exact language coverage must be agreed before implementation.

---

## 7. Functional Requirements

### 7.1 Authentication and Store Access

**FR-AUTH-01 — Account access (P0)**

The application must provide an authentication mechanism appropriate for the selected deployment.

**FR-AUTH-02 — Protected workspace (P0)**

Unauthenticated users must not access protected inventory, invoices, supplier records, or purchase orders.

**FR-AUTH-03 — Store ownership (P0)**

Every store-owned record must be associated with a store or account, and users must not access another store's data without explicit authorisation.

**FR-AUTH-04 — Session handling (P0)**

Expired or invalid sessions must result in a clear authentication state rather than unexplained request failures.

### 7.2 Product Catalogue

**FR-PROD-01 — Product creation (P0)**

The merchant must be able to create a product manually.

**FR-PROD-02 — Product editing (P0)**

The merchant must be able to edit permitted product fields.

**FR-PROD-03 — Product listing (P0)**

The application must display products with relevant identification and inventory information.

**FR-PROD-04 — Product search (P0)**

The merchant must be able to search by product name and supported identifiers.

**FR-PROD-05 — Product identity (P0)**

Products must have stable internal identifiers. Barcode values and other external identifiers must not be used as the sole internal identity.

**FR-PROD-06 — Duplicate detection (P0)**

The application should identify likely duplicate products during invoice matching and catalogue entry.

**FR-PROD-07 — Product units (P0)**

The system must represent product quantities and units consistently. The same product must not be treated as interchangeable across incompatible units without an explicit conversion rule.

**FR-PROD-08 — Opening stock (P0)**

The merchant must be able to enter an initial stock quantity.

**FR-PROD-09 — Product archive (P1)**

If product removal is supported, historical invoice and inventory references must remain interpretable. Archiving is preferred over destructive deletion for products with transaction history.

### 7.3 Invoice Upload and Extraction

**FR-INV-01 — Invoice upload (P0)**

The merchant must be able to upload a supported invoice image or document.

**FR-INV-02 — File validation (P0)**

The application must validate file type, size, and basic readability before processing.

**FR-INV-03 — Invoice extraction (P0)**

The AI integration must extract available invoice metadata and line items.

Potential fields include:

- Supplier name.
- Invoice number.
- Invoice date.
- Product description.
- Product identifier or barcode, when present.
- Quantity.
- Unit of measure.
- Unit price, when present.
- Line total, when present.
- Tax information, when present.

The system must not assume every invoice contains every field.

**FR-INV-04 — Extraction status (P0)**

The application must communicate whether an invoice is awaiting processing, processing, ready for review, confirmed, or failed.

**FR-INV-05 — Product matching (P0)**

The application must attempt to match extracted line items to existing products using available identifiers and product descriptions.

**FR-INV-06 — Match confidence (P0)**

The application must identify uncertain matches and allow manual resolution.

**FR-INV-07 — Review and correction (P0)**

The merchant must be able to review and correct extracted fields before confirmation.

**FR-INV-08 — Unmatched items (P0)**

The merchant must be able to associate an unmatched line item with an existing product or create a new product.

**FR-INV-09 — Duplicate invoice protection (P0)**

The application must detect likely duplicate invoices using available identifying information and warn the merchant before reprocessing.

**FR-INV-10 — Confirmation (P0)**

Inventory changes must occur only after explicit merchant confirmation.

**FR-INV-11 — Processing summary (P0)**

The application must display the number of products successfully updated and identify any failed or skipped items.

**FR-INV-12 — Invoice history (P1)**

The application should retain invoice processing records and their statuses so the merchant can review previous stock-receiving operations.

### 7.4 Inventory Management

**FR-STOCK-01 — Stock updates (P0)**

Confirmed invoice quantities must update the corresponding product stock.

**FR-STOCK-02 — Inventory visibility (P0)**

The merchant must be able to view current recorded stock quantities.

**FR-STOCK-03 — Stock movement consistency (P0)**

An invoice must not add the same quantity more than once because of repeated submissions, retries, or duplicate confirmation requests.

**FR-STOCK-04 — Inventory history (P1)**

The application should record stock changes with their source, timestamp, and associated transaction where available.

**FR-STOCK-05 — Low-stock visibility (P0)**

The application must identify products below an applicable reorder threshold when sufficient information exists.

**FR-STOCK-06 — Missing information (P0)**

The application must distinguish unknown stock quantities from a confirmed quantity of zero.

**FR-STOCK-07 — Manual correction (P1)**

The merchant should be able to correct stock quantities through an explicit inventory-adjustment workflow.

If manual adjustments are implemented, the application should record the reason and resulting change.

### 7.5 Barcode Management

**FR-BAR-01 — Barcode scanning (P0)**

The application must support scanning existing barcodes using a supported device camera or compatible scanner.

**FR-BAR-02 — Barcode lookup (P0)**

A recognised barcode must be matched against the store's product catalogue.

**FR-BAR-03 — Barcode assignment (P0)**

The merchant must be able to associate a valid barcode with a product when the association is unambiguous.

**FR-BAR-04 — Barcode generation (P0)**

The application must generate a barcode for products that require an identifier or label.

**FR-BAR-05 — Identifier uniqueness (P0)**

Generated internal barcode identifiers must not conflict with existing identifiers within the applicable store scope.

**FR-BAR-06 — Printable labels (P0)**

The application must generate a printable label layout containing the barcode and product identification.

**FR-BAR-07 — Existing barcode reuse (P0)**

Products with valid existing barcodes should not receive unnecessary replacement identifiers.

**FR-BAR-08 — Print failure handling (P1)**

The application should allow the merchant to retry label generation or printing without changing inventory.

### 7.6 Buying Copilot

**FR-BUY-01 — Reorder recommendations (P0)**

The application must recommend products for replenishment using available stock and sales data.

**FR-BUY-02 — Suggested quantities (P0)**

Each recommendation must include a suggested order quantity when sufficient data exists to calculate one.

**FR-BUY-03 — Recommendation explanation (P0)**

Each recommendation must show the available supporting information, such as current stock, recent sales, and the reorder threshold or calculation rule used.

**FR-BUY-04 — Editable suggestions (P0)**

The merchant must be able to modify a suggested quantity.

**FR-BUY-05 — Recommendation limitations (P0)**

When required inputs are missing or unreliable, the application must identify the limitation rather than presenting an unsupported quantity as authoritative.

**FR-BUY-06 — Recommendation refresh (P0)**

Recommendations must reflect the latest available stock and sales data when generated.

**FR-BUY-07 — Manual review (P0)**

The merchant must be able to accept or reject individual recommendations.

**FR-BUY-08 — No automatic purchasing (P0)**

Generating or accepting a recommendation must not independently place an order with a supplier.

**FR-BUY-09 — Natural-language query (P1)**

The merchant should be able to request recommendations using a query such as "What should I order today?"

The application may return approximately five prioritised products for the initial demonstration. This is a presentation choice, not a fixed maximum for the underlying recommendation system.

### 7.7 Purchase-Order Drafts

**FR-PO-01 — Draft creation (P0)**

The merchant must be able to create a purchase-order draft from approved reorder recommendations.

**FR-PO-02 — Draft editing (P0)**

The merchant must be able to edit products and quantities before finalising the draft.

**FR-PO-03 — Supplier association (P1)**

A draft may be associated with a supplier when sufficient supplier information exists.

**FR-PO-04 — Draft status (P0)**

The application must distinguish a draft from an approved, sent, or completed order.

**FR-PO-05 — No false delivery status (P0)**

The application must not mark a draft as sent or delivered unless the corresponding action or verified integration has occurred.

**FR-PO-06 — WhatsApp preparation (P1)**

The application should be able to prepare purchase-order text suitable for copying into WhatsApp.

**FR-PO-07 — Approval control (P0)**

The application must require explicit merchant approval before an external order is placed or transmitted.

### 7.8 Supplier Finder

**FR-SUP-01 — Supplier search (P1)**

The application should allow the merchant to find suppliers using available supplier records.

**FR-SUP-02 — Product association (P1)**

The application should associate supplier information with relevant products when a reliable match exists.

**FR-SUP-03 — Supplier comparison (P1)**

The application should display available comparison fields, such as price or availability, when those values are actually known.

**FR-SUP-04 — Data provenance (P1)**

The application must indicate whether supplier information is manually entered, imported, or verified through an integration.

**FR-SUP-05 — Purchase-order preparation (P1)**

The merchant should be able to prepare a purchase-order draft for a selected supplier.

**FR-SUP-06 — No fabricated availability (P0)**

Unknown supplier stock, prices, and delivery information must remain unknown rather than being generated by AI.

### 7.9 Sales Booster

**FR-MKT-01 — Product selection (P1)**

The merchant should be able to select a product for promotional content generation.

**FR-MKT-02 — Content generation (P1)**

The application should generate promotional text using available product details and merchant instructions.

**FR-MKT-03 — Promotion accuracy (P0)**

Generated content must not invent prices, discounts, expiry dates, product benefits, or stock availability.

**FR-MKT-04 — Editing and copying (P1)**

The merchant should be able to edit and copy generated content.

**FR-MKT-05 — Near-expiry products (P1)**

The application may identify products approaching expiry only when reliable expiry information exists.

**FR-MKT-06 — Slow-moving products (P1)**

The application may identify slow-moving products only when sufficient sales history exists to support the classification.

**FR-MKT-07 — No automatic publication (P0)**

Generated content must not be automatically published or sent to customers in the MVP.

### 7.10 Multilingual Assistance

**FR-LANG-01 — Language selection (P1)**

The application should provide a language selector for supported languages.

**FR-LANG-02 — Supported languages (P1)**

The intended languages are Hindi, Marathi, Gujarati, and English.

**FR-LANG-03 — Business-data preservation (P0)**

Language translation must not change numerical quantities, product identifiers, or transaction values.

**FR-LANG-04 — Fallback behaviour (P1)**

Unsupported interactions must produce a clear fallback message.

### 7.11 Billing and Sales Data Import

**FR-IMPORT-01 — Supported import format (P1)**

If import functionality is included, the application must support at least one explicitly defined catalogue or sales-export format.

**FR-IMPORT-02 — Validation (P1)**

The application must validate imported records and identify invalid rows before committing changes.

**FR-IMPORT-03 — Duplicate handling (P1)**

Repeated imports must not silently create duplicate products or duplicate sales records.

**FR-IMPORT-04 — Source tracking (P1)**

Imported data should retain its source and import timestamp.

**FR-IMPORT-05 — No assumed compatibility (P0)**

The application must not claim compatibility with every billing system. Supported formats must be documented.

---

## 8. User Stories and Acceptance Criteria

### 8.1 Invoice Processing

**US-01: Upload an invoice**

As a store owner, I want to upload a supplier invoice so that I can avoid manually entering every product.

Acceptance criteria:

- A supported file can be selected and uploaded.
- Invalid or unsupported files are rejected with a useful explanation.
- A valid upload receives a visible processing status.
- The merchant can identify which invoice is being processed.

**US-02: Review extracted products**

As a store owner, I want to review extracted line items so that incorrect AI results do not corrupt my inventory.

Acceptance criteria:

- Extracted line items appear in a review interface.
- Uncertain and unmatched items are identifiable.
- Editable fields can be corrected.
- The merchant can resolve unmatched items.
- No inventory changes occur before confirmation.

**US-03: Confirm stock receipt**

As a store owner, I want confirmed invoice quantities to update my stock so that the catalogue reflects received inventory.

Acceptance criteria:

- Confirmation applies each valid line item to the intended product.
- Repeated requests do not apply the same invoice twice.
- The application reports successful and unsuccessful updates.
- The merchant can identify the resulting stock changes.

### 8.2 Product and Barcode Management

**US-04: Find a product**

As a merchant, I want to search my product catalogue so that I can quickly locate an item.

Acceptance criteria:

- Search supports product names and applicable identifiers.
- No-match results are clearly communicated.
- The merchant can open a product record from the results.

**US-05: Reuse an existing barcode**

As a merchant, I want to use existing manufacturer barcodes where possible so that I avoid unnecessary relabelling.

Acceptance criteria:

- A recognised barcode can be associated with a product.
- Existing valid identifiers are retained.
- Ambiguous matches require merchant intervention.

**US-06: Print a new barcode**

As a merchant, I want to generate and print a label for an unbarcoded product.

Acceptance criteria:

- The merchant can initiate label generation.
- The generated identifier is unique within the applicable store scope.
- The label includes the product identity and barcode.
- Printing failure does not change inventory.

### 8.3 Purchasing

**US-07: View reorder recommendations**

As a merchant, I want to know which products need replenishment so that I can make informed purchasing decisions.

Acceptance criteria:

- Recommendations use available stock and sales data.
- Suggested quantities are displayed when calculable.
- Supporting data is visible.
- Missing data is clearly identified.

**US-08: Adjust an order**

As a merchant, I want to modify recommended quantities before preparing an order so that I retain control over purchasing.

Acceptance criteria:

- Suggested quantities are editable.
- The merchant can reject individual items.
- The draft reflects the final reviewed quantities.
- No external order is placed automatically.

**US-09: Prepare a purchase order**

As a merchant, I want to prepare a purchase-order draft so that I can communicate my requirements to a supplier.

Acceptance criteria:

- The draft includes the selected products and quantities.
- The merchant can review and edit the draft.
- Draft status is clearly displayed.
- Any external transmission requires explicit approval.

### 8.4 Supplier and Marketing Support

**US-10: Find an alternative supplier**

As a merchant, I want to search available supplier records so that I can investigate alternatives when my usual supplier cannot fulfil an order.

Acceptance criteria:

- The search uses available supplier information.
- Results do not fabricate prices or availability.
- Unknown fields are identified as unavailable.
- The merchant can use the selected supplier when preparing a draft.

**US-11: Generate promotional content**

As a merchant, I want to generate promotional content for a product so that I can market it with less effort.

Acceptance criteria:

- The merchant can select a product and generate content.
- The content is editable.
- Unsupported claims and invented discounts are not presented as facts.
- The merchant controls whether and where the content is published.

### 8.5 Access and Usability

**US-12: Access only authorised store data**

As a store owner, I want my inventory and invoices to remain private so that other users cannot access my business records.

Acceptance criteria:

- Protected routes require authentication.
- Store records are scoped to the authorised account or store.
- Unauthorised requests are rejected.
- Secrets are not exposed to the browser.

**US-13: Use the application on a phone**

As a merchant, I want to complete common tasks on a smartphone so that I can use ShelfSaathi while working in my shop.

Acceptance criteria:

- Primary workflows are usable on a mobile viewport.
- Essential actions are accessible without horizontal scrolling.
- Upload and scanning controls provide clear feedback.
- Forms remain usable with a mobile keyboard.

---

## 9. Pages and Screens

The following is the logical screen structure. Final navigation and visual design may be decided separately.

| Screen | Priority | Purpose | Principal Elements |
|---|---|---|---|
| Sign In | P0 | Authenticate the merchant. | Authentication form, validation, error messages. |
| Store Dashboard | P0 | Provide an overview of store activity. | Stock summary, recent invoice activity, low-stock information, quick actions. |
| Product Catalogue | P0 | Browse and search products. | Product list, search, stock quantities, product actions. |
| Add/Edit Product | P0 | Create or update a product. | Product details, identifiers, units, stock quantity. |
| Invoice Upload | P0 | Select and upload an invoice. | File selector, supported formats, upload status. |
| Invoice Review | P0 | Review AI-extracted information. | Invoice metadata, line items, match status, correction controls. |
| Stock Update Summary | P0 | Confirm the outcome of invoice processing. | Updated products, quantities, skipped items, errors. |
| Barcode Management | P0 | Scan, associate, and generate barcodes. | Scanner, lookup result, identifier assignment, label preview. |
| Label Preview/Print | P0 | Print barcode labels. | Label layout, print action, retry guidance. |
| Buying Copilot | P0 | Display reorder recommendations. | Suggested products, quantities, supporting data, selection controls. |
| Purchase-Order Draft | P0 | Review and prepare an order. | Selected products, quantities, supplier if known, draft status. |
| Supplier Finder | P1 | Find and compare available suppliers. | Search, supplier results, available comparison fields. |
| Sales Booster | P1 | Generate promotional content. | Product selection, generation controls, editable output. |
| Language Selection | P1 | Choose the interaction language. | Supported language options. |
| Import Data | P1 | Import supported catalogue or sales data. | File selection, validation results, import summary. |
| Invoice History | P1 | Review prior invoice processing operations. | Invoice list, processing status, timestamps. |
| Inventory History | P1 | Review historical stock changes. | Stock movement records and their sources. |
| Store Settings | P1 | Manage basic store information and preferences. | Store details, language preference, applicable settings. |

### 9.1 Navigation Requirements

- The primary navigation must make products, invoice processing, barcode management, and Buying Copilot easy to access.
- Secondary modules must not obstruct the core stock-receiving workflow.
- Navigation must work on mobile and desktop layouts.
- A merchant should be able to return from a completed workflow to the dashboard or relevant module.
- Unsaved changes should trigger an appropriate warning when navigating away.

**Assumption A-07:** A single responsive application with a shared navigation structure is sufficient. Separate applications for individual modules are not required.

---

## 10. Roles and Permissions

### 10.1 MVP Roles

| Role | Description | MVP Status |
|---|---|---|
| Store Owner | Owns the store workspace and controls inventory and purchasing. | Required |
| Store Employee | Performs permitted store operations without necessarily having purchasing authority. | Requires approval |
| Platform Administrator | Operates the application infrastructure and provides technical support. | Operational role; no general business-data access by default |

The MVP may initially implement only the Store Owner role if separate employee permissions would delay the core workflow.

### 10.2 Permission Matrix

| Action | Store Owner | Store Employee | Platform Administrator |
|---|---|---|---|
| View store dashboard | Allowed | If authorised | No default access |
| View products | Allowed | If authorised | No default access |
| Create/edit products | Allowed | If authorised | No default access |
| Upload invoices | Allowed | If authorised | No default access |
| Review extracted invoice data | Allowed | If authorised | No default access |
| Confirm inventory updates | Allowed | If authorised | No default access |
| Generate barcode labels | Allowed | If authorised | No default access |
| View reorder recommendations | Allowed | If authorised | No default access |
| Modify recommendations | Allowed | If authorised | No default access |
| Create purchase-order drafts | Allowed | If authorised | No default access |
| Approve external purchasing actions | Allowed | Owner approval required | No default access |
| Configure store settings | Allowed | Restricted | No default access |
| Manage platform infrastructure | No | No | Allowed |
| Access business data for support | Not applicable | Not applicable | Only through an explicitly authorised and controlled process |

### 10.3 Permission Rules

- Access must be enforced by the backend, not solely by hiding frontend controls.
- Store-owned data must be isolated between stores.
- AI services must receive only the data needed for the requested operation.
- The platform administrator role must not automatically imply unrestricted access to merchant business data.
- Employee-specific permissions are deferred until the team approves a multi-user MVP.

---

## 11. Data Requirements

### 11.1 General Data Principles

- Each business entity must have a stable identifier.
- Store-owned records must include a store or tenant association.
- Product quantities and monetary values must use appropriate data types and units.
- Missing values must not be silently converted to zero.
- Confirmed business transactions must be distinguishable from AI-generated drafts.
- Inventory changes must be attributable to their source.
- Sensitive credentials and integration secrets must not be stored in publicly accessible application data.
- Data relationships must preserve the ability to interpret historical transactions.

### 11.2 Core Entities

#### A. User

Represents an authenticated application user.

Required information:

- User identifier.
- Authentication-provider identifier or equivalent account reference.
- Account status where applicable.
- Creation timestamp.

#### B. Store

Represents a merchant's store workspace.

Required information:

- Store identifier.
- Store name.
- Owner reference.
- Preferred language.
- Creation timestamp.

**Assumption A-08:** A store record is required even if the MVP initially supports one store per account.

#### C. Product

Represents a product in the store catalogue.

Required information:

- Product identifier.
- Store identifier.
- Product name.
- Unit of measure.
- Current recorded stock quantity.
- Creation timestamp.
- Last updated timestamp.

Optional information:

- Barcode or product identifier.
- Category.
- Brand.
- Purchase price.
- Selling price.
- Reorder threshold.
- Expiry date, when relevant and known.
- Product status.

The application must not require expiry dates for products that do not have applicable expiry information.

#### D. Product Identifier

Represents an identifier associated with a product.

Potential fields:

- Identifier record ID.
- Product ID.
- Identifier type.
- Identifier value.
- Source or origin.
- Creation timestamp.

This entity may be implemented as a separate table or as part of the product model, depending on the selected schema.

Identifier values must be validated and protected against unintended duplicates within the applicable scope.

#### E. Supplier

Represents a supplier known to the store.

Potential fields:

- Supplier identifier.
- Store association or shared catalogue association.
- Supplier name.
- Contact information, when available.
- Address or location, when available.
- Data source.
- Last verified timestamp, when applicable.

The schema must not imply that a supplier's current availability or price is known merely because a supplier record exists.

#### F. Supplier Product Information

Represents a known relationship between a supplier and a product.

Potential fields:

- Supplier identifier.
- Product identifier.
- Known supplier product code.
- Recorded price, if available.
- Availability status, if available.
- Data source.
- Last updated or verified timestamp.

Live availability must remain unknown unless a reliable source provides it.

#### G. Invoice

Represents a supplier invoice uploaded for processing.

Required information:

- Invoice identifier.
- Store identifier.
- Uploading user reference.
- File reference or storage key.
- Processing status.
- Upload timestamp.
- Confirmation timestamp, when applicable.

Optional information:

- Supplier reference.
- Invoice number.
- Invoice date.
- Extracted invoice metadata.
- Extraction result reference.
- Duplicate-detection result.

Invoice file storage must use controlled access. Publicly accessible file URLs must not expose supplier invoices.

#### H. Invoice Line Item

Represents a product line extracted from an invoice.

Potential fields:

- Line-item identifier.
- Invoice identifier.
- Extracted product description.
- Matched product identifier, when available.
- Extracted quantity.
- Unit of measure.
- Unit price, when present.
- Line total, when present.
- Extraction confidence or match status.
- Merchant-corrected values.
- Confirmation status.

Extracted values and merchant-corrected values must remain distinguishable until the invoice is confirmed.

#### I. Inventory Movement

Represents a recorded stock change.

Required information:

- Movement identifier.
- Store identifier.
- Product identifier.
- Quantity change.
- Movement type.
- Source transaction reference.
- Timestamp.

Potential movement types include:

- Opening stock.
- Supplier invoice receipt.
- Manual adjustment.

The data model must support consistent stock updates and prevent a confirmed invoice from being applied repeatedly.

#### J. Sales Record

Represents a sale or an aggregated sales observation used for purchasing decisions.

Potential fields:

- Sales-record identifier.
- Store identifier.
- Product identifier.
- Quantity sold.
- Sale timestamp or reporting period.
- Data source.
- Import timestamp, when applicable.

The exact structure depends on whether the MVP receives transaction-level data or summary exports.

Sales data must not be fabricated to make recommendations appear more useful.

#### K. Reorder Recommendation

Represents an AI-assisted or rule-based purchasing suggestion.

Required information:

- Recommendation identifier.
- Store identifier.
- Product identifier.
- Recommended quantity, when calculable.
- Generation timestamp.
- Status.

Potential information:

- Current stock used in the calculation.
- Sales data or reporting period used.
- Reorder threshold.
- Calculation method.
- Explanation.
- Data limitations.

The application must be able to explain the recommendation using the inputs actually used.

#### L. Purchase Order

Represents a proposed or approved purchasing document.

Required information:

- Purchase-order identifier.
- Store identifier.
- Status.
- Creation timestamp.
- Creating user reference.

Optional information:

- Supplier identifier.
- Order line items.
- Quantities.
- Known prices.
- Merchant notes.
- Approval timestamp.
- Transmission status, when applicable.

The status model must distinguish drafts from orders actually transmitted to suppliers.

#### M. Purchase-Order Line Item

Represents a product included in a purchase order.

Required information:

- Line-item identifier.
- Purchase-order identifier.
- Product identifier.
- Quantity.

Optional information:

- Supplier product identifier.
- Unit price, when known.
- Recommendation reference.

#### N. Promotional Content

Represents content generated by Sales Booster.

Potential fields:

- Content identifier.
- Store identifier.
- Product reference.
- Generated content.
- Language.
- Creation timestamp.
- Status.

Generated content must remain distinguishable from published content. In the MVP, publication may occur outside ShelfSaathi.

### 11.3 Data Integrity Requirements

- Confirmed invoice processing must be idempotent.
- Product references must resolve to valid records.
- Purchase-order quantities must be positive and valid for the applicable unit.
- Stock changes must be applied consistently.
- Monetary values must use appropriate decimal precision.
- Duplicate product identifiers must be handled according to the identifier's type and scope.
- Deleted or archived products must not make historical invoices or inventory movements unintelligible.
- Concurrent updates must not silently overwrite newer stock values.
- A failed transaction must not leave the application reporting a successful complete update when only part of the operation succeeded.

### 11.4 Data Retention and Privacy

**Assumption A-09:** The initial product stores invoice files and processing records for operational review. The exact retention period requires approval.

The implementation must:

- Restrict access to uploaded invoices.
- Avoid logging invoice contents or sensitive business data unnecessarily.
- Store API credentials in server-side secret configuration.
- Provide a clear process for handling failed uploads and orphaned files.
- Define deletion and retention behaviour before production deployment.
- Follow applicable privacy and data-protection obligations.

---

## 12. Integrations

### 12.1 Proposed Technology Stack

The stack below follows the ShelfSaathi presentation.

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | User interface and interaction workflows. |
| Build tooling | Vite | Frontend development and build process. |
| Styling | Tailwind CSS | Responsive interface styling. |
| Language | JavaScript | Frontend application logic. |
| Backend | Python and FastAPI | Business logic, validation, and API endpoints. |
| Database | Supabase PostgreSQL | Structured application and business data. |
| AI and OCR | Gemini Vision or Claude Vision | Invoice understanding and selected language-model tasks. |
| Product matching | RapidFuzz | Approximate matching of extracted product descriptions. |
| Barcode scanning | ZXing | Barcode recognition. |
| Barcode generation | JsBarcode | Barcode rendering and label generation. |
| Frontend deployment | Vercel | Frontend hosting. |
| Backend deployment | Render | Backend hosting. |

**Decision requiring approval D-01:** Select one primary AI provider for the MVP. The presentation lists Gemini Vision and Claude Vision as alternatives; it does not require both.

### 12.2 AI and OCR Integration

The AI service is responsible for interpreting invoice content and returning structured information.

Requirements:

- Use a defined input and output contract.
- Validate extracted data before saving it as an application record.
- Handle missing or malformed fields.
- Avoid treating AI output as inherently correct.
- Display uncertain extraction results for merchant review.
- Keep API credentials server-side.
- Handle provider timeouts and rate limits.
- Avoid sending unnecessary merchant data to the provider.

The AI service must not directly execute unrestricted database changes. Confirmed business updates must pass through backend validation and the application's transaction workflow.

### 12.3 Product Matching Integration

RapidFuzz may be used to rank likely matches between invoice descriptions and existing product names.

Requirements:

- Prefer reliable identifiers when available.
- Use approximate text matching as a supporting mechanism.
- Do not automatically confirm ambiguous matches solely because one candidate ranks highest.
- Allow the merchant to resolve uncertain matches.
- Keep matching decisions separate from invoice extraction.

### 12.4 Database Integration

Supabase PostgreSQL is the primary structured data store.

Requirements:

- Access business data through a controlled backend or explicitly authorised database access pattern.
- Enforce appropriate access controls.
- Validate writes on the server.
- Protect store-owned data from cross-store access.
- Use transactional operations for inventory updates.
- Do not expose privileged database credentials to the frontend.

### 12.5 Barcode Integration

ZXing and JsBarcode provide scanning and barcode-generation capabilities.

Requirements:

- Support the barcode formats required by the selected products and demo.
- Handle camera permission denial.
- Provide a manual fallback when scanning is unavailable.
- Validate generated identifiers.
- Test generated labels using supported scanning hardware or a compatible camera.

**Assumption A-10:** The MVP supports the barcode formats selected for the demo. Universal compatibility with all retail barcode formats is not assumed.

### 12.6 Supplier and WhatsApp Integration

For the MVP, supplier information may come from manually maintained or curated records.

WhatsApp support may consist of preparing text that the merchant copies into WhatsApp.

Automated messaging, supplier APIs, and live price comparisons require separate integration decisions and are not assumed to exist.

### 12.7 Deployment and Configuration

- Frontend and backend deployments must be configured separately if required by the chosen hosting architecture.
- Development, testing, and production credentials must remain separate.
- Secrets must be configured through environment or secret-management facilities.
- Production builds must not contain development credentials.
- External-service failures must not expose internal stack traces to users.

---

## 13. Non-Functional Requirements

### 13.1 Usability

**NFR-UX-01**

The primary invoice-to-stock workflow must be understandable without technical training.

**NFR-UX-02**

The application must be responsive and usable on smartphone and desktop viewports.

**NFR-UX-03**

Primary actions, processing states, and validation errors must be clearly distinguishable.

**NFR-UX-04**

The interface must avoid requiring the merchant to re-enter information already extracted or available in the catalogue unless confirmation is necessary.

### 13.2 Performance

The following are proposed MVP targets, not measured results.

| Operation | Proposed Target |
|---|---|
| Ordinary application navigation | Responsive under normal network conditions, with a target of approximately 2 seconds for typical screen transitions. |
| Product catalogue retrieval | Target approximately 2 seconds for a typical store catalogue under normal conditions. |
| Barcode lookup | Target approximately 1 second after successful recognition, excluding camera startup. |
| Invoice extraction | Provide immediate processing feedback and a visible status; completion time depends on invoice complexity and AI-provider latency. |
| Reorder recommendations | Target approximately 3 seconds for a typical demo dataset, excluding external service delays where applicable. |

Performance must be measured against realistic data and hardware.

Invoice processing time must not be presented as guaranteed if the external AI service has unpredictable latency.

### 13.3 Reliability and Consistency

**NFR-REL-01**

Retries must not duplicate inventory movements or invoice processing.

**NFR-REL-02**

The application must clearly distinguish completed, pending, partially failed, and failed operations.

**NFR-REL-03**

Inventory updates must use consistent transactional behaviour.

**NFR-REL-04**

External service failures must not corrupt previously confirmed records.

**NFR-REL-05**

A merchant must be able to retry recoverable operations without unknowingly repeating their business effect.

### 13.4 Security

**NFR-SEC-01**

Protected application operations must require appropriate authentication.

**NFR-SEC-02**

Store data must be isolated between authorised tenants.

**NFR-SEC-03**

Server-side secrets must not be exposed in frontend bundles or client-visible responses.

**NFR-SEC-04**

Uploaded files must be validated and stored with appropriate access controls.

**NFR-SEC-05**

Backend endpoints must validate inputs and enforce permissions.

**NFR-SEC-06**

Error responses must not expose credentials, internal stack traces, or unnecessary business data.

**NFR-SEC-07**

External AI and supplier integrations must use controlled server-side access where credentials are involved.

### 13.5 Maintainability

**NFR-MAINT-01**

The application should separate user-interface logic, backend business rules, database access, and external-service integrations.

**NFR-MAINT-02**

The invoice extraction provider should be replaceable without rewriting unrelated inventory functionality.

**NFR-MAINT-03**

Core business rules, particularly stock updates and duplicate protection, must be testable independently of AI providers.

**NFR-MAINT-04**

Configuration values and secrets must not be hardcoded into application logic.

### 13.6 Accessibility

**NFR-ACC-01**

Primary controls must have clear labels and visible interaction states.

**NFR-ACC-02**

Colour must not be the only means of communicating errors, confidence, or status.

**NFR-ACC-03**

Forms and navigation should support standard keyboard interaction.

**NFR-ACC-04**

Text and controls should remain legible on common smartphone displays.

### 13.7 Observability

**NFR-OBS-01**

The backend should record operational events sufficient to diagnose failed invoice processing, AI requests, and inventory updates.

**NFR-OBS-02**

Logs must avoid unnecessary invoice contents, credentials, and sensitive data.

**NFR-OBS-03**

Errors from external providers must be distinguishable from application validation and database errors.

**NFR-OBS-04**

The application should associate processing events with an invoice or request identifier where appropriate.

### 13.8 Scalability

The MVP should support the expected demonstration dataset and a small number of pilot merchants without requiring distributed systems or complex infrastructure.

The initial architecture should prioritise correctness, simplicity, and maintainability.

Horizontal scaling, background-job infrastructure, advanced caching, and large-scale multi-region deployment are not MVP requirements.

---

## 14. Loading, Empty, Success, and Error States

Every primary workflow must provide explicit feedback. A blank screen or an indefinitely spinning indicator is not an acceptable result.

### 14.1 Authentication

| State | Required Behaviour |
|---|---|
| Loading | Show a clear sign-in or session-loading indicator. |
| Empty | Display required fields and validation guidance. |
| Success | Open the authorised store workspace. |
| Error | Explain invalid credentials, expired sessions, or service unavailability without exposing internal details. |

### 14.2 Product Catalogue

| State | Required Behaviour |
|---|---|
| Loading | Display a loading indicator or product-list skeleton. |
| Empty | Explain that no products exist and provide an Add Product action. |
| No search results | Explain that no products match the query and allow the merchant to clear or modify the search. |
| Success | Display products and available stock information. |
| Error | Preserve the user's search input and offer retry where appropriate. |

### 14.3 Invoice Upload and Processing

| State | Required Behaviour |
|---|---|
| No file selected | Explain which file types are supported and how to upload an invoice. |
| Uploading | Display progress when available and prevent accidental duplicate submissions. |
| Invalid file | Explain the file validation failure and accepted formats. |
| Processing | Display an explicit processing status. |
| Extraction complete | Open the invoice review interface. |
| Partial extraction | Display extracted fields and identify missing or uncertain information. |
| No usable line items | Explain that the invoice could not be interpreted and offer retry or manual entry. |
| Provider failure | Explain that extraction failed and provide a retry path. |
| Duplicate suspected | Warn the merchant and require an explicit decision before reprocessing. |
| Confirmation pending | Clearly identify that the inventory has not yet been updated. |
| Success | Display a summary of stock updates. |
| Partial update failure | Identify affected items and report the actual completion state. |
| Network failure | Preserve recoverable review information where feasible and avoid automatically repeating a stock update. |

### 14.4 Product Matching

| State | Required Behaviour |
|---|---|
| Match found | Display the proposed product association. |
| Low-confidence match | Flag the association for review. |
| Multiple candidates | Allow the merchant to select the correct product. |
| No match | Allow creation of a product or selection of an existing one. |
| Matching service failure | Allow manual product selection rather than blocking the entire workflow unnecessarily. |

### 14.5 Barcode Management

| State | Required Behaviour |
|---|---|
| Camera starting | Show a camera initialisation state. |
| Permission denied | Explain the permission requirement and provide manual lookup where possible. |
| Barcode recognised | Display the identifier and matching product. |
| Barcode not found | Explain that no matching product exists in the current catalogue. |
| Invalid or unsupported barcode | Provide a clear recognition or validation error. |
| Label ready | Display the label preview and print action. |
| Print failure | Explain the failure and allow another attempt. |
| Unsupported device | Offer a compatible manual workflow where available. |

### 14.6 Buying Copilot

| State | Required Behaviour |
|---|---|
| Loading | Show that recommendations are being calculated. |
| No products need reordering | Explain that no products currently meet the available reorder criteria. |
| Insufficient data | Identify which inputs are missing and why recommendations are limited. |
| Success | Display recommendations, quantities, and supporting information. |
| Invalid recommendation | Suppress unsupported quantities and identify the issue. |
| Service failure | Explain the failure and offer retry. |
| No selection | Explain how to select recommendations for a draft. |
| Draft creation success | Display the created purchase-order draft. |

### 14.7 Supplier Finder

| State | Required Behaviour |
|---|---|
| Loading | Indicate that supplier information is being retrieved. |
| No supplier records | Explain that no supplier information is available. |
| No matching supplier | Explain that no relevant match was found. |
| Partial supplier data | Display known information and mark missing values as unknown. |
| Search failure | Offer retry and preserve the search query. |

### 14.8 Sales Booster

| State | Required Behaviour |
|---|---|
| No product selected | Ask the merchant to select a product. |
| Generating | Indicate that content is being generated. |
| Success | Display editable promotional content. |
| Missing product information | Ask for necessary information or avoid unsupported claims. |
| Generation failure | Explain the failure and offer retry. |
| Unsaved changes | Warn before discarding edited content when appropriate. |

### 14.9 General Error Handling

- User-facing errors must be concise and actionable.
- Technical details should be available in controlled logs rather than exposed to users.
- Retry controls must not repeat non-idempotent business actions unintentionally.
- Network failures must not be represented as successful writes.
- Empty states must explain the next useful action.
- All asynchronous actions must provide visible feedback.
- Destructive or consequential actions must require appropriate confirmation.

---

## 15. AI Behaviour and Guardrails

AI is a supporting capability, not the authority for confirmed business records.

### 15.1 Invoice Extraction

- Extract only information supported by the invoice.
- Represent uncertain or unreadable fields as uncertain or missing.
- Do not invent quantities, prices, dates, or product identifiers.
- Preserve the distinction between extracted and merchant-corrected values.
- Require merchant confirmation before stock changes.

### 15.2 Product Matching

- Prefer reliable identifiers over approximate names.
- Use fuzzy matching to identify candidates, not to guarantee identity.
- Escalate ambiguous matches to the merchant.
- Do not merge products automatically based solely on similar names.

### 15.3 Reorder Recommendations

- Use the latest available stock and sales records.
- Identify the inputs and rules behind each recommendation.
- Do not fabricate historical sales or supplier information.
- Explain when missing data limits recommendation quality.
- Keep the recommendation separate from the purchase-order draft and external order.

### 15.4 Supplier and Marketing Assistance

- Do not invent supplier availability, prices, discounts, or delivery dates.
- Do not create promotional claims unsupported by product data or merchant input.
- Do not send messages or place orders without explicit approval.
- Treat AI-generated text as a draft for merchant review.

### 15.5 Operational Safety

- Validate AI outputs before storing or acting on them.
- Apply standard backend permissions to all AI-triggered operations.
- Do not allow model output to bypass stock-update or purchasing safeguards.
- Record the source and status of consequential business changes.

---

## 16. Inventory and Reorder Logic

The initial product should use understandable, testable rules rather than an unnecessarily sophisticated forecasting system.

### 16.1 Stock Calculation

The application must maintain a consistent representation of recorded stock.

At a minimum:

- Opening stock establishes the initial recorded quantity.
- Confirmed supplier receipts increase stock.
- Explicit inventory adjustments modify stock.
- Repeated processing of the same confirmed invoice must not duplicate the receipt.

Sales-based stock deductions may be implemented only if the application receives reliable sales data and the applicable workflow is defined.

**Decision requiring approval D-02:** Determine whether MVP inventory updates include only received stock and manual adjustments, or also automatically incorporate imported sales.

### 16.2 Reorder Recommendations

A recommendation should use available information such as:

- Current recorded stock.
- Merchant-defined reorder threshold, if present.
- Recent sales quantities, if available.
- A defined sales reporting period.
- Existing purchase-order information, if available and reliable.

The application must document the actual rule used to calculate a suggested quantity.

**Decision requiring approval D-03:** Select the initial reorder rule.

The simplest acceptable starting point is a threshold-based recommendation using current stock and a merchant-defined reorder threshold. Suggested quantities should be generated only when a defensible quantity rule is available.

Historical demand forecasting is not required for the MVP.

### 16.3 Missing or Incomplete Data

If sales history is unavailable:

- The application must not fabricate demand.
- It may use a configured stock threshold to identify low-stock products.
- It must identify that the recommendation is threshold-based rather than sales-forecast-based.

If no suitable threshold or quantity rule exists, the application should request merchant input rather than generate a misleading order quantity.

### 16.4 Recommendation Explainability

Each recommendation must make it possible for the merchant to understand:

1. Which product is being recommended.
2. Its current recorded stock.
3. Which sales or threshold data was used.
4. How the suggested quantity was determined.
5. Which important information is unavailable.

---

## 17. Business Model

The proposed business model, as described in the ShelfSaathi presentation, includes:

- Freemium SaaS access.
- Paid subscriptions per store.
- One-time onboarding and data-import fees.
- Potential future supplier lead-generation or order commissions.

These are proposed revenue streams, not confirmed pricing decisions.

Pricing, subscription limits, billing integrations, and commission arrangements are outside the MVP implementation scope unless separately approved.

---

## 18. MVP Acceptance Criteria

The MVP is considered functionally complete when the following conditions are met.

### 18.1 Core Workflow

- [ ] A merchant can authenticate and access the correct store workspace.
- [ ] The merchant can create and search products.
- [ ] The merchant can upload a supported supplier invoice.
- [ ] The application extracts structured line items from a supported invoice.
- [ ] Extracted products can be matched against existing catalogue records.
- [ ] Uncertain and unmatched products can be resolved manually.
- [ ] The merchant can review and correct extracted information.
- [ ] Inventory changes require explicit confirmation.
- [ ] Confirming an invoice updates the intended products.
- [ ] Repeating the same confirmation does not add the same stock twice.
- [ ] The application reports the outcome of the inventory update.

### 18.2 Barcode Workflow

- [ ] A supported existing barcode can be scanned or entered manually.
- [ ] A recognised barcode can be matched to a product.
- [ ] The application can generate a barcode for an unbarcoded product.
- [ ] Generated identifiers are unique within the applicable scope.
- [ ] The application can render a printable label.
- [ ] Label generation and printing do not change inventory quantities.

### 18.3 Buying Copilot

- [ ] The application can identify reorder candidates from available data.
- [ ] Recommendations include a suggested quantity when sufficient information exists.
- [ ] Supporting data and calculation rules are visible.
- [ ] Missing data is identified.
- [ ] Recommendations can be reviewed and modified.
- [ ] A merchant can create a purchase-order draft from selected recommendations.
- [ ] Draft quantities match the merchant's reviewed quantities.
- [ ] No external order is placed automatically.

### 18.4 Security and Reliability

- [ ] Protected routes require authentication.
- [ ] Store-owned data is isolated.
- [ ] Secrets remain server-side.
- [ ] Upload failures and AI-provider failures are handled.
- [ ] Database errors do not produce false success messages.
- [ ] Stock updates are protected against duplicate execution.
- [ ] Loading, empty, success, and error states are implemented for the primary workflow.

### 18.5 Demonstration Readiness

- [ ] A realistic sample invoice can be processed end to end.
- [ ] The demo includes existing and previously unregistered products.
- [ ] At least one product demonstrates existing-barcode reuse.
- [ ] At least one product demonstrates new-label generation.
- [ ] The Buying Copilot produces explainable recommendations from the available sample data.
- [ ] The merchant can review recommendations and prepare a purchase-order draft.
- [ ] The workflow can be demonstrated without relying on fabricated success messages or hidden manual database changes.

---

## 19. Success Metrics

The following metrics should be used to evaluate the MVP. Targets are provisional and must be validated.

### 19.1 Operational Metrics

| Metric | Definition | Initial Evaluation |
|---|---|---|
| Invoice processing completion rate | Percentage of supported test invoices that reach a completed review and confirmation workflow. | Measure across a representative test set. |
| Invoice extraction accuracy | Percentage of extracted fields that match verified invoice data. | Evaluate product descriptions, quantities, and other applicable fields separately. |
| Product matching accuracy | Percentage of automatically proposed matches that identify the correct product. | Measure against manually verified matches. |
| Duplicate-processing prevention | Whether repeated confirmation requests produce duplicate inventory movements. | Zero duplicate movements in defined idempotency tests. |
| Inventory update correctness | Percentage of confirmed invoice line items that produce the expected stock change. | Validate against expected transaction results. |
| Reorder recommendation validity | Percentage of recommendations supported by the configured rule and available source data. | Validate against a manually calculated baseline. |
| Label generation success | Percentage of supported products for which a valid printable barcode label is generated. | Test using the selected barcode formats and print layout. |

### 19.2 Merchant Value Metrics

| Metric | Definition | Initial Evaluation |
|---|---|---|
| Invoice-to-stock completion time | Time from invoice upload to completed inventory update. | Compare ShelfSaathi against manual processing for the same invoices. |
| Manual correction burden | Number of extracted fields or matches requiring merchant correction. | Track by invoice and supplier format. |
| Recommendation usefulness | Whether merchants consider the proposed reorder list relevant and actionable. | Evaluate during supervised merchant testing. |
| Workflow completion rate | Percentage of merchants who complete the invoice-to-reorder journey without assistance. | Test with representative users. |
| Merchant feedback | Qualitative assessment of usefulness, clarity, and trust. | Collect after hands-on testing. |

### 19.3 Initial Performance Hypothesis

The presentation proposes reducing stock setup for approximately 200 items from 1–2 hours to around 10 minutes.

This must be treated as a hypothesis, not a success claim.

A valid test should:

1. Use comparable invoice sizes and product catalogues.
2. Measure the complete workflow, including review and correction.
3. Include the time needed to resolve unmatched products.
4. Compare the results against a documented manual baseline.
5. Record failures and cases requiring substantial intervention.

No business-impact claim should be presented as measured until the corresponding evidence exists.

---

## 20. Testing Requirements

### 20.1 Unit Testing

Test:

- Product validation.
- Product matching rules.
- Stock calculations.
- Reorder calculations.
- Barcode identifier uniqueness.
- Invoice duplicate detection.
- Purchase-order quantity validation.
- Permission checks.

### 20.2 Integration Testing

Test:

- Frontend-to-backend API interactions.
- Backend-to-database operations.
- AI extraction responses.
- AI-provider failure handling.
- Barcode scanning and generation.
- Invoice confirmation and stock updates.
- Purchase-order draft creation.

### 20.3 End-to-End Testing

At minimum, validate these scenarios:

1. Upload a valid invoice and confirm all correctly matched products.
2. Upload an invoice containing an unmatched product and create the product.
3. Correct an incorrect extracted quantity before confirmation.
4. Attempt to process the same invoice twice.
5. Process an invoice with missing or unreadable fields.
6. Generate and print a barcode label.
7. Request reorder recommendations with sufficient data.
8. Request recommendations when sales history is unavailable.
9. Modify suggested quantities and create a purchase-order draft.
10. Simulate an AI-provider or network failure.
11. Verify that one store cannot access another store's records.
12. Verify that a failed transaction does not leave inconsistent stock values.

### 20.4 Test Data

The demo dataset should include:

- Products with existing barcodes.
- Products without barcodes.
- Existing catalogue products that can be matched to invoice items.
- At least one new product.
- Products with different units of measure.
- Products with sufficient data for reorder recommendations.
- Products with insufficient data for reliable recommendations.
- Representative invoice images from supported formats.

Test fixtures must be clearly separated from real merchant records.

---

## 21. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Poor invoice image quality | Incorrect or incomplete extraction. | Validate input quality, flag uncertain fields, and allow manual correction. |
| Similar product names | Incorrect product matching. | Prefer identifiers and require review for ambiguous matches. |
| Duplicate invoice processing | Inflated inventory quantities. | Implement duplicate detection and idempotent confirmation. |
| Missing sales history | Weak reorder recommendations. | Use explicit thresholds where available and disclose data limitations. |
| Incorrect supplier information | Poor purchasing decisions. | Track data sources and distinguish unknown from verified values. |
| AI-provider outage | Invoice processing or content generation becomes unavailable. | Provide clear errors and retry paths; keep core business records independent of provider availability. |
| Poor mobile camera compatibility | Barcode scanning becomes unreliable. | Provide manual barcode entry as a fallback. |
| Excessive MVP scope | Core workflow remains unfinished. | Prioritise P0 requirements and defer secondary modules. |
| Inaccurate business-impact claims | Reduced trust and misleading evaluation. | Measure performance in merchant pilots before claiming improvements. |
| Inconsistent stock updates | Incorrect purchasing recommendations. | Use transactional updates, idempotency, and integrity tests. |
| Unauthorised data access | Exposure of merchant information. | Enforce backend permissions and tenant isolation. |

---

## 22. Decisions Requiring Approval

The following decisions are intentionally unresolved. The coding agent must not silently make consequential product decisions where they affect business behaviour.

| ID | Decision | Proposed Default | Why It Matters |
|---|---|---|---|
| D-01 | Primary AI provider | Select either Gemini Vision or Claude Vision. | Determines integration and configuration. |
| D-02 | Source of inventory deductions | Initially track confirmed receipts and explicit adjustments; add sales deductions only if reliable data is available. | Determines whether recorded stock represents received stock or calculated on-hand stock. |
| D-03 | Reorder calculation | Start with a configurable threshold-based rule. | Prevents unsupported forecasting assumptions. |
| D-04 | Account and store model | One store per account for the MVP. | Simplifies access control and data relationships. |
| D-05 | Employee accounts | Defer unless required for the demonstration. | Adds authentication and permission complexity. |
| D-06 | Invoice file formats | Support a defined set of image and document formats. | Affects upload validation and extraction reliability. |
| D-07 | Barcode formats | Select formats appropriate for the demo's products. | Affects scanning and printing compatibility. |
| D-08 | Product unit handling | Require explicit units and avoid implicit conversions. | Prevents incorrect stock quantities. |
| D-09 | Supplier dataset | Use curated sample data if live supplier information is unavailable. | Determines the reliability of Supplier Finder. |
| D-10 | WhatsApp workflow | Copyable message text without automated transmission. | Avoids external messaging integration during the MVP. |
| D-11 | Language coverage | Prioritise the agreed core workflows and supported languages. | Determines translation and testing scope. |
| D-12 | Invoice retention | Retain records for operational review; define a specific retention period before production. | Affects storage costs and privacy obligations. |
| D-13 | Sales data import | Support a defined format only if included in the MVP. | Determines the reliability of sales-based recommendations. |
| D-14 | Purchase-order status | Distinguish draft, approved, and transmitted states. | Prevents the UI from implying an order was sent when it was not. |
| D-15 | Product deletion | Prefer archiving when historical records exist. | Preserves transaction history. |

### Implementation Rule for Unresolved Decisions

The coding agent should:

1. Follow explicitly approved decisions.
2. Use the proposed default for low-risk implementation details.
3. Record assumptions in the relevant technical documentation.
4. Avoid implementing unapproved integrations that materially increase scope.
5. Avoid inventing business rules for inventory, purchasing, or data retention.
6. Keep components replaceable when a provider or implementation choice remains open.

---

## 23. MVP Delivery Plan

The recommended implementation order is based on dependencies, not on the visual prominence of individual features.

### Phase 1: Application Foundation

Deliver:

- Frontend and backend application structure.
- Authentication.
- Store-scoped data access.
- Database schema.
- Product catalogue.
- Basic navigation and responsive layout.

**Exit criterion:** An authenticated merchant can manage products in an isolated store workspace.

### Phase 2: Invoice-to-Stock Workflow

Deliver:

- Invoice upload.
- AI extraction integration.
- Structured extraction validation.
- Product matching.
- Review and correction interface.
- Merchant confirmation.
- Transactional stock updates.
- Duplicate-processing protection.
- Processing status and error handling.

**Exit criterion:** A supported invoice can be processed end to end without duplicate or unintended inventory updates.

### Phase 3: Barcode Management

Deliver:

- Barcode scanning.
- Product lookup.
- Barcode assignment.
- Barcode generation.
- Printable labels.

**Exit criterion:** Existing identifiers can be reused, and products requiring new labels can receive printable barcodes.

### Phase 4: Buying Copilot

Deliver:

- Stock and sales-data retrieval.
- Initial reorder rules.
- Suggested quantities where calculable.
- Recommendation explanations.
- Merchant review and quantity editing.
- Purchase-order drafts.

**Exit criterion:** A merchant can move from current inventory to an explainable, editable purchase-order draft.

### Phase 5: Demo Readiness

Deliver:

- Realistic sample data.
- End-to-end testing.
- Mobile workflow validation.
- Error-state testing.
- Performance checks.
- Deployment configuration.
- Demonstration script.

**Exit criterion:** The complete invoice-to-reorder workflow can be demonstrated reliably.

### Phase 6: Secondary Features

Implement, if time permits:

- Supplier Finder.
- Sales Booster.
- Multilingual enhancements.
- Billing-data import.
- Invoice and inventory history.

These features must not compromise the completion or reliability of the core workflow.

---

## 24. Definition of Done

A feature is complete only when:

- Its stated functional requirements are implemented.
- Its primary success and failure states are handled.
- Inputs are validated.
- Access permissions are enforced.
- Relevant automated tests pass.
- Data integrity is preserved.
- The interface works at the intended mobile and desktop sizes.
- No unsupported business behaviour is implied.
- Relevant documentation is updated.
- The feature has been tested against realistic data.

A visually complete screen is not sufficient if the underlying business operation is missing or simulated without being explicitly identified.

---

## 25. Source of Truth and Change Management

This PRD defines the intended product behaviour for ShelfSaathi.

When implementing the product:

1. Treat the approved PRD as the primary source of truth for product scope and expected behaviour.
2. Treat the approved architecture and technical specifications as the source of truth for implementation details.
3. Do not silently change business rules, permissions, data semantics, or external side effects.
4. Identify contradictions between documents instead of choosing an arbitrary interpretation.
5. Record approved changes in the relevant document.
6. Keep implemented functionality, mocked functionality, and planned functionality distinguishable.
7. Do not claim that an integration works unless it has been implemented and tested.
8. Do not claim performance improvements or business outcomes without supporting measurements.

### Final Product Definition

ShelfSaathi's MVP is a merchant-controlled inventory and purchasing assistant that converts supplier invoices into confirmed stock updates, supports practical barcode management, and produces explainable reorder recommendations with editable purchase-order drafts.

The primary objective is to make this workflow accurate, usable, and demonstrable before expanding into supplier discovery, promotional automation, and more advanced AI capabilities.