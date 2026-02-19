-- Add email_signals column to profiles (default true so all users get emails)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_signals boolean DEFAULT true;

-- Index for fast lookup when broadcasting email signals
CREATE INDEX IF NOT EXISTS idx_profiles_email_signals ON profiles(email_signals) WHERE email_signals = true;
