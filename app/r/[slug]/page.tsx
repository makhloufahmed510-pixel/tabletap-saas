import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { ReservationForm } from "./ReservationForm";
import { sortByDay, dayLabel, toHHMM, todaySummary } from "@/lib/hours";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { OpeningHour, Restaurant } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!restaurant) return { title: "Restaurant not found — TableTap" };

  return {
    title: `Book a table at ${restaurant.name} — TableTap`,
    description: restaurant.description ?? undefined,
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single<Restaurant>();

  if (!restaurant) notFound();

  const { data: hoursData } = await supabase
    .from("opening_hours")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .returns<OpeningHour[]>();

  const hours = sortByDay(hoursData ?? []);
  const enquiryLink = buildWhatsAppLink(
    restaurant.phone,
    `Hi ${restaurant.name}, I have a question about booking a table.`
  );

  return (
    <div className="min-h-dvh bg-cream">
      {/* Hero */}
      <header className="bg-ink text-cream">
        <div className="mx-auto max-w-2xl px-5 pt-6 pb-14 sm:px-8">
          <Logo tone="light" />
          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-brass-light">
            {restaurant.address ?? "Reservations"}
          </p>
          <h1 className="mt-3 font-display italic text-4xl leading-tight sm:text-5xl">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="mt-4 max-w-lg text-cream/75 leading-relaxed">
              {restaurant.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brass-light" />
              {todaySummary(hours)}
            </span>
            <a
              href={enquiryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/25 px-3 py-1.5 hover:border-cream/60 transition-colors"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-2xl px-5 sm:px-8 -mt-8 pb-16">
        <div className="rounded-2xl bg-paper border border-line shadow-[0_1px_2px_rgba(16,49,44,0.06)] p-5 sm:p-8">
          <h2 className="font-display italic text-2xl text-ink">
            Reserve a table
          </h2>
          <p className="mt-1 text-sm text-slate-light">
            Requests are confirmed directly by {restaurant.name}. You&apos;ll
            hear back shortly.
          </p>
          <div className="mt-6">
            <ReservationForm slug={restaurant.slug} restaurant={restaurant} />
          </div>
        </div>

        <section className="mt-10">
          <h3 className="font-display italic text-xl text-ink mb-4">
            Opening hours
          </h3>
          <dl className="divide-y divide-line rounded-2xl border border-line bg-paper overflow-hidden">
            {hours.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <dt className="text-ink font-medium">{dayLabel(h.day_of_week)}</dt>
                <dd className="text-slate-light">
                  {h.is_closed || !h.open_time || !h.close_time
                    ? "Closed"
                    : `${toHHMM(h.open_time)} – ${toHHMM(h.close_time)}`}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="mt-14 text-center text-xs text-slate-light">
          Powered by <span className="font-display italic">TableTap</span>
        </footer>
      </main>
    </div>
  );
}
