-- Drop the table if you need a fresh start (Optional)
-- DROP TABLE IF EXISTS matches CASCADE;

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- "tournament" or "friendly"
    type VARCHAR(20) NOT NULL CHECK (type IN ('tournament', 'friendly')),
    
    -- Category / Sport identifier (e.g., 'Basketball', 'Mixed', etc.)
    -- Used for filtering on the UI
    sport VARCHAR(50) NOT NULL,
    
    -- Optional links to a tournament
    tournament_id UUID NULL, 
    -- Assuming your tournaments table is named 'tournaments'.
    -- Uncomment the next line if you have a tournaments table to enforce referential integrity:
    -- CONSTRAINT fk_tournament FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    
    tournament_name VARCHAR(150) NULL,
    round VARCHAR(50) NULL, -- 'Quarter-Final', 'Week 4'
    
    -- Team details
    -- If you have a teams table, use UUID. Used VARCHAR for flexibilty.
    home_team_id VARCHAR(100) NOT NULL,
    home_team_name VARCHAR(150) NOT NULL,
    away_team_id VARCHAR(100) NOT NULL,
    away_team_name VARCHAR(150) NOT NULL,
    
    -- Match Schedule
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    venue VARCHAR(150) NOT NULL,
    
    -- Status and scores
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'fixture', 'in_progress', 'live', 'completed', 'result', 'postponed', 'cancelled')),
    home_score INTEGER NULL DEFAULT 0,
    away_score INTEGER NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view matches
CREATE POLICY "Public profiles are viewable by everyone."
  ON matches FOR SELECT
  USING ( true );

-- Policy: Only authenticated users (admins) can insert/update/delete
-- IMPORTANT: Adjust this policy based on your specific admin role setup.
CREATE POLICY "Authenticated users can insert matches" 
  ON matches FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches" 
  ON matches FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete matches" 
  ON matches FOR DELETE 
  TO authenticated 
  USING (true);

-- Index for querying matches by tournament or date optimally
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_type_sport ON matches(type, sport);
