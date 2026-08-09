# TableTap — restaurant reservations MVP

A simple, mobile-first reservation system for restaurants: a public booking
page for customers, and an owner dashboard to confirm, reject, or cancel
requests — with a WhatsApp message ready to send for every decision.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(Postgres, Auth, Row Level Security) · deploys to Vercel.

## What's included

- `/` — landing page
- `/r/[slug]` — public reservation page (e.g. `/r/le-petit-port`), with a
  booking form and opening hours
- `/login` — restaurant owner login (Supabase Auth, email + password)
- `/dashboard` — reservation list with filters and Confirm / Reject / Cancel
  actions, each with a "Notify on WhatsApp" deep link
- `/dashboard/settings` — restaurant profile and opening hours editor
- `supabase/schema.sql` — tables + Row Level Security policies
- `supabase/seed.sql` — a demo restaurant ("Le Petit Port") with hours and
  sample reservations

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run the contents of `supabase/schema.sql` — this
   creates the `restaurants`, `opening_hours`, and `reservations` tables
   along with Row Level Security policies.
3. Then run `supabase/seed.sql` to create the demo restaurant, its opening
   hours, and a few sample reservations.

## 2. Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Fill in your project's values from **Supabase Dashboard → Project Settings
→ API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Only the public anon key is used — RLS policies (not a service key) are
what keep data safe, so this key is fine to expose to the browser.

## 3. Install and run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — the demo restaurant's public page is at
`http://localhost:3000/r/le-petit-port`.

## 4. Claim the demo restaurant as an owner

The demo restaurant has no owner yet, so you can log in as its owner with
any account you create:

1. In Supabase Dashboard → **Authentication → Users → Add user**, create a
   user with an email and password (skip email confirmation for testing).
2. Copy that user's UUID.
3. In the SQL Editor, run:

   ```sql
   update public.restaurants
   set owner_id = 'paste-the-user-uuid-here'
   where slug = 'le-petit-port';
   ```

4. Go to `/login` and sign in with that email and password. You'll land on
   `/dashboard` with the demo restaurant's reservations.

To onboard a **new real restaurant**, insert a new row into `restaurants`
(with a unique `slug`) and set its `owner_id` to that owner's user UUID.
Add seven `opening_hours` rows for it (or add them from
`/dashboard/settings` once logged in — it upserts one row per day
automatically).

## 5. Deploy to Vercel

1. Push this repository to GitHub (see below).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. `vercel.json` is already configured for the Next.js framework
   preset.

## Pushing this project to GitHub

From this project folder:

```bash
git init
git add -A
git commit -m "TableTap MVP"
git branch -M main
git remote add origin https://github.com/makhloufahmed510-pixel/tabletap-saas.git
git push -u origin main
```

## How WhatsApp notifications work

There's no messaging backend in this MVP — instead, every reservation
action generates a [`wa.me`](https://wa.me) deep link pre-filled with a
message matching that action (request received, confirmed, rejected,
cancelled). Tapping it opens WhatsApp (app or web) with the customer's
number and message ready to send. This keeps the architecture simple: no
WhatsApp Business API account or webhook server required to ship the MVP.

Phone numbers should be stored in international format, digits only (e.g.
a Tunisian number as `21698000000`, no `+` or spaces) — the restaurant's
WhatsApp number is set from `/dashboard/settings`, and each customer's
number is collected on the booking form.

## Notes on the architecture

- **Auth & data access:** Supabase Auth issues the session; every table
  read/write goes through Postgres Row Level Security policies rather than
  a custom backend permission layer. The public reservation page and API
  route use the anon key; the same key is used in the dashboard once a
  session cookie is present, and RLS restricts what each request can see
  or change based on `auth.uid()`.
- **Reservation creation** goes through `POST /api/reservations` (server
  route) rather than a direct client insert, so date/party-size validation
  happens server-side before hitting the database.
- **Status changes** go through `PATCH /api/reservations/[id]`, which
  requires a logged-in session; RLS additionally guarantees an owner can
  only ever update reservations that belong to their own restaurant.
- **No ORM** — just the Supabase JS client, to keep the codebase small and
  easy to extend.

## Project structure

```
app/
  page.tsx                     Landing page
  login/page.tsx                Owner login
  r/[slug]/page.tsx             Public reservation page
  r/[slug]/ReservationForm.tsx  Booking form (client)
  dashboard/layout.tsx           Auth-guarded dashboard shell
  dashboard/page.tsx             Reservation list (server)
  dashboard/ReservationList.tsx  Filters + confirm/reject/cancel (client)
  dashboard/settings/page.tsx    Settings (server)
  dashboard/settings/SettingsForm.tsx  Profile + hours editor (client)
  api/reservations/route.ts          POST create reservation (public)
  api/reservations/[id]/route.ts     PATCH update status (owner only)
components/        Button, StatusBadge, Logo, SignOutButton
lib/
  supabase/client.ts    Browser Supabase client
  supabase/server.ts    Server Supabase client (Server Components/Routes)
  supabase/middleware.ts Session refresh + /dashboard auth guard
  types.ts, whatsapp.ts, hours.ts
supabase/
  schema.sql   Tables + Row Level Security policies
  seed.sql     Demo restaurant, hours, sample reservations
proxy.ts        Next.js proxy (formerly "middleware") entry point
```
