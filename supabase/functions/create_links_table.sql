CREATE OR REPLACE FUNCTION create_links_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the links table if it doesn't exist
  CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    summary TEXT,
    categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS links_user_id_idx ON links(user_id);
  CREATE INDEX IF NOT EXISTS links_created_at_idx ON links(created_at);

  -- Create RLS policies
  ALTER TABLE links ENABLE ROW LEVEL SECURITY;

  -- Policy for selecting links
  DROP POLICY IF EXISTS "Users can view their own links" ON links;
  CREATE POLICY "Users can view their own links"
    ON links FOR SELECT
    USING (auth.uid() = user_id);

  -- Policy for inserting links
  DROP POLICY IF EXISTS "Users can insert their own links" ON links;
  CREATE POLICY "Users can insert their own links"
    ON links FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- Policy for updating links
  DROP POLICY IF EXISTS "Users can update their own links" ON links;
  CREATE POLICY "Users can update their own links"
    ON links FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Policy for deleting links
  DROP POLICY IF EXISTS "Users can delete their own links" ON links;
  CREATE POLICY "Users can delete their own links"
    ON links FOR DELETE
    USING (auth.uid() = user_id);
END;
$$; 