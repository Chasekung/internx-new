-- Comprehensive RLS fix for all form-related tables
-- This allows students to view and fill out published application forms

-- ============================================
-- 1. FORMS TABLE - Allow viewing published forms
-- ============================================

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;

-- Create new policy: Anyone can view published forms, companies can view all their forms
CREATE POLICY "Anyone can view published forms"
    ON public.forms FOR SELECT
    USING (
        published = true
        OR auth.uid() = company_id
    );

-- ============================================
-- 2. FORM_SECTIONS TABLE - Allow viewing sections of published forms
-- ============================================

DROP POLICY IF EXISTS "Anyone can view sections of published forms" ON public.form_sections;

CREATE POLICY "Anyone can view sections of published forms"
    ON public.form_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM forms
            WHERE forms.id = form_sections.form_id
            AND (forms.published = true OR forms.company_id = auth.uid())
        )
    );

-- ============================================
-- 3. FORM_QUESTIONS TABLE - Allow viewing questions of published forms
-- ============================================

DROP POLICY IF EXISTS "Anyone can view questions of published forms" ON public.form_questions;

CREATE POLICY "Anyone can view questions of published forms"
    ON public.form_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM form_sections
            JOIN forms ON forms.id = form_sections.form_id
            WHERE form_sections.id = form_questions.section_id
            AND (forms.published = true OR forms.company_id = auth.uid())
        )
    );

-- ============================================
-- 4. FORM_RESPONSES TABLE - Allow users to create and view their own responses
-- ============================================

DROP POLICY IF EXISTS "Users can create their own form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Users can view their own form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Companies can view responses to their forms" ON public.form_responses;

-- Users can create responses to published forms
CREATE POLICY "Users can create their own form responses"
    ON public.form_responses FOR INSERT
    WITH CHECK (
        auth.uid() = applicant_id
        AND EXISTS (
            SELECT 1 FROM forms
            WHERE forms.id = form_responses.form_id
            AND forms.published = true
        )
    );

-- Users can view and update their own responses
CREATE POLICY "Users can view their own form responses"
    ON public.form_responses FOR SELECT
    USING (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own form responses"
    ON public.form_responses FOR UPDATE
    USING (auth.uid() = applicant_id);

-- Companies can view responses to their forms
CREATE POLICY "Companies can view responses to their forms"
    ON public.form_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM forms
            WHERE forms.id = form_responses.form_id
            AND forms.company_id = auth.uid()
        )
    );

-- ============================================
-- 5. RESPONSE_ANSWERS TABLE - Allow users to manage their own answers
-- ============================================

DROP POLICY IF EXISTS "Users can create their own response answers" ON public.response_answers;
DROP POLICY IF EXISTS "Users can view their own response answers" ON public.response_answers;
DROP POLICY IF EXISTS "Companies can view answers to their forms" ON public.response_answers;

-- Users can create their own answers
CREATE POLICY "Users can create their own response answers"
    ON public.response_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.id = response_answers.response_id
            AND form_responses.applicant_id = auth.uid()
        )
    );

-- Users can view and update their own answers
CREATE POLICY "Users can view their own response answers"
    ON public.response_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.id = response_answers.response_id
            AND form_responses.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own response answers"
    ON public.response_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.id = response_answers.response_id
            AND form_responses.applicant_id = auth.uid()
        )
    );

-- Companies can view answers to their forms
CREATE POLICY "Companies can view answers to their forms"
    ON public.response_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            JOIN forms ON forms.id = form_responses.form_id
            WHERE form_responses.id = response_answers.response_id
            AND forms.company_id = auth.uid()
        )
    );

-- ============================================
-- Summary of what this script does:
-- ============================================
-- 1. Allows anyone to VIEW published forms
-- 2. Allows anyone to VIEW sections/questions of published forms
-- 3. Allows students to CREATE and MANAGE their own form responses
-- 4. Allows companies to VIEW responses to their forms
-- 5. Maintains security: unpublished forms remain private to companies
