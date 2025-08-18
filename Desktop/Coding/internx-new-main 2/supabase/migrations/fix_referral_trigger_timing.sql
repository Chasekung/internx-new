-- Fix referral trigger timing
-- The trigger needs to run AFTER INSERT so the new user record exists
-- when we try to create the referral record

-- Drop the existing BEFORE INSERT trigger
DROP TRIGGER IF EXISTS trigger_handle_new_referral ON interns;

-- Create or replace function to create referral when new user signs up
CREATE OR REPLACE FUNCTION handle_new_referral()
RETURNS TRIGGER AS $$
BEGIN
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

-- Create trigger to automatically handle referrals AFTER new user signup
CREATE TRIGGER trigger_handle_new_referral
    AFTER INSERT ON interns
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_referral(); 