-- ==============================================================================
-- 1. Create the Tournament Registrations Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  team_name text NOT NULL,
  captain_name text NOT NULL,
  captain_email text NOT NULL,
  captain_phone text,
  player_count integer NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can insert registrations" ON public.tournament_registrations;
DROP POLICY IF EXISTS "Public can view registrations" ON public.tournament_registrations;

-- Create policies (we allow anyone to register without auth for now, or you can restrict if needed)
CREATE POLICY "Public can insert registrations"
  ON public.tournament_registrations FOR INSERT
  WITH CHECK (true);

-- Anyone can read (so public API works)
CREATE POLICY "Public can view registrations"
  ON public.tournament_registrations FOR SELECT
  USING (true);

CREATE POLICY "Enable update for authenticated" ON public.tournament_registrations 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated" ON public.tournament_registrations 
  FOR DELETE TO authenticated USING (true);


-- ==============================================================================
-- 2. Triggers to auto-update tournament registered_teams count
-- ==============================================================================
CREATE OR REPLACE FUNCTION increment_registered_teams()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tournaments
  SET registered_teams = registered_teams + 1
  WHERE id = NEW.tournament_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_team_registered ON public.tournament_registrations;
CREATE TRIGGER on_team_registered
AFTER INSERT ON public.tournament_registrations
FOR EACH ROW EXECUTE FUNCTION increment_registered_teams();

CREATE OR REPLACE FUNCTION decrement_registered_teams()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tournaments
  SET registered_teams = GREATEST(0, registered_teams - 1)
  WHERE id = OLD.tournament_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_team_deregistered ON public.tournament_registrations;
CREATE TRIGGER on_team_deregistered
AFTER DELETE ON public.tournament_registrations
FOR EACH ROW EXECUTE FUNCTION decrement_registered_teams();
