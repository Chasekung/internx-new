-- Safe version of add_referral_system.sql
-- Add referral system to existing database

-- Add referral columns to interns table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interns' AND column_name = 'referral_code') THEN
        ALTER TABLE interns ADD COLUMN referral_code VARCHAR(20) UNIQUE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interns' AND column_name = 'referred_by') THEN
        ALTER TABLE interns ADD COLUMN referred_by UUID REFERENCES interns(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interns' AND column_name = 'signup_location') THEN
        ALTER TABLE interns ADD COLUMN signup_location VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interns' AND column_name = 'signup_ip') THEN
        ALTER TABLE interns ADD COLUMN signup_ip VARCHAR(45);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interns' AND column_name = 'signup_user_agent') THEN
        ALTER TABLE interns ADD COLUMN signup_user_agent TEXT;
    END IF;
END $$;

-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    signup_location VARCHAR(255),
    signup_ip VARCHAR(45),
    signup_user_agent TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referred_id)
);

-- Create referral_link_clicks table if it doesn't exist
CREATE TABLE IF NOT EXISTS referral_link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(20) NOT NULL,
    referrer_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    visitor_ip VARCHAR(45),
    visitor_user_agent TEXT,
    visitor_location VARCHAR(255),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
DO $$ 
BEGIN
    ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE referral_link_clicks ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

-- RLS policies for referrals
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Users can insert referrals" ON referrals;
CREATE POLICY "Users can insert referrals" ON referrals
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own referrals" ON referrals;
CREATE POLICY "Users can update their own referrals" ON referrals
    FOR UPDATE USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- RLS policies for referral_link_clicks
DROP POLICY IF EXISTS "Users can view their own link clicks" ON referral_link_clicks;
CREATE POLICY "Users can view their own link clicks" ON referral_link_clicks
    FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Anyone can insert link clicks" ON referral_link_clicks;
CREATE POLICY "Anyone can insert link clicks" ON referral_link_clicks
    FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interns_referral_code ON interns(referral_code);
CREATE INDEX IF NOT EXISTS idx_interns_referred_by ON interns(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_link_clicks_referral_code ON referral_link_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_link_clicks_referrer_id ON referral_link_clicks(referrer_id);

-- Create or replace function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    code VARCHAR(20);
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate a 8-character alphanumeric code
        code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
        
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM interns WHERE referral_code = code) THEN
            RETURN code;
        END IF;
        
        counter := counter + 1;
        -- Prevent infinite loop
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique referral code after 100 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to create referral when new user signs up
CREATE OR REPLACE FUNCTION handle_new_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate referral code if not provided
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    
    -- If user was referred, create referral record
    IF NEW.referred_by IS NOT NULL THEN
        INSERT INTO referrals (
            referrer_id,
            referred_id,
            referral_code,
            signup_location,
            signup_ip,
            signup_user_agent,
            status
        ) VALUES (
            NEW.referred_by,
            NEW.id,
            NEW.referral_code,
            NEW.signup_location,
            NEW.signup_ip,
            NEW.signup_user_agent,
            'completed'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically handle referrals on new user signup
DROP TRIGGER IF EXISTS trigger_handle_new_referral ON interns;
CREATE TRIGGER trigger_handle_new_referral
    BEFORE INSERT ON interns
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_referral(); 