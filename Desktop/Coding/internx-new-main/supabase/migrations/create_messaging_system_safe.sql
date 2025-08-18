-- Safe migration for messaging and announcements system
-- This migration creates the database schema for real-time messaging between companies and interns
-- It includes safety checks to prevent conflicts with existing tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table (safe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(company_id, intern_id)
    );
  END IF;
END $$;

-- Create messages table (safe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL,
      sender_type TEXT NOT NULL CHECK (sender_type IN ('company', 'intern')),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      read_at TIMESTAMP WITH TIME ZONE,
      is_system_message BOOLEAN DEFAULT FALSE
    );
  END IF;
END $$;

-- Create announcements table (safe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements') THEN
    CREATE TABLE announcements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      announcement_type TEXT NOT NULL CHECK (
        announcement_type IN (
          'application_status', 
          'interview_scheduled', 
          'offer_extended', 
          'rejection', 
          'general_update'
        )
      ),
      status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      read_at TIMESTAMP WITH TIME ZONE
    );
  END IF;
END $$;

-- Enable Row Level Security (RLS) - safe with proper checks
DO $$ 
BEGIN
  -- Enable RLS on conversations if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on messages if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on announcements if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements') THEN
    ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If any table doesn't exist, continue without error
    NULL;
END $$;

-- Create indexes for better performance (safe) - AFTER tables are created
DO $$ 
BEGIN
  -- Indexes for conversations
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversations_company_id') THEN
      CREATE INDEX idx_conversations_company_id ON conversations(company_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_conversations_intern_id') THEN
      CREATE INDEX idx_conversations_intern_id ON conversations(intern_id);
    END IF;
  END IF;
  
  -- Indexes for messages
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_messages_conversation_id') THEN
      CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_messages_created_at') THEN
      CREATE INDEX idx_messages_created_at ON messages(created_at);
    END IF;
  END IF;
  
  -- Indexes for announcements
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements') THEN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_announcements_intern_id') THEN
      CREATE INDEX idx_announcements_intern_id ON announcements(intern_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_announcements_company_id') THEN
      CREATE INDEX idx_announcements_company_id ON announcements(company_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_announcements_created_at') THEN
      CREATE INDEX idx_announcements_created_at ON announcements(created_at);
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If any index creation fails, continue without error
    NULL;
END $$;

-- RLS Policies for conversations (safe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Companies can view their conversations') THEN
      CREATE POLICY "Companies can view their conversations" ON conversations
        FOR SELECT USING (
          company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Interns can view their conversations') THEN
      CREATE POLICY "Interns can view their conversations" ON conversations
        FOR SELECT USING (
          intern_id IN (
            SELECT id FROM interns WHERE user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Companies can create conversations') THEN
      CREATE POLICY "Companies can create conversations" ON conversations
        FOR INSERT WITH CHECK (
          company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Update conversation timestamp') THEN
      CREATE POLICY "Update conversation timestamp" ON conversations
        FOR UPDATE USING (
          company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
          ) OR
          intern_id IN (
            SELECT id FROM interns WHERE user_id = auth.uid()
          )
        );
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- RLS Policies for messages (safe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'View messages in users conversations') THEN
      CREATE POLICY "View messages in user's conversations" ON messages
        FOR SELECT USING (
          conversation_id IN (
            SELECT c.id FROM conversations c
            LEFT JOIN companies comp ON c.company_id = comp.id
            LEFT JOIN interns i ON c.intern_id = i.id
            WHERE comp.user_id = auth.uid() OR i.user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Send messages as company') THEN
      CREATE POLICY "Send messages as company" ON messages
        FOR INSERT WITH CHECK (
          sender_type = 'company' AND
          sender_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
          ) AND
          conversation_id IN (
            SELECT id FROM conversations WHERE company_id = sender_id
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Send messages as intern') THEN
      CREATE POLICY "Send messages as intern" ON messages
        FOR INSERT WITH CHECK (
          sender_type = 'intern' AND
          sender_id IN (
            SELECT id FROM interns WHERE user_id = auth.uid()
          ) AND
          conversation_id IN (
            SELECT id FROM conversations WHERE intern_id = sender_id
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Mark messages as read') THEN
      CREATE POLICY "Mark messages as read" ON messages
        FOR UPDATE USING (
          conversation_id IN (
            SELECT c.id FROM conversations c
            LEFT JOIN companies comp ON c.company_id = comp.id
            LEFT JOIN interns i ON c.intern_id = i.id
            WHERE comp.user_id = auth.uid() OR i.user_id = auth.uid()
          )
        );
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- RLS Policies for announcements (safe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements') THEN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Companies can view their announcements') THEN
      CREATE POLICY "Companies can view their announcements" ON announcements
        FOR SELECT USING (
          company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Interns can view their announcements') THEN
      CREATE POLICY "Interns can view their announcements" ON announcements
        FOR SELECT USING (
          intern_id IN (
            SELECT id FROM interns WHERE user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Companies can create announcements') THEN
      CREATE POLICY "Companies can create announcements" ON announcements
        FOR INSERT WITH CHECK (
          company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Mark announcements as read') THEN
      CREATE POLICY "Mark announcements as read" ON announcements
        FOR UPDATE USING (
          intern_id IN (
            SELECT id FROM interns WHERE user_id = auth.uid()
          )
        );
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Create function to update conversation updated_at timestamp (safe)
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp when message is sent (safe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_conversation_on_message') THEN
      CREATE TRIGGER update_conversation_on_message
        AFTER INSERT ON messages
        FOR EACH ROW
        EXECUTE FUNCTION update_conversation_timestamp();
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Create function to get conversation participants (safe)
CREATE OR REPLACE FUNCTION get_conversation_participants(conv_id UUID)
RETURNS TABLE(
  company_name TEXT,
  intern_name TEXT,
  company_id UUID,
  intern_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as company_name,
    CONCAT(i.first_name, ' ', i.last_name) as intern_name,
    c.id as company_id,
    i.id as intern_id
  FROM conversations conv
  JOIN companies c ON conv.company_id = c.id
  JOIN interns i ON conv.intern_id = i.id
  WHERE conv.id = conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread message count (safe)
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_type TEXT;
  unread_count INTEGER;
BEGIN
  -- Determine if user is company or intern
  SELECT 
    CASE 
      WHEN EXISTS(SELECT 1 FROM companies WHERE user_id = get_unread_message_count.user_id) THEN 'company'
      WHEN EXISTS(SELECT 1 FROM interns WHERE user_id = get_unread_message_count.user_id) THEN 'intern'
      ELSE NULL
    END INTO user_type;
  
  IF user_type = 'company' THEN
    SELECT COUNT(*) INTO unread_count
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.company_id IN (SELECT id FROM companies WHERE user_id = get_unread_message_count.user_id)
      AND m.sender_type = 'intern'
      AND m.read_at IS NULL;
  ELSIF user_type = 'intern' THEN
    SELECT COUNT(*) INTO unread_count
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.intern_id IN (SELECT id FROM interns WHERE user_id = get_unread_message_count.user_id)
      AND m.sender_type = 'company'
      AND m.read_at IS NULL;
  ELSE
    unread_count := 0;
  END IF;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread announcement count (safe)
CREATE OR REPLACE FUNCTION get_unread_announcement_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM announcements a
  WHERE a.intern_id IN (SELECT id FROM interns WHERE user_id = get_unread_announcement_count.user_id)
    AND a.status = 'unread';
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions (safe)
DO $$ 
BEGIN
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT ALL ON conversations TO authenticated;
  GRANT ALL ON messages TO authenticated;
  GRANT ALL ON announcements TO authenticated;
  GRANT EXECUTE ON FUNCTION get_conversation_participants(UUID) TO authenticated;
  GRANT EXECUTE ON FUNCTION get_unread_message_count(UUID) TO authenticated;
  GRANT EXECUTE ON FUNCTION get_unread_announcement_count(UUID) TO authenticated;
EXCEPTION
  WHEN OTHERS THEN
    -- Permissions might already be granted, continue
    NULL;