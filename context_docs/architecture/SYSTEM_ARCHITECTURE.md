# System Architecture

**Document Purpose**: High-level overview of Mini Arcade Royale technical architecture, data flow, and core systems.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USERS (Client Layer)                     │
└────────────┬────────────────────────────────────────────┬───┘
             │                                            │
         ┌───▼────────────────┐              ┌───────────▼──┐
         │  Frontend (React)   │              │  Mobile/Web  │
         │  Next.js + TypeScript               Browser Auth  │
         │  TailwindCSS        │              └───────────┬──┘
         └────────┬─────────────┘                         │
                  │                                        │
                  └────────────────┬─────────────────────┬─┘
                                   │                      │
            ┌──────────────────────▼──────────────────────▼──────┐
            │          HTTPS / WebSocket / REST API              │
            │      API Gateway / Load Balancer (if scaling)       │
            └──────────────────────┬─────────────────────────────┘
                                   │
        ┌──────────────────────────┼───────────────────────┐
        │                          │                       │
   ┌────▼──────────────┐    ┌─────▼────────────┐    ┌────▼────────────┐
   │  Backend (FastAPI) │    │  Cache Layer     │    │  Job Queue      │
   │  Python 3.11       │    │  Redis (opt.)    │    │  Celery (opt.)  │
   │  Uvicorn/Gunicorn  │    │  Rate Limits     │    │  Async Tasks    │
   │                    │    │  Session Store   │    │  Email, Webhooks│
   └────┬──────────────┘    └──────────────────┘    └────────────────┘
        │
   ┌────▼──────────────────────────────────────────┐
   │       Core Services (Modular Layer)            │
   ├────┬─────────────┬──────────┬────────┬────┐   │
   │Auth│ Credit Sys  │ Games    │ Store  │Admin│   │
   │    │ & Ledger    │ Engine   │ Stripe │    │   │
   └────┼─────────────┼──────────┼────────┼────┘   │
        └────────────┬──────────────────────────────┘
                     │
    ┌────────────────┼──────────────────────┐
    │                │                      │
┌───▼────────────┐ ┌─▼──────────────┐ ┌──▼────────────┐
│ PostgreSQL DB  │ │ Stripe API     │ │ Email Service │
│ ACID          │ │ (Payments)     │ │ (Resend/SG)   │
│ Transactions  │ │ (Webhooks)     │ │               │
└────────────────┘ └────────────────┘ └───────────────┘

    Monitoring, Logging, Analytics
    ├─ Sentry (Error tracking)
    ├─ Structured logs (JSON)
    ├─ Health checks / readiness probes
    └─ Custom dashboards
```

---

## Core Systems

### 1. Authentication & Session Management
- **Technology**: FastAPI security, Bcrypt/Argon2, session cookies (web)
- **Flow**: Signup → Email verification → Login → Secure cookie
- **Session Storage**: Redis or in-memory (configurable)
- **Token Expiry**: 24 hours (with refresh option)
- **Per-User Sessions**: Track multiple logins, allow single-logout-all

### 2. Credit Economy (Server-Authoritative)
- **Wallet Service**: Fetch balance always from DB, never trust client
- **Ledger**: Immutable transaction log with full audit trail
- **Transaction Types**: Purchase, game spend, reward, admin adjustment, refund
- **Consistency**: All operations transaction-safe, no race conditions
- **Idempotency**: Replay protection on game plays and purchases

### 3. Game Engine
- **Server Decides**: All game outcomes determined server-side (RNG)
- **Client Animates**: Frontend only reveals what server decided
- **Atomic Plays**: Single transaction: deduct cost → decide outcome → award reward → log
- **Replay Prevention**: Idempotency keys prevent double-charges
- **Config-Driven**: Costs, reward tables configurable without code changes

### 4. Payment Processing
- **Provider**: Stripe (checkout or payment intents)
- **Webhooks**: Idempotent webhook handling (deduplication)
- **Reconciliation**: Reconcile purchases with user credit records
- **Audit**: Every transaction logged with timestamp, IP, device

### 5. Support & Moderation
- **Ticket System**: User-initiated support requests
- **Admin Queue**: Support team reviews and responds
- **Self-Service**: FAQs, help center for common issues
- **Escalation**: Critical issues marked for urgent attention

---

## Data Flow Examples

### Example 1: Signup → Play → Win
```
1. User signs up (frontend)
   ├─ Validate email, username, password (frontend + backend)
   ├─ Store legal acceptance + version (backend)
   ├─ Send verification email
   └─ Success response

2. User verifies email
   ├─ Click link in email
   ├─ Validate token expiry
   └─ Update email_verified flag

3. User buys credits
   ├─ Select package (100 credits for $0.99)
   ├─ Start Stripe checkout
   ├─ Stripe charges card
   ├─ Webhook fires (charge.succeeded)
   ├─ Backend: Grant credits (idempotent)
   ├─ Send purchase receipt + email
   └─ Frontend: Show success, update balance

4. User plays Scratch Royale
   ├─ Click "Play" on game card
   ├─ Request: POST /api/games/scratch-royale/play
   │   - Include idempotency_key
   │   - Backend checks wallet (10 credits required)
   │   - Deduct cost (transaction atomic)
   │   - Generate outcome (RNG: 50%, 500%, 5000%)
   │   - Award reward
   │   - Log play record
   │   - Record ledger entries
   └─ Response: { "result": "won", "reward": 500, "newBalance": 590 }

5. Frontend animates result
   ├─ Show scratch card
   ├─ User "scratches" (client-side only, no damage if offline)
   ├─ Reveal server-decided outcome
   ├─ Celebration animation
   └─ Update balance in UI
```

### Example 2: Purchase Issue → Support Ticket → Admin Resolution
```
1. User reports missing credits
   ├─ Submit support ticket
   │   - Type: "missing_credits"
   │   - Description: "Bought 600 credits but only got 100"
   │   - Timestamp: auto-recorded
   └─ Email confirmation sent

2. Support team reviews
   ├─ Dashboard query: Find user's purchase history
   ├─ Stripe lookup: Confirm payout successful
   ├─ Ledger check: Trace credit transactions
   ├─ Hypothesize: Webhook may have failed (first payment attempt)
   └─ Action: Mark for admin review

3. Admin investigates
   ├─ Pull Stripe webhook logs
   ├─ Confirm charge succeeded but webhook_id missing in DB
   ├─ Decision: Reprocess webhook (idempotent, safe)
   ├─ Grant missing 500 credits manually (with reason logged)
   └─ Close ticket + notify user

4. User receives notification
   ├─ Email: "Your issue resolved: +500 credits added"
   ├─ Ticket marked closed
   └─ New balance visible in-app
```

---

## Database Schema (High-Level)

### Core Tables
```
users
├─ id, email, username, password_hash, role
├─ email_verified, created_at, updated_at
└─ Indexes: email, username (unique), role

credit_wallets
├─ id, user_id (FK), balance
├─ created_at, updated_at
└─ Indexes: user_id (unique)

credit_transactions
├─ id, user_id (FK), transaction_type
├─ amount_delta, balance_before, balance_after
├─ reference_type, reference_id (e.g., "game_play:123")
├─ created_at, admin_actor_id (nullable)
└─ Indexes: user_id, created_at, reference_type

game_plays
├─ id, user_id (FK), game_key
├─ idempotency_key (unique per play)
├─ cost_paid, reward_won, result_data (JSON)
├─ created_at
└─ Indexes: user_id, game_key, created_at

stripe_checkout_sessions
├─ id, user_id (FK), session_id
├─ package_id (FK), amount, status
├─ webhook_received_at, webhook_id
├─ created_at
└─ Indexes: user_id, session_id (unique), status

audit_logs
├─ id, actor_id (user making action)
├─ action, resource_type, resource_id
├─ changes (JSON: before/after)
├─ ip_address, user_agent
├─ created_at
└─ Indexes: actor_id, resource_type, created_at

legal_acceptances
├─ id, user_id (FK)
├─ policy_bundle_version
├─ accepted_at, accepted_ip
└─ Indexes: user_id, policy_bundle_version
```

---

## Security Layers

### Authentication Layer
- SSL/TLS (HTTPS only in production)
- Secure session cookies (HttpOnly, Secure, SameSite)
- CSRF tokens on state-changing requests
- Rate limiting: 5 signup attempts/hr, 10 login attempts/hr

### Authorization Layer
- RBAC: user, moderator, admin, super_admin
- Per-endpoint permission checks
- Never trust client role or claims

### Credit System Security
- Server always sources of truth for balance
- No client balance mutations
- All transactions logged with actor ID
- Idempotency keys prevent replay
- Transaction rollback on failure (ACID)

### Payment Security
- PCI DSS: Don't store raw card data (Stripe handles)
- Webhook signature verification
- Idempotent webhook processing
- Duplicate charge prevention

### Data Security
- Password: Bcrypt/Argon2 with salt
- Secrets: Environment variables, never on disk
- Database: Encrypted at rest (provider-level)
- Backups: Encrypted, tested restore monthly

---

## Scalability & Performance

### Caching Strategy (Optional Redis)
- Session store (client cookies preferred for web)
- Rate limit counters
- Game config (reload on change)
- Popular leaderboard segments

### Database Optimization
- Connection pooling (20–50 connections)
- Indexes on high-query paths (user_id, created_at)
- Partitioning on large tables (e.g., game_plays by month)
- Query optimization (N+1 prevention, batch operations)

### Frontend Optimization
- Code splitting (lazy load games, admin)
- Image optimization (WebP, responsive)
- CSS-in-JS or Tailwind (no runtime overhead)
- Static asset caching (30-day CDN)

### API Optimization
- Request caching (ETag, 304 Not Modified)
- Pagination (default 50 items, max 100)
- Field selection (return minimal data)
- Compression (gzip/brotli)

---

## Deployment & Environments

### Environments
- **Development**: Local machine, hot-reload, debug: true
- **Staging**: Production-like, real DB copy, Stripe test mode
- **Production**: Locked down, monitoring, Stripe live mode, backups

### Infrastructure
- **Frontend**: Vercel, Netlify, or self-hosted Next.js on Node
- **Backend**: Cloud Run, ECS, or self-hosted Docker
- **Database**: Managed PostgreSQL (RDS, Cloud SQL, Heroku)
- **Email**: Resend or SendGrid
- **Monitoring**: Sentry, DataDog, or custom logs

---

## Success Criteria

- [x] Architecture documented and clear
- [x] Data flow examples provided
- [x] Security layers defined
- [ ] Database migrations (Phase 2)
- [ ] API implementation (Phase 2)
- [ ] Deployments tested (Phase 17)
