"use client";

import { createContext, useContext, useState } from "react";

import type { Dispatch, SetStateAction } from "react";
import type { IEvent } from "../interfaces";
import type { TBadgeVariant, TCalendarView, TVisibleHours } from "../types";
import type { EventResponse } from "../hooks/use-events";

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

// 转换数据库事件为前端事件格式
const convertEventResponseToIEvent = (event: EventResponse): IEvent => ({
  id: event.id,
  title: event.title,
  description: event.description,
  startDate: event.start_date,
  endDate: event.end_date,
  color: event.color as any,
});

export function CalendarProvider({
  children,
}: {
  children: React.ReactNode;
  events: EventResponse[];
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] =
    useState<TVisibleHours>(VISIBLE_HOURS);

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
