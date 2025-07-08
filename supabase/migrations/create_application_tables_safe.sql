-- Safe version of create_application_tables.sql
-- This version checks for existing objects before creating them

-- Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references auth.users(id) on delete cascade,
    title text not null,
    description text,
    settings jsonb default '{}'::jsonb,
    status text default 'draft' check (status in ('draft', 'published', 'archived')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sections table
CREATE TABLE IF NOT EXISTS public.form_sections (
    id uuid default gen_random_uuid() primary key,
    form_id uuid references public.forms(id) on delete cascade,
    title text not null,
    description text,
    order_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create question bank table
CREATE TABLE IF NOT EXISTS public.question_bank (
    id uuid default gen_random_uuid() primary key,
    company_id uuid references auth.users(id) null,
    type text not null check (type in ('short_text', 'long_text', 'multiple_choice', 'checkboxes', 'dropdown', 'file_upload', 'video_upload')),
    question_text text not null,
    options jsonb default null,
    category text,
    is_private boolean default true,
    usage_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.form_questions (
    id uuid default gen_random_uuid() primary key,
    section_id uuid references public.form_sections(id) on delete cascade,
    question_bank_id uuid references public.question_bank(id) null,
    type text not null check (type in ('short_text', 'long_text', 'multiple_choice', 'checkboxes', 'dropdown', 'file_upload', 'video_upload')),
    question_text text not null,
    options jsonb default null,
    required boolean default false,
    order_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create responses table
CREATE TABLE IF NOT EXISTS public.form_responses (
    id uuid default gen_random_uuid() primary key,
    form_id uuid references public.forms(id) on delete cascade,
    applicant_id uuid references auth.users(id) on delete cascade,
    status text default 'in_progress' check (status in ('in_progress', 'submitted', 'reviewed', 'archived')),
    submitted_at timestamp with time zone null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create response answers table
CREATE TABLE IF NOT EXISTS public.response_answers (
    id uuid default gen_random_uuid() primary key,
    response_id uuid references public.form_responses(id) on delete cascade,
    question_id uuid references public.form_questions(id) on delete cascade,
    answer_text text,
    answer_data jsonb default null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - safe to run multiple times
DO $$ 
BEGIN
    ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.form_sections ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.response_answers ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

-- RLS Policies for forms - Drop and recreate to avoid conflicts
DROP POLICY IF EXISTS "Companies can create forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can update their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can delete their own forms" ON public.forms;

CREATE POLICY "Companies can create forms"
    ON public.forms FOR INSERT
    WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can view their own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = company_id);

CREATE POLICY "Companies can update their own forms"
    ON public.forms FOR UPDATE
    USING (auth.uid() = company_id);

CREATE POLICY "Companies can delete their own forms"
    ON public.forms FOR DELETE
    USING (auth.uid() = company_id);

-- RLS Policies for question bank - Drop and recreate to avoid conflicts
DROP POLICY IF EXISTS "Companies can create questions in bank" ON public.question_bank;
DROP POLICY IF EXISTS "Companies can view their own questions and public questions" ON public.question_bank;
DROP POLICY IF EXISTS "Companies can update their own questions" ON public.question_bank;
DROP POLICY IF EXISTS "Companies can delete their own questions" ON public.question_bank;

CREATE POLICY "Companies can create questions in bank"
    ON public.question_bank FOR INSERT
    WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can view their own questions and public questions"
    ON public.question_bank FOR SELECT
    USING (auth.uid() = company_id OR NOT is_private);

CREATE POLICY "Companies can update their own questions"
    ON public.question_bank FOR UPDATE
    USING (auth.uid() = company_id);

CREATE POLICY "Companies can delete their own questions"
    ON public.question_bank FOR DELETE
    USING (auth.uid() = company_id);

-- RLS Policies for form_sections
DROP POLICY IF EXISTS "Companies can manage form sections" ON public.form_sections;
CREATE POLICY "Companies can manage form sections"
    ON public.form_sections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.forms 
            WHERE forms.id = form_sections.form_id 
            AND forms.company_id = auth.uid()
        )
    );

-- RLS Policies for form_questions
DROP POLICY IF EXISTS "Companies can manage form questions" ON public.form_questions;
CREATE POLICY "Companies can manage form questions"
    ON public.form_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.form_sections 
            JOIN public.forms ON forms.id = form_sections.form_id
            WHERE form_sections.id = form_questions.section_id 
            AND forms.company_id = auth.uid()
        )
    );

-- RLS Policies for form_responses
DROP POLICY IF EXISTS "Users can manage their own responses" ON public.form_responses;
DROP POLICY IF EXISTS "Companies can view responses to their forms" ON public.form_responses;

CREATE POLICY "Users can manage their own responses"
    ON public.form_responses FOR ALL
    USING (auth.uid() = applicant_id);

CREATE POLICY "Companies can view responses to their forms"
    ON public.form_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.forms 
            WHERE forms.id = form_responses.form_id 
            AND forms.company_id = auth.uid()
        )
    );

-- RLS Policies for response_answers
DROP POLICY IF EXISTS "Users can manage their own answers" ON public.response_answers;
DROP POLICY IF EXISTS "Companies can view answers to their forms" ON public.response_answers;

CREATE POLICY "Users can manage their own answers"
    ON public.response_answers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.form_responses 
            WHERE form_responses.id = response_answers.response_id 
            AND form_responses.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Companies can view answers to their forms"
    ON public.response_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.form_responses 
            JOIN public.forms ON forms.id = form_responses.form_id
            WHERE form_responses.id = response_answers.response_id 
            AND forms.company_id = auth.uid()
        )
    ); 