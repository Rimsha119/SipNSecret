/**
 * API Service for communicating with Flask backend
 * All API calls go through Flask, which then communicates with Supabase
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    /**
     * Initialize or get existing user
     */
    initialize: async (pseudonym) => {
        return apiRequest('/auth/initialize', {
            method: 'POST',
            body: { pseudonym },
        });
    },

    /**
     * Get user by ID
     */
    getUser: async (userId) => {
        return apiRequest(`/auth/user/${userId}`);
    },

    /**
     * Get top users
     */
    getTopUsers: async () => {
        return apiRequest('/auth/users');
    },
};

// Markets API
export const marketsAPI = {
    /**
     * Get all markets with optional filters
     */
    getMarkets: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/markets${queryString ? `?${queryString}` : ''}`;
        return apiRequest(endpoint);
    },

    /**
     * Get market by ID
     */
    getMarket: async (marketId) => {
        return apiRequest(`/markets/${marketId}`);
    },

    /**
     * Submit a new market
     */
    submitMarket: async (marketData) => {
        return apiRequest('/markets/submit', {
            method: 'POST',
            body: marketData,
        });
    },

    /**
     * Place a bet on a market
     */
    placeBet: async (marketId, betData) => {
        return apiRequest(`/markets/${marketId}/bet`, {
            method: 'POST',
            body: betData,
        });
    },
};

// Oracle API
export const oracleAPI = {
    /**
     * Resolve a market
     */
    resolveMarket: async (marketId, outcome) => {
        return apiRequest('/oracles/resolve', {
            method: 'POST',
            body: { market_id: marketId, outcome },
        });
    },

    /**
     * Submit oracle report
     */
    submitReport: async (reportData) => {
        return apiRequest('/oracles/submit', {
            method: 'POST',
            body: reportData,
        });
    },

    /**
     * Get reports for a market
     */
    getReports: async (marketId) => {
        return apiRequest(`/oracles/reports/${marketId}`);
    },
};

// Health & Stats API
export const systemAPI = {
    /**
     * Health check
     */
    health: async () => {
        return apiRequest('/health');
    },

    /**
     * Get system statistics
     */
    getStats: async () => {
        return apiRequest('/stats');
    },
};

export default {
    auth: authAPI,
    markets: marketsAPI,
    oracle: oracleAPI,
    system: systemAPI,
};

