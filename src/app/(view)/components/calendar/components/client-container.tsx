"use client";

import { useMemo } from "react";
import { isSameDay, parseISO } from "date-fns";

import { useCalendar } from "../contexts/calendar-context";

import { DndProviderWrapper } from "./dnd/dnd-provider";

import { CalendarHeader } from "./header/calendar-header";
import { CalendarYearView } from "./year-view/calendar-year-view";
import { CalendarMonthView } from "./month-view/calendar-month-view";
import { CalendarAgendaView } from "./agenda-view/calendar-agenda-view";
import { CalendarDayView } from "./week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "./week-and-day-view/calendar-week-view";
import { IEvent } from "../interfaces";


export function ClientContainer() {
  const { selectedDate, view } = useCalendar();

  const filteredEvents:IEvent[] = [];

  const singleDayEvents:IEvent[] = [];

  const multiDayEvents:IEvent[] = [];

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const eventStartDates:IEvent[] = [];

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader />

      <DndProviderWrapper>
        {view === "day" && <CalendarDayView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "year" && <CalendarYearView allEvents={eventStartDates} />}
        {view === "agenda" && <CalendarAgendaView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
      </DndProviderWrapper>
    </div>
  );
}
