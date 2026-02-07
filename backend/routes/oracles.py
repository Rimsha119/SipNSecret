"""Oracle routes"""

import logging
from flask import Blueprint, request, jsonify
from services.oracle_service import OracleService
from services.ai_service import AIService
from utils.supabase_client import get_supabase_client
from models.user import User

logger = logging.getLogger(__name__)
oracles_bp = Blueprint('oracles', __name__)
oracle_service = OracleService()
ai_service = AIService()

@oracles_bp.route('/predict/<market_id>', methods=['GET', 'POST'])
def get_prediction(market_id):
    """Get oracle prediction for a market"""
    try:
        user_query = None
        if request.method == 'POST':
            data = request.get_json()
            user_query = data.get('query')
        else:
            user_query = request.args.get('query')
        
        prediction, error = oracle_service.get_oracle_prediction(market_id, user_query)
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({'prediction': prediction}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oracles_bp.route('/predict/batch', methods=['POST'])
def get_batch_predictions():
    """Get predictions for multiple markets"""
    try:
        data = request.get_json()
        market_ids = data.get('market_ids', [])
        user_query = data.get('query')
        
        if not market_ids:
            return jsonify({'error': 'market_ids array is required'}), 400
        
        predictions, errors = oracle_service.get_multiple_predictions(market_ids, user_query)
        
        response = {'predictions': predictions}
        if errors:
            response['errors'] = errors
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

