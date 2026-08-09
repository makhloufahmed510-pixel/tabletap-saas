"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { buildWhatsAppLink, reservationStatusMessage } from "@/lib/whatsapp";
import type { Reservation, ReservationStatus, Restaurant } from "@/lib/types";

type Filter = "upcoming" | ReservationStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function ReservationList({
  restaurant,
  initialReservations,
}: {
  restaurant: Restaurant;
  initialReservations: Reservation[];
}) {
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [busyId, setBusyId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    if (filter === "upcoming") {
      return reservations.filter(
        (r) =>
          r.reservation_date >= today &&
          (r.status === "pending" || r.status === "confirmed")
      );
    }
    return reservations.filter((r) => r.status === filter);
  }, [reservations, filter, today]);

  async function updateStatus(id: string, status: ReservationStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const { reservation } = await res.json();
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? reservation : r))
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  const counts = {
    pending: reservations.filter((r) => r.status === "pending").length,
  };

  return (
    <div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? "bg-ink text-cream border-ink"
                : "border-line text-slate hover:border-ink/40"
            }`}
          >
            {f.label}
            {f.key === "pending" && counts.pending > 0 && (
              <span className="ml-1.5 text-brass">({counts.pending})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-slate-light">
          Nothing here yet. New requests from your reservation page will
          show up automatically.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((r) => {
            const whatsappLink = buildWhatsAppLink(
              r.customer_phone,
              reservationStatusMessage(r, restaurant)
            );
            const isBusy = busyId === r.id;

            return (
              <li
                key={r.id}
                className="rounded-2xl border border-line bg-paper p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{r.customer_name}</p>
                    <p className="text-sm text-slate-light">
                      {formatDate(r.reservation_date)} ·{" "}
                      {r.reservation_time.slice(0, 5)} · Party of{" "}
                      {r.party_size}
                    </p>
                    {r.notes && (
                      <p className="mt-1 text-sm text-slate italic">
                        &ldquo;{r.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {r.status !== "confirmed" && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isBusy}
                      onClick={() => updateStatus(r.id, "confirmed")}
                    >
                      Confirm
                    </Button>
                  )}
                  {r.status === "pending" && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={isBusy}
                      onClick={() => updateStatus(r.id, "rejected")}
                    >
                      Reject
                    </Button>
                  )}
                  {r.status !== "cancelled" && r.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => updateStatus(r.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  )}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-sm text-brass hover:text-brass-light underline underline-offset-4"
                  >
                    Notify on WhatsApp
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
