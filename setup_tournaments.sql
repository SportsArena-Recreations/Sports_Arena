-- ==============================================================================
-- 1. Create the Tournaments Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tournaments (
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

-- Drop existing policies just in case to avoid conflict errors
DROP POLICY IF EXISTS "Tournaments_viewable" ON public.tournaments;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.tournaments;
DROP POLICY IF EXISTS "Enable update for authenticated" ON public.tournaments;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON public.tournaments;

-- Create policies for Tournaments
CREATE POLICY "Tournaments_viewable" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.tournaments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated" ON public.tournaments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated" ON public.tournaments FOR DELETE TO authenticated USING (true);


-- ==============================================================================
-- 2. Storage Upload Policies for "tournament-images" Bucket
-- ==============================================================================

-- Let's drop existing ones so we start fresh without duplicates
DROP POLICY IF EXISTS "Public Access for tournament-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads tournament-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates tournament-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes tournament-images" ON storage.objects;

-- 2.1 Allow public access to view image URLs 
CREATE POLICY "Public Access for tournament-images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'tournament-images' );

-- 2.2 Allow authenticated users to upload new files
CREATE POLICY "Allow authenticated uploads tournament-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK ( bucket_id = 'tournament-images' );

-- 2.3 Allow authenticated users to update files (needed for `upsert: true`)
CREATE POLICY "Allow authenticated updates tournament-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING ( bucket_id = 'tournament-images' );

-- 2.4 Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes tournament-images"
  ON storage.objects FOR DELETE TO authenticated
  USING ( bucket_id = 'tournament-images' );
