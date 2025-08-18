-- Add question_category column to interview_responses table
-- Migration: add_question_category_to_responses.sql
 
ALTER TABLE interview_responses ADD COLUMN IF NOT EXISTS question_category VARCHAR(50); 