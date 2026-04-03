# Credit Ledger Rules

**Document Purpose**: Define credit economy, ledger operations, and transaction safety for Mini Arcade Royale.

---

## Credit System Fundamentals

### Credit = Virtual Entertainment Currency

- **Definition**: Numerical balance in user's wallet
- **Representation**: Always as positive integer (no fractions)
- **Scope**: Only usable on Mini Arcade Royale platform
- **Redemption**: NOT redeemable for real money
- **Expiration**: No expiration (lifetime until account deletion)
- **Transferability**: NOT transferable between users

### Wallet Model

```
credit_wallets
├─ id (PK)
├─ user_id (FK, unique)
├─ balance (integer, >= 0)
├─ created_at
└─ updated_at  (only on balance change)
```

**Rules**
- One wallet per user
- Balance >= 0 (never negative)
- Only source of truth for user's balance

---

## Ledger & Transactions

### Transaction Record

```
credit_transactions
├─ id (PK)
├─ user_id (FK)
├─ transaction_type (enum)
├─ amount_delta (signed integer, can be +/-)
├─ balance_before (snapshot)
├─ balance_after (snapshot)
├─ reference_type (e.g., 'game_play', 'purchase', 'admin_adjustment')
├─ reference_id (e.g., game_play record ID)
├─ note (optional description)
├─ created_by_system_or_admin (enum: 'system' | 'admin_id')
├─ admin_actor_id (nullable, if admin-initiated)
├─ ip_address (for traceability)
├─ created_at (immutable timestamp)
└─ (no update or delete operations)
```

**Immutability**
- Transactions are WRITE-ONCE, NEVER modified
- No update or delete operations allowed
- Provides auditable trail for all credit changes

---

## Transaction Types

### Purchase-Related
- **PURCHASE**: Credit purchase from store (e.g., user bought 1000 credits for $9.99)
- **PURCHASE_BONUS**: Bonus applied to purchase (e.g., +20% first purchase)
- **PURCHASE_REVERSAL**: Refund of credits due to chargeback or request

### Gameplay-Related
- **GAME_SPEND**: Cost deducted playing game (e.g., -10 for Scratch Royale)
- **GAME_REWARD**: Credits won from gameplay (e.g., +500 from game outcome)
- **GAME_REVERSAL**: Reversal due to cheating detection or bug

### Progression & Rewards
- **DAILY_BONUS**: Daily login reward (e.g., +5 credits)
- **MISSION_REWARD**: Completed mission reward (e.g., +50 credits)
- **STREAK_REWARD**: Login streak milestone (e.g., +100 for 7-day streak)
- **ACHIEVEMENT_REWARD**: Achievement unlocked reward
- **EVENT_REWARD**: Special event credits

### Promotions
- **PROMO_REWARD**: Promo code applied (e.g., +100 credits)
- **BONUS_CREDIT**: One-time promotional bonus

### Admin & Disputes
- **ADMIN_ADJUSTMENT_ADD**: Admin grants credits with reason
- **ADMIN_ADJUSTMENT_SUBTRACT**: Admin deducts credits with reason
- **REFUND_REVERSAL**: Reversal of refund (e.g., user re-deposits)

---

## Ledger Operations

### Read Operations (Frequent, Fast)

**Get Current Balance**
```
SELECT balance FROM credit_wallets WHERE user_id = ?
```
- Response time: < 10ms (cached if needed)
- Authorization: User owns wallet or admin

**Get Transaction History**
```
SELECT * FROM credit_transactions 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 100
```
- Response time: < 100ms
- Authorization: User owns or admin
- Pagination: Support offset/limit

**Get Balance at Point in Time**
```
SELECT balance_after FROM credit_transactions
WHERE user_id = ? AND created_at <= ?
ORDER BY created_at DESC
LIMIT 1
```
- Used for auditing, chargeback disputes

### Write Operations (Atomic, Safe)

**Debit Credits (Game Play)**

```python
# Pseudo-code
BEGIN TRANSACTION
  1. Lock wallet row: SELECT ... FOR UPDATE
  2. Check balance >= cost
  3. If insufficient: ROLLBACK, return error
  4. Update wallet: balance -= cost
  5. Create transaction record:
     - transaction_type: GAME_SPEND
     - amount_delta: -cost
     - balance_before: old_balance
     - balance_after: new_balance
     - reference_id: game_play_id
  6. COMMIT
END TRANSACTION
```

**Credit Credits (Win Reward)**

```python
BEGIN TRANSACTION
  1. Lock wallet: SELECT ... FOR UPDATE
  2. Update wallet: balance += reward
  3. Create transaction record:
     - transaction_type: GAME_REWARD
     - amount_delta: +reward
     - balance_before: old_balance
     - balance_after: new_balance
     - reference_id: game_play_id
  4. COMMIT
END TRANSACTION
```

**Admin Adjustment (With Reason)**

```python
BEGIN TRANSACTION
  1. Authenticate admin (role: admin or super_admin)
  2. Validate amount (min/max limits: e.g., -10000 to +10000)
  3. Require reason (string, >= 10 chars)
  4. Lock wallet
  5. Update balance
  6. Create transaction record:
     - transaction_type: ADMIN_ADJUSTMENT_ADD or SUBTRACT
     - admin_actor_id: admin_user_id
     - note: reason (required)
  7. Log to audit_logs table
  8. COMMIT
END TRANSACTION
```

---

## Idempotency & Replay Protection

### Problem
- Network failures or retries might cause duplicate processing
- Example: User plays game, server deducts credits, but response times out
  - Client retries the request
  - If no protection, credits deducted twice

### Solution: Idempotency Keys

**Request**
```json
POST /api/games/scratch-royale/play
{
  "idempotency_key": "play_20240403_150530_abc123xyz",
  ...
}
```

**Idempotency Storage**
```
idempotency_keys
├─ id
├─ user_id
├─ idempotency_key (unique: user_id + key)
├─ operation (e.g., 'game_play', 'purchase')
├─ response_data (cached result)
├─ created_at
└─ expires_at (24 hours)
```

**Backend Logic**
```python
def play_game(user_id, idempotency_key, game_key):
  # Check if already processed
  existing = db.query(idempotency_keys).filter(
    idempotency_key=idempotency_key,
    user_id=user_id
  ).first()
  
  if existing and not expired(existing.created_at):
    # Return cached result (same as first attempt)
    return existing.response_data
  
  # First time or expired; process normally
  result = process_game_play(user_id, game_key)
  
  # Store for future retries
  db.create(idempotency_keys, {
    user_id, idempotency_key, response_data
  })
  
  return result
```

---

## Consistency & Reconciliation

### Daily Reconciliation Check

```sql
-- Balance should equal sum of all transactions
SELECT 
  user_id,
  balance as wallet_balance,
  COALESCE(SUM(amount_delta), 0) as ledger_sum
FROM credit_wallets w
LEFT JOIN credit_transactions t ON w.user_id = t.user_id
GROUP BY user_id
HAVING wallet_balance != ledger_sum
```

**If Mismatch Detected**
1. Alert admin immediately (Sentry error)
2. Lock user's account (prevent further plays)
3. Investigate and reconcile manually
4. Log correction in audit_logs

### Purchase Reconciliation

After Stripe webhook:

```python
# Verify purchase recorded
purchase = db.query(stripe_checkout_sessions).filter(
  session_id = webhook.session_id
).first()

if purchase:
  # Credits already granted (idempotent; ok to re-grant)
  # Log duplicate webhook
  pass
else:
  # First time; grant credits
  grant_credits(purchase.user_id, purchase.package_id)
```

---

## Admin Operations

### Grant Credits

**Backend Endpoint**: POST `/api/admin/credits/adjust`

```json
{
  "user_id": "user_123",
  "amount": 1000,
  "type": "add",
  "reason": "Refund for missing purchase credits from 2024-03-15"
}
```

**Authorization**
- Admin role required
- IP logged
- Audit entry created

**Confirmation**
- Show summary before commit
- Require admin to confirm (prevent misclicks)
- Send email to user if large amount

### Deduct Credits

**Similar to grant, type: "subtract"**
- Used for: Fraud reversal, chargeback, abuse punishment
- Reason required (audit trail)
- Can go negative temporarily, then lock account

### Reversal

**Revert a transaction**
- Create new REVERSAL transaction (don't delete)
- Reason: "Reversal of transaction_id_123 due to [reason]"
- Always creates new transaction (immutable history)

---

## Purchase Integration

### Credit Purchase Flow

1. User selects package ($9.99 → 1000 credits with +20% bonus = 1200 total)
2. Backend creates order: `stripe_checkout_sessions{session_id, user_id, package_id, amount, status: 'pending'}`
3. Redirect to Stripe Checkout
4. User pays
5. Stripe calls webhook: `charge.succeeded`
6. Backend verifies webhook signature
7. Find order by session_id
8. Create transaction: `PURCHASE for 1000 + PURCHASE_BONUS for 200`
9. Store webhook_received_at
10. Send receipt email + "credits_added" email
11. Mark order status: "completed"

### Refund Flow

1. User requests refund in support ticket (or chargeback from bank)
2. Admin reviews purchase
3. If approved:
   - Issue refund via Stripe (reverses charge)
   - Stripe webhook: `charge.refunded`
   - Backend creates transaction: `PURCHASE_REVERSAL`
   - Deduct credits from user
   - If insufficient balance, lock account pending investigation
4. Notify user via email

---

## Dispute & Investigation

### User Claims Missing Credits

1. Find all purchases by user in past 30 days
2. Find credit_transactions matching purchases
3. Check webhook_received_at (is webhook logged?)
4. If webhook missing: Reprocess webhook (safe, idempotent)
5. If mismatch: Manual investigation + admin adjustment

### Admin Audit View

```
SELECT 
  u.username,
  p.amount as purchase_amount,
  p.created_at,
  COUNT(CASE WHEN t.transaction_type IN ('PURCHASE', 'PURCHASE_BONUS') THEN 1 END) as grant_count,
  SUM(CASE WHEN t.transaction_type IN ('PURCHASE', 'PURCHASE_BONUS') THEN t.amount_delta ELSE 0 END) as total_credits
FROM stripe_checkout_sessions p
JOIN users u ON p.user_id = u.id
LEFT JOIN credit_transactions t ON p.id = t.reference_id
WHERE p.created_at > NOW() - INTERVAL 7 DAY
GROUP BY p.id
HAVING purchase_amount IS NOT NULL
```

---

## Success Criteria

- [x] Ledger design documented
- [x] Transaction types defined
- [x] Consistency rules established
- [x] Idempotency explained
- [ ] Implementation in Phase 3
