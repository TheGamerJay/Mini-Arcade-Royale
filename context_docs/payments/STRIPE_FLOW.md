# Stripe Payment Flow

**Document Purpose**: Define Stripe integration, payment processing, webhook handling, and reconciliation for Mini Arcade Royale.

---

## Stripe Integration Overview

### Why Stripe?

- PCI-DSS compliant (we don't touch card data)
- Webhook API for async payment events
- Checkout product for hosted checkout page
- Idempotent APIs (safe retries)
- Sandbox mode for testing
- Built-in fraud prevention

### Keys

**Test Mode** (Development)
- Publishable: `pk_test_...`
- Secret: `sk_test_...`

**Live Mode** (Production)
- Publishable: `pk_live_...`
- Secret: `sk_live_...`

Environment variables:
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

---

## Payment Flow

### Step 1: Customer Clicks "Buy Credits"

**Frontend (React)**
```jsx
function CreditPurchase({ package }) {
  const handleCheckout = async () => {
    const response = await fetch('/api/store/create-checkout', {
      method: 'POST',
      body: JSON.stringify({
        package_id: package.id,  // e.g., "1000_credits"
        idempotency_key: generateKey()
      })
    });
    
    const { checkout_url } = await response.json();
    window.location.href = checkout_url;  // Redirect to Stripe Checkout
  };
  
  return <button onClick={handleCheckout}>Buy Now</button>;
}
```

### Step 2: Backend Creates Checkout Session

**Endpoint**: POST `/api/store/create-checkout`

```python
@app.post("/api/store/create-checkout")
@require_auth
async def create_checkout(request: CheckoutRequest):
    user = request.user  # From auth middleware
    
    # Validate package
    package = STORE_PACKAGES[request.package_id]
    if not package:
        raise ValueError("Invalid package")
    
    # Check idempotency
    existing = db.query(CheckoutSessions).filter(
        CheckoutSessions.user_id == user.id,
        CheckoutSessions.idempotency_key == request.idempotency_key
    ).first()
    
    if existing:
        return {"checkout_url": existing.checkout_url}
    
    # Create Stripe Checkout Session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        customer_email=user.email,
        mode="payment",
        metadata={
            "user_id": str(user.id),
            "package_id": package.id,
            "credits_amount": str(package.credits)
        },
        line_items=[{
            "price": package.stripe_price_id,  # Pre-configured in Stripe
            "quantity": 1
        }],
        success_url=f"{FRONTEND_URL}/store/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/store/canceled"
    )
    
    # Store in DB for webhook processing
    db.create(CheckoutSessions, {
        "user_id": user.id,
        "stripe_session_id": session.id,
        "mode": "payment",
        "amount": package.price,
        "currency": "usd",
        "credits_amount": package.credits,
        "package_id": package.id,
        "status": "pending",
        "idempotency_key": request.idempotency_key,
        "ip_address": request.client.host,
        "user_agent": request.headers["user-agent"],
        "created_at": datetime.now()
    })
    
    # Audit log
    log_action(user.id, "checkout_created", {
        "session_id": session.id,
        "package_id": package.id
    })
    
    return {
        "checkout_url": session.url,
        "session_id": session.id
    }
```

**Response**
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

### Step 3: User Pays on Stripe Checkout

- Stripe hosts checkout page (we don't see card data)
- User enters card info securely
- User reviews order
- User clicking "Pay" triggers Stripe processing

### Step 4: Payment Result

**Success**
- Stripe redirects to `{FRONTEND_URL}/store/success?session_id=cs_...`
- Frontend shows "Order confirmed! Credits added to account."
- Frontend does NOT immediately add credits (waits for webhook)

**Failure/Cancel**
- Redirects to `{FRONTEND_URL}/store/canceled`
- Shows "Payment canceled. Your card was not charged."

### Step 5: Stripe Webhook — Payment Completed

When payment succeeds, Stripe sends webhook: `checkout.session.completed`

**Webhook Handler**: POST `/api/webhooks/stripe`

```python
@app.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    # Verify signature (prevent spoofing)
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Log webhook receipt
    webhook_log_id = db.create(WebhookLogs, {
        "provider": "stripe",
        "event_type": event.type,
        "event_id": event.id,
        "payload": event.data,
        "received_at": datetime.now()
    }).id
    
    # Handle event
    if event.type == "checkout.session.completed":
        session = event.data.object
        handle_checkout_completed(session, webhook_log_id)
    
    elif event.type == "charge.refunded":
        charge = event.data.object
        handle_charge_refunded(charge, webhook_log_id)
    
    # Return 200 to confirm webhook received
    return {"status": "received"}
```

### Step 6: Backend Grants Credits

**Function**: `handle_checkout_completed`

```python
def handle_checkout_completed(stripe_session, webhook_log_id):
    """
    Process successful payment.
    This function is IDEMPOTENT — safe to call multiple times.
    """
    
    # Find order in DB
    checkout = db.query(CheckoutSessions).filter(
        CheckoutSessions.stripe_session_id == stripe_session.id
    ).first()
    
    if not checkout:
        # Webhook arrived before user created order? Store for manual review.
        log_error(f"Webhook received for unknown session {stripe_session.id}")
        return
    
    if checkout.status == "completed":
        # Already processed (webhook may retried)
        log_info(f"Webhook for {stripe_session.id} already processed")
        return
    
    # ATOMIC transaction
    with db.transaction():
        # 1. Lock checkout row
        checkout = db.query(CheckoutSessions).filter(
            CheckoutSessions.id == checkout.id
        ).with_for_update().first()
        
        # Prevent race condition: check again
        if checkout.status == "completed":
            return
        
        # 2. Lock user's wallet
        wallet = db.query(CreditWallets).filter(
            CreditWallets.user_id == checkout.user_id
        ).with_for_update().first()
        
        # 3. Calculate credits to grant
        credits_to_grant = checkout.credits_amount
        bonus_credits = calculate_bonus(checkout)  # E.g., first-purchase bonus
        total_credits = credits_to_grant + bonus_credits
        
        # 4. Update wallet
        wallet.balance += total_credits
        db.commit()
        
        # 5. Create ledger entries
        db.create(CreditTransactions, {
            "user_id": checkout.user_id,
            "transaction_type": "PURCHASE",
            "amount_delta": credits_to_grant,
            "balance_before": wallet.balance - total_credits,
            "balance_after": wallet.balance,
            "reference_type": "stripe_checkout",
            "reference_id": checkout.id,
            "note": f"Purchased {checkout.package_id}",
            "created_by": "system"
        })
        
        if bonus_credits > 0:
            db.create(CreditTransactions, {
                "user_id": checkout.user_id,
                "transaction_type": "PURCHASE_BONUS",
                "amount_delta": bonus_credits,
                "balance_before": wallet.balance - bonus_credits,
                "balance_after": wallet.balance,
                "reference_type": "stripe_checkout",
                "reference_id": checkout.id,
                "note": f"First purchase bonus (+{bonus_credits}%)",
                "created_by": "system"
            })
        
        # 6. Update checkout record
        checkout.status = "completed"
        checkout.payment_received_at = datetime.now()
        db.commit()
        
        # 7. Log webhook processing
        db.update(WebhookLogs, webhook_log_id, {
            "processed": True,
            "processed_at": datetime.now(),
            "user_id": checkout.user_id
        })
    
    # 8. Send confirmation email (outside transaction)
    send_email(
        to=checkout.user.email,
        template="purchase_receipt",
        context={
            "user": checkout.user,
            "package": STORE_PACKAGES[checkout.package_id],
            "amount": checkout.amount,
            "credits": total_credits,
            "order_id": checkout.id
        }
    )
    
    # 9. Send credits notification email
    send_email(
        to=checkout.user.email,
        template="credits_added",
        context={
            "credits": total_credits,
            "balance": wallet.balance
        }
    )
    
    # 10. Log success
    log_info(f"Payment processed for user {checkout.user_id}, credits: {total_credits}")
```

---

## Webhook Retries & Idempotency

### Stripe's Retry Policy

Stripe retries failed webhooks 5 times over 3 days:
- Hour 1: Immediate retry
- Hour 5: Second retry
- Day 1: Third retry
- Day 2: Fourth retry
- Day 3: Fifth retry

**If all fail**: We must monitor and manually process.

### Our Idempotency

Our logic is **idempotent**:
1. Check if webhook already processed (status == "completed")
2. If yes, return success (don't process twice)
3. If no, process and update status

This means:
- ✓ Duplicate webhooks are safe (2nd call returns early)
- ✓ Retries from Stripe are safe
- ✓ Manual reprocessing is safe

---

## Webhook Monitoring

### Unprocessed Webhook Alert

Every hour, check for unprocessed webhooks:

```python
def check_unprocessed_webhooks():
    """Alert if webhooks arrived but not processed."""
    unprocessed = db.query(WebhookLogs).filter(
        WebhookLogs.processed == False,
        WebhookLogs.received_at < datetime.now() - timedelta(hours=1)
    ).all()
    
    if unprocessed:
        send_alert(
            f"Unprocessed webhooks: {len(unprocessed)}",
            severity="high"
        )
        log_unprocessed(unprocessed)
```

### Failed Payment Reconciliation

Daily reconciliation check:

```sql
-- Find unpaid orders (session created, but not completed)
SELECT cs.*, u.email
FROM checkout_sessions cs
JOIN users u ON cs.user_id = u.id
WHERE cs.status = 'pending'
  AND cs.created_at < NOW() - INTERVAL 1 DAY
ORDER BY cs.created_at DESC
```

**Action**: Email user reminder to complete payment, or send refund link.

---

## Refund Flow

### Admin Issues Refund

**Endpoint**: POST `/api/admin/refunds`

```python
@app.post("/api/admin/refunds")
@require_role("admin")
async def issue_refund(refund_request: RefundRequest):
    checkout = db.query(CheckoutSessions).filter(
        CheckoutSessions.id == refund_request.checkout_id
    ).first()
    
    if not checkout or checkout.status != "completed":
        raise ValueError("Cannot refund: checkout not completed")
    
    # Issue refund via Stripe
    refund = stripe.Refund.create(
        charge=checkout.stripe_charge_id,
        reason=refund_request.reason  # "requested_by_customer" etc
    )
    
    # Log refund
    db.create(RefundLogs, {
        "checkout_id": checkout.id,
        "stripe_refund_id": refund.id,
        "amount": checkout.amount,
        "reason": refund_request.reason,
        "admin_id": request.user.id
    })
    
    # Store refund approval (awaiting webhook)
    checkout.refund_requested_at = datetime.now()
    checkout.refund_requested_by = request.user.id
    db.commit()
    
    return {"refund_id": refund.id}
```

### Stripe Sends Refund Webhook

**Event**: `charge.refunded`

```python
def handle_charge_refunded(stripe_charge, webhook_log_id):
    """When Stripe refunds a charge."""
    
    # Find checkout
    checkout = db.query(CheckoutSessions).filter(
        CheckoutSessions.stripe_charge_id == stripe_charge.id
    ).first()
    
    if not checkout:
        log_error(f"Refund webhook for unknown charge {stripe_charge.id}")
        return
    
    # ATOMIC: Reverse credit grant
    with db.transaction():
        wallet = db.query(CreditWallets).filter(
            CreditWallets.user_id == checkout.user_id
        ).with_for_update().first()
        
        # Deduct credits (set user balance to pre-purchase)
        wallet.balance -= checkout.credits_amount
        
        # Create reversal transaction
        db.create(CreditTransactions, {
            "user_id": checkout.user_id,
            "transaction_type": "PURCHASE_REVERSAL",
            "amount_delta": -checkout.credits_amount,
            "reference_type": "refund",
            "reference_id": checkout.id,
            "note": "Refund processed"
        })
        
        checkout.status = "refunded"
        checkout.refunded_at = datetime.now()
        db.commit()
    
    # Send refund confirmation email
    send_email(
        to=checkout.user.email,
        template="refund_issued",
        context={
            "amount": checkout.amount,
            "date": datetime.now()
        }
    )
```

**Edge Case**: If user has spent credits after purchase → Balance goes negative, account locked for investigation.

---

## Store Configuration

### Packages (in .env or DB)

```json
{
  "STORE_PACKAGES": {
    "100_credits": {
      "id": "100_credits",
      "name": "Starter",
      "credits": 100,
      "price": 0.99,
      "stripe_price_id": "price_test_..."
    },
    "500_credits": {
      "id": "500_credits",
      "name": "Player",
      "credits": 500,
      "price": 4.99,
      "stripe_price_id": "price_test_...",
      "bonus_percent": 10  # +10% bonus credits on first purchase
    },
    "1000_credits": {
      "id": "1000_credits",
      "name": "Pro",
      "credits": 1000,
      "price": 9.99,
      "stripe_price_id": "price_test_...",
      "bonus_percent": 20
    },
    "5000_credits": {
      "id": "5000_credits",
      "name": "Elite",
      "credits": 5000,
      "price": 49.99,
      "stripe_price_id": "price_test_...",
      "bonus_percent": 25
    }
  }
}
```

---

## Testing

### Test Stripe Cards

| Card Number | Outcome |
|---|---|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | Requires 3D Secure |

### Test Webhook (Manual)

```bash
curl http://localhost:8000/api/webhooks/stripe \
  -H "stripe-signature: t=...,v1=..." \
  -d @webhook_payload.json
```

---

## Success Criteria

- [x] Stripe integration defined
- [x] Payment flow documented
- [x] Webhook handling specified
- [x] Refund process outlined
- [x] Idempotency strategy explained
- [x] Testing instructions provided
- [ ] Implementation in Phase 4 (payments/store)
