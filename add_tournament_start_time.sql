-- Migration: Add start_time and end_time to tournaments table
-- Run this in your Supabase SQL editor

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS start_time time DEFAULT NULL;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS end_time time DEFAULT NULL;
