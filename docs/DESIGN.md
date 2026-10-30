# DESIGN.md

## 1. Purpose

This document defines the product's visual design system and user experience rules. It is the single source of truth for implementing the interface. Use this document alongside `PRD.md`:
 - `PRD.md` defines what the product must do. 
 - `DESIGN.md` defines how the product should look, feel, and behave.

When a requirement is unclear, do not invent a major feature or interaction. Record the assumption and request approval where necessary.

## 2. Design Direction

### Visual principles

1.  **Clarity first** --- prioritise the user's primary task on every screen.
2.  **Calm and focused** --- use a restrained palette, clear hierarchy, and sufficient whitespace.
3.  **Consistent patterns** --- similar actions and states should behave and look alike throughout the product.
4.  **Progressive disclosure** --- show essential information first; reveal secondary detail when needed.
5.  **Useful feedback** --- make loading, success, validation, and failure states visible.
6.  **Accessible by default** --- support keyboard use, readable
    contrast, and assistive technology.
7.  **Responsive by design** --- preserve task completion on small
    screens rather than simply shrinking desktop layouts.

### Overall aesthetic

Use a clean, modern product interface with: 
- Light neutral page backgrounds. 
- White or near-white surfaces.
- A restrained blue primary accent. 
- Strong text contrast. 
- Subtle borders and restrained shadows. 
- Rounded corners used consistently. 
- Minimal decoration; avoid gradients, excessive glass effects, and ornamental motion unless
the product requirements explicitly call for them.

The palette below is a proposed default. Confirm it against any established brand direction before treating it as final.

## 3. Typography

### Typeface

**Outfit is the only typeface used throughout the product.**

Use Outfit for headings, body copy, labels, navigation, buttons, tables,
helper text, numeric values, and all other interface text. Do not
introduce a secondary font. Establish hierarchy through font size,
weight, line height, letter spacing, and colour.

Load only the weights needed by the interface and provide a sensible
sans-serif fallback if Outfit cannot load.

### Type scale

| Token | Suggested size | Weight | Line height | Intended use |
| --- | --- | --- | --- | --- |
| `display` | 36 px | 600--700 | 1.15 | Rare, prominent page-level heading |
| `h1` | 30 px | 600--700 | 1.2 | Main page title |
| `h2` | 24 px | 600 | 1.25 | Major section heading |
| `h3` | 20 px | 600 | 1.3 | Card or subsection heading |
| `h4` | 16 px | 600 | 1.4 | Compact section heading |
| `body-lg` | 16 px | 400--500 | 1.5 | Introductory or prominent body copy |
| `body` | 14 px | 400 | 1.5 | Default interface text |
| `body-sm` | 13 px | 400 | 1.45 | Secondary information |
| `label` | 13 px | 500--600 | 1.35 | Form labels and compact labels |
| `caption` | 12 px | 400--500 | 1.4 | Helper text, timestamps, metadata |
| `button` | 14 px | 600 | 1.2 | Button text |
| `numeric` | Contextual | 500--700 | 1.2 | Metrics and tabular numbers |

These values are starting points, not a reason to create one-off sizes.
Use the same typographic role consistently across screens.

### Typography rules

-   Use sentence case for headings, buttons, labels, and navigation.
-   Avoid long passages in all caps.
-   Use weight and spacing sparingly; do not make every label bold.
-   Keep body text comfortably readable and avoid overly tight line
    heights.
-   Use tabular numerals for columns of numbers when supported.
-   Do not rely on colour alone to establish hierarchy or meaning.

## 4. Colour System

### Proposed palette

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#F8FAFC` | Application page background |
| `surface` | `#FFFFFF` | Cards, panels, menus, dialogs |
| `surface-muted` | `#F1F5F9` | Subtle secondary surfaces |
| `border` | `#E2E8F0` | Default borders and dividers |
| `border-strong` | `#CBD5E1` | Stronger boundaries and input borders |
| `text-primary` | `#0F172A` | Main text and headings |
| `text-secondary` | `#475569` | Secondary text |
| `text-muted` | `#64748B` | Metadata and supporting text |
| `primary` | `#2563EB` | Primary actions, links, active states |
| `primary-hover` | `#1D4ED8` | Hover state for primary actions |
| `primary-subtle` | `#EFF6FF` | Selected and highlighted backgrounds |
| `success` | `#15803D` | Successful outcomes |
| `success-subtle` | `#F0FDF4` | Success backgrounds |
| `warning` | `#B45309` | Warnings and attention states |
| `warning-subtle` | `#FFFBEB` | Warning backgrounds |
| `danger` | `#B91C1C` | Errors and destructive actions |
| `danger-subtle` | `#FEF2F2` | Error backgrounds |
| `info` | `#0369A1` | Informational messages |
| `info-subtle` | `#F0F9FF` | Informational backgrounds |
| `disabled` | `#94A3B8` | Disabled controls where appropriate |

### Colour rules

-   Use the primary colour for the main action, active navigation,
    links, and focused selections.
-   Do not make every button or interactive element primary blue.
-   Use semantic colours only when their meaning applies.
-   Pair semantic colour with a label, icon, or other text cue.
-   Check contrast for all foreground/background combinations, including
    hover, focus, disabled, and error states.
-   Do not use colour as the only way to communicate status.
-   If a brand palette exists, map these semantic tokens to approved
    brand colours rather than scattering raw colour values through the
    interface.

## 5. Spacing, Layout, and Surfaces

### Spacing scale

Use a 4 px base spacing unit.

| Token | Value |
| --- | --- |
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

Prefer the defined scale over arbitrary values. Small optical
adjustments are acceptable when needed for alignment.

### Layout rules

-   Use a clear page hierarchy: application navigation, page header,
    primary content, and contextual actions.
-   Align related content to a shared grid.
-   Keep the main task visually dominant.
-   Group related controls and information together.
-   Avoid excessive card nesting.
-   Keep forms and reading-heavy content at a comfortable width.
-   Use a consistent page gutter and adjust it at responsive
    breakpoints.
-   Let content determine height; avoid fixed heights that clip user
    data.
-   Use sticky positioning only when it materially helps navigation or
    task completion.

### Surfaces and borders

| Property | Default |
| --- | --- |
| Card background | `surface` |
| Card border | 1 px solid `border` |
| Card radius | 12 px |
| Input radius | 8 px |
| Button radius | 8 px |
| Dialog radius | 16 px |
| Small badge radius | 6 px or pill where appropriate |
| Shadow | Subtle, reserved for elevated elements |

Use borders and spacing as the primary grouping mechanisms. Shadows
should communicate elevation, not decoration.

## 6. Iconography and Imagery

-   Use one consistent icon family throughout the interface.
-   Prefer simple, recognisable line icons with consistent stroke
    weight.
-   Use icons to support text, not replace important labels.
-   Icon-only controls must have accessible names and a clear tooltip
    where useful.
-   Do not mix emoji, unrelated icon packs, and decorative illustrations
    as interface iconography.
-   Use imagery only when it supports the product task or communicates
    useful information.
-   Provide meaningful alternative text for informative images; use
    empty alternative text for purely decorative images.

## 7. Navigation

### Navigation principles

-   Make the current location obvious.
-   Use consistent labels across navigation, page titles, and actions.
-   Keep primary navigation focused on the product's core destinations.
-   Group secondary or administrative destinations separately where
    appropriate.
-   Preserve navigation state when it helps users return to their
    previous context.
-   Avoid hiding essential actions behind hover-only interactions.
-   On small screens, use a compact navigation pattern that remains
    discoverable and keyboard accessible.

### Active and interactive states

Navigation items should support:

- Default
- Hover
- Keyboard focus
- Active/current
- Disabled, when applicable

The active state should be indicated with more than a subtle colour
change where necessary, such as a background, indicator, or weight
change.

## 8. Component Standards

Build reusable components rather than implementing each screen
independently. Reuse should preserve consistent behaviour,
accessibility, and visual states.

### Buttons

Variants:

- **Primary:** the main action for the current context.
- **Secondary:** a supporting action with clear boundaries.
- **Tertiary/ghost:** a low-emphasis action.
- **Danger:** destructive or high-risk actions.
- **Link:** navigation or inline actions.

Rules:

- Use concise, verb-led labels.
- One primary action should normally dominate a page or dialog.
- Provide hover, focus, pressed, disabled, and loading states.
- Prevent accidental repeated submission while an action is processing.
- Do not communicate destructive meaning through colour alone.
- Do not use vague labels such as "OK" when a specific action label is possible.

### Forms and inputs

-   Place a persistent label above or beside each input.
-   Use placeholder text only for examples or supplementary hints, never
    as the only label.
-   Keep helper text near the relevant field.
-   Show validation errors next to the relevant field and associate them
    programmatically.
-   Preserve valid user-entered data when submission fails.
-   Validate at the appropriate time; avoid displaying errors before the
    user has had a reasonable chance to complete a field.
-   Use input types and autocomplete attributes appropriate to the data.
-   Clearly distinguish required and optional fields.
-   Use suitable controls for the task rather than defaulting every
    input to a text field.
-   Group long forms into logical sections.
-   Warn before discarding meaningful unsaved changes.

### Cards and panels

-   Use cards for meaningful groups of content or actions, not every
    individual element.
-   Keep card padding consistent.
-   Make interactive cards visibly interactive and keyboard accessible.
-   Avoid nesting interactive controls inside another interactive
    control.
-   Use clear headings and concise supporting text.

### Tables and data lists

-   Align numeric values consistently.
-   Use clear column headers and preserve readable row spacing.
-   Support horizontal overflow or an intentional alternate layout on
    narrow screens.
-   Do not rely on colour alone to identify status.
-   Make sorting, filtering, pagination, and row actions discoverable
    when those capabilities exist in the PRD.
-   Provide a clear empty state when no records match.
-   Avoid truncating important information without a way to inspect it.

### Badges and status indicators

-   Use short, consistent status labels.
-   Apply semantic colours consistently.
-   Keep status vocabulary aligned with the product's data model.
-   Do not introduce statuses that are not defined by product
    requirements.

### Dialogs and confirmations

-   Use dialogs for focused decisions that require attention.
-   Keep the title and purpose explicit.
-   Provide a clear primary action and a clear way to cancel or close.
-   Move focus into the dialog when opened and return it appropriately
    when closed.
-   Support Escape to close unless doing so would lose an important
    in-progress action.
-   For destructive actions, state what will happen and whether it can
    be undone.
-   Avoid dialogs for routine information that can be shown inline.

### Menus and tooltips

-   Use menus for related secondary actions.
-   Ensure menus work with keyboard navigation and touch.
-   Tooltips should clarify unfamiliar controls, not contain essential
    instructions.
-   Do not make critical information available only on hover.

### Toasts and inline alerts

-   Use toasts for brief feedback that does not require immediate
    action.
-   Use inline alerts for information that must remain visible in
    context.
-   Provide a meaningful message and, where relevant, a next step.
-   Do not expose raw stack traces or internal implementation details.
-   Do not show a success message before the operation has actually
    succeeded.

## 9. Interaction and Motion

### Interaction principles

-   Every interactive element must have a clear response to user input.
-   Use consistent behaviour for the same component across the product.
-   Make important state changes visible.
-   Preserve user input when possible after errors.
-   Ask for confirmation when an action is destructive, irreversible, or
    likely to surprise the user.
-   Do not add features or interactions that are not supported by the
    PRD.

### Motion

-   Keep animation short and purposeful.
-   Use motion to clarify state changes, transitions, or hierarchy.
-   Avoid decorative movement that distracts from the task.
-   Respect the user's reduced-motion preference.
-   Do not use animation as the only indication that an operation is in
    progress or complete.

Suggested motion durations:

- Micro-interactions: 100--150 ms.
- Small state transitions: 150--200 ms.
- Dialog and panel transitions: 180--240 ms.

These are defaults; reduced-motion settings take precedence.

## 10. Loading, Empty, Success, and Error States

Every data-driven screen and action must have appropriate states. Do not
leave a blank page while waiting for data.

### Loading

-   Use a skeleton when the content structure is known and loading takes
    noticeable time.
-   Use a spinner for a discrete action or compact region.
-   Keep the layout stable where possible to reduce visual shift.
-   For long-running operations, provide progress or a useful status
    message when the system can support it.
-   Prevent duplicate submissions while an action is pending.

### Empty

An empty state should explain:

1. What is currently absent.
2. Why it may be absent, when known.
3. What the user can do next, if an action is available.

Differentiate between:

- A first-use state with no data yet.
- A filtered search with no matching results.
- A genuinely empty result from a completed operation.
- An unavailable or inaccessible resource.

Do not display an action that the user's role or permissions do not
allow.

### Success

-   Confirm meaningful completed actions.
-   Update the relevant content without requiring a full page reload
    where practical.
-   Use concise, specific messages.
-   Avoid interrupting the user for routine success events.

### Error

-   Explain the problem in plain language.
-   State what the user can do next when possible.
-   Preserve form values and other user input where safe.
-   Distinguish validation errors, permission errors, missing resources,
    network errors, and server failures.
-   Offer retry only when retrying is safe and meaningful.
-   Never expose secrets, credentials, raw stack traces, or internal
    system details.

### Permission and access states

-   Explain when a user cannot access a resource or action.
-   Do not present disabled actions without context when the reason
    would otherwise be unclear.
-   Do not reveal sensitive information about resources the user is not
    authorised to access.
-   Follow the role and permission rules defined in `PRD.md`.

## 11. Page-Level Layout Rules

Apply these patterns to the corresponding pages defined in `PRD.md`. Do
not invent new pages solely to fit this design system.

### Standard page

1.  Breadcrumbs or contextual navigation, when useful.
2.  Page title and concise supporting description.
3.  Primary action in a predictable location.
4.  Main content area.
5.  Secondary actions close to the content they affect.

### List or overview page

-   Show the page title and primary creation/action control first.
-   Place search, filters, and sorting close to the list.
-   Make the current filter and sort state visible.
-   Provide loading, empty, no-results, and error states.
-   Keep row actions consistent and avoid overcrowding the main list.

### Detail page

-   Establish the identity and current status of the item near the top.
-   Group information into clearly named sections.
-   Keep actions near the information they affect.
-   Distinguish editable fields from read-only information.
-   Preserve a clear route back to the parent list or context.

### Create and edit forms

-   Explain the purpose of the form.
-   Group related fields.
-   Use clear labels and contextual help.
-   Keep the primary submit action easy to find.
-   Make cancellation and unsaved-change behaviour predictable.
-   Present validation errors near their fields and provide a useful
    summary for long forms.

### Settings pages

-   Group settings by topic.
-   Explain the impact of consequential options.
-   Keep save behaviour consistent and clearly indicate whether changes
    are saved automatically or explicitly.
-   Confirm high-impact changes where appropriate.

### Dashboard or summary pages

-   Prioritise information that supports the user's next decision or
    action.
-   Use consistent metric formatting and comparison periods.
-   Label units and time ranges.
-   Avoid decorative charts that do not answer a clear question.
-   Provide meaningful loading and no-data states for each data region.

These are layout patterns, not permission to add page types or
functionality absent from the PRD.

## 12. Responsive Behaviour

Use content-driven responsive layouts. Suggested breakpoints:

| Name | Width |
| --- | --- |
| Small | Below 640 px |
| Medium | 640--1023 px |
| Large | 1024--1279 px |
| Extra large | 1280 px and above |

Treat these as starting points. Adjust only when the actual content and
interaction requirements justify it.

### Small screens

-   Collapse multi-column layouts into a readable single-column flow.
-   Keep primary actions visible and reachable.
-   Use touch targets of approximately 44 × 44 CSS pixels where
    practical.
-   Avoid horizontal page scrolling; allow it only for content such as
    wide tables when a suitable alternative is not practical.
-   Ensure dialogs fit the viewport and remain usable with the on-screen
    keyboard.
-   Do not rely on hover to expose actions.
-   Keep form labels and error messages visible.

### Medium and large screens

-   Use available width without stretching text-heavy content
    excessively.
-   Maintain consistent page gutters and alignment.
-   Use multi-column layouts only where they improve scanning or task
    completion.
-   Keep navigation, content, and contextual panels visually distinct.

## 13. Accessibility

Target **WCAG 2.2 Level AA**.

Requirements:

- All functionality must be usable by keyboard.
- Focus indicators must be visible and not obscured.
- Use semantic HTML and accessible names.
- Maintain sufficient text and non-text contrast.
- Associate form labels, descriptions, and errors with their inputs.
- Announce important dynamic updates to assistive technology when appropriate.
- Manage focus correctly in dialogs and other modal interactions.
- Use headings in a logical hierarchy.
- Do not use colour as the sole carrier of meaning.
- Provide text alternatives for meaningful imagery and accessible names for icon-only controls.
- Respect reduced-motion preferences.
- Ensure zoom and text resizing do not make essential content or functionality unavailable.
- Test important workflows with keyboard-only navigation and representative assistive technology.

## 14. Content and Microcopy

-   Use clear, direct language.
-   Prefer specific action labels such as "Create project" or "Save
    changes".
-   Use sentence case.
-   Keep labels short without making them ambiguous.
-   Explain consequences before high-impact actions.
-   Avoid technical jargon unless the intended users understand it.
-   Avoid blame-oriented error messages.
-   Use consistent terminology across navigation, forms, alerts, and
    documentation.
-   Format dates, times, numbers, and currency consistently with the
    product's intended locale.
-   Do not fabricate example data that could be mistaken for real user
    data.

## 15. Design Tokens and Implementation Rules

Represent shared design decisions as reusable tokens or theme
variables:

- Colour.
- Typography.
- Spacing.
- Radius.
- Border.
- Elevation.
- Motion duration.
- Responsive breakpoints.
- Focus treatment.

Rules:

- Components should consume shared tokens rather than repeat raw values.
- Do not create near-duplicate tokens without a clear reason.
- Do not introduce a second font.
- Avoid one-off visual treatments unless a real product requirement justifies them.
- Keep visual state handling consistent across components.
- Maintain a single reusable component for each shared pattern where practical.
- If implementation constraints require a deviation, document it rather than silently changing the design system.

## 16. UX State Matrix

| Component or flow | Required states |
| --- | --- |
| Data list | Loading, populated, empty, no results, error |
| Form | Default, focused, invalid, submitting, success, submission error |
| Button | Default, hover, focus, pressed, disabled, loading |
| Dialog | Closed, open, submitting if applicable, error if applicable |
| Data fetch | Loading, success, empty result, failure |
| Permission-controlled action | Available, unavailable, explanatory state where appropriate |
| Destructive action | Confirmation, in progress, success, failure |
| Search | Idle, searching, results, no results, error |
| Async operation | Pending, progress where available, completed, failed |

Implement only the states applicable to each feature, but do not omit a
state that is needed for a reliable user journey.

## 17. Performance and Stability

-   Avoid unnecessary layout shifts.
-   Use appropriately sized assets.
-   Load fonts efficiently and avoid unnecessary font weights.
-   Keep animation lightweight.
-   Do not block the entire interface for a local action when only one
    region needs to update.
-   Provide a visible response to user actions without implying that a
    server operation succeeded before confirmation.
-   Ensure responsive layouts remain stable while data loads.

## 18. Decisions Requiring Approval

Confirm these decisions if they have not already been established by the
product owner or existing brand assets:

1.  The proposed blue and neutral colour palette.
2.  The exact type scale and component radii.
3.  The final icon family.
4.  Responsive breakpoints, based on actual target devices and content.
5.  Whether the product requires dark mode. Do not implement it by
    default unless the PRD or product owner requires it.
6.  Any brand-specific illustrations, charts, or specialised data
    visualisations.

Until approved, treat the values in this document as proposed defaults,
not established brand facts.

## 19. Out of Scope

Unless required by `PRD.md` or explicitly approved, do not add:

- New product features or pages.
- A second typeface.
- A dark theme.
- Decorative gradients, glass effects, or elaborate animations.
- Unrequested onboarding flows.
- Additional dashboards or charts without a user need.
- New roles, permissions, or statuses.
- New interaction patterns that change the product workflow.

## 20. Definition of Done

A screen or component is design-complete when:

- It follows the Outfit-only typography system.
- It uses the shared colour, spacing, radius, and surface tokens.
- It has consistent hover, focus, pressed, disabled, and loading states where applicable.
- It includes relevant loading, empty, success, error, and permission states.
- It works at supported responsive sizes.
- It is keyboard accessible and uses semantic structure.
- Text and controls meet the accessibility requirements.
- It follows the journeys and permissions in `PRD.md`.
- It does not introduce unapproved functionality or visual patterns.
- Any necessary deviation from this document is documented.

## 21. Instructions for the Coding Agent

1.  Read `PRD.md` before implementing screens or interactions.
2.  Treat `PRD.md` as the source of truth for product scope and
    behaviour.
3.  Treat this file as the source of truth for visual design and UX.
4.  Use Outfit as the sole typeface across the product.
5.  Build reusable components and shared design tokens before
    duplicating patterns across pages.
6.  Implement all applicable loading, empty, success, error, validation,
    and permission states.
7.  Do not invent missing product requirements. Record assumptions and
    request approval for consequential decisions.
8.  Keep the interface responsive and accessible.
9.  Do not add features, pages, roles, or integrations that are not
    specified in the PRD.
10. Before completion, verify the implementation against the Definition
    of Done above.
