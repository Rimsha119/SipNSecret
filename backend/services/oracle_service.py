"""Oracle service for market oracle operations"""

import logging
from datetime import datetime
from typing import Dict, List
from services.ai_service import AIService
from services.market_service import MarketService
from utils.supabase_client import get_supabase_client
from models.market import Market
from models.user import User
from models.position import Position
import numpy as np

logger = logging.getLogger(__name__)

class OracleService:
    """Service for oracle operations"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.market_service = MarketService()
    
    def get_oracle_prediction(self, market_id, user_query=None):
        """Get oracle prediction for a market"""
        # Get market data
        market, error = self.market_service.get_market_by_id(market_id)
        if error:
            return None, error
        
        # Get AI prediction
        market_data = market.to_dict()
        prediction, error = self.ai_service.generate_prediction(market_data, user_query)
        if error:
            return None, error
        
        # Calculate confidence score (simplified)
        confidence = self._calculate_confidence(market_data, prediction)
        
        return {
            'market_id': market_id,
            'prediction': prediction,
            'confidence': confidence,
            'timestamp': market.updated_at if hasattr(market, 'updated_at') else None
        }, None
    
    def _calculate_confidence(self, market_data, prediction):
        """Calculate confidence score for prediction"""
        # Simplified confidence calculation
        # In production, this would use more sophisticated methods
        base_confidence = 0.5
        
        # Adjust based on market data availability
        if market_data.get('status') == 'active':
            base_confidence += 0.2
        
        # Add some randomness for demo (replace with actual ML model)
        noise = np.random.normal(0, 0.1)
        confidence = np.clip(base_confidence + noise, 0.0, 1.0)
        
        return float(confidence)
    
    def get_multiple_predictions(self, market_ids, user_query=None):
        """Get predictions for multiple markets"""
        predictions = []
        errors = []
        
        for market_id in market_ids:
            prediction, error = self.get_oracle_prediction(market_id, user_query)
            if error:
                errors.append(f"Market {market_id}: {error}")
            else:
                predictions.append(prediction)
        
        return predictions, errors if errors else None
    
    def settle_market(self, market_id: str, outcome: str) -> Dict:
        """
        Settle a market and distribute payouts
        
        Args:
            market_id: Market ID to settle
            outcome: 'true' or 'false'
        
        Returns:
            Dictionary with payouts, winners, losers, and total_paid
        
        Raises:
            ValueError: If market is not active or outcome is invalid
            Exception: For database errors
        """
        if outcome not in ['true', 'false']:
            raise ValueError("Outcome must be 'true' or 'false'")
        
        supabase = get_supabase_client()
        
        try:
            # 1. Get market from Supabase
            market_response = supabase.table('markets').select('*').eq('id', market_id).execute()
            if not market_response.data:
                raise ValueError(f"Market {market_id} not found")
            
            market = Market.from_dict(market_response.data[0])
            
            # 2. Validate active
            if not market.is_active():
                raise ValueError(f"Market {market_id} is not active (status: {market.status})")
            
            # 3. Get all active positions
            positions_response = supabase.table('positions').select('*').eq('market_id', market_id).eq('status', 'open').execute()
            positions = [Position.from_dict(p) for p in positions_response.data] if positions_response.data else []
            
            # 4. Calculate submitter payout: stake*2 if TRUE else 0
            submitter_payout = 0.0
            if market.submitter_id:
                if outcome == 'true':
                    submitter_payout = market.stake * 2
                else:
                    submitter_payout = 0.0
            
            # 5. Calculate payouts for each position
            payouts = {}
            winners = []
            losers = []
            
            # Process submitter payout
            if submitter_payout > 0 and market.submitter_id:
                payouts[market.submitter_id] = payouts.get(market.submitter_id, 0.0) + submitter_payout
                winners.append(market.submitter_id)
            
            # Process positions
            for position in positions:
                user_id = position.user_id
                
                if position.type == 'true':  # Long position
                    payout = position.calculate_payout_if_true() if outcome == 'true' else 0.0
                else:  # Short position (false)
                    payout = position.calculate_payout_if_false() if outcome == 'false' else 0.0
                
                if payout > 0:
                    payouts[user_id] = payouts.get(user_id, 0.0) + payout
                    winners.append(user_id)
                else:
                    if user_id not in winners:
                        losers.append(user_id)
            
            # 6. Update all user balances
            user_updates = {}
            for user_id, payout_amount in payouts.items():
                # Get user
                user_response = supabase.table('users').select('*').eq('id', user_id).execute()
                if not user_response.data:
                    logger.warning(f"User {user_id} not found for payout")
                    continue
                
                user = User.from_dict(user_response.data[0])
                
                # Calculate locked CC for this market (sum of all positions)
                user_positions = [p for p in positions if p.user_id == user_id]
                total_locked = sum(p.collateral for p in user_positions)
                
                # Unlock locked CC for this market
                user.unlock_balance(total_locked)
                
                # Add payout to available
                user.available_balance += payout_amount
                
                # Update total_earned
                user.total_earned += payout_amount
                
                user_updates[user_id] = {
                    'available_balance': user.available_balance,
                    'locked_balance': user.locked_balance,
                    'total_earned': user.total_earned
                }
            
            # Handle submitter if outcome is false (unlock their stake)
            if outcome == 'false' and market.submitter_id and market.submitter_id not in payouts:
                submitter_response = supabase.table('users').select('*').eq('id', market.submitter_id).execute()
                if submitter_response.data:
                    submitter = User.from_dict(submitter_response.data[0])
                    # Unlock the submitter's stake (stake was locked when market was created)
                    try:
                        submitter.unlock_balance(market.stake)
                        user_updates[market.submitter_id] = {
                            'available_balance': submitter.available_balance,
                            'locked_balance': submitter.locked_balance
                        }
                    except ValueError:
                        # Stake might already be unlocked or amount mismatch
                        logger.warning(f"Could not unlock stake for submitter {market.submitter_id}")
            
            # Update losers (unlock their locked balance, record loss)
            for user_id in losers:
                if user_id in payouts:
                    continue  # Already processed
                
                user_response = supabase.table('users').select('*').eq('id', user_id).execute()
                if not user_response.data:
                    continue
                
                user = User.from_dict(user_response.data[0])
                user_positions = [p for p in positions if p.user_id == user_id]
                total_locked = sum(p.collateral for p in user_positions)
                total_cost = sum(p.cost_basis for p in user_positions)
                
                # Unlock locked CC
                try:
                    user.unlock_balance(total_locked)
                except ValueError:
                    logger.warning(f"Could not unlock balance for user {user_id}")
                
                # Record loss
                user.deduct_loss(total_cost)
                
                user_updates[user_id] = {
                    'available_balance': user.available_balance,
                    'locked_balance': user.locked_balance,
                    'total_lost': user.total_lost
                }
            
            # Apply all user updates
            for user_id, update_data in user_updates.items():
                supabase.table('users').update(update_data).eq('id', user_id).execute()
            
            # 7. Close all positions
            for position in positions:
                supabase.table('positions').update({
                    'status': 'closed'
                }).eq('id', position.id).execute()
            
            # 8. Update market
            resolved_status = 'resolved_true' if outcome == 'true' else 'resolved_false'
            supabase.table('markets').update({
                'status': resolved_status,
                'resolved_at': datetime.utcnow().isoformat()
            }).eq('id', market_id).execute()
            
            # Calculate total paid
            total_paid = sum(payouts.values())
            
            return {
                'payouts': payouts,
                'winners': list(set(winners)),
                'losers': list(set(losers)),
                'total_paid': total_paid
            }
            
        except Exception as e:
            logger.error(f"Error settling market {market_id}: {str(e)}")
            raise

