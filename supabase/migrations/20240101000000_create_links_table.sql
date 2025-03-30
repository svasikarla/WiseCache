-- Create links table
CREATE TABLE links (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    categories TEXT[],
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_links_user_id ON links(user_id);

-- Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own links
CREATE POLICY "Users can only see their own links"
    ON links
    FOR ALL
    USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();