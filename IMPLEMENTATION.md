# SipNSecret Implementation Guide

## Overview

SipNSecret is a **decentralized, anonymous prediction market** built with:
- **Backend**: Flask + Supabase PostgreSQL
- **Frontend**: React + Vite
- **Core Features**: Market creation, anonymous oracle voting, consensus-based settlement, reputation tracking

---

## Architecture

### Backend Structure
```
backend/
├── app.py                 # Flask app initialization
├── config.py              # Environment config
├── run.py                 # Entry point
├── routes/
│   ├── auth.py           # User/pseudonym management
│   ├── markets.py        # Market creation & betting
│   └── oracles.py        # Oracle report submission
├── services/
│   ├── oracle_service.py # Core oracle logic (consensus, settlement)
│   ├── market_service.py # Market operations
│   └── ai_service.py     # OpenAI-powered predictions
├── models/
│   ├── user.py           # User balance & state
│   ├── market.py         # Market data
│   └── position.py       # Betting positions
├── utils/
│   ├── supabase_client.py # DB connection
│   └── sanitize.py        # Input validation
└── database/
    └── schema.sql        # PostgreSQL schema
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Markets.jsx
│   │   ├── Oracle.jsx    # Oracle reporting UI
│   │   ├── PortfolioSidebar.jsx
│   │   ├── TradeModal.jsx
│   │   └── SplashScreen.jsx
│   ├── hooks/
│   │   └── useAuth.js    # User session management
│   ├── services/
│   │   └── api.js        # Backend HTTP client
│   └── styles/
│       ├── global.css
│       └── variables.css
└── vite.config.js        # Build configuration
```

---

## Key Problems & Solutions

### 1. **SYBIL ATTACK PREVENTION** ❌ Multi-account voting

**Problem**: Users could create unlimited accounts and vote repeatedly on the same market, manipulating consensus.

**Solution - Privacy-Preserving HMAC IP Hashing**:
- Extract client IP (first hop via X-Forwarded-For header)
- Compute `ip_hash = HMAC_SHA256(IP, IP_HMAC_SECRET)` (raw IP never stored)
- Store only `ip_hash` in `oracle_vote_history` table for rate limiting
- Secret stored in `backend/.env` as `IP_HMAC_SECRET`

**Code**:
- `backend/routes/oracles.py` (lines ~60-75): Compute HMAC and pass to service
- `backend/services/oracle_service.py` (lines ~320-330): Validate IP rate-limit using `ip_hash`

**Protections**:
1. **Duplicate Vote Prevention**: Unique constraint on `(oracle_id, market_id)` in `oracle_reports` table
   - Same oracle cannot vote twice on same market (database enforces)
   
2. **IP Rate Limiting**: Max 5 votes per IP per hour
   - Queried via `oracle_vote_history` table on `ip_hash`
   - Prevents single attacker from flooding votes from one IP
   
3. **Higher Minimum Stake**: 20 CC minimum (vs 5 CC for betting)
   - Economic barrier discourages casual Sybil attacks
   - Attacker must have capital to create fake votes

4. **Anonymous** (no PII collected):
   - Raw IP never stored (only HMAC hash)
   - No email collection
   - No account age checks
   - Users remain pseudonymous

---

### 2. **ORACLE CONSENSUS & MARKET SETTLEMENT** ❌ Determining truth

**Problem**: How do decentralized oracles agree on market outcomes without a central authority?

**Solution - Weighted Voting Consensus**:
- Requires **minimum 3 oracle reports** per market
- Consensus threshold: **≥75% weighted agreement** (not 50% majority)
- Weight = `stake * reputation` (higher reputation = more voting power)
- Automatic market settlement when consensus reached

**Code**:
- `backend/services/oracle_service.py::check_consensus()` (lines ~340-365)
- `backend/services/oracle_service.py::submit_oracle_report()` (lines ~380-410): Triggers settlement on consensus
- `backend/services/oracle_service.py::settle_market()` (lines ~70-280): Distributes payouts

**Flow**:
```
Oracle submits report
    ↓
Lock oracle's stake balance
    ↓
Insert report into DB
    ↓
Check consensus (3+ reports, 75% agreement)
    ↓
If consensus reached:
   - Settle market (mark as resolved_true or resolved_false)
   - Distribute payouts to correct predictors
   - Reward correct oracles
   - Penalize incorrect oracles
```

**Payout Formula**:
- **Correct oracle**: unlock stake + reward (stake × 1.5-2.0× based on reputation)
- **Incorrect oracle**: lose stake (no payout)
- **Market winner**: 2× initial position value
- **Market loser**: lose collateral

---

### 3. **ORACLE REPUTATION TRACKING** ❌ Ensuring quality reports

**Problem**: Low-quality or malicious oracles shouldn't have equal voting power.

**Solution - Accuracy-Based Reputation**:
- Reputation = `(correct_reports) / (total_reports)` or default 0.6 for new oracles
- Reputation multiplies oracle's voting weight
- Reward multiplier based on reputation:
  - `reputation > 0.8` → 2.0× multiplier
  - `reputation > 0.6` → 1.5× multiplier
  - `reputation ≤ 0.6` → 1.2× multiplier

**Code**:
- `backend/services/oracle_service.py::_compute_oracle_reputation()` (lines ~265-280)
- `backend/services/oracle_service.py::_apply_oracle_payouts()` (lines ~370-450): Apply reputation multipliers

**Example**:
- Oracle A: 90% accuracy, reputation 0.9 → votes worth 0.9×stake
- Oracle B: 50% accuracy, reputation 0.5 → votes worth 0.5×stake
- Consensus favors higher-quality oracles

---

### 4. **ANONYMOUS USER SYSTEM** ❌ No usernames/emails required

**Problem**: How to maintain anonymity while preventing bot attacks?

**Solution - Pseudonym-Based System**:
- Users register with pseudonym only (via `/auth/initialize`)
- No email, no real name, no KYC
- User ID is UUID (generated server-side)
- Balance tracked per pseudonym/ID
- Can trade, submit markets, vote on oracles without identity

**Code**:
- `backend/routes/auth.py::initialize()` (lines ~111-155): Create anonymous user
- `backend/models/user.py`: User balance tracking (available, locked, earned, lost)
- Frontend stores `userId` in localStorage (session-scoped)

**Data Isolation**:
- No email addresses collected
- No IP addresses stored (only HMAC hash for rate-limiting)
- Pseudonym can be anything (e.g., "trader_123", "oracle_xyz")

---

### 5. **BALANCE & COLLATERAL LOCKING** ❌ Preventing double-spending

**Problem**: User could try to use same balance in multiple markets/bets simultaneously.

**Solution - Available/Locked Balance Model**:
```
User
├── available_balance: 100 CC (can spend)
├── locked_balance: 30 CC (in active positions)
├── total_earned: 500 CC (payout history)
└── total_lost: 100 CC (loss history)
```

**Flow**:
1. User places bet on market: `available -= 30`, `locked += 30`
2. Market resolves: winners keep payout, losers lose collateral
3. After resolution: `locked -= 30`, `available += payout (if won)`

**Code**:
- `backend/models/user.py::lock_balance()`, `unlock_balance()` (lines ~20-40)
- `backend/services/oracle_service.py::settle_market()` (lines ~150-220): Manages balance transfers
- `backend/routes/markets.py::place_bet()` (lines ~240-350): Locks collateral on bet placement

---

### 6. **CONSENSUS-DRIVEN SETTLEMENT** ❌ Preventing manipulation

**Problem**: Markets need reliable resolution without central arbiter. Consensus must be:
- Fast (automatic when 75% agreement reached)
- Fair (weighted by stake and reputation)
- Irreversible (no changing resolved markets)

**Solution - Automatic Settlement on Consensus**:
- Once 3+ reports exist and 75% weighted agreement reached:
  1. Market status changes to `resolved_true` or `resolved_false`
  2. All open positions are closed
  3. Winners receive payouts
  4. Losers lose collateral
  5. Oracles are rewarded/penalized

**Code**:
- `backend/services/oracle_service.py::submit_oracle_report()` (lines ~404-410): Checks consensus after each report
- `backend/services/oracle_service.py::settle_market()` (lines ~70-280): Executes settlement atomically
- `backend/services/oracle_service.py::_apply_oracle_payouts()` (lines ~370-450): Rewards/penalizes oracles

---

## Database Schema

### Core Tables

**users**
```sql
id (UUID primary key)
pseudonym (VARCHAR, unique)
available_balance (DECIMAL)
locked_balance (DECIMAL)
total_earned (DECIMAL)
total_lost (DECIMAL)
created_at, updated_at (TIMESTAMP)
```

**markets**
```sql
id (UUID primary key)
text (TEXT)
category (VARCHAR)
submitter_id (FK users)
stake (DECIMAL) -- submitter's market creation stake
price (DECIMAL 0.01-0.99) -- current odds
total_bet_true, total_bet_false (DECIMAL)
status (VARCHAR: active|resolved_true|resolved_false)
ai_prediction, ai_confidence
created_at, updated_at, resolved_at
```

**oracle_reports**
```sql
id (UUID primary key)
oracle_id (FK users)
market_id (FK markets)
verdict (VARCHAR: true|false)
evidence (JSONB) -- array of evidence strings
stake (DECIMAL) -- oracle's stake on this report
status (VARCHAR: pending|correct|incorrect)
created_at, updated_at
UNIQUE(oracle_id, market_id) -- one oracle per market
```

**oracle_vote_history** (anonymized)
```sql
id (UUID primary key)
oracle_id (FK users)
market_id (FK markets)
ip_hash (VARCHAR 128) -- HMAC(IP), not raw IP
created_at (TIMESTAMP)
INDEX on (ip_hash, created_at) -- for rate-limiting
```

**positions**
```sql
id (UUID primary key)
user_id (FK users)
market_id (FK markets)
type (VARCHAR: true|false)
shares (DECIMAL)
entry_price (DECIMAL 0.01-0.99)
cost_basis (DECIMAL) -- total CC spent
collateral (DECIMAL) -- CC locked for this position
status (VARCHAR: open|closed)
created_at, updated_at
```

---

## Environment Configuration

### Required (`backend/.env`)
```bash
# Supabase connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-...

# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key

# Sybil protection
IP_HMAC_SECRET=change_this_to_a_strong_secret_please
```

### Deployed (Render/Vercel)
Set environment variables in your deployment service dashboard (same keys as above).

---

## Testing

### Local Test (Duplicate Vote Prevention)
```bash
# Create users and market
USER1=$(curl -s -X POST http://localhost:5000/auth/initialize \
  -d '{"pseudonym":"owner1"}' | jq -r '.user.id')
MARKET=$(curl -s -X POST http://localhost:5000/markets/submit \
  -d "{\"user_id\":\"$USER1\",\"text\":\"Q?\",\"category\":\"tech\",\"stake\":10}" | jq -r '.market.id')
USER2=$(curl -s -X POST http://localhost:5000/auth/initialize \
  -d '{"pseudonym":"oracle1"}' | jq -r '.user.id')

# First vote (succeeds)
curl -s -X POST http://localhost:5000/oracles/report \
  -d "{\"oracle_id\":\"$USER2\",\"market_id\":\"$MARKET\",\"verdict\":\"true\",\"evidence\":[],\"stake\":20}"

# Second vote (fails with duplicate error)
curl -s -X POST http://localhost:5000/oracles/report \
  -d "{\"oracle_id\":\"$USER2\",\"market_id\":\"$MARKET\",\"verdict\":\"false\",\"evidence\":[],\"stake\":20}"
# Expected: {"error": "You have already submitted a report for this market"}
```

### Local Test (IP Rate Limiting)
```bash
# Submit 6 reports from same IP (5 should succeed, 6th blocked)
for i in 1 2 3 4 5 6; do
  curl -s -X POST http://localhost:5000/auth/initialize \
    -d "{\"pseudonym\":\"rep$i\"}" > /tmp/u$i.json
  UID=$(jq -r '.user.id' /tmp/u$i.json)
  curl -s -X POST http://localhost:5000/oracles/report \
    -H "X-Forwarded-For: 1.2.3.4" \
    -d "{\"oracle_id\":\"$UID\",\"market_id\":\"$MARKET\",\"verdict\":\"true\",\"evidence\":[],\"stake\":20}"
done
# Expect: attempts 1-5 succeed, attempt 6: {"error": "IP rate limit exceeded..."}
```

---

## Deployment Checklist

- [ ] Create Supabase project & run `backend/database/schema.sql` + sybil_protection.sql migration
- [ ] Set `SUPABASE_URL`, `SUPABASE_KEY`, `OPENAI_API_KEY`, `IP_HMAC_SECRET` in production env
- [ ] Deploy backend to Render: `gunicorn app:app`
- [ ] Deploy frontend to Vercel: `npm run build`
- [ ] Set frontend env var `VITE_API_URL` to backend URL
- [ ] Test duplicate vote prevention and IP rate-limiting
- [ ] Monitor logs for "Already submitted a report" and "IP rate limit exceeded" messages

---

## FAQ

**Q: Is my data anonymous?**
A: Yes. We store pseudonym + UUID only, no emails or real names. IPs are hashed (not stored raw).

**Q: Can I vote multiple times on same market?**
A: No. Database constraint + API validation prevent duplicate votes.

**Q: Can the same IP flood votes?**
A: No. Limited to 5 votes per IP per hour (rate limiting).

**Q: How is consensus reached?**
A: Requires 3+ reports with ≥75% weighted agreement (weight = stake × reputation).

**Q: What if I submit a wrong oracle report?**
A: You lose your stake. If consensus disagrees, your report is marked "incorrect" and you get no payout.

**Q: How is oracle reputation calculated?**
A: `(# correct reports) / (# total reports)`. New oracles default to 0.6 reputation.

---

## Future Enhancements

1. **Automated Oracle Bots**: Monitor APIs/RSS feeds and submit reports automatically
2. **Leaderboard**: Display top oracles by reputation and earnings
3. **Dispute Resolution**: 24-hour challenge window to dispute settled markets
4. **KYC for Large Stakes**: Optional identity verification for high-value markets
5. **Device Fingerprinting**: Detect bot farms using FingerprintJS
6. **Collateral Bonding**: Increase Sybil resistance with reputation-weighted bonds

---

**Last Updated**: February 7, 2026  
**Version**: 1.0 (Production Ready)
