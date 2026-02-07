/**
 * API Service for communicating with Flask backend
 * In development: Uses Vite proxy (relative URLs)
 * In production: Uses absolute backend URL from environment
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
        // Add a 30 second timeout to fetch requests
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(url, { ...config, signal: controller.signal });
        clearTimeout(timeout);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { error: await response.text() };
        }

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error.message);
        // Provide more helpful error messages
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server took too long to respond');
        }
        throw new Error(error.message || 'Failed to fetch data from server');
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

