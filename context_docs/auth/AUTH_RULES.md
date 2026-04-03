# Auth Rules

**Document Purpose**: Define authentication flows, security policies, and session management for Mini Arcade Royale.

---

## Authentication Flows

### Signup Flow (Server-Side Validation)

**Frontend Request** → POST `/api/auth/signup`

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

**Backend Validation**
1. ✓ Email is valid format (RFC 5322)
2. ✓ Email not already in system (case-insensitive)
3. ✓ Username 3–20 chars, alphanumeric + underscore
4. ✓ Username not already in system
5. ✓ Username not reserved (list: admin, support, moderator, system, test, etc.)
6. ✓ Password strength (min 8 chars, mix of upper/lower/number/special)
7. ✓ Passwords match (client AND server validation)
8. ✓`legal_accepted === true`
9. ✓ Rate limit: 5 signups per IP per hour

**Backend Actions**
1. Hash password with bcrypt (cost: 12) or argon2
2. Store user record with `email_verified: false`
3. Generate email verification token (6-char alphanumeric + random)
4. Store legal acceptance record (user_id, version, timestamp, IP, user_agent)
5. Send verification email
6. Respond: `{ "user_id": "...", "email": "user@...", "message": "Check your email to verify" }`

**Error Handling**
- Email already exists: "Email already in use. Try login or reset password."
- Username exists: "Username taken. Choose another."
- Password weak: "Password must be 8+ chars with uppercase, lowercase, number, special char."
- Passwords don't match: "Passwords don't match. Try again."
- Legal not accepted: "You must accept the legal policies to continue."

---

### Email Verification Flow

**Frontend** → User clicks link in email: `{APP_URL}/verify-email?token={token}`

**Backend Verification** → GET `/api/auth/verify-email`

1. Fetch token from URL param
2. Validate token format and age (expires in 7 days)
3. Find user by token
4. Mark `email_verified: true`
5. Log action in audit log
6. Respond: Success page + "Email verified! You can now log in."
7. Auto-redirect to login

**Error Handling**
- Invalid token: "Link is invalid or expired. Request new verification."
- Already verified: "Email already verified. Proceed to login."

**Resend Verification** → POST `/api/auth/resend-verification`

1. Accept email input
2. Find user by email (case-insensitive)
3. Check if already verified (safe: don't reveal, just say "Sent")
4. Generate new token, invalidate old
5. Send email
6. Respond: "Verification email sent"

---

### Login Flow

**Frontend Request** → POST `/api/auth/login`

```json
{
  "login": "player123",  // Can be email OR username
  "password": "TempPass123!",
  "remember_me": false
}
```

**Backend Validation**
1. ✓ Find user by email OR username (case-insensitive for email)
2. ✓ Validate password against stored hash
3. ✓ Check email verified (if required)
4. ✓ Check not suspended/banned
5. ✓ Rate limit: 10 login attempts per IP per hour

**Backend Actions**
1. Create session record (or JWT)
2. Set secure cookie with session ID
3. Log login event with IP, user_agent (anomaly detection)
4. If suspicious (new device, new location), note for optional email alert
5. Respond: `{ "user_id": "...", "username": "...", "role": "user" }`

**Error Handling**
- User not found or password wrong: "Invalid login or password." (no email enumeration)
- Email not verified: "Please verify your email before logging in."
- Account suspended: "Your account is suspended. Contact support."
- Account banned: "Your account has been permanently closed."
- Rate limited: "Too many login attempts. Try again in 1 hour."

**Multi-Session Support**
- User can have multiple active sessions (e.g., browser, mobile, another device)
- Each session has unique ID, timestamp, user-agent, IP
- Cookie stores session ID (not JWT with claims)

---

### Logout Flow

**Single Logout** → POST `/api/auth/logout`

1. Get session ID from cookie
2. Mark session as logged out (`logged_out_at`)
3. Clear cookie
4. Respond: Success message

**Logout All Sessions** → POST `/api/auth/logout-all`

1. Get current user from session
2. Find all active sessions for user
3. Mark all as logged out
4. Clear current cookie
5. Respond: "Logged out from all devices"

---

### Forgot Password Flow

**Frontend Request** → POST `/api/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

**Backend Validation**
1. Find user by email (case-insensitive)
2. Rate limit: 3 attempts per IP per hour
3. Rate limit: 3 attempts per email per hour

**Backend Actions**
1. Generate reset token (32-char random, expires 24 hrs)
2. Store token with expiry
3. Send reset email (safe: never reveal if email exists)
4. Respond: "If email is registered, reset link sent. Check your inbox."

**Error Handling** (Safe anti-enumeration)
- All cases respond: "If email is registered, reset link sent."

---

### Reset Password Flow

**Frontend** → User clicks link: `{APP_URL}/reset-password?token={token}`

**Reset Request** → POST `/api/auth/reset-password`

```json
{
  "token": "...",
  "password": "NewPass123!",
  "password_confirm": "NewPass123!"
}
```

**Backend Validation**
1. ✓ Find token, check valid + not expired (24 hrs)
2. ✓ New password strength (same as signup: 8+ chars, mixed case/number/special)
3. ✓ Passwords match
4. ✓ New password different from old password

**Backend Actions**
1. Hash new password
2. Update user password
3. Invalidate all existing sessions (force re-login for security)
4. Delete reset token
5. Send confirmation email
6. Log password change in audit log
7. Respond: Success + redirect to login

**Error Handling**
- Invalid token: "Link is invalid or expired. Request new reset."
- Password weak: (same as signup)
- Passwords don't match: "Passwords don't match. Try again."

---

### Change Password (Authenticated)

**Endpoint** → POST `/api/auth/change-password`

```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!",
  "new_password_confirm": "NewPass123!"
}
```

**Backend Validation**
1. ✓ User authenticated
2. ✓ Current password matches stored hash
3. ✓ New password strength
4. ✓ Passwords match
5. ✓ New password different from current

**Backend Actions**
1. Hash new password
2. Update password
3. Log change in audit log
4. Send confirmation email
5. Respond: "Password changed successfully"

---

## Password Policy

### Strength Requirements
- **Length**: Minimum 8 characters
- **Character Types**: Uppercase + lowercase + number + special character
- **Special Chars**: !@#$%^&*()_+-=[]{}|;:'",.<>?/
- **Common Passwords**: Optional rejection list (top 1000)
- **Breached Passwords**: Optional check against Have I Been Pwned API

### Validation
- Frontend: Live validation as user types (UX feedback)
- Backend: Re-validate server-side (never trust client)

### Storage
- Always hash with bcrypt (cost: 12) or Argon2
- Never store plain text
- Never transmit over non-HTTPS

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Capabilities | Can See | Can Do |
|------|---|---|---|
| **user** | Play games, buy credits, submit support | Own account, leaderboard | Play, buy, create tickets |
| **moderator** | Review reports, moderate | User reports, flagged content | Flag, warn, suspend 7 days |
| **admin** | Full system access | All users, all data | Adjust credits, override, permanent ban |
| **super_admin** | System management | Everything | All admin + settings, role management |

### Access Checks
All endpoints enforce role requirements:

```python
@require_auth
@require_role("admin")
async def adjust_credits(user_id: str, amount: int):
    # Only admins can reach this
    pass
```

---

## Session Management

### Session Lifetime
- **Duration**: 24 hours from last activity
- **Refresh**: Automatic on activity (don't require re-login)
- **Timeout**: 15 minutes of inactivity logs out (configurable)

### Cookie Settings (Web)
```
HttpOnly: true        # No JavaScript access
Secure: true          # HTTPS only
SameSite: Strict      # CSRF protection
Max-Age: 86400 (24h)
Domain: .mini-arcade-royale.com (production)
Path: /
```

### Session Tracking
- Store in database for multi-device support
- Track IP address, user agent, device fingerprint
- Log creation, activity, destruction

### Multi-Device Support
- User can have multiple concurrent sessions
- Each session independent (logout on one doesn't affect others)
- Optional: Limit to N concurrent sessions, drop oldest

---

## Security Policies

### Brute Force Protection
- **Signup**: 5 attempts per IP per hour
- **Login**: 10 attempts per IP per hour
- **Forgot Password**: 3 attempts per IP + 3 per email per hour
- **Email Verification**: 5 attempts per email per hour
- **Action**: Lock and respond with "Too many attempts. Try again in [time]."

### Suspicious Login Detection (Optional)
- New IP from previous location (e.g., 5000 miles in < 1 hour)
- New device with no user-agent history
- Time of day anomaly (e.g., user usually logs in 9am, now 3am)
- **Action**: Log event, optionally send alert email, require verification

### Account Recovery
- If user locked out: Support ticket or email recovery link
- Recovery link: One-time use, 30-min expiry, no password required
- Reset to temporary password, force change on next login

---

## Legal Acceptance

### Storage
```
legal_acceptances
├─ id
├─ user_id (FK)
├─ policy_bundle_version (e.g., "1.0", "2.1")
├─ accepted_at (ISO 8601 timestamp)
├─ accepted_ip_address
├─ accepted_user_agent
└─ created_at
```

### Acceptance Required
- Before signup complete: Accept all policies
- Checkbox text: "I understand and agree to the [linked] policies"
- Links must be clickable and open in new tab
- Acceptance stored with version metadata

### Policy Updates
- Increment version when terms change
- Require re-acceptance for material changes
- Optional: Grace period before forced re-acceptance
- Track acceptance history per user

---

## API Endpoints Summary

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/logout-all
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/change-password
DELETE /api/account/delete
```

---

## Success Criteria

- [x] All auth flows documented
- [x] Security policies defined
- [x] Role system clear
- [x] Legal acceptance rules established
- [ ] Implementation in Phase 2
