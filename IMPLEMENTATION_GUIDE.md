# SipsNSecrets - Next Steps Implementation Guide

## Quick Start for Remaining Requirements

### Priority 1: Integrate Input Sanitization (1 hour)

#### Step 1: Update Market Submit Endpoint
**File**: `backend/routes/markets.py` (line ~115)

Add sanitization before processing:
```python
from utils.sanitize import sanitize_text, sanitize_category

@markets_bp.route('/submit', methods=['POST'])
def submit_market():
    try:
        data = request.get_json()
        
        # Add sanitization here:
        text = sanitize_text(data.get('text'), max_length=1000)
        category = sanitize_category(data.get('category'))
        
        if not text:
            return jsonify({'error': 'Rumor text is required'}), 400
        if not category:
            return jsonify({'error': 'Valid category is required'}), 400
        
        # Continue with existing code...
```

#### Step 2: Update Auth Initialize Endpoint
**File**: `backend/routes/auth.py` (line ~110)

```python
from utils.sanitize import sanitize_pseudonym

@auth_bp.route('/initialize', methods=['POST'])
def initialize():
    try:
        data = request.get_json()
        pseudonym = sanitize_pseudonym(data.get('pseudonym'))
        
        if not pseudonym:
            return jsonify({'error': 'Invalid pseudonym. Use 3-20 alphanumeric characters'}), 400
        
        # Continue with existing code...
```

---

### Priority 2: Implement Oracle Consensus (3-4 hours)

#### Step 1: Create Oracle Resolution Service
**File**: `backend/services/oracle_resolution.py` (NEW)

```python
"""Oracle resolution and consensus logic"""

from datetime import datetime
from utils.supabase_client import get_supabase_client

class OracleResolution:
    """Handle oracle-based market resolution"""
    
    CONSENSUS_THRESHOLD = 0.66  # 66% agreement needed
    MIN_ORACLE_REPORTS = 3      # Minimum reports for resolution
    
    @staticmethod
    def get_market_oracle_reports(market_id):
        """Get all oracle reports for a market"""
        supabase = get_supabase_client()
        response = supabase.table('oracle_reports').select('*').eq(
            'market_id', market_id
        ).eq('status', 'submitted').execute()
        return response.data if response.data else []
    
    @staticmethod
    def check_consensus(market_id):
        """Check if oracle consensus is reached
        
        Returns: {'consensus_reached': bool, 'resolution': 'true'/'false', 'confidence': 0-1}
        """
        reports = OracleResolution.get_market_oracle_reports(market_id)
        
        if len(reports) < OracleResolution.MIN_ORACLE_REPORTS:
            return {
                'consensus_reached': False,
                'reason': f'Need {OracleResolution.MIN_ORACLE_REPORTS} reports, have {len(reports)}'
            }
        
        # Count votes
        true_votes = len([r for r in reports if r['verdict'] == 'true'])
        false_votes = len([r for r in reports if r['verdict'] == 'false'])
        total_votes = true_votes + false_votes
        
        true_ratio = true_votes / total_votes if total_votes > 0 else 0
        false_ratio = false_votes / total_votes if total_votes > 0 else 0
        
        # Check for consensus
        if true_ratio >= OracleResolution.CONSENSUS_THRESHOLD:
            return {
                'consensus_reached': True,
                'resolution': 'true',
                'confidence': true_ratio,
                'votes': {'true': true_votes, 'false': false_votes}
            }
        elif false_ratio >= OracleResolution.CONSENSUS_THRESHOLD:
            return {
                'consensus_reached': True,
                'resolution': 'false',
                'confidence': false_ratio,
                'votes': {'true': true_votes, 'false': false_votes}
            }
        else:
            return {
                'consensus_reached': False,
                'reason': 'No consensus yet',
                'votes': {'true': true_votes, 'false': false_votes},
                'needed_for_true': max(0, int(total_votes * OracleResolution.CONSENSUS_THRESHOLD) + 1 - true_votes),
            }
    
    @staticmethod
    def auto_resolve_market(market_id):
        """Automatically resolve market if consensus is reached"""
        from services.market_service import MarketService
        
        consensus = OracleResolution.check_consensus(market_id)
        
        if not consensus['consensus_reached']:
            return {'error': consensus['reason']}
        
        supabase = get_supabase_client()
        
        # Get market
        market_response = supabase.table('markets').select('*').eq('id', market_id).execute()
        if not market_response.data:
            return {'error': 'Market not found'}
        
        from models.market import Market
        market = Market.from_dict(market_response.data[0])
        
        # Settle market
        settlement = MarketService.settle_market(market_id, consensus['resolution'], supabase)
        
        return {
            'resolved': True,
            'resolution': consensus['resolution'],
            'confidence': consensus['confidence'],
            'settlement': settlement
        }
```

#### Step 2: Add Oracle Resolution Endpoint
**File**: `backend/routes/oracles.py` (ADD)

```python
from services.oracle_resolution import OracleResolution

@oracles_bp.route('/resolve/<market_id>', methods=['POST'])
def resolve_market(market_id):
    """Check and resolve market based on oracle consensus"""
    try:
        # Check for consensus
        consensus = OracleResolution.check_consensus(market_id)
        
        if not consensus['consensus_reached']:
            return jsonify({
                'success': False,
                'message': consensus.get('reason'),
                'current_votes': consensus.get('votes'),
                'votes_needed': consensus.get('needed_for_true')
            }), 200  # 200 because it's not an error, just not ready
        
        # Resolve the market
        resolution = OracleResolution.auto_resolve_market(market_id)
        
        return jsonify({
            'success': True,
            'message': 'Market resolved',
            'resolution': resolution
        }), 200
        
    except Exception as e:
        logger.error(f"Error in resolve_market: {str(e)}")
        return jsonify({'error': str(e)}), 500
```

---

### Priority 3: Add Market Resolution API (1 hour)

#### Add Endpoint for Manual/Admin Resolution
**File**: `backend/routes/markets.py` (ADD)

```python
@markets_bp.route('/<market_id>/resolve', methods=['POST'])
def resolve_market(market_id):
    """Resolve a market with specified outcome (for testing/admin)"""
    try:
        data = request.get_json()
        resolution = data.get('resolution')  # 'true' or 'false'
        user_id = data.get('user_id')
        
        if resolution not in ['true', 'false']:
            return jsonify({'error': "resolution must be 'true' or 'false'"}), 400
        
        # For now, allow any user. In production, validate admin/oracle authority
        
        settlement = market_service.settle_market(market_id, resolution, supabase)
        
        if 'error' in settlement:
            return jsonify(settlement), 500
        
        return jsonify({
            'message': 'Market resolved',
            'resolution': resolution,
            'settlement': settlement
        }), 200
        
    except Exception as e:
        logger.error(f"Error resolving market: {str(e)}")
        return jsonify({'error': str(e)}), 500
```

---

### Priority 4: Add Tooltips (2 hours)

#### Create Tooltip Component
**File**: `frontend/src/components/Tooltip.jsx` (NEW)

```jsx
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const Tooltip = ({ text, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                style={{ cursor: 'help' }}
            >
                <HelpCircle size={16} style={{ opacity: 0.6 }} />
            </div>
            
            {isVisible && (
                <div style={{
                    position: 'absolute',
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    width: '200px',
                    zIndex: 1000,
                    top: position === 'top' ? '-40px' : 'auto',
                    bottom: position === 'bottom' ? '-40px' : 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.4
                }}>
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
```

#### Use in Markets Component
```jsx
import Tooltip from './Tooltip';

// In JSX:
<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <span>Current Price: {market.price.toFixed(2)}</span>
    <Tooltip text="Price reflects collective belief in rumor truth. Ranges from 0.01 to 0.99" />
</div>
```

---

## Testing the New Features

### Test Market Settlement
```bash
# 1. Create a market
curl -X POST http://localhost:5000/markets/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "text": "Test market",
    "category": "academic",
    "stake": 50
  }'

# Get the market ID from response

# 2. Resolve the market
curl -X POST http://localhost:5000/markets/MARKET_ID/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "true",
    "user_id": "USER_ID"
  }'
```

### Test Market Deletion
```bash
# Delete unresolved market
curl -X DELETE http://localhost:5000/markets/MARKET_ID \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID"}'
```

### Test Input Sanitization
```bash
# Try XSS injection (should be sanitized)
curl -X POST http://localhost:5000/markets/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "text": "<script>alert(1)</script>",
    "category": "academic",
    "stake": 50
  }'

# Check response - should show sanitized text
```

---

## Estimated Timeline

| Task | Duration | Difficulty |
|------|----------|-----------|
| Input Sanitization | 1 hour | Easy |
| Oracle Consensus | 3-4 hours | Medium |
| Market Resolution API | 1 hour | Easy |
| Tooltips | 2 hours | Easy |
| Testing & Debugging | 2 hours | Medium |
| **Total** | **~9-10 hours** | **Medium** |

---

## Helpful Resources

- **AMM Pricing**: https://en.wikipedia.org/wiki/Automated_market_maker
- **Supabase Docs**: https://supabase.com/docs
- **React Hooks**: https://react.dev/reference/react
- **Flask Blueprints**: https://flask.palletsprojects.com/blueprints/

