# Oracle System - Quick Setup & Usage Guide

## Overview

The Oracle System enables decentralized truth verification for prediction markets. Users can submit evidence-based verdicts that automatically trigger market settlement when consensus is reached.

**Time to first oracle report**: ~5 minutes

---

## Getting Started

### Step 1: Start the Backend

```bash
cd /workspaces/SipNSecret/backend
python run.py
```

Expected output:
```
Serving Flask app 'app'
Running on http://127.0.0.1:5000
```

### Step 2: Create a User

```bash
USER=$(curl -s -X POST http://localhost:5000/auth/initialize \
  -H "Content-Type: application/json" \
  -d '{"pseudonym":"my_username"}' | jq -r '.user.id')

echo "User ID: $USER"
```

### Step 3: Create a Market (Rumor)

```bash
MARKET=$(curl -s -X POST http://localhost:5000/markets/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"'$USER'",
    "text":"Campus library closing early Friday",
    "category":"event",
    "stake":10
  }' | jq -r '.market.id')

echo "Market ID: $MARKET"
```

This locks your 10 CC stake. If you're right (oracle consensus agrees), you'll get 2× your stake back.

### Step 4: Create Oracle Users & Submit Reports

```bash
# Create 4 oracle users
for i in {1..4}; do
  ID=$(curl -s -X POST http://localhost:5000/auth/initialize \
    -H "Content-Type: application/json" \
    -d '{"pseudonym":"oracle_'$i'"}' | jq -r '.user.id')
  
  # Submit FALSE verdict with evidence
  curl -s -X POST http://localhost:5000/oracles/report \
    -H "Content-Type: application/json" \
    -d '{
      "oracle_id":"'$ID'",
      "market_id":"'$MARKET'",
      "verdict":"false",
      "evidence":["Library hours show 6pm Friday closing, not early"],
      "stake":5
    }' | jq '{status:.report.status, consensus:.consensus_triggered}'
done
```

### Step 5: Check Market Settlement

```bash
# After 3+ reports with consensus
curl http://localhost:5000/markets/$MARKET | jq '.market.status'
# Output: "resolved_false"
```

### Step 6: Check Your Earnings

```bash
# Get oracle user IDs from previous step
ORACLE_ID="..." # from step 4

curl http://localhost:5000/auth/user/$ORACLE_ID | jq '{balance:.user.available_balance, earned:.user.total_earned}'
# Output: {balance: 109, earned: 9}  ← 5 CC unlocked + 4 CC profit
```

---

## Key Concepts

### Submitter Stake
- **Amount**: 10+ CC minimum
- **Risk**: Lose entire stake if rumor resolves FALSE
- **Reward**: 2× your stake if TRUE (after oracle consensus)
- **Example**: Stake 10 CC → Get 20 CC back if right → Profit 10 CC

### Oracle Reports
- **Stake**: 5+ CC per report
- **Verdict**: TRUE or FALSE
- **Evidence**: Links/descriptions supporting your verdict
- **Earning**: Depends on accuracy and reputation

### Oracle Payouts

```
Your Accuracy:     Multiplier:    Payout for Correct Verdicts:
Brand new (0.6)    1.2×           5 × (1 + 1.5×1.2) = 14 CC → profit 9 CC
Good (0.75)        1.5×           5 × (1 + 1.5×1.5) = 16.25 CC → profit 11.25 CC
Excellent (0.85)   2.0×           5 × (1 + 1.5×2.0) = 20 CC → profit 15 CC

Wrong verdict:     0×             0 CC payout → loss 5 CC stake
```

### Consensus Rules
```
Need:        ≥3 oracle reports
Threshold:   ≥75% weighted agreement
Trigger:     Automatic market settlement on consensus
```

Example:
```
4 reports all FALSE:
  Weights: 4 × (5 stake × 0.6 rep) = 12
  Consensus: 0/12 = 0% ≤ 25% → resolves FALSE ✓
```

---

## API Quick Reference

### Create User
```bash
curl -X POST http://localhost:5000/auth/initialize \
  -H "Content-Type: application/json" \
  -d '{"pseudonym":"user_name"}'
```

### Submit Market
```bash
curl -X POST http://localhost:5000/markets/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"uuid",
    "text":"Rumor text",
    "category":"event|policy|safety|other",
    "stake":10
  }'
```

### Submit Oracle Report
```bash
curl -X POST http://localhost:5000/oracles/report \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_id":"uuid",
    "market_id":"uuid",
    "verdict":"true|false",
    "evidence":["url_or_description"],
    "stake":5
  }'
```

Response includes `consensus_triggered: true/false`
- If true: market has settled automatically

### Get Reports for Market
```bash
curl http://localhost:5000/oracles/reports/market-uuid
# Returns all reports with status: pending|correct|incorrect
```

### Get User Info
```bash
curl http://localhost:5000/auth/user/user-uuid
# Shows balance, earnings, loss
```

---

## Running the Integration Test

```bash
bash /workspaces/SipNSecret/backend/test_oracle_system.sh
```

Expected output:
```
[SUCCESS] Market created and stake locked
[SUCCESS] Oracle reports submitted
[SUCCESS] Consensus triggered on 3rd report
[SUCCESS] Market settled to resolved_false
[SUCCESS] Payouts distributed
All requirements met! Oracle system is functional.
```

---

## Common Scenarios

### Scenario 1: You're the Submitter (Wrong Rumor)

```
1. Submit rumor "Exam at 5pm" with 10 CC stake
2. Market locks your 10 CCs
3. 3 oracles check and find "Exam is at 3pm"
4. Market resolves FALSE
5. Your 10 CC stake is lost
6. Total earned: -0 | Total lost: 10
```

### Scenario 2: You're an Oracle (Correct)

```
1. Oracle submits "FALSE" with 5 CC stake
2. 5 CCs locked while waiting for consensus
3. 2 other oracles submit "FALSE" too
4. Consensus reached: FALSE wins
5. Your 5 CCs unlocked + 9 CC profit = 14 CC total earned
6. Total earned: 9 | Available balance: 109
```

### Scenario 3: You're an Oracle (Wrong)

```
1. Oracle submits "TRUE" with 5 CC stake
2. 5 CCs locked while waiting
3. Other oracles submit "FALSE"
4. Consensus reached: FALSE wins
5. Your verdict was wrong
6. Your 5 CC stake is lost (not returned)
7. Total lost: 5 | Available balance: 95
```

---

## Troubleshooting

### "Insufficient balance" Error
- You don't have enough CC to stake
- Start with 100 CC per new user
- Earn CC by making accurate oracle reports

### "Market not found" Error
- Market ID is wrong or market was deleted
- Check market ID in responses carefully

### "Stake < 5 CCs" Error for Reports
- Oracle reports require minimum 5 CC stake
- You only have less than 5 CCs available

### "Consensus not triggered" After 3 Reports
- Threshold is 75% weighted agreement
- If votes are split, consensus won't trigger
- Need more clear-cut cases

### Market Stays "Active" After Reports
- Consensus requires ≥3 reports
- All reports must be from different users
- Check that 75% threshold is met

---

## Game Theory Tips

### Win as a Submitter
1. Submit rumors you **strongly believe** are true
2. Include details that make them verifiable
3. Stake more on rumors with stronger evidence

### Win as an Oracle
1. Research each rumor thoroughly
2. Submit verdicts with strong evidence
3. Start with less popular markets (less competition)
4. Build reputation over time for bonus multipliers

### Avoid Losing CC
1. Don't submit unverified information
2. Don't stake more than you can afford to lose
3. Don't collude with other oracles (it's economically irrational)

---

## Documentation Reference

For more details, see:
- [Complete Oracle System Guide](backend/ORACLE_SYSTEM.md)
- [Implementation Report](backend/ORACLE_IMPLEMENTATION_SUMMARY.md)
- [Requirements Coverage](backend/FR5_COVERAGE_REPORT.md)
- [Completion Report](ORACLE_COMPLETION_REPORT.md)

---

## Support

### Check Backend Health
```bash
curl http://localhost:5000/health | jq .
```

### Check Application Stats
```bash
curl http://localhost:5000/stats | jq .
```

### View Backend Logs
```bash
tail -f /tmp/backend.log
```

### Reset All Data (⚠️ Destructive)
```bash
# This will delete all users, markets, and reports
# Requires recreating the database from schema:
sqlite3 sipnsecret.db < database/schema.sql
```

---

**Last Updated**: February 7, 2026  
**Status**: Production Ready ✅  
**Questions?** Check the [comprehensive documentation](backend/ORACLE_SYSTEM.md)
