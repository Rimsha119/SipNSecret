"""Oracle routes"""

import logging
from flask import Blueprint, request, jsonify
from services.oracle_service import OracleService
import os
import hmac
import hashlib
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


@oracles_bp.route('/report', methods=['POST'])
def submit_report():
    """Submit an oracle report (verdict + evidence + stake)."""
    try:
        data = request.get_json()
        oracle_id = data.get('oracle_id')
        market_id = data.get('market_id')
        verdict = data.get('verdict')
        evidence = data.get('evidence', [])
        stake = data.get('stake')

        if not all([oracle_id, market_id, verdict, stake is not None]):
            return jsonify({'error': 'oracle_id, market_id, verdict and stake are required'}), 400

        # Extract client IP (first hop) if available and compute HMAC(ip) for privacy-preserving rate-limits
        ip_address = request.headers.get('X-Forwarded-For')
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        else:
            ip_address = request.headers.get('X-Real-IP', request.remote_addr)

        ip_hash = None
        secret = os.getenv('IP_HMAC_SECRET')
        if secret and ip_address:
            try:
                ip_hash = hmac.new(secret.encode('utf-8'), ip_address.encode('utf-8'), hashlib.sha256).hexdigest()
            except Exception:
                ip_hash = None

        report, triggered = oracle_service.submit_oracle_report(oracle_id, market_id, verdict, evidence, stake, ip_hash)

        resp = {'report': report, 'consensus_triggered': triggered}
        return jsonify(resp), 201

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Error submitting oracle report: {e}")
        return jsonify({'error': str(e)}), 500


@oracles_bp.route('/reports/<market_id>', methods=['GET'])
def get_reports_for_market(market_id):
    """Return oracle reports for a market."""
    try:
        supabase = get_supabase_client()
        resp = supabase.table('oracle_reports').select('*').eq('market_id', market_id).order('created_at', desc=True).execute()
        reports = resp.data if resp.data else []
        return jsonify({'reports': reports}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

