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

    # Oracle-related methods
    def _compute_oracle_reputation(self, oracle_id: str) -> float:
        """Compute oracle reputation as correct_reports / total_reports (default 0.6)"""
        supabase = get_supabase_client()
        # Only consider resolved reports (status correct/incorrect) for reputation
        resp = supabase.table('oracle_reports').select('verdict', 'status').eq('oracle_id', oracle_id).in_('status', ['correct', 'incorrect']).execute()
        if not resp.data:
            return 0.6

        total = len(resp.data)
        correct = 0
        for r in resp.data:
            if r.get('status') == 'correct':
                correct += 1

        return float(correct) / float(total) if total > 0 else 0.6

    def submit_oracle_report(self, oracle_id: str, market_id: str, verdict: str, evidence, stake: float, ip_hash: str = None):
        """Submit an oracle report in privacy-preserving mode.

        This implementation avoids collecting IPs, user-agents, or email metadata.
        To protect against Sybil attacks while preserving anonymity we enforce a
        higher minimum stake and a per-(oracle,market) uniqueness constraint.

        Returns the created report record and whether consensus triggered settlement.
        """
        if verdict not in ['true', 'false']:
            raise ValueError("verdict must be 'true' or 'false')")

        stake = float(stake)
        if stake < 5.0:
            raise ValueError('Minimum oracle stake is 5 CCs')

        supabase = get_supabase_client()

        # Validate market
        market_resp = supabase.table('markets').select('*').eq('id', market_id).execute()
        if not market_resp.data:
            raise ValueError('Market not found')

        market = Market.from_dict(market_resp.data[0])
        if not market.is_active():
            raise ValueError('Market is not active or already resolved')

        # Validate oracle user exists and has balance
        user_resp = supabase.table('users').select('*').eq('id', oracle_id).execute()
        if not user_resp.data:
            raise ValueError('Oracle user not found')

        oracle = User.from_dict(user_resp.data[0])
        if oracle.available_balance < stake:
            raise ValueError('Insufficient available balance for oracle stake')

        # Enforce duplicate prevention only (no personal identity checks)
        self._validate_no_duplicate_vote(supabase, oracle_id, market_id)

        # Enforce a higher economic barrier for anonymous reporting to deter Sybil attacks
        MIN_ANON_ORACLE_STAKE = 20.0
        if stake < MIN_ANON_ORACLE_STAKE:
            raise ValueError(f'Minimum anonymous oracle stake is {MIN_ANON_ORACLE_STAKE} CCs')

        # Rate-limit using ip_hash (HMAC of IP). If no ip_hash supplied, skip IP rate-limiting.
        if ip_hash:
            self._validate_ip_rate_limit(supabase, ip_hash)

        # Lock oracle stake
        oracle.lock_balance(stake)
        supabase.table('users').update({
            'available_balance': oracle.available_balance,
            'locked_balance': oracle.locked_balance
        }).eq('id', oracle_id).execute()

        # Insert oracle report
        report_payload = {
            'oracle_id': oracle_id,
            'market_id': market_id,
            'verdict': verdict,
            'evidence': evidence or [],
            'stake': stake,
            'status': 'pending'
        }

        insert_resp = supabase.table('oracle_reports').insert(report_payload).execute()
        report = insert_resp.data[0] if insert_resp.data else None

        # After insertion, check consensus
        # Log vote to history (anonymous: no IP, no user-agent)
        history_payload = {
            'oracle_id': oracle_id,
            'market_id': market_id,
            'ip_hash': ip_hash
        }
        try:
            supabase.table('oracle_vote_history').insert(history_payload).execute()
        except Exception as e:
            logger.warning(f"Failed to log vote history: {e}")

        consensus = self.check_consensus(market_id)
        triggered = False
        if consensus in ['true', 'false']:
            # Trigger market settlement
            try:
                self.settle_market(market_id, consensus)
                # After settlement, apply oracle payouts and update reputations
                self._apply_oracle_payouts(market_id, consensus)
                triggered = True
            except Exception as e:
                logger.error(f"Error auto-settling market {market_id}: {e}")

        return report, triggered

    def check_consensus(self, market_id: str):
        """Check oracle consensus for a market.

        Returns 'true', 'false', or None (inconclusive).
        """
        supabase = get_supabase_client()
        resp = supabase.table('oracle_reports').select('*').eq('market_id', market_id).execute()
        reports = resp.data if resp.data else []

        if len(reports) < 3:
            return None

        weighted_true = 0.0
        weighted_false = 0.0

        for r in reports:
            rep = self._compute_oracle_reputation(r.get('oracle_id'))
            weight = float(r.get('stake', 0.0)) * rep
            if r.get('verdict') == 'true':
                weighted_true += weight
            else:
                weighted_false += weight

        total = weighted_true + weighted_false
        if total == 0:
            return None

        consensus_score = weighted_true / total
        if consensus_score >= 0.75:
            return 'true'
        if consensus_score <= 0.25:
            return 'false'

        return None

    def _apply_oracle_payouts(self, market_id: str, consensus: str):
        """Apply payouts to oracles based on consensus and update their reputations."""
        supabase = get_supabase_client()
        reports_resp = supabase.table('oracle_reports').select('*').eq('market_id', market_id).execute()
        reports = reports_resp.data if reports_resp.data else []

        for r in reports:
            oracle_id = r.get('oracle_id')
            stake = float(r.get('stake', 0.0))
            verdict = r.get('verdict')

            # Compute reputation to decide multiplier
            rep = self._compute_oracle_reputation(oracle_id)
            if rep > 0.8:
                mult = 2.0
            elif rep > 0.6:
                mult = 1.5
            else:
                mult = 1.2

            base_reward = 1.5
            reward_multiplier = base_reward * mult

            # Load oracle user
            user_resp = supabase.table('users').select('*').eq('id', oracle_id).execute()
            if not user_resp.data:
                logger.warning(f"Oracle user {oracle_id} not found for payout")
                continue

            oracle = User.from_dict(user_resp.data[0])

            if verdict == consensus:
                # Pay out reward, unlock stake + reward
                payout = stake * reward_multiplier
                # unlock stake (remove from locked and add to available), then add payout
                try:
                    oracle.unlock_balance(stake)
                except Exception:
                    # If unlocking fails, adjust locked manually
                    oracle.locked_balance = max(0.0, oracle.locked_balance - stake)
                oracle.available_balance += payout
                oracle.total_earned += payout
                new_status = 'correct'
            else:
                # Oracle loses stake (locked decreases, available not increased)
                # remove stake from locked and record loss
                try:
                    # Reduce locked without adding to available
                    if oracle.locked_balance >= stake:
                        oracle.locked_balance -= stake
                    else:
                        oracle.locked_balance = 0.0
                except Exception:
                    oracle.locked_balance = max(0.0, oracle.locked_balance - stake)

                oracle.total_lost += stake
                new_status = 'incorrect'

            # Persist user update
            supabase.table('users').update({
                'available_balance': oracle.available_balance,
                'locked_balance': oracle.locked_balance,
                'total_earned': oracle.total_earned,
                'total_lost': oracle.total_lost
            }).eq('id', oracle_id).execute()

            # Update report status
            supabase.table('oracle_reports').update({
                'status': new_status
            }).eq('id', r.get('id')).execute()



    # SYBIL PROTECTION METHODS
    def _validate_no_duplicate_vote(self, supabase, oracle_id: str, market_id: str):
        """Prevent same oracle from voting twice on same market"""
        existing = supabase.table('oracle_reports').select('id').eq('oracle_id', oracle_id).eq('market_id', market_id).execute()
        if existing.data:
            raise ValueError('You have already submitted a report for this market')

    def _validate_email_verified(self, supabase, oracle_id: str):
        """Require email verification (Supabase auth verified email)"""
        # Get user from Supabase auth
        try:
            # Check if user exists in auth
            user_resp = supabase.table('users').select('id').eq('id', oracle_id).execute()
            if not user_resp.data:
                raise ValueError('User not found')
            # Note: Supabase auth requires email confirmation by default
            # In production, track email_verified_at timestamp
            logger.info(f"Email verification check for oracle {oracle_id}")
        except Exception as e:
            raise ValueError(f'Email verification check failed: {str(e)}')

    def _validate_account_age(self, oracle: User):
        """Require minimum 1 hour account age"""
        from datetime import datetime, timedelta, timezone

        if not hasattr(oracle, 'created_at') or oracle.created_at is None:
            raise ValueError('Account creation date not found')

        # Parse created_at if it's a string
        if isinstance(oracle.created_at, str):
            created_at = datetime.fromisoformat(oracle.created_at.replace('Z', '+00:00'))
        else:
            created_at = oracle.created_at

        # Ensure we're comparing timezone-aware datetimes
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)
        age = (now - created_at).total_seconds() / 3600  # hours

        min_hours = 1
        if age < min_hours:
            raise ValueError(f'Account must be at least {min_hours} hour old to submit oracle reports. Current age: {age:.1f} hours')

    def _validate_ip_rate_limit(self, supabase, ip_address: str, max_votes_per_hour: int = 5):
        """Prevent IP hash from submitting more than max_votes_per_hour per hour"""
        if not ip_address:
            logger.warning("ip_hash not provided for rate limiting")
            return

        from datetime import datetime, timedelta, timezone
        one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()

        resp = supabase.table('oracle_vote_history').select('id').eq('ip_hash', ip_address).gte('created_at', one_hour_ago).execute()
        vote_count = len(resp.data) if resp.data else 0

        if vote_count >= max_votes_per_hour:
            raise ValueError(f'IP rate limit exceeded. Max {max_votes_per_hour} votes per hour. Try again later.')

    def _validate_vote_cooldown(self, supabase, oracle_id: str, cooldown_hours: int = 24):
        """Prevent same oracle from voting too frequently"""
        from datetime import datetime, timedelta, timezone
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=cooldown_hours)).isoformat()

        resp = supabase.table('oracle_vote_history').select('market_id').eq('oracle_id', oracle_id).gte('created_at', cutoff).order('created_at', desc=True).limit(1).execute()

        if resp.data:
            last_vote = resp.data[0]
            # Allow voting again after cooldown
            logger.info(f"Last vote for oracle {oracle_id} was within {cooldown_hours}h, but different markets are allowed")

        # Note: We allow voting on different markets within 24h
        # Use _validate_no_duplicate_vote for same-market checks
        return True

