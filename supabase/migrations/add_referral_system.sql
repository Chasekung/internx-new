-- Add referral system to existing database
-- This migration adds referral tracking and location data

-- Add referral_code column to interns table
ALTER TABLE interns ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES interns(id);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS signup_location VARCHAR(255);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS signup_ip VARCHAR(45);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS signup_user_agent TEXT;

-- Create referrals table to track referral relationships
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

-- Create referral_links table for tracking link clicks
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
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals" ON referrals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own referrals" ON referrals
    FOR UPDATE USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- RLS policies for referral_link_clicks
CREATE POLICY "Users can view their own link clicks" ON referral_link_clicks
    FOR SELECT USING (auth.uid() = referrer_id);

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

-- Function to generate unique referral codes
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

-- Function to create referral when new user signs up
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

-- Trigger to automatically handle referrals on new user signup
CREATE TRIGGER trigger_handle_new_referral
    BEFORE INSERT ON interns
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_referral(); 