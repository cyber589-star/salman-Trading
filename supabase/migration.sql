-- Run this in Supabase SQL Editor

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  mobile TEXT NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0,
  total_invested DECIMAL(12,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
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

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'jazzcash',
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
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

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'earning')),
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  method TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  method TEXT DEFAULT 'jazzcash',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
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

-- Insert default admin (run after creating admin user)
-- UPDATE profiles SET role = 'admin' WHERE username = 'admin';

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for deposits
CREATE POLICY "Users can view own deposits"
  ON deposits FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own deposits"
  ON deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update deposits"
  ON deposits FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for investments
CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own investments"
  ON investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "System can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for withdrawals
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update withdrawals"
  ON withdrawals FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS for settings (anyone can read)
CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  USING (true);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Anyone can view payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs');

-- Helper functions for the earnings cron job
CREATE OR REPLACE FUNCTION add_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET balance = balance + amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
