-- Sybil Protection Enhancement
-- Add this to your Supabase database to track oracle votes and IP addresses

-- Oracle vote history table (anonymous tracking: no IP / user-agent)
CREATE TABLE IF NOT EXISTS oracle_vote_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oracle_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL,
    ip_hash VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for vote history (anonymous)
CREATE INDEX IF NOT EXISTS idx_oracle_vote_history_oracle_id ON oracle_vote_history(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_vote_history_market_id ON oracle_vote_history(market_id);
CREATE INDEX IF NOT EXISTS idx_oracle_vote_history_oracle_created ON oracle_vote_history(oracle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oracle_vote_history_iphash_created ON oracle_vote_history(ip_hash, created_at DESC);

-- Add unique constraint: one oracle per market
CREATE UNIQUE INDEX IF NOT EXISTS idx_oracle_one_per_market ON oracle_reports(oracle_id, market_id);

-- Verify email field exists in users table (should exist from Supabase auth)
-- If you need to add an email verification tracking:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
