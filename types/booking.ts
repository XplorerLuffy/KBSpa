import type { Gender } from "@/lib/constants";

export type BookingStep =
  | "service"
  | "staff"
  | "date"
  | "time"
  | "details"
  | "review"
  | "confirmation";

export type BookingState = {
  serviceId: string | null;
  serviceSlug: string | null;
  staffId: string | null;
  /** Calendar date as yyyy-MM-dd in the business timezone. */
  date: string | null;
  /** Full ISO timestamp of the chosen slot. */
  slot: string | null;
  name: string;
  phone: string;
  email: string;
  gender: Gender | null;
  notes: string;
};

export type BookingAction =
  | { type: "SET_SERVICE"; serviceId: string; serviceSlug: string }
  | { type: "SET_STAFF"; staffId: string }
  | { type: "SET_DATE"; date: string }
  | { type: "SET_SLOT"; slot: string }
  | {
      type: "SET_DETAILS";
      details: Pick<BookingState, "name" | "phone" | "email" | "gender" | "notes">;
    }
  | { type: "RESET" };

export const initialBookingState: BookingState = {
  serviceId: null,
  serviceSlug: null,
  staffId: null,
  date: null,
  slot: null,
  name: "",
  phone: "",
  email: "",
  gender: null,
  notes: "",
};
