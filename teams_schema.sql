CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    captain_name TEXT,
    captain_phone TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Allow public read access to teams
CREATE POLICY "Public profiles are viewable by everyone" 
ON teams FOR SELECT 
USING (true);

-- Allow authenticated admins to insert, update, delete
CREATE POLICY "Admins can insert teams" 
ON teams FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can update teams" 
ON teams FOR UPDATE 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete teams" 
ON teams FOR DELETE 
TO authenticated 
USING (true);
