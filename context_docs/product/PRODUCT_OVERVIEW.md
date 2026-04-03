# Product Overview

**Document Purpose**: Central reference for Mini Arcade Royale's product definition, business model, and core value proposition.

---

## What is Mini Arcade Royale?

Mini Arcade Royale is a **premium digital arcade entertainment platform** built on virtual credits. Users create accounts, purchase platform credits with real money, play engaging arcade-style games, and earn rewards and recognition.

### Business Model

- **Freemium Access**: Users can sign up free, but need to purchase credits to play
- **Primary Revenue**: Credit packages ($0.99 – $49.99)
- **Retention Revenue**: Optional membership, limited offers, seasonal bundles
- **No Real Money Out**: Credits are entertainment currency only. No cashout, no gambling framing.

### Core Differentiators

1. **Premium UX**: Electric blue + royal purple theme, smooth animations, modern design
2. **Server-Authoritative**: All game outcomes, rewards, economy decided server-side (not client)
3. **Trustworthy**: Full audit trail, transparent credit economy, easy support
4. **Complete**: Auth, payments, games, progression, leaderboards, admin panel, legal compliance — shipping as one product
5. **Sustainable**: No casino language, compliant with advertising standards, clear policy

---

## Key Metrics & KPIs

### Engagement
- **DAU** (Daily Active Users)
- **MAU** (Monthly Active Users)
- **Session length** (avg, median)
- **Games played per session**
- **Return rate** (7-day, 30-day)

### Monetization
- **ARPU** (Average Revenue Per User)
- **First-purchase conversion rate**
- **Repeat purchase rate**
- **Average credit purchase size**
- **LTV** (Lifetime Value)
- **CAC** (Customer Acquisition Cost)

### Economy Health
- **Total credits in circulation**
- **Credits spent vs. won** (balance ratio)
- **Average account balance**
- **Credit transaction volume**

### Support & Compliance
- **Support ticket response time** (target: < 24 hrs)
- **Refund rate** (track disputes)
- **Legal acceptance rate** (% of signups who accept ToS)
- **Uptime %** (target: 99.9%)

---

## Platform Pages

### Public (No Auth Required)
- **Homepage** (`/`) — Hero, features, CTA, FAQ
- **Games** (`/games`) — Game previews, how to play
- **Store** (`/store`) — Credit packages, pricing
- **Missions** (`/missions`) — Mission descriptions (public)
- **Leaderboard** (`/leaderboard`) — Top players (public view)
- **About** (`/about`) — Company, team, mission statement
- **Contact** (`/contact`) — General support form
- **Support** (`/support`) — Help center, FAQs
- **Legal** — Terms, Privacy, Credits Policy, Refund Policy, Game Rules, Acceptable Use, Cookie, DMCA

### Auth Pages
- **Signup** — Create account with legal acceptance
- **Login** — Email or username
- **Forgot Password** — Reset via email link
- **Reset Password** — Set new password
- **Verify Email** — Email token flow

### Authenticated (User)
- **Dashboard** — Balance, stats, active missions, recent games
- **Games** — Play Scratch Royale, Royale Spin, Mystery Vault
- **Account** — Profile, security, sessions, notifications, preferences
- **Credits** — Balance, transaction history, purchase history
- **Missions** — Active missions, mission details, claim rewards
- **Rewards** — Badges, achievements, streaks
- **Leaderboard** — Compete with other players
- **Store** — Buy credits, redeem promos
- **Membership** — VIP benefits, subscribe
- **Support** — Submit tickets, track issues
- **Settings** — Preferences, email, theme

### Admin-Only
- **Admin Dashboard** — Overview, metrics, alerts
- **User Management** — Search, view profiles, suspend/ban, adjust credits
- **Purchase Management** — View transactions, reconcile, refund
- **Game Config** — Enable/disable, tune costs, set reward tables
- **Promotion** — Create/edit promo codes
- **Store** — Manage credit packages
- **Support Queue** — Review and respond to tickets
- **Audit Log** — View all system actions
- **Webhooks** — Monitor Stripe events
- **Legal** — View acceptance history, version management

---

## Three Games

### Game 1: Scratch Royale
- **Format**: Digital scratch card
- **Cost**: 10 credits (configurable)
- **UX**: Smooth scratch mechanics, premium reveal animation
- **Rewards**: 50/500/5000 credits (configurable tiers)
- **Theme**: Electric blue / royal purple, modern premium feel

### Game 2: Royale Spin
- **Format**: Spinning wheel
- **Cost**: 15 credits (configurable)
- **UX**: Suspense timing, smooth easing, neon glow
- **Rewards**: 30/300/3000 credits (configurable tiers)
- **Theme**: High-end casino feel (but no gambling framing)

### Game 3: Mystery Vault
- **Format**: Vault opening with rarity system
- **Cost**: 20 credits (configurable)
- **UX**: Animation, rarity-based visuals, excitement
- **Rewards**: Commons / Rares / Legendaries with credit values
- **Theme**: Premium treasure chest / mystical

---

## Economy & Monetization

### Credit Packages

| Price | Credits | Value | Incentive |
|-------|---------|-------|-----------|
| $0.99 | 100 | 101 cr/$ | Entry-level |
| $4.99 | 600 | 120 cr/$ | Best for casual |
| $9.99 | 1,300 | 130 cr/$ | Best value |
| $19.99 | 2,800 | 140 cr/$ | High value |
| $49.99 | 8,000 | 160 cr/$ | Whale tier |

### Bonuses
- **First Purchase**: +20% bonus credits (configurable)
- **Member Bonus**: +10% monthly credit allowance (if VIP tier)
- **Daily Reward**: 5 credits (claimable once per day)
- **Streak Bonus**: 50 extra credits for 7-day login streak
- **Mission Rewards**: 20–200 credits per mission

### Promo Codes
- Code format: `ARCADE25` (6-8 chars, alphanumeric)
- Discount: % or fixed amount (e.g., +100 free credits)
- Usage: Per-account or global limit
- Expiry: Date-based expiration

---

## Legal & Compliance

### User Acknowledgments
Before signup, user MUST accept:
1. Terms of Service
2. Privacy Policy
3. **Credits Policy** (no real-money redemption, no gambling framing)
4. Refund Policy
5. Game Rules
6. Acceptable Use Policy

Acceptance is **stored with version, timestamp, IP, user agent**.

### No Gambling Framing
- ❌ "Win cash"
- ❌ "Real money gaming"
- ❌ "Make money while you play"
- ✅ "Earn entertainment credits"
- ✅ "Compete for rewards"
- ✅ "Play premium arcade games"

### Content Standards
- Age verification: 18+ (or per jurisdiction)
- No inappropriate content in games
- No offensive language in user profiles
- Report / moderation system for abuse

---

## Success Criteria (Phase 0 Complete)

- [x] Full directory structure created
- [x] README files comprehensive and clear
- [x] Environment template (.env.example) complete
- [x] Static HTML and email templates production-ready
- [x] Context docs established with key reference documents
- [x] RAG foundation ready for AI retrieval
- [ ] Next phase: Design system implementation
