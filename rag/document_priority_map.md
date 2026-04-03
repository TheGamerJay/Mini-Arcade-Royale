# Document Priority Map for RAG

Ranking context_docs by importance for AI retrieval and developer reference.

---

## Priority Tiers

### 🔴 CRITICAL (Priority 1) — Essential for any task

Must be retrieved for almost every complex question. Foundation documents that unlock all other understanding.

| Document | Reason |
|----------|--------|
| SYSTEM_ARCHITECTURE.md | All implementation flows start here |
| API_CONTRACTS.md | Every backend task references endpoints |
| AUTH_RULES.md | Every endpoint has auth requirements |
| CREDIT_LEDGER_RULES.md | All financial operations depend on this |
| GAME_ENGINE_RULES.md | Core business logic (3 games specified) |
| PRODUCT_OVERVIEW.md | Defines what we're building |
| BRAND_GUIDE.md | Design tokens, color system, constraints |

**Total Chunks (Est.)**: 40–50 chunks  
**Typical Search**: 30–40% of queries retrieve at least one critical chunk

---

### 🟠 IMPORTANT (Priority 2) — Frequently referenced

High-value context that resolves most domain-specific questions. Most developers reference these daily.

| Document | Reason |
|----------|--------|
| STRIPE_FLOW.md | Payment integration (Webhook logic) |
| WEBHOOK_RULES.md | Safe webhook handling, idempotency |
| PURCHASE_RECONCILIATION.md | Resolving payment issues |
| ACCOUNT_SECURITY_POLICY.md | Login flows, session management |
| LEGAL_ACCEPTANCE_RULES.md | Required disclaimers, legal holds |
| FRONTEND_OVERVIEW.md | Route structure, page layout |
| BACKEND_OVERVIEW.md | Service structure, dependencies |
| ADMIN_ACTION_POLICY.md | Admin capabilities and limits |
| RATE_LIMIT_POLICY.md | Request throttling rules |
| CREDIT_ECONOMY_POLICY.md | Pricing tiers, package configs |

**Total Chunks (Est.)**: 60–80 chunks  
**Typical Search**: 50–70% of queries retrieve at least one important chunk

---

### 🟡 REFERENCE (Priority 3) — Domain-specific, often needed

Useful for specialized tasks, but not on critical path. Reference material for specific features.

| Document | Reason |
|----------|--------|
| GAME_1_SCRATCH_ROYALE.md | Game 1 spec for implementation |
| GAME_2_ROYALE_SPIN.md | Game 2 spec for implementation |
| GAME_3_MYSTERY_VAULT.md | Game 3 spec for implementation |
| DESIGN_SYSTEM.md | Component library, spacing scale |
| COMPONENT_RULES.md | Button, card, input specs |
| ANIMATION_RULES.md | Easing, timing, motion specs |
| PROMO_CODE_RULES.md | Promotional system logic |
| SUPPORT_RUNBOOK.md | Support team procedures |
| ERROR_CODE_REFERENCE.md | API error definitions |
| DEPLOYMENT_RUNBOOK.md | Deploy steps (ops task) |
| ENVIRONMENT_VARIABLES.md | Config variables list |
| FRAUD_AND_ABUSE_RULES.md | Cheating detection policies |
| INCIDENT_RESPONSE.md | How to handle security issues |

**Total Chunks (Est.)**: 80–100 chunks  
**Typical Search**: 20–40% of queries retrieve a reference chunk

---

### 🟢 NICE-TO-KNOW (Priority 4) — Supplemental information

Background/context, rarely required for immediate implementation. Educational, historical.

| Document | Reason |
|----------|--------|
| PRODUCT_VISION.md | Strategic direction, long-term goals |
| USER_JOURNEYS.md | User flows, onboarding paths |
| INFORMATION_ARCHITECTURE.md | Site structure, menu organization |
| FEATURE_INVENTORY.md | Phase 1–17 feature list |
| VOICE_AND_TONE.md | Writing guidelines, personality |
| COLOR_SYSTEM.md | Detailed color palette rules |
| DIRECTORY_STRUCTURE.md | Folder organization reference |
| ARCHITECTURE_DECISIONS.md | Why we chose certain tech (RFCs) |
| ROUTE_MAP.md | All frontend routes listed |
| STATE_MANAGEMENT_RULES.md | Zustand store guidelines |
| LEGAL_PAGE_SOURCE_NOTES.md | How legal pages were created |
| QA_TEST_PLAN.md | Testing procedures (QA task) |
| OBSERVABILITY_AND_LOGGING.md | Monitoring setup (ops task) |
| MOBILE_UX_RULES.md | Responsive design breakpoints |

**Total Chunks (Est.)**: 50–70 chunks

---

### ⚪ COMPLIANCE (Priority 5) — Required for specific roles

Legal/compliance docs, needed by legal team / support / admins, not developers.

| Document | Reason |
|----------|--------|
| TERMS_SOURCE.md | Terms of Service content |
| PRIVACY_SOURCE.md | Privacy Policy content |
| CREDITS_POLICY_SOURCE.md | Credits policy legal text |
| REFUND_POLICY_SOURCE.md | Refund policy legal text |
| GAME_RULES_SOURCE.md | Game rules & odds disclosure |
| ACCEPTABLE_USE_SOURCE.md | Acceptable use policy |
| COOKIE_POLICY_SOURCE.md | Cookie policy legal text |
| DMCA_SOURCE.md | DMCA takedown procedures |
| MODERATION_POLICY.md | Content moderation rules |
| SECURITY_REPORT_SOP.md | Security incident reporting |
| PURCHASE_ISSUE_SOP.md | Support handbook (purchase issues) |
| CREDIT_DISPUTE_SOP.md | Support handbook (credit disputes) |
| RELEASE_CHECKLIST.md | Pre-release tasks |
| ROLLBACK_PLAN.md | Emergency rollback procedure |
| CHANGELOG_POLICY.md | Version update documentation |

**Total Chunks (Est.)**: 60–80 chunks

---

## Search Ranking Algorithm

### Relevance Score Formula

```
final_score = (
    (semantic_similarity × 0.50) +
    (keyword_match_score × 0.20) +
    (priority_multiplier × 0.20) +
    (tag_match_score × 0.10)
)
```

### Priority Multiplier

| Priority | Multiplier | Applied When |
|----------|-----------|---|
| 1 (Critical) | 2.0 | Direct match to query |
| 2 (Important) | 1.5 | Medium specificity |
| 3 (Reference) | 1.0 | Niche/specialized query |
| 4 (Nice-to-know) | 0.7 | Educational/background |
| 5 (Compliance) | 0.5 | Off-topic for most queries |

### Example Ranking

Query: "How do I integrate Stripe into the checkout flow?"

| Document | Semantic | Keyword | Priority | Tag Match | Final Score |
|----------|----------|---------|----------|-----------|--|
| STRIPE_FLOW.md | 0.92 | 0.95 | 2.0 | 1.0 | (0.92×0.5)+(0.95×0.2)+(2.0×0.2)+(1.0×0.1) = **0.95** ✓ |
| WEBHOOK_RULES.md | 0.85 | 0.80 | 2.0 | 0.8 | 0.85 |
| PAYMENT_RECONCILIATION.md | 0.78 | 0.75 | 2.0 | 0.6 | 0.76 |
| STORE_AND_PACKAGES.md | 0.61 | 0.55 | 3.0 | 0.5 | 0.60 |
| TERMS_SOURCE.md | 0.40 | 0.35 | 5.0 | 0.2 | 0.23 |

**Result**: Return STRIPE_FLOW first, then WEBHOOK_RULES, then RECONCILIATION.

---

## Dynamic Prioritization

### Boost Based on User Role

| User Role | Boost | Reason |
|-----------|-------|--------|
| Backend Engineer | Critical + Important | Need API, architecture, auth |
| Frontend Engineer | Important + Reference | Need routes, design, components |
| Game Developer | Reference (games) | Need GAME_1/2/3 specs |
| Admin User | Reference + Compliance | Need admin policies, procedures |
| Support Agent | Compliance + Runbooks | Need support SOPs, legal text |
| QA Engineer | Priority 3 + QA docs | Need test plan, checklists |

**Implementation**: Optional user role field passed to search; multiplier applied per role.

---

## Search Query Patterns & Suggested Docs

### Common Queries → Recommended Priority Chunks

```
"How do I...(developer question)"
→ Critical + Important docs

"What does...(backend info question)"
→ Important + Reference docs

"When should I...(business logic)"
→ Critical + Reference docs

"What happens if...(edge case/error)"
→ Critical + Compliance docs for error handling

"Generate legal page for...(compliance)"
→ Compliance docs only
```

---

## Maintenance & Updates

### When to Adjust Priorities

- **Every 3 months**: Review search analytics; if Priority 4 doc retrieves > 50% of queries, promote to Priority 3
- **After major feature**: New docs start at Priority 3; promote based on usage
- **Before release**: Prioritize QA/release docs temporarily
- **After incident**: Boost priority of affected domain docs

### Success Metrics

- Average retrieval quality: > 75% (user finds what they need)
- Query latency: < 100ms
- Critical docs in top-3 results: > 90% of queries
- User satisfaction on retrieved docs: > 80%

---

## Success Criteria

- [x] Priority tiers defined
- [x] Documents categorized
- [x] Ranking algorithm specified
- [x] Query patterns mapped
- [x] Dynamic prioritization explained
- [ ] Analytics tracking implementation (Phase 2)
- [ ] Automated re-ranking (Phase 3)
