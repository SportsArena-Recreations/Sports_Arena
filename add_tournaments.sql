-- Create the tournaments table
CREATE TABLE public.tournaments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sport text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  registration_deadline date NOT NULL,
  max_teams integer NOT NULL,
  registered_teams integer DEFAULT 0 NOT NULL,
  entry_fee integer NOT NULL,
  prize_pool integer NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  rules text[] DEFAULT '{}',
  facility_id uuid REFERENCES public.facilities(id),
  facility_name text,
  image_url text DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tournaments
CREATE POLICY "Tournaments are viewable by everyone."
  ON public.tournaments FOR SELECT
  USING (true);

-- Allow authenticated admins to insert/update/delete 
-- (You may want to tighten this to check for an admin role later)
CREATE POLICY "Enable insert for authenticated users only" ON public.tournaments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.tournaments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.tournaments
  FOR DELETE TO authenticated USING (true);
