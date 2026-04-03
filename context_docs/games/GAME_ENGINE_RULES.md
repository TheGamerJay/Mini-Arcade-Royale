# Game Engine Rules

**Document Purpose**: Define game mechanics, payout calculations, and server-side game logic for Mini Arcade Royale.

---

## Game Engine Principles

### Core Rule: Server-Authoritative

- **Frontend**: Animates only; has NO access to outcome decisions
- **Server**: Decides ALL outcomes (RNG, payouts, validation)
- **Client**: Receives final result as immutable fact
- **Trust**: Server result is always correct; client never trusted for balances or wins

### Game Play Flow

```
1. Client selects game
2. Client calls POST /api/games/{game_key}/play
   └─ Body: { "idempotency_key": "...", "bet": 10 }

3. Server validates:
   ✓ User authenticated
   ✓ User has sufficient credits
   ✓ Bet within game limits
   ✓ Rate limit not exceeded
   ✓ Idempotency key not already processed

4. Server deducts credits (locked transaction)

5. Server calculates outcome (RNG + game rules)
   └─ Decision is FINAL and immutable

6. Server logs game_play record with outcome

7. Server responds with:
   {
     "game_play_id": "play_abc123",
     "result": "win" | "lose",
     "payout": 500,
     "new_balance": 1490
   }

8. Client receives response

9. Client animates outcome animation
   └─ No logic, just visual representation of server result

10. Server updates wallet balance (credits awarded if win)
```

**Key**: NO back-and-forth; outcome determined server-side in step 5, sent to client in step 7.

---

## Game Play Record

```
game_plays
├─ id (PK)
├─ user_id (FK)
├─ game_key (enum: 'scratch_royale', 'royale_spin', 'mystery_vault')
├─ bet_amount (from request, validated)
├─ outcome (enum: 'win', 'lose')
├─ payout_amount (0 or >=0)
├─ rng_seed (optional: for deterministic replay)
├─ rng_outcome (optional: raw RNG value from 0-1)
├─ created_at
├─ ip_address (for fraud detection)
├─ user_agent (for geolocation/device anomalies)
├─ idempotency_key (for replay protection)
└─ session_id (for session-based analytics)
```

**Immutability**
- Record created once, never updated
- Outcome is final; cannot be changed
- Provides audit trail for all plays

---

## Game Definitions

### Game 1: Scratch Royale

**Theme**: Scratch-off lottery card

**Specs**
- **Cost**: 10 credits
- **Payout Pool**: 
  - Loss: 0 credits (90%)
  - Small Win: 15 credits (7%)
  - Big Win: 100 credits (2.5%)
  - Grand Win: 500 credits (0.5%)

**Calculation**
```python
def play_scratch_royale(bet):
  cost = 10
  rng = random.random()  # 0 to 1
  
  if rng < 0.9:
    outcome = "lose"
    payout = 0
  elif rng < 0.97:
    outcome = "win"
    payout = 15
  elif rng < 0.995:
    outcome = "win"
    payout = 100
  else:
    outcome = "win"
    payout = 500
  
  return { "outcome": outcome, "payout": payout }
```

**House Edge**: Cost 10, avg payout 18.75 → -25% margin to user (NOT sustainable!)

**TODO Phase 2**: Adjust odds for sustainable margin, currently math is wrong.

---

### Game 2: Royale Spin

**Theme**: Spinning wheel of fortune

**Specs**
- **Cost**: 15 credits
- **Wheel Segments**: 8 positions around wheel
  1. Lose (25%)
  2. +10 credits (20%)
  3. +20 credits (15%)
  4. +50 credits (15%)
  5. +100 credits (10%)
  6. +250 credits (8%)
  7. +500 credits (5%)
  8. Free Spin (2%) → grants another free play

**Calculation**
```python
def play_royale_spin(bet, free_spin=False):
  cost = 0 if free_spin else 15
  rng = random.random()
  
  segments = [
    (0.25, "lose", 0),
    (0.20, "win", 10),
    (0.15, "win", 20),
    (0.15, "win", 50),
    (0.10, "win", 100),
    (0.08, "win", 250),
    (0.05, "win", 500),
    (0.02, "free_spin", 0)  # special
  ]
  
  cumulative = 0
  for pct, result_type, payout in segments:
    cumulative += pct
    if rng <= cumulative:
      return {
        "outcome": result_type,
        "payout": payout,
        "free_spin_granted": (result_type == "free_spin")
      }
```

**House Edge**: Cost 15, avg payout ≈ 15.5 → -3.3% margin sustainable.

---

### Game 3: Mystery Vault

**Theme**: Open vault, reveal mystery prize

**Specs**
- **Cost**: 20 credits
- **Prize Pool**: 
  - Empty Vault (60%): 0 credits
  - Mystery Box: 1 of 5 prizes
    - Emerald (20%): 25 credits
    - Sapphire (10%): 75 credits
    - Ruby (6%): 150 credits
    - Diamond (3%): 400 credits
    - Legendary (1%): 1000 credits

**Calculation**
```python
def play_mystery_vault(bet):
  cost = 20
  rng = random.random()
  
  if rng < 0.60:
    outcome = "lose"
    payout = 0
  else:
    # Open mystery box
    box_rng = random.random()
    if box_rng < 0.20:
      outcome = "win"
      payout = 25
      prize = "emerald"
    elif box_rng < 0.30:
      outcome = "win"
      payout = 75
      prize = "sapphire"
    # ... etc
  
  return { "outcome": outcome, "payout": payout, "prize": prize }
```

**House Edge**: Cost 20, avg payout ≈ 20.2 → -1% margin, most sustainable.

---

## Payout Validation

Before awarding credits:

1. ✓ Game exists in configuration
2. ✓ Bet matches expected cost
3. ✓ Payout within expected pool for game
4. ✓ User has sufficient credits (checked at top of request)
5. ✓ No more than 1 play per user per second (rate limit)
6. ✓ Idempotency key not already processed

If ANY check fails:
- Log as potential fraud
- Reject play (return 400 error)
- Alert admin if pattern detected

---

## Cheating Prevention

### Client-Side Tampering

User tries to:
- Modify game result in dev tools
- Change payout amount in response
- Spoof winning animation

**Defense**
- Frontend has NO ability to affect balance or outcome
- Server decides outcome; client only displays it
- All writes to balance bypass client (server-authoritative)

### RNG Seed Attacks

Attacker tries to predict next RNG value

**Defense**
- Use cryptographically secure RNG (os.urandom)
- Seed per-request (not seeded at server start)
- Never expose seed to client
- Optional: Use external randomness service (AWS Lambda randomness API)

### Idempotency Key Reuse

User replays same play with same key to win multiple times

**Defense**
- Idempotency key only accepts ONE result (cached response)
- Second request gets same response as first (cached payout)
- Key expires in 24 hours

---

## Game Configuration

### Config Object (Server-Side)

```json
{
  "game_id": "scratch_royale",
  "name": "Scratch Royale",
  "description": "Scratch-off lottery cards",
  "cost_credits": 10,
  "active": true,
  "payout_tiers": [
    {
      "name": "loss",
      "probability": 0.90,
      "payout": 0,
      "message": "No win this time"
    },
    {
      "name": "small_win",
      "probability": 0.07,
      "payout": 15,
      "message": "You won 15 credits!"
    },
    {
      "name": "big_win",
      "probability": 0.025,
      "payout": 100,
      "message": "Big win! 100 credits!"
    },
    {
      "name": "grand_win",
      "probability": 0.005,
      "payout": 500,
      "message": "Jackpot! 500 credits!"
    }
  ],
  "daily_play_limit": 1000,  # Per user
  "min_account_age_minutes": 5,  # Anti-abuse
  "required_email_verified": false
}
```

**Usage**
- Stored in database (admin can adjust)
- Loaded at server startup (cached)
- Can be hot-reloaded without server restart
- Changes tracked in audit log

---

## Rate Limiting Per Game

### Rules

| Game | Limit | Window | Reason |
|------|-------|--------|--------|
| Any | Max 10 plays/min per user | Per-minute | Prevent spam/scripting |
| Any | Max 100 plays/day per user | Per-day | Sustainable gameplay |
| Scratch | (same as above) | | |
| Royale Spin | (same) + Free spin grants one bonus play | | |

### Database

```
game_rate_limit_logs
├─ user_id
├─ game_key
├─ play_count_last_minute
├─ play_count_today
├─ last_play_at
└─ created_at
```

---

## Fraud Detection

### Flags

- User plays 100+ times in 1 hour (scripted?)
- User wins 5+ times in a row (unlikely, check RNG)
- User location jumps (e.g., US to China in 10 mins)
- Duplicate IP but different user accounts playing simultaneously
- Payout amount mismatch (server vs client logs)

### Response Options

**Tier 1**: Log event, no action
**Tier 2**: Email user ("Unusual activity detected")
**Tier 3**: Require email verification before next play
**Tier 4**: Lock account, require support ticket

---

## Audit & Reporting

### Daily Report

```sql
SELECT
  DATE(created_at) as play_date,
  game_key,
  COUNT(*) as total_plays,
  SUM(CASE WHEN outcome = 'win' THEN 1 ELSE 0 END) as wins,
  SUM(payout_amount) as total_payouts,
  SUM(bet_amount) as total_bets,
  AVG(payout_amount) as avg_payout,
  SUM(payout_amount) - SUM(bet_amount) as net_to_platform
FROM game_plays
GROUP BY DATE(created_at), game_key
```

### Alert Conditions

- Win rate > 40% (indicates math problem)
- Average payout > cost (losing money)
- Total payouts > 500k in day (volume spike)

---

## Live Game Constants (Configurable)

In `.env`:
```
GAME_SCRATCH_ROYALE_COST=10
GAME_SCRATCH_ROYALE_WIN_PROB=0.10
GAME_ROYALE_SPIN_COST=15
GAME_MYSTERY_VAULT_COST=20
RATE_LIMIT_PLAYS_PER_MINUTE=10
RATE_LIMIT_PLAYS_PER_DAY=100
```

---

## Success Criteria

- [x] Game mechanics defined
- [x] Payout calculations specified
- [x] Server-authoritative enforcement clear
- [x] Cheating prevention described
- [x] Configuration system planned
- [x] Audit requirements specified
- [ ] Implementation in Phase 5 (game development)
