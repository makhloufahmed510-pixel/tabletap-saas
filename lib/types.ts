export type ReservationStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export type Restaurant = {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  phone: string; // WhatsApp number in international format, e.g. 21698123456
  address: string | null;
  cover_image_url: string | null;
  timezone: string;
  created_at: string;
};

export type OpeningHour = {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 0 = Sunday ... 6 = Saturday
  is_closed: boolean;
  open_time: string | null; // "HH:MM:SS"
  close_time: string | null; // "HH:MM:SS"
};

export type Reservation = {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string; // "YYYY-MM-DD"
  reservation_time: string; // "HH:MM:SS"
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
};

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
