-- Create forms table
create table if not exists public.forms (
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
create table if not exists public.form_sections (
    id uuid default gen_random_uuid() primary key,
    form_id uuid references public.forms(id) on delete cascade,
    title text not null,
    description text,
    order_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create question bank table FIRST (moved up)
create table if not exists public.question_bank (
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

-- Create questions table (now question_bank exists)
create table if not exists public.form_questions (
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
create table if not exists public.form_responses (
    id uuid default gen_random_uuid() primary key,
    form_id uuid references public.forms(id) on delete cascade,
    applicant_id uuid references auth.users(id) on delete cascade,
    status text default 'in_progress' check (status in ('in_progress', 'submitted', 'reviewed', 'archived')),
    submitted_at timestamp with time zone null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create response answers table
create table if not exists public.response_answers (
    id uuid default gen_random_uuid() primary key,
    response_id uuid references public.form_responses(id) on delete cascade,
    question_id uuid references public.form_questions(id) on delete cascade,
    answer_text text,
    answer_data jsonb default null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.forms enable row level security;
alter table public.form_sections enable row level security;
alter table public.form_questions enable row level security;
alter table public.question_bank enable row level security;
alter table public.form_responses enable row level security;
alter table public.response_answers enable row level security;

-- RLS Policies for forms
create policy "Companies can create forms"
    on public.forms for insert
    with check (auth.uid() = company_id);

create policy "Companies can view their own forms"
    on public.forms for select
    using (auth.uid() = company_id);

create policy "Companies can update their own forms"
    on public.forms for update
    using (auth.uid() = company_id);

create policy "Companies can delete their own forms"
    on public.forms for delete
    using (auth.uid() = company_id);

-- RLS Policies for question bank
create policy "Companies can create questions in bank"
    on public.question_bank for insert
    with check (auth.uid() = company_id);

create policy "Companies can view their own questions and public questions"
    on public.question_bank for select
    using (auth.uid() = company_id or not is_private);

create policy "Companies can update their own questions"
    on public.question_bank for update
    using (auth.uid() = company_id);

create policy "Companies can delete their own questions"
    on public.question_bank for delete
    using (auth.uid() = company_id);

-- Similar policies for other tables...
-- (Additional RLS policies would be added for each table) 