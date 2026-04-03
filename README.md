# Mini Arcade Royale

A production-grade digital arcade entertainment platform with virtual credits, premium games, real payments, and complete account management. Built for serious players who want a trustworthy, visually modern, low-friction entertainment experience.

**Status**: Phase 0 — Project Structure & Documentation Foundation  
**Version**: 0.1.0  
**License**: Proprietary

---

## Table of Contents

- [Product Overview](#product-overview)
- [Feature Inventory](#feature-inventory)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Services](#running-services)
- [Stripe Integration](#stripe-integration)
- [Webhook Configuration](#webhook-configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Documentation Index](#documentation-index)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Admin Notes](#admin-notes)
- [Support](#support)

---

## Product Overview

**Mini Arcade Royale** is a virtual-credit arcade entertainment platform where users:

1. **Create accounts** with email/username authentication
2. **Purchase digital credits** with real money (Stripe payments)
3. **Play premium games** in modern, polished interfaces (Scratch Royale, Royale Spin, Mystery Vault)
4. **Win rewards** — more credits, badges, achievements, cosmetics
5. **Track progress** — stats, streaks, missions, leaderboards
6. **Enjoy a complete experience** — dashboard, history, settings, support

### Core Principles

- ✅ **Server-Authoritative** — All game outcomes, credits, and rewards determined server-side
- ✅ **Transactionally Safe** — All credit changes logged, immutable, and auditable
- ✅ **Real Payments** — Integration with Stripe for secure credit purchases
- ✅ **Premium UX** — Electric blue + royal purple theme, smooth animations, modern component design
- ✅ **No Casino Language** — Credits are entertainment currency, NOT redeemable for real money
- ✅ **Complete Legal** — Terms, Privacy, Credits Policy, Refund Policy, Game Rules, Acceptable Use, Cookie Policy all included
- ✅ **Production Ready** — Admin panel, support system, observability, incident response

---

## Feature Inventory

### Phase 1: Core Product (Now)
- [x] Project structure & documentation
- [ ] Design system with Tailwind CSS
- [ ] React/Next.js app shell and landing pages
- [ ] Premium UI component library

### Phase 2: Authentication
- [ ] Signup (Email, Username, Password, Confirm Password)
- [ ] Signup legal acceptance checkbox (required)
- [ ] Login (Email or Username)
- [ ] Logout (single session or all sessions)
- [ ] Forgot password / reset password
- [ ] Email verification
- [ ] Account management (profile, security, sessions)

### Phase 3: Credit System & Payments
- [ ] Credit wallet with server-side balance
- [ ] Immutable credit ledger (all transactions logged)
- [ ] Store with 5 credit packages ($0.99–$49.99)
- [ ] Stripe Checkout integration
- [ ] Stripe webhook handling (idempotent)
- [ ] Promo code support
- [ ] Purchase receipt emails
- [ ] Transaction history

### Phase 4: Game Engine
- [ ] Server-side game outcome engine
- [ ] Idempotency key support (prevent double-plays)
- [ ] Atomic play transactions
- [ ] Configurable reward tables
- [ ] Anti-abuse logging

### Phase 5–7: Games
- [ ] **Scratch Royale** — Premium scratch card game
- [ ] **Royale Spin** — Polished wheel spin game
- [ ] **Mystery Vault** — Rarity-based vault opening

### Phase 8: Progression & Retention
- [ ] User progression (XP, levels)
- [ ] Daily login rewards
- [ ] Login streak tracking
- [ ] Weekly missions
- [ ] Achievement system
- [ ] Badge system

### Phase 9: Dashboard & History
- [ ] User dashboard (balance, recent games, current streak, missions)
- [ ] Game history
- [ ] Player stats
- [ ] Leaderboard (most wins, most played, longest streak)

### Phase 10: Membership & Offers
- [ ] Optional VIP/Membership tier
- [ ] First-purchase bonus
- [ ] Limited-time offers
- [ ] Seasonal bundles

### Phase 11: Admin Panel
- [ ] User search & account management
- [ ] Credit adjustment (with audit trail)
- [ ] Promo code manager
- [ ] Store package manager
- [ ] Game configuration editor
- [ ] Reward table manager
- [ ] Webhook log viewer
- [ ] Support ticket manager
- [ ] Audit log viewer
- [ ] Legal acceptance lookup

### Phase 12: Support System
- [ ] Contact form
- [ ] Purchase issue form
- [ ] Security report form
- [ ] Support ticket management
- [ ] Admin review queue

### Phase 13: Legal Pages
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Credits Policy (no cash redemption)
- [ ] Refund Policy
- [ ] Game Rules
- [ ] Acceptable Use Policy
- [ ] Cookie Policy
- [ ] DMCA Policy

### Phase 14–17: Completion & Launch
- [ ] Full API surface
- [ ] Security hardening (rate limits, CSRF, input validation)
- [ ] Testing (unit, integration, API)
- [ ] QA checklist
- [ ] Deployment runbook
- [ ] Monitoring & alerting

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build & Routing**: Next.js 14 (App Router recommended)
- **Styling**: Tailwind CSS 3 + custom design tokens
- **Animation**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand (or Redux Toolkit if needed)
- **Icons**: Lucide React or Heroicons

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2
- **Validation**: Pydantic v2
- **Database**: PostgreSQL 14+
- **Migrations**: Alembic
- **Cache/Locks**: Redis (optional, for rate limits and locks)
- **Task Queue**: Celery (optional, for async jobs)
- **Auth**: PassLib + JWT (session cookies for web, JWT for mobile)
- **Payments**: Stripe API

### Database
- **Primary**: PostgreSQL 14+ (ACID-compliant, production-ready)
- **Optional Cache**: Redis (rate limit keys, session store)

### Deployment
- **Frontend**: Vercel, Netlify, or self-hosted Node
- **Backend**: Docker + Kubernetes, AWS ECS, or cloud-native platform
- **Database**: Managed PostgreSQL (AWS RDS, Google Cloud SQL, Heroku Postgres)
- **Email**: Resend, SendGrid, or AWS SES
- **Monitoring**: Sentry, DataDog, or New Relic
- **CDN**: Cloudflare or AWS CloudFront

---

## Quick Start

### Prerequisites
- Python 3.11+ ([install](https://www.python.org/downloads/))
- Node.js 18+ ([install](https://nodejs.org/))
- PostgreSQL 14+ ([install](https://www.postgresql.org/download/))
- Docker + Docker Compose (recommended for postgres locally)
- Git

### 30-Second Setup

```bash
# 1. Clone and navigate
cd "Mini Arcade Royale"

# 2. Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Set up frontend
cd ../frontend
npm install

# 4. Copy environment templates
cp ../.env.example ../.env

# 5. See detailed setup in README_LOCAL_DEV.md
```

For **complete step-by-step setup**, see [README_LOCAL_DEV.md](README_LOCAL_DEV.md).

---

## Local Development Setup

### Full Setup Instructions

See **[README_LOCAL_DEV.md](README_LOCAL_DEV.md)** for:
- Detailed backend setup (venv, dependencies, database)
- Frontend setup (Node, npm, Next.js)
- Local PostgreSQL or Docker setup
- Running both services concurrently
- Seed data and test accounts

### New Developer Checklist

- [ ] Python 3.11+ and Node 18+ installed
- [ ] PostgreSQL running locally (or Docker Compose up)
- [ ] Backend `venv` activated and dependencies installed
- [ ] Frontend `node_modules` installed
- [ ] `.env` file copied and configured
- [ ] Database migrations ran (`alembic upgrade head`)
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Can access `http://localhost:3000` and sign up

---

## Environment Variables

Copy `.env.example` to `.env` and fill in real values.

### Required Variables

```env
# App config
APP_NAME=Mini Arcade Royale
APP_ENV=development
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/arcade_royale_dev

# Redis (optional, for caching and rate limits)
REDIS_URL=redis://localhost:6379/0

# Session & Auth
SESSION_SECRET=your-random-session-secret-min-32-chars
JWT_SECRET=your-random-jwt-secret-min-32-chars
CSRF_SECRET=your-random-csrf-secret-min-32-chars

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@mini-arcade-royale.com
SUPPORT_EMAIL=support@mini-arcade-royale.com
ADMIN_EMAIL=admin@mini-arcade-royale.com

# Observability
LOG_LEVEL=INFO
SENTRY_DSN=https://...

# Deploy config
SECURE_COOKIES=false  # true in production
COOKIE_DOMAIN=localhost  # .mini-arcade-royale.com in production
```

See `.env.example` for complete list and defaults.

---

## Database Setup

### Local PostgreSQL (Docker)

```bash
docker-compose up -d postgres
# Creates user: arcade_dev, password: arcade_pass, db: arcade_royale_dev
```

### Local PostgreSQL (Manual)

```bash
brew install postgresql  # macOS
# Or download from postgresql.org

createuser arcade_dev -P  # prompted for password
createdb arcade_royale_dev -O arcade_dev
```

### Migrations

```bash
cd backend
alembic upgrade head  # Run all pending migrations
alembic current       # Check current revision
```

---

## Running Services

### Backend (FastAPI)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

- API available at `http://localhost:8000`
- Docs at `http://localhost:8000/docs` (interactive Swagger)

### Frontend (Next.js)

```bash
cd frontend
npm run dev
```

- App available at `http://localhost:3000`

### Both Concurrently

Use `tmux`, `screen`, or two terminal tabs:

```bash
# Terminal 1
cd backend && source venv/bin/activate && uvicorn main:app --reload

# Terminal 2
cd frontend && npm run dev
```

---

## Stripe Integration

### Sandbox Setup

1. **Create Stripe account** at [stripe.com](https://stripe.com/)
2. **Get test keys** from Dashboard → Developers → API Keys
3. **Set environment variables**:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. **Create products & prices** in Stripe Dashboard (or seeded in migrations)
5. **Test with Stripe test cards** (e.g., `4242 4242 4242 4242`)

### Webhook Testing Locally

```bash
# Install Stripe CLI if not already
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhook events to your local backend
stripe listen --forward-to localhost:8000/api/webhooks/stripe

# Trigger test webhook
stripe trigger charge.succeeded
```

---

## Webhook Configuration

### Stripe Webhook Endpoint

- **URL**: `{BACKEND_URL}/api/webhooks/stripe`
- **Events**: `charge.succeeded`, `charge.refunded`, `checkout.session.completed`
- **Secret**: Store in `STRIPE_WEBHOOK_SECRET`

### Handler Requirements

- ✅ Verify webhook signature
- ✅ Log all webhook events
- ✅ Handle idempotency (same event may arrive multiple times)
- ✅ Grant credits only once per checkout session
- ✅ Notify user via email after credits added
- ✅ Reconcile with purchase record

---

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
pytest tests/ -v --cov=app  # With coverage
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:e2e  # End-to-end with Playwright
```

### Manual API Testing

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Deployment

**🚀 LIVE**: [mini-arcade-royale-production.up.railway.app](https://mini-arcade-royale-production.up.railway.app)  
**Hosted on**: Railway | **Port**: 8080 | **Region**: US East | **Auto-Deploy**: Enabled (main branch)

For complete deployment instructions, see **[README_DEPLOYMENT.md](README_DEPLOYMENT.md)**.

### High-Level Checklist

- [✓] Service deployed on Railway
- [✓] GitHub connected (main branch → auto-deploy)
- [ ] Environment variables configured for production
- [ ] Database migrations tested
- [ ] HTTPS enabled (via Railway)
- [ ] Stripe live keys configured
- [ ] Email provider (Resend) configured
- [ ] Sentry or monitoring configured
- [ ] Backup strategy documented
- [ ] Rollback plan documented
- [ ] Health checks green
- [ ] Admin account created

---

## Project Structure

```
Mini Arcade Royale/
├── frontend/                    # React/Next.js app
│   ├── app/                     # Next.js app directory
│   ├── components/              # Reusable React components
│   ├── lib/                     # Utilities, API client, hooks
│   ├── styles/                  # Tailwind config, globals
│   ├── public/                  # Static assets
│   └── package.json
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic validation
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Auth, CORS, logging
│   │   └── utils/               # Helpers, constants
│   ├── migrations/              # Alembic migrations (in /migrations root)
│   ├── tests/                   # pytest tests
│   ├── requirements.txt         # Python dependencies
│   └── config.py                # Environment & settings
│
├── database/                    # Database setup & schemas
│   └── README.md                # Database documentation
│
├── migrations/                  # Alembic migrations (run from backend)
│   ├── env.py
│   ├── script.py.mako
│   └── versions/                # Migration files
│
├── templates/                   # Email & static HTML templates
│   ├── email/                   # Email templates (Mjml or HTML)
│   │   ├── welcome.html
│   │   ├── verify_email.html
│   │   ├── reset_password.html
│   │   ├── purchase_receipt.html
│   │   ├── credits_added.html
│   │   ├── suspicious_login.html
│   │   ├── support_reply.html
│   │   └── policy_update.html
│   └── static/
│       └── text.html            # Branded fallback page
│
├── legal/                       # Generated legal HTML pages
│   ├── terms.html
│   ├── privacy.html
│   ├── credits_policy.html
│   ├── refund_policy.html
│   ├── game_rules.html
│   ├── acceptable_use.html
│   ├── cookie_policy.html
│   └── dmca.html
│
├── context_docs/                # Knowledge base for AI & humans
│   ├── product/                 # Product specs
│   ├── brand/                   # Brand guidelines
│   ├── design/                  # Design system
│   ├── architecture/            # System design
│   ├── backend/                 # Backend patterns
│   ├── frontend/                # Frontend patterns
│   ├── auth/                    # Authentication rules
│   ├── payments/                # Payment flows
│   ├── credits/                 # Credit economy
│   ├── games/                   # Game specifications
│   ├── admin/                   # Admin system
│   ├── support/                 # Support processes
│   ├── legal/                   # Legal document sources
│   ├── security/                # Security hardening
│   ├── ops/                     # Operations & deployment
│   ├── qa/                      # QA & testing
│   └── releases/                # Release management
│
├── rag/                         # RAG (Retrieval-Augmented Generation) foundation
│   ├── README.md                # RAG overview
│   ├── chunking_strategy.md     # How to split docs
│   ├── indexing_strategy.md     # Search indexing
│   ├── document_priority_map.md # Doc priority for retrieval
│   └── metadata_schema.md       # Metadata for chunks
│
├── ops/                         # Operational runbooks
│   ├── deployment.md
│   ├── healthchecks.md
│   ├── incident_response.md
│   └── monitoring.md
│
├── tests/                       # Integration, E2E tests
│   ├── api/
│   ├── auth/
│   ├── payments/
│   ├── games/
│   └── e2e/
│
├── scripts/                     # Developer & admin scripts
│   ├── seed.py                  # Seed database
│   ├── create_admin.py          # Create admin user
│   ├── backup.sh                # Backup database
│   └── restore.sh               # Restore database
│
├── assets/                      # Design assets, logos, etc.
│   ├── logo/
│   ├── colors/
│   ├── illustrations/
│   └── fonts/
│
├── README.md                    # You are here
├── README_LOCAL_DEV.md          # Local development guide
├── README_DEPLOYMENT.md         # Deployment guide
├── .env.example                 # Environment template
└── .gitignore

```

---

## Documentation Index

### Quick References
- **[README_LOCAL_DEV.md](README_LOCAL_DEV.md)** — Local development setup guide
- **[README_DEPLOYMENT.md](README_DEPLOYMENT.md)** — Deployment & infrastructure guide
- **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** — 🚀 Railway production reference (quick guide)
- **[.env.example](.env.example)** — Environment variables template

### Deployment Files
- **[Dockerfile](Dockerfile)** — Backend containerization
- **[.dockerignore](.dockerignore)** — Docker build optimization
- **[railway.json](railway.json)** — Railway infrastructure-as-code
- **[.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)** — GitHub Actions CI/CD pipeline

### Context Docs (AI & Human Knowledge Base)
- **[context_docs/product/PRODUCT_OVERVIEW.md](context_docs/product/PRODUCT_OVERVIEW.md)** — Business model, KPIs
- **[context_docs/brand/BRAND_GUIDE.md](context_docs/brand/BRAND_GUIDE.md)** — Voice, tone, visual identity
- **[context_docs/design/DESIGN_SYSTEM.md](context_docs/design/DESIGN_SYSTEM.md)** — Component library, tokens
- **[context_docs/architecture/SYSTEM_ARCHITECTURE.md](context_docs/architecture/SYSTEM_ARCHITECTURE.md)** — System design, data flow
- **[context_docs/auth/AUTH_RULES.md](context_docs/auth/AUTH_RULES.md)** — Auth flows, session rules
- **[context_docs/payments/STRIPE_FLOW.md](context_docs/payments/STRIPE_FLOW.md)** — Payment integration
- **[context_docs/credits/CREDIT_LEDGER_RULES.md](context_docs/credits/CREDIT_LEDGER_RULES.md)** — Credit economy rules
- **[context_docs/games/GAME_ENGINE_RULES.md](context_docs/games/GAME_ENGINE_RULES.md)** — Game play flow
- **[context_docs/admin/ADMIN_ACTION_POLICY.md](context_docs/admin/ADMIN_ACTION_POLICY.md)** — Admin capabilities
- **[context_docs/ops/DEPLOYMENT_RUNBOOK.md](context_docs/ops/DEPLOYMENT_RUNBOOK.md)** — Deploy procedures
- **[context_docs/backend/API_CONTRACTS.md](context_docs/backend/API_CONTRACTS.md)** — API endpoint specifications

### Legal Documentation
- **[legal/LEGAL_PAGE_SOURCE_NOTES.md](context_docs/legal/LEGAL_PAGE_SOURCE_NOTES.md)** — Content mappings
- **[legal/TERMS_SOURCE.md](context_docs/legal/TERMS_SOURCE.md)** — Terms of Service
- **[legal/PRIVACY_SOURCE.md](context_docs/legal/PRIVACY_SOURCE.md)** — Privacy Policy
- **[legal/CREDITS_POLICY_SOURCE.md](context_docs/legal/CREDITS_POLICY_SOURCE.md)** — Credits Policy
- **[legal/REFUND_POLICY_SOURCE.md](context_docs/legal/REFUND_POLICY_SOURCE.md)** — Refund Policy

### RAG Foundation
- **[rag/](rag/)** — Retrieval-augmented generation setup for AI assistance
- **[rag/README.md](rag/README.md)** — RAG system overview
- **[rag/chunking_strategy.md](rag/chunking_strategy.md)** — Document chunking for AI retrieval
- **[rag/indexing_strategy.md](rag/indexing_strategy.md)** — Search indexing methodology
- **[rag/document_priority_map.md](rag/document_priority_map.md)** — Document importance rankings

---

## Troubleshooting

### Backend won't start
```
Error: "uvicorn main:app" not found
→ Check venv is activated: source venv/bin/activate
→ Check main.py exists in backend/app/
→ Check dependencies: pip install -r requirements.txt
```

### Frontend won't start
```
Error: "next: command not found"
→ Install dependencies: npm install
→ Check Node version: node --version (should be 18+)
```

### Database connection error
```
Error: "could not connect to server"
→ Check PostgreSQL is running: pg_isready
→ Check DATABASE_URL in .env is correct
→ Check user/password: createuser arcade_dev -P
```

### Stripe webhook not firing
```
→ Check STRIPE_WEBHOOK_SECRET is set correctly
→ Run: stripe listen --forward-to localhost:8000/api/webhooks/stripe
→ Test: stripe trigger charge.succeeded
→ Check backend logs for webhook events
```

### Permission denied on scripts
```
chmod +x scripts/*.sh
```

---

## Security Notes

### Critical Security Practices (Non-Negotiable)

1. **Server-Side Auth** — ALL auth decisions made on server, never trust client
2. **Password Hashing** — Always use `bcrypt` or `argon2`, never plain text
3. **HTTPS Only** — All production traffic must be encrypted
4. **Secure Cookies** — HTTPOnly, Secure, SameSite=Strict
5. **CSRF Protection** — Use CSRF tokens on state-changing requests
6. **Rate Limiting** — Protect auth, play, and payment routes
7. **Input Validation** — Validate all user input (email, password, amounts)
8. **SQL Injection** — Use ORM (SQLAlchemy) and parameterized queries
9. **XSS Prevention** — Escape output, use Content Security Policy
10. **Secrets Management** — Never commit `.env`, use environment variables
11. **Audit Logging** — Log all credit changes, admin actions, purchases
12. **Idempotency Keys** — Prevent double-charge on game plays and purchases

### Compliance

- [ ] PCI DSS (Stripe handles payment data, not stored locally)
- [ ] GDPR (Privacy Policy, data deletion, consent)
- [ ] Terms of Service (All users must accept before signup)
- [ ] CCPA (California users have privacy rights)

---

## Admin Notes

### Initial Setup

```bash
# Create admin user
cd backend
python scripts/create_admin.py \
  --email admin@mini-arcade-royale.com \
  --username admin \
  --password <secure-password>

# Seed development data
python scripts/seed.py --environment=development
```

### Key Admin Operations

1. **Grant credits** — POST `/api/admin/credits/adjust` (logged, requires approval)
2. **View audit log** — GET `/api/admin/logs` (immutable record of all actions)
3. **Manage store packages** — POST/PATCH `/api/admin/store/packages`
4. **Review support tickets** — GET `/api/admin/support`
5. **Check purchase reconciliation** — GET `/api/admin/purchases`

### Emergency Procedures

- **Rollback webhook** — Run `python scripts/rollback_webhook.py <webhook_id>`
- **Suspend user** — POST `/api/admin/users/<id>/suspend` (audit logged)
- **Reverse credit transaction** — POST `/api/admin/credits/reversal` (with reason)

See **[context_docs/admin/ADMIN_ACTION_POLICY.md](context_docs/admin/ADMIN_ACTION_POLICY.md)** for complete admin guide.

---

## Support

### Getting Help

1. **Developer Issues**
   - Check [Troubleshooting](#troubleshooting) section
   - Review [README_LOCAL_DEV.md](README_LOCAL_DEV.md)
   - Check [context_docs/ops/](context_docs/ops/) for deployment issues

2. **User Issues**
   - Direct users to [Support Page](https://mini-arcade-royale.com/support)
   - Submit support tickets via `/support/contact`
   - Admin reviews via `/admin/support`

3. **Security Issues**
   - Do NOT post publicly
   - Email: security@mini-arcade-royale.com
   - Follow [context_docs/security/INCIDENT_RESPONSE.md](context_docs/security/INCIDENT_RESPONSE.md)

### Reporting Bugs

Submit issues on GitHub (or internal system):
- Include error logs
- Include browser/device info
- Include reproduction steps
- Include screenshots if UI-related

---

## Legal & Compliance

### Required User Acknowledgments

Before signup, users must read and agree to:
- ✅ Terms of Service
- ✅ Privacy Policy
- ✅ Credits Policy (no real-money redemption)
- ✅ Refund Policy
- ✅ Game Rules
- ✅ Acceptable Use Policy

**Acceptance is stored with timestamp, IP, browser, and policy version.**

See **[legal/](legal/)** directory and **[context_docs/legal/](context_docs/legal/)** for all legal source content.

---

## Contributing

### Code Standards

- **Python**: Follow PEP 8, use type hints
- **TypeScript**: Strict mode enabled, no `any`
- **Git**: Commit messages: `[PHASE][AREA] Short description`
  - Example: `[PHASE-2][AUTH] Fix email verification race condition`

### Branching

```
main           (production, tagged releases)
├── staging     (pre-release testing)
└── develop     (feature integration)
    ├── feature/auth-refactor
    ├── feature/game-balancing
    └── bugfix/rate-limit
```

---

## License & Branding

**Mini Arcade Royale** is proprietary and confidential.

Brand names supported via configuration:
- Mini Arcade Royale (default)
- Mini Pasttime
- Mini Royal Fun
- Mini Arcade

---

## Changelog

### [0.1.0] — 2026-04-03

**Status**: ✅ Phase 0 Complete

- [x] Full project directory structure
- [x] Comprehensive README files
- [x] Environment configuration template
- [x] Static HTML templates
- [x] Email templates (8 responsive)
- [x] Complete context docs (40+ files)
- [x] RAG foundation for AI retrieval
- [x] Database schemas & migrations setup

**Next Phase**: Phase 1 — Design System + App Shell + Landing Pages

---

## Credits

Built with production-grade standards. No corners cut.

**Questions?** See **[CONTRIBUTING.md](CONTRIBUTING.md)** or contact the dev team.
