"use client";

import { createContext, useContext, useState } from "react";

import type { Dispatch, SetStateAction } from "react";
import type { IEvent } from "../interfaces";
import type { TBadgeVariant, TCalendarView, TVisibleHours } from "../types";

interface ICalendarContext {
  view: TCalendarView;
  setView: (value: TCalendarView) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
}

const CalendarContext = createContext({} as ICalendarContext);

const VISIBLE_HOURS = { from: 7, to: 18 };

export function CalendarProvider({
  children,
  events,
}: {
  children: React.ReactNode;
  events: IEvent[];
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] =
    useState<TVisibleHours>(VISIBLE_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());

  // This localEvents doesn't need to exists in a real scenario.
  // It's used here just to simulate the update of the events.
  // In a real scenario, the events would be updated in the backend
  // and the request that fetches the events should be refetched
  const [localEvents, setLocalEvents] = useState<IEvent[]>(events);
  const [view, setView] = useState<TCalendarView>("day");

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        view,
        setView,
        setSelectedDate: handleSelectDate,
        badgeVariant,
        setBadgeVariant,
        visibleHours,
        setVisibleHours,
        // If you go to the refetch approach, you can remove the localEvents and pass the events directly
        events: localEvents,
        setLocalEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
