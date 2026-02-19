ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whop_membership_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whop_user_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
