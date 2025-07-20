import { useMemo } from "react";

import { useCalendar } from "../../contexts/calendar-context";

import { DayCell } from "./day-cell";

import { getCalendarCells, calculateMonthEventPositions } from "../../helpers";

import { useTodos } from "@/hooks/use-event";
import { isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";



const WEEK_DAYS = ["一", "二", "三", "四", "五", "六", "日" ];

export function CalendarMonthView() {
  const { selectedDate } = useCalendar();


  const startTime = startOfMonth(selectedDate);
  const endTime = endOfMonth(selectedDate);
  
  const { data:  filteredEvents = [] } = useTodos(
    startTime.toISOString(), 
    endTime.toISOString()
  );
  

  const singleDayEvents = filteredEvents.filter(event => {
    const startDate = parseISO(event.start_date);
    const endDate = parseISO(event.end_date);
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = filteredEvents.filter(event => {
    const startDate = parseISO(event.start_date);
    const endDate = parseISO(event.end_date);
    return !isSameDay(startDate, endDate);
  });



  const allEvents = [...multiDayEvents, ...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(
    () => calculateMonthEventPositions(multiDayEvents, singleDayEvents, selectedDate),
    [multiDayEvents, singleDayEvents, selectedDate]
  );

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map(day => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map(cell => (
          <DayCell key={cell.date.toISOString()} cell={cell} events={allEvents} eventPositions={eventPositions} />
        ))}
      </div>
    </div>
  );
}
