# Sybil Attack Protection Implementation

## Overview
This document describes the comprehensive Sybil attack protection mechanisms implemented to prevent users from creating multiple accounts and voting repeatedly on oracle markets.

## Protection Layers

### 1. **Duplicate Vote Prevention**
**What it prevents:** Same oracle voting multiple times on same market  
**How it works:** Unique constraint on `oracle_id + market_id`  
**Error:** `"You have already submitted a report for this market"`  
**Level:** Hard enforcement (database constraint)

```sql
-- Database constraint
CREATE UNIQUE INDEX idx_oracle_one_per_market ON oracle_reports(oracle_id, market_id);
```

### 2. **Email Verification Requirement**
**What it prevents:** Throwaway email accounts  
**How it works:** Requires email confirmation via Supabase Auth  
**Configuration:** Supabase automatically requires email confirmation on signup  
**Level:** Moderate (database-level + auth)

### 3. **Minimum Account Age**
**What it prevents:** Immediate multi-account flooding  
**How it works:** Check `created_at < now() - 1 hour`  
**Error:** `"Account must be at least 1 hour old to submit oracle reports"`  
**Configurable:** In `oracle_service.py` line ~380, change `min_hours = 1`

```python
# Current: 1 hour minimum
min_hours = 1  # Change this to increase (e.g., 24 for 24 hours)
```

### 4. **IP-Based Rate Limiting**
**What it prevents:** Single attacker submitting multiple votes rapidly  
**How it works:** Max 5 votes per IP per hour  
**Error:** `"IP rate limit exceeded. Max 5 votes per hour"`  
**Configurable:** In `oracle_service.py` method `_validate_ip_rate_limit`, default is 5

```python
# Current: 5 votes per IP per hour
def _validate_ip_rate_limit(self, supabase, ip_address: str, max_votes_per_hour: int = 5):
```

**How Proxies Work:**
- Vercel/Render properly forward X-Forwarded-For header
- Getting first IP from list handles multiple proxies
- Falls back to X-Real-IP and then request.remote_addr

### 5. **Vote Cooldown Period**
**What it prevents:** Rapid-fire voting on different markets  
**How it works:** Oracle can vote on different markets, but we track in history  
**Configuration:** 24-hour resolution period (markets don't settle faster)  
**Note:** Different markets can be voted on multiple times (allows genuine oracle participation)

## Database Changes

**Two new tables created:**
1. `oracle_vote_history` - Tracks every vote with IP and timestamp
2. Unique index on `oracle_reports(oracle_id, market_id)` - Prevents duplicates

**Migration Script:** `backend/database/sybil_protection.sql`

Run this in your Supabase SQL Editor before deploying:
```sql
-- Execute all queries in sybil_protection.sql
```

## Implementation Details

### Backend Flow
```
User submits oracle report
    ↓
Extract IP from request headers
    ↓
Validate no duplicate vote for this market ← HARD BLOCK
    ↓
Validate email verified ← From Supabase Auth
    ↓
Validate account age (1+ hours) ← Based on user.created_at
    ↓
Validate IP rate limit (5/hour) ← Checks oracle_vote_history
    ↓
Validate vote cooldown ← Tracks voting patterns
    ↓
Lock stake balance
    ↓
Insert report + log to vote_history
    ↓
Check consensus
    ↓
Return report ✓
```

### Error Responses
```json
{
  "error": "You have already submitted a report for this market"
}
// OR
{
  "error": "Account must be at least 1 hour old to submit oracle reports. Current age: 0.5 hours"
}
// OR
{
  "error": "IP rate limit exceeded. Max 5 votes per hour. Try again later."
}
```

## Frontend Enforcement

The Frontend already:
- ✅ Requires login (userId from localStorage)
- ✅ Uses real Supabase session tokens
- ✅ Validates form (min stake 5 CC, verdict required)
- ✅ Sends correct oracle_id to backend

**No frontend changes needed** - backend validates everything.

## Testing the Protections

### Test 1: Duplicate Vote Prevention
```bash
# First vote (succeeds)
curl -X POST http://localhost:5000/oracles/report \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_id": "user-123",
    "market_id": "market-456",
    "verdict": "true",
    "evidence": ["evidence text"],
    "stake": 10
  }'

# Second vote on same market (fails with 400)
curl -X POST http://localhost:5000/oracles/report \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_id": "user-123",
    "market_id": "market-456",
    "verdict": "false",
    "evidence": ["different evidence"],
    "stake": 10
  }'
# Expected: {"error": "You have already submitted a report for this market"}
```

### Test 2: Account Age Validation
```bash
# Create new user
# Try to vote immediately (fails)

# Wait 1+ hour
# Try to vote again (succeeds if other checks pass)
```

### Test 3: IP Rate Limiting
```bash
# Submit 5 votes from same IP → all succeed
# Submit 6th vote from same IP → fails with "IP rate limit exceeded"

# Wait 1 hour
# Submit 6th vote from same IP → succeeds
```

## Configuration for Production

### Increase Account Age
```python
# In oracle_service.py, line ~380
min_hours = 24  # Require 24 hours instead of 1
```

### Increase IP Rate Limit
```python  
# In oracle_service.py
# Call _validate_ip_rate_limit with higher limit
def _validate_ip_rate_limit(self, supabase, ip_address: str, max_votes_per_hour: int = 3):
    # 3 votes per hour instead of 5
```

### Add Geography Checks
```python
# Could add: IP geolocation validation (prevent mass voting from botnets)
# Requires: geoip2 library + MaxMind database

import geoip2.database
def _validate_geolocation(self, ip_address: str):
    with geoip2.database.Reader('GeoLite2-City.mmdb') as reader:
        response = reader.city(ip_address)
        # Check if from known datacenter / VPN
```

## Monitoring

### Check Vote History
```sql
-- See all votes from a user
SELECT * FROM oracle_vote_history 
WHERE oracle_id = 'user-123' 
ORDER BY created_at DESC 
LIMIT 10;

-- See all votes from an IP
SELECT * FROM oracle_vote_history 
WHERE ip_address = '192.168.1.1' 
ORDER BY created_at DESC 
LIMIT 20;

-- Check for suspicious patterns (user voting many times)
SELECT oracle_id, COUNT(*) as vote_count, 
       DATE_TRUNC('hour', created_at) as hour
FROM oracle_vote_history
GROUP BY oracle_id, hour
HAVING COUNT(*) > 3
ORDER BY vote_count DESC;
```

### Monitor Rate Limits
```sql
-- Check IP votes in last 24 hours
SELECT ip_address, COUNT(*) as votes_24h
FROM oracle_vote_history
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
ORDER BY votes_24h DESC
LIMIT 20;
```

## Future Enhancements

1. **Stake Deposit Requirements**
   - Require upfront deposit (e.g., 100 CC) to participate
   - Loses deposit if accuracy drops below 40%

2. **KYC/Identity Verification**
   - Integrate Stripe Connect or Persona
   - Require government ID verification

3. **Device Fingerprinting**
   - Use FingerprintJS to detect same device across accounts
   - Block voting from same device within 24 hours

4. **Behavior Analysis**
   - ML model to detect unusual voting patterns
   - Require CAPTCHA if suspicious voting detected

5. **Debt/Reputation System**
   - If oracle provides incorrect verdicts repeatedly, reputation drops
   - Low reputation = less weight in consensus
   - Eventually reputation becomes 0 = effectively banned

6. **Collateral Bonding**
   - Require stake equal to 10% of total market value
   - Discourages casual flooding attacks

## Deployment Checklist

Before deploying to Render/Vercel:

- [ ] Run migration: `backend/database/sybil_protection.sql` in Supabase
- [ ] Verify oracle_reports has unique constraint on (oracle_id, market_id)
- [ ] Verify oracle_vote_history table exists
- [ ] Test duplicate vote prevention
- [ ] Test account age validation (create test user, wait 1+ hour)
- [ ] Test IP rate limiting from same IP
- [ ] Verify frontend still works (no changes needed)
- [ ] Monitor logs for Sybil attempts: `"IP rate limit exceeded"` messages
- [ ] Set up alerts for suspicious voting patterns

## Support

If you encounter issues:
1. Check backend logs: `docker logs flask-backend` (or tail on Render)
2. Verify migration ran: Check Supabase SQL Editor for oracle_vote_history table
3. Check IP extraction: Add logging to routes/oracles.py line ~62
4. Verify Supabase auth email verification is enabled (default: yes)
