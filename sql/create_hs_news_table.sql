-- Create hs_news table for high school news articles
CREATE TABLE IF NOT EXISTS public.hs_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    headline_image_url TEXT,
    body TEXT NOT NULL, -- Rich text content (HTML)
    author TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- Max 2 tags
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hs_news_published_at ON public.hs_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_hs_news_created_at ON public.hs_news(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.hs_news ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published news
CREATE POLICY "Public can read hs_news"
ON public.hs_news
FOR SELECT
TO public
USING (true);

-- Policy: Only admin (chasekung) can insert
CREATE POLICY "Admin can insert hs_news"
ON public.hs_news
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username = 'chasekung'
    )
);

-- Policy: Only admin (chasekung) can update
CREATE POLICY "Admin can update hs_news"
ON public.hs_news
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username = 'chasekung'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username = 'chasekung'
    )
);

-- Policy: Only admin (chasekung) can delete
CREATE POLICY "Admin can delete hs_news"
ON public.hs_news
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username = 'chasekung'
    )
);

-- Add constraint to limit tags to max 2
ALTER TABLE public.hs_news
ADD CONSTRAINT check_max_tags CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 2);

