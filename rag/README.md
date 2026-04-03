# RAG Foundation

This directory contains infrastructure and metadata for Retrieval-Augmented Generation (RAG) — enabling AI systems to understand, index, and retrieve Mini Arcade Royale documentation.

---

## Why RAG?

As Mini Arcade Royale grows, developers, support staff, and AI assistants need fast, accurate access to:
- **System architecture** and data flows
- **API contracts** and endpoint definitions
- **Product rules** (credit economy, game logic, legal policies)
- **Operational procedures** (deployments, incident response)
- **Business logic** (pricing, promotions, user progression)

RAG bridges documentation and AI by making docs:
1. **Semantically indexed** (quick conceptual search)
2. **Properly chunked** (digestible for LLM context)
3. **Metadata-rich** (categorization, priority, relationships)
4. **Retrieval-optimized** (fast lookup, no hallucination)

---

## Document Organization

### Documents Included in RAG Index

```
context_docs/
├── product/
│   ├── PRODUCT_OVERVIEW.md        ⭐⭐⭐ Critical
│   ├── PRODUCT_VISION.md          ⭐⭐
│   ├── USER_JOURNEYS.md           ⭐⭐
│   ├── INFORMATION_ARCHITECTURE.md ⭐⭐
│   └── FEATURE_INVENTORY.md       ⭐
├── brand/
│   ├── BRAND_GUIDE.md             ⭐⭐ (Design tokens, colors)
│   ├── VOICE_AND_TONE.md          ⭐
│   └── COLOR_SYSTEM.md            ⭐
├── design/
│   ├── DESIGN_SYSTEM.md           ⭐⭐ (Component library rules)
│   ├── COMPONENT_RULES.md         ⭐
│   ├── ANIMATION_RULES.md         ⭐
│   └── MOBILE_UX_RULES.md         ⭐
├── architecture/
│   ├── SYSTEM_ARCHITECTURE.md     ⭐⭐⭐ Critical
│   ├── DIRECTORY_STRUCTURE.md     ⭐
│   └── ARCHITECTURE_DECISIONS.md  ⭐
├── backend/
│   ├── BACKEND_OVERVIEW.md        ⭐⭐ (API structure)
│   ├── API_CONTRACTS.md           ⭐⭐⭐ (Endpoint definitions)
│   └── ERROR_CODE_REFERENCE.md    ⭐
├── frontend/
│   ├── FRONTEND_OVERVIEW.md       ⭐⭐
│   ├── ROUTE_MAP.md               ⭐⭐
│   ├── STATE_MANAGEMENT_RULES.md  ⭐
│   └── COMPONENT_LIBRARY.md       ⭐
├── auth/
│   ├── AUTH_RULES.md              ⭐⭐⭐ Core
│   ├── ACCOUNT_SECURITY_POLICY.md ⭐⭐
│   └── LEGAL_ACCEPTANCE_RULES.md  ⭐
├── payments/
│   ├── STORE_AND_PACKAGES.md      ⭐⭐
│   ├── STRIPE_FLOW.md             ⭐⭐⭐ (Payment integration)
│   ├── WEBHOOK_RULES.md           ⭐⭐
│   └── PURCHASE_RECONCILIATION.md ⭐
├── credits/
│   ├── CREDIT_LEDGER_RULES.md     ⭐⭐⭐ Core (Economy)
│   ├── CREDIT_TRANSACTION_TYPES.md ⭐
│   ├── CREDIT_ECONOMY_POLICY.md   ⭐⭐
│   └── PROMO_CODE_RULES.md        ⭐
├── games/
│   ├── GAME_ENGINE_RULES.md       ⭐⭐⭐ Core
│   ├── GAME_ODDS_CONFIG_POLICY.md ⭐⭐
│   ├── GAME_1_SCRATCH_ROYALE.md   ⭐
│   ├── GAME_2_ROYALE_SPIN.md      ⭐
│   └── GAME_3_MYSTERY_VAULT.md    ⭐
├── admin/
│   ├── ADMIN_ACTION_POLICY.md     ⭐⭐ (Admin capabilities)
│   ├── ADMIN_ROLE_MATRIX.md       ⭐
│   └── MODERATION_POLICY.md       ⭐
├── support/
│   ├── SUPPORT_RUNBOOK.md         ⭐⭐ (Support procedures)
│   ├── PURCHASE_ISSUE_SOP.md      ⭐
│   ├── SECURITY_REPORT_SOP.md     ⭐
│   └── CREDIT_DISPUTE_SOP.md      ⭐
├── legal/
│   ├── LEGAL_PAGE_SOURCE_NOTES.md ⭐⭐
│   ├── TERMS_SOURCE.md            ⭐
│   ├── PRIVACY_SOURCE.md          ⭐
│   ├── CREDITS_POLICY_SOURCE.md   ⭐
│   ├── REFUND_POLICY_SOURCE.md    ⭐
│   ├── GAME_RULES_SOURCE.md       ⭐
│   ├── ACCEPTABLE_USE_SOURCE.md   ⭐
│   ├── COOKIE_POLICY_SOURCE.md    ⭐
│   └── DMCA_SOURCE.md             ⭐
├── security/
│   ├── FRAUD_AND_ABUSE_RULES.md   ⭐⭐
│   ├── INCIDENT_RESPONSE.md       ⭐⭐
│   ├── SECURITY_HEADERS_POLICY.md ⭐
│   └── RATE_LIMIT_POLICY.md       ⭐
├── ops/
│   ├── DEPLOYMENT_RUNBOOK.md      ⭐⭐
│   ├── ENVIRONMENT_VARIABLES.md   ⭐
│   ├── OBSERVABILITY_AND_LOGGING.md ⭐
│   ├── BACKUP_AND_RECOVERY.md     ⭐
│   └── HEALTHCHECKS_AND_MONITORING.md ⭐
├── qa/
│   ├── QA_TEST_PLAN.md            ⭐⭐
│   ├── PRELAUNCH_CHECKLIST.md     ⭐
│   └── POSTLAUNCH_MONITORING.md   ⭐
└── releases/
    ├── RELEASE_CHECKLIST.md       ⭐
    ├── ROLLBACK_PLAN.md           ⭐
    └── CHANGELOG_POLICY.md        ⭐
```

---

See detailed metadata, chunking, and retrieval strategies in:
- **[chunking_strategy.md](chunking_strategy.md)** — How to split docs
- **[indexing_strategy.md](indexing_strategy.md)** — Search indexing
- **[document_priority_map.md](document_priority_map.md)** — Importance ranking
- **[metadata_schema.md](metadata_schema.md)** — Chunk metadata structure
