# API Contracts

**Document Purpose**: Define all API endpoints, request/response schemas, authentication, and error handling for Mini Arcade Royale backend.

---

## API Overview

### Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.mini-arcade-royale.com/api`

### Version
- Current: `v1`
- Header: `Accept: application/json`
- All responses: `Content-Type: application/json`

### Authentication
- **Method**: Bearer token (JWT or session cookie)
- **Header**: `Authorization: Bearer {token}`
- **Cookie**: `session_id={id}` (alternative for web)
- **Public endpoints**: No auth required

---

## Authentication Endpoints

### POST /auth/signup

Register new user.

**Request**
```json
{
  "email": "user@example.com",
  "username": "player123",
  "password": "TempPass123!",
  "password_confirm": "TempPass123!",
  "legal_accepted": true,
  "legal_bundle_version": 1
}
```

**Response (201 Created)**
```json
{
  "user_id": "user_abc123",
  "username": "player123",
  "email": "user@example.com",
  "email_verified": false,
  "created_at": "2026-04-03T15:30:00Z",
  "message": "Signup successful. Check your email to verify."
}
```

**Error (400 Bad Request)**
```json
{
  "error": "validation_error",
  "details": [
    {
      "field": "email",
      "message": "Email already in use"
    },
    {
      "field": "password",
      "message": "Password must be 8+ chars with uppercase, lowercase, number, special char"
    }
  ]
}
```

---

### POST /auth/login

Authenticate and get session.

**Request**
```json
{
  "login": "player123",
  "password": "TempPass123!",
  "remember_me": false
}
```

**Response (200 OK)**
```json
{
  "user_id": "user_abc123",
  "username": "player123",
  "role": "user",
  "session_id": "sess_xyz789",
  "token_expires_at": "2026-04-04T15:30:00Z"
}
```

**Headers** (Set-Cookie)
```
Set-Cookie: session_id=sess_xyz789; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Error (401 Unauthorized)**
```json
{
  "error": "invalid_credentials",
  "message": "Invalid login or password"
}
```

---

### POST /auth/logout

Invalidate session.

**Request** (Authenticated)
```
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/me

Get current user info.

**Request** (Authenticated)
```
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "user_id": "user_abc123",
  "username": "player123",
  "email": "user@example.com",
  "email_verified": true,
  "role": "user",
  "created_at": "2026-04-03T15:30:00Z",
  "last_login_at": "2026-04-03T16:00:00Z"
}
```

---

### POST /auth/forgot-password

Request password reset.

**Request**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)** (Safe, no enumeration)
```json
{
  "message": "If email is registered, reset link sent"
}
```

---

### POST /auth/reset-password

Reset password with token.

**Request**
```json
{
  "token": "resettoken123",
  "password": "NewPass123!",
  "password_confirm": "NewPass123!"
}
```

**Response (200 OK)**
```json
{
  "message": "Password reset successfully. Proceed to login."
}
```

---

## User Endpoints

### GET /user/account

Get account details.

**Request** (Authenticated)

**Response (200 OK)**
```json
{
  "user_id": "user_abc123",
  "username": "player123",
  "email": "user@example.com",
  "email_verified": true,
  "created_at": "2026-04-03T15:30:00Z",
  "last_login_at": "2026-04-03T16:00:00Z",
  "role": "user"
}
```

---

### GET /user/credits

Get credit balance and transaction history.

**Request** (Authenticated)
```
GET /user/credits?limit=50&offset=0
```

**Response (200 OK)**
```json
{
  "balance": 1500,
  "transactions": [
    {
      "id": "txn_abc123",
      "type": "GAME_REWARD",
      "amount": 500,
      "reference": "Scratch Royale win",
      "timestamp": "2026-04-03T16:05:00Z"
    },
    {
      "id": "txn_xyz789",
      "type": "PURCHASE",
      "amount": 1000,
      "reference": "Pro package purchase",
      "timestamp": "2026-04-03T15:30:00Z"
    }
  ],
  "total_count": 1200,
  "limit": 50,
  "offset": 0
}
```

---

## Game Endpoints

### GET /games

List available games.

**Request** (Authenticated)

**Response (200 OK)**
```json
{
  "games": [
    {
      "key": "scratch_royale",
      "name": "Scratch Royale",
      "description": "Scratch-off lottery cards",
      "cost_credits": 10,
      "max_payout_credits": 500,
      "theme_color": "#00D9FF"
    },
    {
      "key": "royale_spin",
      "name": "Royale Spin",
      "description": "Spinning wheel of fortune",
      "cost_credits": 15,
      "max_payout_credits": 500,
      "theme_color": "#9D4EDD"
    },
    {
      "key": "mystery_vault",
      "name": "Mystery Vault",
      "description": "Open vault, reveal prize",
      "cost_credits": 20,
      "max_payout_credits": 1000,
      "theme_color": "#00D084"
    }
  ]
}
```

---

### POST /games/{game_key}/play

Play a game.

**Request** (Authenticated)
```json
{
  "idempotency_key": "play_20260403_160530_abc123",
  "bet": 10
}
```

**Response (200 OK)**
```json
{
  "game_play_id": "play_xyz789",
  "game_key": "scratch_royale",
  "result": "win",
  "payout": 500,
  "previous_balance": 1500,
  "new_balance": 1990,
  "animation_data": {
    "result_animation": "big_win",
    "reveal_sequence": ["s1", "s2", "s3", "s4", "s5"],
    "particles": "gold_confetti"
  }
}
```

**Error (400 Bad Request)**
```json
{
  "error": "insufficient_credits",
  "current_balance": 8,
  "required": 10
}
```

---

## Store Endpoints

### GET /store/packages

List credit packages.

**Request**

**Response (200 OK)**
```json
{
  "packages": [
    {
      "id": "100_credits",
      "name": "Starter",
      "credits": 100,
      "price_cents": 99,
      "currency": "USD",
      "bonus_percent": 0,
      "stripe_price_id": "price_test_..."
    },
    {
      "id": "1000_credits",
      "name": "Pro",
      "credits": 1000,
      "price_cents": 999,
      "currency": "USD",
      "bonus_percent": 20,
      "stripe_price_id": "price_test_..."
    }
  ]
}
```

---

### POST /store/create-checkout

Initiate Stripe checkout session.

**Request** (Authenticated)
```json
{
  "package_id": "1000_credits",
  "idempotency_key": "checkout_20260403_160530_xyz"
}
```

**Response (201 Created)**
```json
{
  "session_id": "cs_test_...",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "package_id": "1000_credits",
  "credits": 1000,
  "price_cents": 999
}
```

---

### POST /store/apply-promo

Apply promo code.

**Request** (Authenticated)
```json
{
  "code": "WELCOME50"
}
```

**Response (200 OK)**
```json
{
  "code": "WELCOME50",
  "discount_percent": 50,
  "max_uses": 1000,
  "uses_remaining": 999,
  "expires_at": "2026-12-31T23:59:59Z"
}
```

**Error (404 Not Found)**
```json
{
  "error": "invalid_promo",
  "message": "Promo code not found or expired"
}
```

---

## Leaderboard Endpoints

### GET /leaderboard

Get top-ranked players.

**Request**
```
GET /leaderboard?game_key=scratch_royale&limit=100&period=weekly
```

**Response (200 OK)**
```json
{
  "period": "weekly",
  "game_key": "scratch_royale",
  "leaderboard": [
    {
      "rank": 1,
      "username": "ProlPlayer",
      "total_wins": 456,
      "total_earnings": 45000,
      "avatar_color": "#FF0000"
    },
    {
      "rank": 2,
      "username": "ScratchMaster",
      "total_wins": 432,
      "total_earnings": 43200,
      "avatar_color": "#0000FF"
    }
  ]
}
```

---

## Support Endpoints

### POST /support/tickets

Create support ticket.

**Request** (Authenticated)
```json
{
  "category": "purchase_issue",
  "subject": "Missing credits in account",
  "description": "I purchased 1000 credits but only received 800",
  "order_id": "checkout_xyz789"
}
```

**Response (201 Created)**
```json
{
  "ticket_id": "ticket_abc123",
  "status": "open",
  "priority": "medium",
  "created_at": "2026-04-03T16:05:00Z",
  "estimated_response": "2026-04-03T18:05:00Z"
}
```

---

### GET /support/tickets

Get user's support tickets.

**Request** (Authenticated)
```
GET /support/tickets?status=open&limit=10
```

**Response (200 OK)**
```json
{
  "tickets": [
    {
      "ticket_id": "ticket_abc123",
      "subject": "Missing credits in account",
      "status": "open",
      "priority": "medium",
      "created_at": "2026-04-03T16:05:00Z",
      "updated_at": "2026-04-03T18:05:00Z",
      "last_reply": "We're investigating..."
    }
  ],
  "total_count": 3
}
```

---

## Admin Endpoints

### POST /admin/users/{user_id}/adjust-credits

Admin adjust user credits.

**Request** (Authenticated, role: admin)
```json
{
  "amount": 1000,
  "type": "add",
  "reason": "Refund for missing purchase credits"
}
```

**Response (200 OK)**
```json
{
  "user_id": "user_abc123",
  "adjustment_id": "adj_xyz789",
  "amount": 1000,
  "previous_balance": 500,
  "new_balance": 1500,
  "reason": "Refund for missing purchase credits",
  "timestamp": "2026-04-03T16:05:00Z"
}
```

---

### GET /admin/dashboard

Admin dashboard statistics.

**Request** (Authenticated, role: admin)

**Response (200 OK)**
```json
{
  "stats": {
    "active_users_today": 1250,
    "new_users_today": 85,
    "total_games_played": 450000,
    "revenue_today_cents": 125000,
    "average_order_value_cents": 999,
    "support_tickets_open": 23,
    "fraud_alerts": 3
  }
}
```

---

## Error Response Format

### Standard Error

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "request_id": "req_abc123xyz",
  "timestamp": "2026-04-03T16:05:00Z"
}
```

### Validation Error

```json
{
  "error": "validation_error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password too short"
    }
  ]
}
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized (missing permission) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/race condition |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal error |
| 503 | Service Unavailable | Maintenance |

---

## Rate Limiting

**Headers**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1649077200
```

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth (login, signup) | 10/hour | Per IP |
| Games (play) | 10/minute | Per user |
| Store (checkout) | 5/hour | Per user |
| Support (create ticket) | 5/day | Per user |
| Admin (any) | 100/minute | Per admin |

**Error (429 Too Many Requests)**
```json
{
  "error": "rate_limited",
  "message": "Too many requests. Retry after 3600 seconds",
  "retry_after": 3600
}
```

---

## Success Criteria

- [x] All endpoint signatures defined
- [x] Request/response schemas documented
- [x] HTTP status codes specified
- [x] Error handling detailed
- [x] Rate limits defined
- [x] Auth requirements clear
- [ ] Implementation in Phase 2 (backend)
