"""Market routes"""

import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from services.market_service import MarketService
from services.ai_service import AIService
from utils.supabase_client import get_supabase_client
from utils.sanitize import sanitize_text, sanitize_category
from models.market import Market
from models.user import User
from models.position import Position

logger = logging.getLogger(__name__)
markets_bp = Blueprint('markets', __name__)
market_service = MarketService()
ai_service = AIService()

@markets_bp.route('', methods=['GET'])
def get_markets():
    """Get paginated markets with query params"""
    try:
        # Get query parameters
        status = request.args.get('status')
        category = request.args.get('category')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        supabase = get_supabase_client()
        
        # Build query step by step
        query = supabase.table('markets').select('*')
        
        # Apply filters
        if status:
            query = query.eq('status', status)
        if category:
            query = query.eq('category', category)
        
        # Execute query and handle pagination/sorting in Python for reliability
        # This approach is more compatible across different Supabase client versions
        response = query.execute()
        
        if not response.data:
            markets = []
        else:
            # Sort by created_at descending (most recent first)
            sorted_data = sorted(
                response.data,
                key=lambda x: x.get('created_at') or x.get('created_at', ''),
                reverse=True
            )
            
            # Apply pagination
            paginated_data = sorted_data[offset:offset + limit]
            
            # Convert to Market objects
            markets = [Market.from_dict(market) for market in paginated_data]
        
        return jsonify({
            'markets': [market.to_dict() for market in markets],
            'limit': limit,
            'offset': offset,
            'count': len(markets)
        }), 200
        
    except ValueError as e:
        logger.error(f"Validation error in get_markets: {str(e)}")
        return jsonify({'error': f'Invalid request: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Error in get_markets: {str(e)}", exc_info=True)
        # Return a more user-friendly error message
        error_msg = str(e)
        if 'table' in error_msg.lower() or 'relation' in error_msg.lower():
            error_msg = 'Database table not found. Please ensure the markets table exists in Supabase.'
        elif 'connection' in error_msg.lower() or 'network' in error_msg.lower():
            error_msg = 'Unable to connect to database. Please check your Supabase configuration.'
        return jsonify({'error': error_msg}), 500

@markets_bp.route('/<market_id>', methods=['GET'])
def get_market(market_id):
    """Get market by ID with submitter and positions count"""
    try:
        supabase = get_supabase_client()
        
        # Get market
        market_response = supabase.table('markets').select('*').eq('id', market_id).execute()
        
        if not market_response.data:
            return jsonify({'error': 'Market not found'}), 404
        
        market = Market.from_dict(market_response.data[0])
        market_dict = market.to_dict()
        
        # Get submitter info
        if market.submitter_id:
            submitter_response = supabase.table('users').select('id, pseudonym').eq('id', market.submitter_id).execute()
            if submitter_response.data:
                market_dict['submitter'] = {
                    'id': submitter_response.data[0].get('id'),
                    'pseudonym': submitter_response.data[0].get('pseudonym')
                }
        
        # Get positions count
        positions_response = supabase.table('positions').select('id', count='exact').eq('market_id', market_id).execute()
        positions_count = positions_response.count if hasattr(positions_response, 'count') else len(positions_response.data) if positions_response.data else 0
        market_dict['positions_count'] = positions_count
        
        return jsonify({'market': market_dict}), 200
        
    except Exception as e:
        logger.error(f"Error in get_market: {str(e)}")
        return jsonify({'error': str(e)}), 500

@markets_bp.route('/submit', methods=['POST'])
def submit_market():
    """Submit a new market"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        text = data.get('text')
        category = data.get('category')
        stake = float(data.get('stake', 0))
        
        # Validate inputs
        if not user_id or not text or not category:
            return jsonify({'error': 'user_id, text, and category are required'}), 400
        
        if stake < 10:
            return jsonify({'error': 'Stake must be at least 10 CC'}), 400
        
        supabase = get_supabase_client()
        
        # Validate user balance
        user_response = supabase.table('users').select('*').eq('id', user_id).execute()
        if not user_response.data:
            return jsonify({'error': 'User not found'}), 404
        
        user = User.from_dict(user_response.data[0])
        if user.available_balance < stake:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        # Lock user's stake
        try:
            user.lock_balance(stake)
            supabase.table('users').update({
                'available_balance': user.available_balance,
                'locked_balance': user.locked_balance
            }).eq('id', user_id).execute()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # AI analysis with fallbacks
        ai_analysis = {}
        
        # Classify rumor
        try:
            classification = ai_service.classify_rumor(text)
            ai_analysis['classification'] = classification
        except Exception as e:
            logger.warning(f"AI classification failed: {str(e)}")
            ai_analysis['classification'] = {
                'prediction': 'UNCERTAIN',
                'confidence': 50,
                'reasoning': 'AI unavailable'
            }
        
        # Check duplicate
        try:
            duplicate_check = ai_service.check_duplicate(text)
            ai_analysis['duplicate_check'] = duplicate_check
        except Exception as e:
            logger.warning(f"Duplicate check failed: {str(e)}")
            ai_analysis['duplicate_check'] = {
                'is_duplicate': False,
                'similar_to': None,
                'similarity': 0.0,
                'similar_text': None
            }
        
        # Generate embedding
        embedding = None
        try:
            embedding = ai_service.generate_embedding(text)
        except Exception as e:
            logger.warning(f"Embedding generation failed: {str(e)}")
        
        # Create market
        market_data = {
            'text': text,
            'category': category,
            'submitter_id': user_id,
            'stake': stake,
            'price': 0.50,
            'total_bet_true': stake,
            'total_bet_false': stake,
            'status': 'active',
            'ai_prediction': ai_analysis['classification'].get('prediction'),
            'ai_confidence': ai_analysis['classification'].get('confidence'),
            'embedding': embedding
        }
        
        market_response = supabase.table('markets').insert(market_data).execute()
        
        if not market_response.data:
            # Rollback: unlock user balance
            user.unlock_balance(stake)
            supabase.table('users').update({
                'available_balance': user.available_balance,
                'locked_balance': user.locked_balance
            }).eq('id', user_id).execute()
            return jsonify({'error': 'Failed to create market'}), 500
        
        market = Market.from_dict(market_response.data[0])
        
        return jsonify({
            'market': market.to_dict(),
            'ai_analysis': ai_analysis
        }), 201
        
    except Exception as e:
        logger.error(f"Error in submit_market: {str(e)}")
        return jsonify({'error': str(e)}), 500

@markets_bp.route('/<market_id>/bet', methods=['POST'])
def place_bet(market_id):
    """Place a bet on a market"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        bet_type = data.get('type')  # 'long' or 'short'
        cc_amount = float(data.get('cc_amount', 0))
        
        # Validate inputs
        if not user_id or not bet_type or cc_amount <= 0:
            return jsonify({'error': 'user_id, type (long/short), and cc_amount > 0 are required'}), 400
        
        if bet_type not in ['long', 'short']:
            return jsonify({'error': "type must be 'long' or 'short'"}), 400
        
        supabase = get_supabase_client()
        
        # Validate trade
        validation = market_service.validate_trade(user_id, market_id, cc_amount)
        if not validation['valid']:
            return jsonify({'error': validation['error']}), 400
        
        # Get market
        market_response = supabase.table('markets').select('*').eq('id', market_id).execute()
        if not market_response.data:
            return jsonify({'error': 'Market not found'}), 404
        
        market = Market.from_dict(market_response.data[0])
        current_price = market.price
        
        # Calculate shares
        if bet_type == 'long':
            shares = market_service.calculate_shares_for_long(cc_amount, current_price)
            trade_type = 'true'
        else:  # short
            shares = market_service.calculate_shares_for_short(cc_amount, current_price)
            trade_type = 'false'
        
        # Get user and lock CC
        user_response = supabase.table('users').select('*').eq('id', user_id).execute()
        user = User.from_dict(user_response.data[0])
        
        try:
            user.lock_balance(cc_amount)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Update market totals and recalculate price
        market.apply_trade(trade_type, cc_amount)
        new_price = market.price
        
        # Update user balance
        supabase.table('users').update({
            'available_balance': user.available_balance,
            'locked_balance': user.locked_balance
        }).eq('id', user_id).execute()
        
        # Update market
        supabase.table('markets').update({
            'total_bet_true': market.total_bet_true,
            'total_bet_false': market.total_bet_false,
            'price': new_price
        }).eq('id', market_id).execute()
        
        # Check for existing position
        existing_position = supabase.table('positions').select('*').eq('user_id', user_id).eq('market_id', market_id).eq('type', trade_type).eq('status', 'open').execute()
        
        if existing_position.data:
            # Aggregate position
            position_data = existing_position.data[0]
            position = Position.from_dict(position_data)
            
            # Calculate weighted average entry price
            # For long (true): shares = cost / price, so cost = price * shares
            # For short (false): shares = cost / (1-price), so cost = shares * (1-price)
            total_shares = position.shares + shares
            total_cost = position.cost_basis + cc_amount
            
            if trade_type == 'true':
                # Long position: entry_price = cost / shares
                new_entry_price = total_cost / total_shares if total_shares > 0 else current_price
            else:
                # Short position: cost = shares * (1 - price), so price = 1 - (cost / shares)
                new_entry_price = 1 - (total_cost / total_shares) if total_shares > 0 else current_price
                new_entry_price = max(0.01, min(0.99, new_entry_price))  # Clamp to valid range
            
            position.shares = total_shares
            position.cost_basis = total_cost
            position.entry_price = new_entry_price
            position.collateral = market_service.calculate_collateral(total_shares, new_entry_price)
            
            # Update position
            supabase.table('positions').update(position.to_dict()).eq('id', position.id).execute()
        else:
            # Create new position
            collateral = market_service.calculate_collateral(shares, current_price)
            position_data = {
                'user_id': user_id,
                'market_id': market_id,
                'type': trade_type,
                'shares': shares,
                'entry_price': current_price,
                'cost_basis': cc_amount,
                'collateral': collateral,
                'status': 'open'
            }
            position_response = supabase.table('positions').insert(position_data).execute()
            position = Position.from_dict(position_response.data[0]) if position_response.data else None
        
        # Create trade record
        trade_data = {
            'user_id': user_id,
            'market_id': market_id,
            'type': trade_type,
            'cc_amount': cc_amount,
            'shares': shares,
            'price': current_price
        }
        supabase.table('trades').insert(trade_data).execute()
        
        return jsonify({
            'market': market.to_dict(),
            'position': position.to_dict() if position else None,
            'shares_received': shares,
            'new_price': new_price
        }), 200
        
    except Exception as e:
        logger.error(f"Error in place_bet: {str(e)}")
        return jsonify({'error': str(e)}), 500

@markets_bp.route('/<market_id>', methods=['DELETE'])
def delete_market(market_id):
    """Delete a market and refund all locked CCs proportionally
    
    Only the market submitter can delete unresolved markets.
    """
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        supabase = get_supabase_client()
        
        # Get market
        market_response = supabase.table('markets').select('*').eq('id', market_id).execute()
        if not market_response.data:
            return jsonify({'error': 'Market not found'}), 404
        
        market = Market.from_dict(market_response.data[0])
        
        # Check authorization - only submitter can delete
        if market.submitter_id != user_id:
            return jsonify({'error': 'Only market submitter can delete this market'}), 403
        
        # Check if market is unresolved
        if market.status != 'active':
            return jsonify({'error': f'Cannot delete market with status: {market.status}'}), 400
        
        total_locked = market.total_bet_true + market.total_bet_false
        
        # Get all open positions
        positions_response = supabase.table('positions').select('*').eq(
            'market_id', market_id
        ).eq('status', 'open').execute()
        
        positions = positions_response.data if positions_response.data else []
        
        refunds = []
        
        # Refund each position holder proportionally
        for position in positions:
            if total_locked > 0:
                # Calculate their proportion of the pool
                proportion = position['cost_basis'] / total_locked
                # Refund their original stake (not full pool)
                refund = position['cost_basis']
                
                # Update user balance
                user_response = supabase.table('users').select(
                    'available_balance', 'locked_balance'
                ).eq('id', position['user_id']).execute()
                
                if user_response.data:
                    user_data = user_response.data[0]
                    current_available = user_data.get('available_balance', 0)
                    current_locked = user_data.get('locked_balance', 0)
                    
                    supabase.table('users').update({
                        'available_balance': current_available + refund,
                        'locked_balance': max(0, current_locked - refund)
                    }).eq('id', position['user_id']).execute()
                
                # Mark position as closed (deleted market)
                supabase.table('positions').update({
                    'status': 'deleted',
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('id', position['id']).execute()
                
                refunds.append({
                    'user_id': position['user_id'],
                    'refund_amount': refund
                })
        
        # Refund submitter's stake
        if market.submitter_id:
            user_response = supabase.table('users').select(
                'available_balance', 'locked_balance'
            ).eq('id', market.submitter_id).execute()
            
            if user_response.data:
                user_data = user_response.data[0]
                current_available = user_data.get('available_balance', 0)
                current_locked = user_data.get('locked_balance', 0)
                
                supabase.table('users').update({
                    'available_balance': current_available + market.stake,
                    'locked_balance': max(0, current_locked - market.stake)
                }).eq('id', market.submitter_id).execute()
            
            refunds.append({
                'user_id': market.submitter_id,
                'refund_amount': market.stake,
                'type': 'submitter'
            })
        
        # Mark market as deleted (audit trail)
        supabase.table('markets').update({
            'status': 'deleted',
            'updated_at': datetime.utcnow().isoformat()
        }).eq('id', market_id).execute()
        
        return jsonify({
            'message': 'Market deleted successfully',
            'market_id': market_id,
            'total_refunded': sum(r['refund_amount'] for r in refunds),
            'refunds': refunds
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting market: {str(e)}")
        return jsonify({'error': str(e)}), 500
