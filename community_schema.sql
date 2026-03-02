-- ==============================================================================
-- SPORTS ARENA — Community Schema
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- ─────────────────────────────────────────────
-- 1. community_posts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_posts (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id     uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   text    NOT NULL,
  avatar_color  text    NOT NULL DEFAULT 'bg-blue-500',
  category      text    NOT NULL CHECK (category IN ('Tournament','Discussion','Question','Announcement')),
  title         text    NOT NULL,
  content       text    NOT NULL,
  pinned        boolean NOT NULL DEFAULT false,
  tournament_link text,
  tournament_date text,
  likes_count   integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at    timestamp with time zone DEFAULT now(),
  updated_at    timestamp with time zone DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select"   ON public.community_posts;
DROP POLICY IF EXISTS "posts_insert"   ON public.community_posts;
DROP POLICY IF EXISTS "posts_update"   ON public.community_posts;
DROP POLICY IF EXISTS "posts_delete"   ON public.community_posts;

-- Public can read all posts
CREATE POLICY "posts_select" ON public.community_posts
  FOR SELECT USING (true);

-- Authenticated users can insert their own posts
CREATE POLICY "posts_insert" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Author or admin can update
CREATE POLICY "posts_update" ON public.community_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

-- Author can delete own posts
CREATE POLICY "posts_delete" ON public.community_posts
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);


-- ─────────────────────────────────────────────
-- 2. community_post_likes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id  uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_likes_select" ON public.community_post_likes;
DROP POLICY IF EXISTS "post_likes_insert" ON public.community_post_likes;
DROP POLICY IF EXISTS "post_likes_delete" ON public.community_post_likes;

CREATE POLICY "post_likes_select" ON public.community_post_likes
  FOR SELECT USING (true);

CREATE POLICY "post_likes_insert" ON public.community_post_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_likes_delete" ON public.community_post_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 3. community_comments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_comments (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       uuid    NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_id     uuid    REFERENCES public.community_comments(id) ON DELETE CASCADE,  -- null = top-level
  author_id     uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   text    NOT NULL,
  avatar_color  text    NOT NULL DEFAULT 'bg-blue-500',
  content       text    NOT NULL,
  likes_count   integer NOT NULL DEFAULT 0,
  created_at    timestamp with time zone DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select" ON public.community_comments;
DROP POLICY IF EXISTS "comments_insert" ON public.community_comments;
DROP POLICY IF EXISTS "comments_delete" ON public.community_comments;

CREATE POLICY "comments_select" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert" ON public.community_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_delete" ON public.community_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);


-- ─────────────────────────────────────────────
-- 4. community_comment_likes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_comment_likes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

ALTER TABLE public.community_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_likes_select" ON public.community_comment_likes;
DROP POLICY IF EXISTS "comment_likes_insert" ON public.community_comment_likes;
DROP POLICY IF EXISTS "comment_likes_delete" ON public.community_comment_likes;

CREATE POLICY "comment_likes_select" ON public.community_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "comment_likes_insert" ON public.community_comment_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_likes_delete" ON public.community_comment_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ==============================================================================
-- 5. Functions / Triggers — keep likes_count + comments_count in sync
-- ==============================================================================

-- ── Post likes counter ──
CREATE OR REPLACE FUNCTION public.handle_post_like_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_like_change ON public.community_post_likes;
CREATE TRIGGER trg_post_like_change
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_change();

-- ── Post comments counter ──
CREATE OR REPLACE FUNCTION public.handle_comment_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NULL THEN
    UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NULL THEN
    UPDATE public.community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_change ON public.community_comments;
CREATE TRIGGER trg_comment_change
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_change();

-- ── Comment likes counter ──
CREATE OR REPLACE FUNCTION public.handle_comment_like_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_like_change ON public.community_comment_likes;
CREATE TRIGGER trg_comment_like_change
  AFTER INSERT OR DELETE ON public.community_comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_like_change();


-- ==============================================================================
-- 6. Seed — starter posts (optional, remove if you want a clean slate)
-- ==============================================================================

-- We'll insert as a "system" user — replace '00000000-0000-0000-0000-000000000000'
-- with a real admin user UUID from your auth.users table if you want attribution.
-- Alternatively, just leave this block commented out and let users create posts.

/*
INSERT INTO public.community_posts
  (author_id, author_name, avatar_color, category, title, content, pinned, tournament_date)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'Arena Admin',
    'bg-orange-500',
    'Announcement',
    'Welcome to the Sports Arena Community!',
    'This is your hub for connecting with fellow athletes, discussing upcoming tournaments, asking questions, and staying up-to-date with facility news. Introduce yourself below!',
    true,
    null
  );
*/
