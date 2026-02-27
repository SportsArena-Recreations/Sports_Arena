CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to sports
CREATE POLICY "Public sports are viewable by everyone" 
ON sports FOR SELECT 
USING (true);

-- Allow authenticated admins to insert, update, delete
CREATE POLICY "Admins can insert sports" 
ON sports FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can update sports" 
ON sports FOR UPDATE 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete sports" 
ON sports FOR DELETE 
TO authenticated 
USING (true);

-- Insert some default sports to get started
INSERT INTO sports (name, icon) VALUES 
('Soccer', 'soccer-ball'),
('Basketball', 'basketball'),
('Tennis', 'tennis'),
('Volleyball', 'volleyball'),
('Esports', 'gamepad');
