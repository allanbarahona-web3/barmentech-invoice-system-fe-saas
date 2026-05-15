# Frontend Architecture Review: Country-Driven Billing Readiness

Date: 2026-05-14
Scope: Frontend architecture review for multi-country billing evolution

## Executive Summary

The frontend has a good foundational direction (country pack folder, fiscal extension schema, feature flags, and modular invoice screens), but most runtime behavior is still globally hardcoded around a single invoice/quote model and generic tenant tax settings.

Current state can support Costa Rica launch and limited near-term expansion with code changes. It is not yet truly country-pack driven at runtime for document types, status workflows, fiscal rules, or preview/PDF behavior.

## High-Level Verdict

- Good foundations: partial
- Country-driven runtime behavior: weak
- Feature flag architecture: moderate
- Readiness for country-specific document workflows: low-to-moderate

---

## Findings (Ordered by Severity)

### 1) High: Country-pack toggle is mostly UI-level and not an execution switch

The country pack state is persisted in localStorage and surfaced in settings UI, but core invoice create/edit/list/detail flows are not consistently reading this as authoritative logic.

Evidence:

- `src/app/system/settings/page.tsx` persists `countryPack:<code>` toggle.
- `src/services/tenantSettingsService.ts` auto-activates country pack key in localStorage.
- `src/modules/invoices/components/InvoicePreview.tsx` contains commented-out CR info rendering (`isCREnabled`, `buildCRFiscalSummary`).

Impact:

- Activating/deactivating a pack does not reliably alter form schema, tax behavior, status workflow, or document rendering.

### 2) High: Tax model is tenant-level single tax, not country/document-rule driven

Tax is currently one `taxName + taxRate` pair and globally computed as a simple percentage.

Evidence:

- `src/schemas/tenantSettings.schema.ts` defines `taxEnabled`, `taxName`, `taxRate`.
- `src/modules/invoices/invoice.calc.ts` computes tax using a single percentage.
- `src/app/system/invoices/new/page.tsx` and `src/app/system/invoices/[id]/edit/page.tsx` apply one tenant tax rate.

Impact:

- Difficult to support multi-rate VAT, exemptions, withholding, per-line tax categories, jurisdictional split taxes, or fiscal-status-specific treatment.

### 3) High: Document and status domains are hardcoded

Core schema enforces fixed document types and statuses.

Evidence:

- `src/modules/invoices/invoice.schema.ts` document type enum: `invoice | quote`.
- `src/modules/invoices/invoice.schema.ts` status enum: `draft | issued | sent | paid | archived`.
- `src/modules/invoices/components/InvoicesTable.tsx` and `InvoicePreview.tsx` branch UI behavior on those fixed statuses.

Impact:

- Weak compatibility with countries requiring additional document classes (credit note, debit note, receipt) and country-specific state machines.

### 4) Medium: Preview/PDF area still has CR/Spanish-specific assumptions

There is dynamic branding, but some locale/date/tax labeling remains tied to `es-CR` and literal examples.

Evidence:

- `src/modules/invoices/components/InvoicePreview.tsx` uses `Intl.DateTimeFormat("es-CR")`.
- `src/modules/company/components/InvoicePreviewLive.tsx` uses hardcoded sample `IVA (13%)` and `toLocaleDateString('es-CR')`.

Impact:

- Preview fidelity and legal labels will drift for non-CR countries.

### 5) Medium: Onboarding country model is static in UI

Country selection and defaults are hardcoded in components/maps.

Evidence:

- `src/components/system/onboarding/OnboardingStepCompany.tsx` has static `SelectItem` country list.
- `src/components/system/onboarding/OnboardingWizard.tsx` has default `country: "US"`.
- `src/lib/countryDefaults.ts` stores static defaults map.

Impact:

- Adding a country requires frontend code edits instead of loading from a registry/manifest.

### 6) Medium: Feature flags are used, but source-of-truth is still transitional

Module flags gate recurring/scheduled send/CC limits in key places, which is good. But plan resolution is still mocked in billing hooks.

Evidence:

- Gating in invoice screens: `src/app/system/invoices/new/page.tsx`, `src/app/system/invoices/[id]/edit/page.tsx`.
- Gating in send dialog: `src/modules/invoices/components/SendInvoiceDialog.tsx`.
- Plan hook currently fixed to trial: `src/modules/billing/features.hooks.ts`.

Impact:

- Good extensibility pattern, but not yet strong enough as backend-governed policy for country/module combinations.

### 7) Medium: POS/billing-mode support is not present

No explicit POS mode, receipt/ticket flow, or mode engine surfaced in frontend architecture.

Impact:

- POS roadmap likely needs a dedicated bounded context/module, not just toggling existing invoice pages.

### 8) Positive: Real extension seam already exists for fiscal country fields

There is a real, useful start with country-pack schemas and storage sanitization.

Evidence:

- `src/country-packs/cr/*` pack scaffolding.
- `src/modules/company/company.schema.ts` supports `fiscal.cr` extension.
- `src/modules/company/components/CompanyFiscalForm.tsx` conditionally renders CR fields via `isCREnabled`.
- `src/modules/company/company.storage.ts` applies CR sanitization.

Impact:

- Strong base to expand into a true pack registry model.

---

## Requested 8-Point Check

### 1. Document creation forms

Status: Partially adaptable, still hardcoded at domain level.

- Supports dynamic calculations and feature-gated blocks.
- Still constrained by fixed document types and fixed status lifecycle.

### 2. Tenant onboarding

Status: Country-aware defaults exist, but setup remains static.

- Country defaults (`currency/tax`) are applied.
- Country list and behavior are not pulled from runtime registry.

### 3. Settings screens

Status: Good structure, incomplete country-pack wiring.

- Country pack card/toggle exists.
- Toggle does not drive all downstream business behavior.

### 4. Tax fields

Status: Too generic for long-term multi-country.

- Single tenant tax pair is too limited for real fiscal diversity.

### 5. Document status labels

Status: Hardcoded finite set.

- Needs pack-driven state mapping and labels.

### 6. Invoice/PDF preview

Status: Dynamic branding is solid; localization/fiscal specifics are partially hardcoded.

- Needs pack templating and locale abstraction.

### 7. POS or billing mode support

Status: Not implemented in current architecture.

- Needs dedicated mode model and UI flow separation.

### 8. Feature flags by country/module

Status: Module flags are in place; country/module policy layer is incomplete.

- Good start for recurring/scheduled/CC.
- Needs backend policy source and country-aware composition.

---

## What Should Stay Global vs Country-Pack Driven

## Keep Global

- Tenant identity and branding: company metadata, logo/colors, generic contact.
- Core document primitives: items, subtotal/discount/total math, attachments, audit, permissions.
- Cross-country platform capabilities: reminders, scheduling framework, recurring framework, analytics skeleton.
- Canonical lifecycle abstraction: internal normalized states for dashboards/metrics.

## Move to Country-Pack Driven

- Document catalog: allowed document types per country.
- Numbering rules: per document type and legal constraints.
- Fiscal forms and validations: required fields, catalogs, conditional requirements.
- Tax engine settings: tax labels, rates, multiple tax types, exemptions, withholding.
- Status workflows: transitions and labels by country and document type.
- Preview/PDF content: locale formats, legal legends, mandatory sections.
- Action permissions per country workflow: issue/send/cancel/convert constraints.
- Country-specific feature availability: e-invoicing integrations, branch/terminal data, payment rails.

---

## Recommended Target Architecture

### 1) Introduce a country-pack manifest contract

Create a typed manifest per country pack with:

- `countryCode`
- `documentTypes[]`
- `statusModel` and transition map
- `fiscalFieldDefinitions`
- `taxModelConfig`
- `localeConfig`
- `pdfTemplateConfig`
- `enabledModules`

### 2) Build a runtime registry service

Resolve active pack from tenant + backend policy, not localStorage only.

- `getActiveCountryPack(tenantId)`
- `getCountryCapabilities(countryCode)`

### 3) Refactor forms to metadata-driven rendering

Replace hardcoded country blocks with schema/field metadata maps from manifest.

### 4) Split status engine from presentation

Use pack-defined workflow transitions and keep global canonical mapping for analytics.

### 5) Convert preview/PDF to template adapters

Core renderer + country adapters for legal blocks and formatting.

### 6) Unify feature policy

Compose feature access from:

- Plan features
- Country capabilities
- Module entitlements

Single policy result should power all UI guards.

---

## Suggested Refactor Phases

### Phase 1: Low-risk foundation

- Add country-pack manifest interface and loader.
- Keep current UI, but read defaults from registry instead of static maps.
- Move `countryPack:<code>` activation to backend-driven tenant setting.

### Phase 2: Domain decoupling

- Externalize document type and status definitions.
- Add status transition guard service.
- Make onboarding/select options fully registry-driven.

### Phase 3: Full country-driven behavior

- Pack-driven fiscal forms and tax engine config.
- Pack-driven preview/PDF templates.
- Country-aware policy composition for module features.

---

## Residual Risks and Gaps

- No evidence of automated tests for country-switch behavior.
- No country matrix tests for preview/PDF legal compliance.
- No explicit contract tests for status transitions by country/document type.

---

## Final Recommendation

The current frontend should be treated as a strong Costa Rica-first baseline with extension seams, not yet as a mature country-pack platform.

To support future countries with different document models, fiscal fields, tax logic, and workflows, prioritize replacing hardcoded domain enums/flows with a manifest-driven runtime registry and pack adapters.

