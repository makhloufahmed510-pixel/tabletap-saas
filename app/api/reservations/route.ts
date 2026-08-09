import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  slug?: string;
  customer_name?: string;
  customer_phone?: string;
  party_size?: number;
  reservation_date?: string;
  reservation_time?: string;
  notes?: string;
};

export async function POST(request: Request) {
  const body: Body = await request.json().catch(() => ({}));
  const {
    slug,
    customer_name,
    customer_phone,
    party_size,
    reservation_date,
    reservation_time,
    notes,
  } = body;

  if (
    !slug ||
    !customer_name?.trim() ||
    !customer_phone?.trim() ||
    !party_size ||
    !reservation_date ||
    !reservation_time
  ) {
    return NextResponse.json(
      { error: "Please fill in every field before booking." },
      { status: 400 }
    );
  }

  if (party_size < 1 || party_size > 30) {
    return NextResponse.json(
      { error: "Party size must be between 1 and 30." },
      { status: 400 }
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (reservation_date < todayStr) {
    return NextResponse.json(
      { error: "Please choose a date that hasn't passed yet." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json(
      { error: "We couldn't find that restaurant." },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurant.id,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      party_size,
      reservation_date,
      reservation_time,
      notes: notes?.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong while saving your reservation. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ reservation: data }, { status: 201 });
}
