-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    website VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    location VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interns table
CREATE TABLE IF NOT EXISTS interns (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    location VARCHAR(255),
    university VARCHAR(255),
    major VARCHAR(255),
    graduation_year INTEGER,
    gpa DECIMAL(3,2),
    skills TEXT[],
    experience TEXT,
    resume_url VARCHAR(500),
    profile_photo_url VARCHAR(500),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    bio TEXT,
    interests TEXT[],
    languages TEXT[],
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create internships table (for future use)
CREATE TABLE IF NOT EXISTS internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT[],
    location VARCHAR(255),
    salary_min INTEGER,
    salary_max INTEGER,
    duration VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table (for future use)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    cover_letter TEXT,
    resume_url VARCHAR(500),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(internship_id, intern_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view their own company profile" ON companies
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own company profile" ON companies
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own company profile" ON companies
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for interns
CREATE POLICY "Users can view their own intern profile" ON interns
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own intern profile" ON interns
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own intern profile" ON interns
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for internships (companies can manage their own, interns can view all)
CREATE POLICY "Companies can manage their own internships" ON internships
    FOR ALL USING (auth.uid() = company_id);

CREATE POLICY "Interns can view all active internships" ON internships
    FOR SELECT USING (is_active = true);

-- Create RLS policies for applications
CREATE POLICY "Interns can manage their own applications" ON applications
    FOR ALL USING (auth.uid() = intern_id);

CREATE POLICY "Companies can view applications for their internships" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internships 
            WHERE internships.id = applications.internship_id 
            AND internships.company_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_company_name ON companies(company_name);
CREATE INDEX IF NOT EXISTS idx_interns_email ON interns(email);
CREATE INDEX IF NOT EXISTS idx_interns_username ON interns(username);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_is_active ON internships(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_intern_id ON applications(intern_id); 