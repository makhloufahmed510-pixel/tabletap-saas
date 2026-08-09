import type { Reservation, Restaurant } from "./types";

/**
 * Strips everything except digits so wa.me always receives a clean
 * international number (no +, spaces, or dashes).
 */
function digitsOnly(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Builds a wa.me deep link that opens WhatsApp with a pre-filled message.
 * Works on both mobile (opens the app) and desktop (opens WhatsApp Web).
 */
export function buildWhatsAppLink(phone: string, message: string) {
  const number = digitsOnly(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

/**
 * Message the restaurant owner sends to a customer once a reservation's
 * status changes, so the customer gets a human, personal notification.
 */
export function reservationStatusMessage(
  reservation: Reservation,
  restaurant: Restaurant
) {
  const date = new Date(
    `${reservation.reservation_date}T${reservation.reservation_time}`
  ).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = reservation.reservation_time.slice(0, 5);

  switch (reservation.status) {
    case "confirmed":
      return `Hi ${reservation.customer_name}, your table for ${reservation.party_size} at ${restaurant.name} on ${date} at ${time} is confirmed. See you soon!`;
    case "rejected":
      return `Hi ${reservation.customer_name}, unfortunately ${restaurant.name} can't take your reservation for ${date} at ${time}. Please reply here to find another time.`;
    case "cancelled":
      return `Hi ${reservation.customer_name}, your reservation at ${restaurant.name} on ${date} at ${time} has been cancelled. Let us know if you'd like to rebook.`;
    default:
      return `Hi ${reservation.customer_name}, we've received your reservation request at ${restaurant.name} for ${date} at ${time}. We'll confirm shortly.`;
  }
}

/**
 * Message a customer sends to the restaurant right after booking, so the
 * owner gets an instant WhatsApp notification even before checking the
 * dashboard.
 */
export function newReservationOwnerMessage(
  reservation: Pick<
    Reservation,
    "customer_name" | "party_size" | "reservation_date" | "reservation_time"
  >,
  restaurantName: string
) {
  const date = new Date(
    `${reservation.reservation_date}T${reservation.reservation_time}`
  ).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = reservation.reservation_time.slice(0, 5);

  return `New reservation request for ${restaurantName}: ${reservation.customer_name}, party of ${reservation.party_size}, on ${date} at ${time}.`;
}
