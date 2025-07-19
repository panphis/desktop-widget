"use client";

import { createContext, useContext, useState } from "react";

import type { Dispatch, SetStateAction } from "react";
import type { TBadgeVariant, TCalendarView, TVisibleHours , EventResponse } from "@/types";

interface ICalendarContext {
  view: TCalendarView;
  setView: (value: TCalendarView) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
}

const CalendarContext = createContext({} as ICalendarContext);

const VISIBLE_HOURS = { from: 6, to: 20 };

export function CalendarProvider({
  children,
}: {
  children: React.ReactNode;
  events: EventResponse[];
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
