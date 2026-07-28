"use client";

import { createContext, useContext, useReducer, type Dispatch } from "react";
import {
  initialBookingState,
  type BookingAction,
  type BookingState,
} from "@/types/booking";

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_SERVICE":
      // Changing the service invalidates everything chosen after it.
      return {
        ...state,
        serviceId: action.serviceId,
        serviceSlug: action.serviceSlug,
        staffId: null,
        date: null,
        slot: null,
      };
    case "SET_STAFF":
      return { ...state, staffId: action.staffId, date: null, slot: null };
    case "SET_DATE":
      return { ...state, date: action.date, slot: null };
    case "SET_SLOT":
      return { ...state, slot: action.slot };
    case "SET_DETAILS":
      return { ...state, ...action.details };
    case "RESET":
      return initialBookingState;
  }
}

const BookingContext = createContext<{
  state: BookingState;
  dispatch: Dispatch<BookingAction>;
} | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used inside a BookingProvider");
  }
  return context;
}
