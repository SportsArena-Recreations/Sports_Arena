drop policy if exists "bookings_read_availability_anon" on public.bookings;
drop policy if exists "bookings_read_availability_all" on public.bookings;

create policy "bookings_read_availability_all"
  on public.bookings for select
  using ( status in ('pending', 'confirmed') );
