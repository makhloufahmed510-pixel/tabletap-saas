import { createClient } from "@/lib/supabase/server";
import { sortByDay } from "@/lib/hours";
import { SettingsForm } from "./SettingsForm";
import type { OpeningHour, Restaurant } from "@/lib/types";

export default async function SettingsPage() {
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
      <div className="rounded-2xl border border-line bg-paper p-8 text-center text-sm text-slate-light">
        No restaurant linked to this account yet. See the README for setup
        instructions.
      </div>
    );
  }

  const { data: hoursData } = await supabase
    .from("opening_hours")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .returns<OpeningHour[]>();

  return (
    <SettingsForm restaurant={restaurant} initialHours={sortByDay(hoursData ?? [])} />
  );
}
