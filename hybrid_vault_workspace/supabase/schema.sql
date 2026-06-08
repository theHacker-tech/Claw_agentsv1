-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for Telegram Identity
CREATE TABLE IF NOT EXISTS profiles (
  tg_id BIGINT PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- The Briefcase (Escrow Transactions)
CREATE TABLE IF NOT EXISTS briefcases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(6) UNIQUE NOT NULL,
  right_hand_id BIGINT REFERENCES profiles(tg_id),
  left_hand_id BIGINT REFERENCES profiles(tg_id),
  access_keys TEXT, -- Encrypted digital assets
  amount DECIMAL(18, 2) NOT NULL,
  fee_amount DECIMAL(18, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'funded', 'released'
  payment_method TEXT, -- 'crypto', 'fiat'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefcases ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can only read their own profile
CREATE POLICY "Profile Access" ON profiles 
FOR SELECT USING (auth.uid()::text = tg_id::text OR tg_id = (SELECT tg_id FROM profiles WHERE tg_id = auth.uid()));

-- Briefcase RLS: Only participants can see the briefcase
CREATE POLICY "Briefcase Access" ON briefcases
FOR SELECT USING (
  auth.jwt() ->> 'tg_id' = right_hand_id::text 
  OR 
  auth.jwt() ->> 'tg_id' = left_hand_id::text
);

CREATE POLICY "Update Briefcase" ON briefcases
FOR UPDATE USING (
  auth.jwt() ->> 'tg_id' = right_hand_id::text 
  OR 
  auth.jwt() ->> 'tg_id' = left_hand_id::text
);