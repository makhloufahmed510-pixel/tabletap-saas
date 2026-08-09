import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReservationList } from "./ReservationList";
import type { Reservation, Restaurant } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle<Restaurant>();

  if (!restaurant) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-8 text-center">
        <h2 className="font-display italic text-xl text-ink">
          No restaurant linked to this account yet
        </h2>
        <p className="mt-2 text-sm text-slate-light max-w-md mx-auto">
          Create a restaurant row in Supabase with{" "}
          <code className="bg-ink/5 px-1.5 py-0.5 rounded">owner_id</code>{" "}
          set to this user&apos;s ID, or claim the demo restaurant — see the
          README for the exact SQL.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-brass underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true })
    .returns<Reservation[]>();

  return (
    <ReservationList
      restaurant={restaurant}
      initialReservations={reservations ?? []}
    />
  );
}
