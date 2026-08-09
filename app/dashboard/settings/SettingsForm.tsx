"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { dayLabel, toHHMM } from "@/lib/hours";
import { DAY_LABELS, type OpeningHour, type Restaurant } from "@/lib/types";

type HourDraft = {
  day_of_week: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
};

function buildHourDrafts(initial: OpeningHour[]): HourDraft[] {
  return DAY_LABELS.map((_, day) => {
    const existing = initial.find((h) => h.day_of_week === day);
    return {
      day_of_week: day,
      is_closed: existing?.is_closed ?? true,
      open_time: toHHMM(existing?.open_time ?? null) || "18:00",
      close_time: toHHMM(existing?.close_time ?? null) || "22:00",
    };
  });
}

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-ink text-[16px]";
const labelClass =
  "block text-xs font-medium uppercase tracking-wide text-slate-light mb-1.5";

export function SettingsForm({
  restaurant,
  initialHours,
}: {
  restaurant: Restaurant;
  initialHours: OpeningHour[];
}) {
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [phone, setPhone] = useState(restaurant.phone);
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [hours, setHours] = useState<HourDraft[]>(buildHourDrafts(initialHours));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  function updateHour(day: number, patch: Partial<HourDraft>) {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === day ? { ...h, ...patch } : h))
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        phone: phone.trim(),
        address: address.trim() || null,
      })
      .eq("id", restaurant.id);

    const { error: hoursError } = await supabase.from("opening_hours").upsert(
      hours.map((h) => ({
        restaurant_id: restaurant.id,
        day_of_week: h.day_of_week,
        is_closed: h.is_closed,
        open_time: h.is_closed ? null : h.open_time,
        close_time: h.is_closed ? null : h.close_time,
      })),
      { onConflict: "restaurant_id,day_of_week" }
    );

    setSaving(false);

    if (restaurantError || hoursError) {
      setMessage({ type: "error", text: "Something went wrong while saving. Please try again." });
      return;
    }

    setMessage({ type: "success", text: "Settings saved." });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-line bg-paper p-5 sm:p-8">
        <h2 className="font-display italic text-xl text-ink">Restaurant profile</h2>
        <p className="mt-1 text-sm text-slate-light">
          This is what customers see on your public booking page.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelClass}>
                WhatsApp number
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="21698000000"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-light">
                International format, digits only — no spaces or +.
              </p>
            </div>
            <div>
              <label htmlFor="address" className={labelClass}>Address</label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper p-5 sm:p-8">
        <h2 className="font-display italic text-xl text-ink">Opening hours</h2>
        <p className="mt-1 text-sm text-slate-light">
          Shown on your booking page so customers know when to expect a table.
        </p>

        <div className="mt-6 space-y-3">
          {hours.map((h) => (
            <div
              key={h.day_of_week}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-3"
            >
              <span className="w-24 text-sm font-medium text-ink">
                {dayLabel(h.day_of_week)}
              </span>

              <label className="flex items-center gap-2 text-sm text-slate-light">
                <input
                  type="checkbox"
                  checked={!h.is_closed}
                  onChange={(e) =>
                    updateHour(h.day_of_week, { is_closed: !e.target.checked })
                  }
                  className="h-4 w-4 rounded border-line accent-ink"
                />
                Open
              </label>

              {!h.is_closed && (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="time"
                    value={h.open_time}
                    onChange={(e) =>
                      updateHour(h.day_of_week, { open_time: e.target.value })
                    }
                    className="rounded-lg border border-line px-2 py-1.5 text-sm outline-none focus:border-ink"
                  />
                  <span className="text-slate-light">–</span>
                  <input
                    type="time"
                    value={h.close_time}
                    onChange={(e) =>
                      updateHour(h.day_of_week, { close_time: e.target.value })
                    }
                    className="rounded-lg border border-line px-2 py-1.5 text-sm outline-none focus:border-ink"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {message && (
        <p
          className={`text-sm rounded-lg px-3 py-2 border ${
            message.type === "success"
              ? "text-ink-2 bg-ink/5 border-ink/15"
              : "text-coral bg-coral/10 border-coral/25"
          }`}
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
