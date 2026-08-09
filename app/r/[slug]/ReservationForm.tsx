"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";
import { buildWhatsAppLink, newReservationOwnerMessage } from "@/lib/whatsapp";
import type { Restaurant } from "@/lib/types";

type Props = {
  slug: string;
  restaurant: Restaurant;
};

type SubmittedReservation = {
  customer_name: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
};

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-ink placeholder:text-slate-light/70 focus:border-ink outline-none transition-colors text-[16px]";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-light mb-1.5";

export function ReservationForm({ slug, restaurant }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedReservation | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      slug,
      customer_name: String(formData.get("customer_name") || ""),
      customer_phone: String(formData.get("customer_phone") || ""),
      party_size: Number(formData.get("party_size") || 0),
      reservation_date: String(formData.get("reservation_date") || ""),
      reservation_time: String(formData.get("reservation_time") || ""),
      notes: String(formData.get("notes") || ""),
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted({
        customer_name: payload.customer_name,
        party_size: payload.party_size,
        reservation_date: payload.reservation_date,
        reservation_time: payload.reservation_time,
      });
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    const whatsappLink = buildWhatsAppLink(
      restaurant.phone,
      newReservationOwnerMessage(submitted, restaurant.name)
    );
    const dateLabel = new Date(
      `${submitted.reservation_date}T${submitted.reservation_time}`
    ).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-brass text-brass rotate-[-6deg]">
          <span className="font-display italic text-sm leading-tight">
            Request
            <br />
            sent
          </span>
        </div>
        <h3 className="mt-5 font-display italic text-xl text-ink">
          Thanks, {submitted.customer_name.split(" ")[0]}
        </h3>
        <p className="mt-2 text-sm text-slate-light max-w-xs">
          Your table for {submitted.party_size} on {dateLabel} at{" "}
          {submitted.reservation_time.slice(0, 5)} is on its way to{" "}
          {restaurant.name}. They&apos;ll confirm it shortly.
        </p>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-5">
          <Button type="button" variant="secondary">
            Notify them on WhatsApp too
          </Button>
        </a>
        <button
          type="button"
          onClick={() => setSubmitted(null)}
          className="mt-4 text-sm text-slate-light underline underline-offset-4"
        >
          Book another table
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customer_name" className={labelClass}>
            Full name
          </label>
          <input
            id="customer_name"
            name="customer_name"
            required
            autoComplete="name"
            className={inputClass}
            placeholder="Sarra Ben Ali"
          />
        </div>
        <div>
          <label htmlFor="customer_phone" className={labelClass}>
            Phone (WhatsApp)
          </label>
          <input
            id="customer_phone"
            name="customer_phone"
            type="tel"
            required
            autoComplete="tel"
            className={inputClass}
            placeholder="21620000000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="reservation_date" className={labelClass}>
            Date
          </label>
          <input
            id="reservation_date"
            name="reservation_date"
            type="date"
            required
            min={today}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="reservation_time" className={labelClass}>
            Time
          </label>
          <input
            id="reservation_time"
            name="reservation_time"
            type="time"
            required
            className={inputClass}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="party_size" className={labelClass}>
            Guests
          </label>
          <input
            id="party_size"
            name="party_size"
            type="number"
            min={1}
            max={30}
            defaultValue={2}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className={inputClass}
          placeholder="Window table, allergy, celebration…"
        />
      </div>

      {error && (
        <p className="text-sm text-coral bg-coral/10 border border-coral/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending…" : "Request reservation"}
      </Button>
    </form>
  );
}
