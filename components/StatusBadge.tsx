import type { ReservationStatus } from "@/lib/types";

const styles: Record<ReservationStatus, string> = {
  pending: "bg-brass/15 text-brass border-brass/30",
  confirmed: "bg-ink/10 text-ink-2 border-ink/20",
  rejected: "bg-coral/10 text-coral border-coral/25",
  cancelled: "bg-slate-light/15 text-slate-light border-slate-light/25",
};

const labels: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide uppercase ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
