-- ============================================================================
-- TableTap demo data
-- Creates a demo restaurant ("Le Petit Port") so you can see the public
-- reservation page and the dashboard UI immediately after setup.
--
-- owner_id is left NULL here on purpose — no real account exists yet.
-- To manage this demo restaurant from the dashboard:
--   1. Create a user in Supabase Auth (Authentication -> Users -> Add user).
--   2. Run: update public.restaurants set owner_id = '<the new user id>'
--            where slug = 'le-petit-port';
-- See README.md for the full walkthrough.
-- ============================================================================

insert into public.restaurants (id, owner_id, name, slug, description, phone, address, cover_image_url, timezone)
values (
  '11111111-1111-1111-1111-111111111111',
  null,
  'Le Petit Port',
  'le-petit-port',
  'A small harbourside table serving fresh seafood and Mediterranean plates in Monastir. Book ahead — the terrace fills up fast at sunset.',
  '21698000000',
  'Marina Monastir, Monastir, Tunisia',
  null,
  'Africa/Tunis'
)
on conflict (slug) do nothing;

-- Opening hours: closed Mondays, dinner service Tue–Sun.
insert into public.opening_hours (restaurant_id, day_of_week, is_closed, open_time, close_time)
values
  ('11111111-1111-1111-1111-111111111111', 0, false, '18:00', '23:00'), -- Sunday
  ('11111111-1111-1111-1111-111111111111', 1, true,  null,    null),    -- Monday (closed)
  ('11111111-1111-1111-1111-111111111111', 2, false, '18:00', '23:00'), -- Tuesday
  ('11111111-1111-1111-1111-111111111111', 3, false, '18:00', '23:00'), -- Wednesday
  ('11111111-1111-1111-1111-111111111111', 4, false, '18:00', '23:30'), -- Thursday
  ('11111111-1111-1111-1111-111111111111', 5, false, '18:00', '23:30'), -- Friday
  ('11111111-1111-1111-1111-111111111111', 6, false, '12:00', '23:30')  -- Saturday
on conflict (restaurant_id, day_of_week) do nothing;

-- A few sample reservations so the dashboard isn't empty on first login.
insert into public.reservations (restaurant_id, customer_name, customer_phone, party_size, reservation_date, reservation_time, status, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'Sarra Ben Ali', '21620000001', 2, current_date + interval '1 day', '19:30', 'pending', null),
  ('11111111-1111-1111-1111-111111111111', 'Karim Trabelsi', '21620000002', 4, current_date + interval '1 day', '20:00', 'confirmed', 'Window table if possible'),
  ('11111111-1111-1111-1111-111111111111', 'Ines Gharbi', '21620000003', 6, current_date + interval '2 days', '20:30', 'pending', 'Birthday dinner');
