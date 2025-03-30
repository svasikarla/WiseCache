-- Create the links table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    summary TEXT,
    categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS links_user_id_idx ON public.links(user_id);
CREATE INDEX IF NOT EXISTS links_created_at_idx ON public.links(created_at);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own links"
    ON public.links
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own links"
    ON public.links
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links"
    ON public.links
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
    ON public.links
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to ensure links table exists
CREATE OR REPLACE FUNCTION public.create_links_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'links'
    ) THEN
        -- Create the table
        CREATE TABLE public.links (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            title TEXT,
            summary TEXT,
            categories TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        -- Create indexes
        CREATE INDEX links_user_id_idx ON public.links(user_id);
        CREATE INDEX links_created_at_idx ON public.links(created_at);

        -- Enable RLS
        ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own links"
            ON public.links
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own links"
            ON public.links
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own links"
            ON public.links
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own links"
            ON public.links
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END;
$$; 