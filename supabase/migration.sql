-- Run this in Supabase SQL Editor (FULL RESET)
-- DANGER: This will disable RLS and remove auth.users dependency

-- Drop all RLS policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own deposits" ON deposits;
DROP POLICY IF EXISTS "Users can insert own deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can update deposits" ON deposits;
DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE deposits DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;

-- Add password_hash column and remove auth.users dependency
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  mobile TEXT DEFAULT '',
  password_hash TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  total_invested DECIMAL(12,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  investment DECIMAL(12,2) NOT NULL,
  daily_profit DECIMAL(12,2) NOT NULL,
  total_profit DECIMAL(12,2) NOT NULL,
  duration INT NOT NULL,
  color TEXT DEFAULT 'from-emerald-500 to-emerald-600',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'jazzcash',
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id INT REFERENCES packages(id) NOT NULL,
  package_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  daily_profit DECIMAL(12,2) NOT NULL,
  total_profit DECIMAL(12,2) NOT NULL,
  duration INT NOT NULL,
  days_completed INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_earning_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'earning')),
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  method TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  method TEXT DEFAULT 'jazzcash',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert default packages
INSERT INTO packages (name, investment, daily_profit, total_profit, duration, color) VALUES
  ('Starter', 280, 60, 3900, 65, 'from-emerald-500 to-emerald-600'),
  ('Basic', 680, 170, 11050, 65, 'from-emerald-500 to-teal-600'),
  ('Bronze', 1280, 320, 20800, 65, 'from-teal-500 to-cyan-600'),
  ('Silver', 1880, 470, 30550, 65, 'from-cyan-500 to-blue-600'),
  ('Gold', 2980, 745, 48425, 65, 'from-amber-500 to-yellow-600'),
  ('Platinum', 4350, 1095, 71175, 65, 'from-yellow-500 to-orange-600'),
  ('Diamond', 6380, 1620, 105300, 65, 'from-orange-500 to-red-600'),
  ('Elite', 9780, 2440, 158600, 65, 'from-rose-500 to-pink-600'),
  ('Crown', 16680, 4270, 277550, 65, 'from-purple-500 to-violet-600')
ON CONFLICT (id) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('admin_password', 'admin123'),
  ('admin_whatsapp', '923043310635'),
  ('contact_number', '03043310635'),
  ('jazzcash_number', '03043310635'),
  ('account_name', 'Muhammad Salman'),
  ('min_withdrawal', '1000')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Helper function for earnings cron job
CREATE OR REPLACE FUNCTION add_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET balance = balance + amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
