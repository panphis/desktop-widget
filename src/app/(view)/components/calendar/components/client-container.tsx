"use client";


import { useCalendar } from "../contexts/calendar-context";

import { DndProviderWrapper } from "./dnd/dnd-provider";

import { CalendarHeader } from "./header/calendar-header";
import { CalendarYearView } from "./year-view/calendar-year-view";
import { CalendarMonthView } from "./month-view/calendar-month-view";
import { CalendarAgendaView } from "./agenda-view/calendar-agenda-view";
import { CalendarDayView } from "./week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "./week-and-day-view/calendar-week-view";


export function ClientContainer() {
  const { view } = useCalendar();


  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader />

      <DndProviderWrapper>
        {view === "day" && <CalendarDayView />}
        {view === "month" && <CalendarMonthView />}
        {view === "week" && <CalendarWeekView/>}
        {view === "year" && <CalendarYearView />}
        {view === "agenda" && <CalendarAgendaView />}
      </DndProviderWrapper>
    </div>
  );
}
