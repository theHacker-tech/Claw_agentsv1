-- Supabase PostgreSQL Schema for Hybrid Vault (V1)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for Telegram ID mappings
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    accepted_tos BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Briefcases table for 6-digit token, asset descriptions, fee calculations, and escrow states
CREATE TABLE briefcases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(6) UNIQUE NOT NULL,
    right_hand_id BIGINT NOT NULL,
    left_hand_id BIGINT NOT NULL,
    asset_description TEXT,
    access_keys TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    base_amount DECIMAL(10, 2),
    platform_fee DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    payment_method VARCHAR(10),
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Indexes for performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_briefcases_token ON briefcases(token);
CREATE INDEX idx_briefcases_right_hand ON briefcases(right_hand_id);
CREATE INDEX idx_briefcases_left_hand ON briefcases(left_hand_id);
CREATE INDEX idx_briefcases_status ON briefcases(status);

-- Row-Level Security Policies for Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid()::text = telegram_id::text);

CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid()::text = telegram_id::text);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = telegram_id::text);

-- Row-Level Security Policies for Briefcases table
ALTER TABLE briefcases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Right hand can view briefcase"
    ON briefcases FOR SELECT
    USING (auth.uid()::text = right_hand_id::text);

CREATE POLICY "Left hand can view briefcase"
    ON briefcases FOR SELECT
    USING (auth.uid()::text = left_hand_id::text);

CREATE POLICY "Right hand can update funding status"
    ON briefcases FOR UPDATE
    USING (auth.uid()::text = right_hand_id::text AND status = 'pending');

CREATE POLICY "Left hand can lock access keys"
    ON briefcases FOR UPDATE
    USING (auth.uid()::text = left_hand_id::text AND status = 'pending');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_briefcases_updated_at BEFORE UPDATE ON briefcases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();