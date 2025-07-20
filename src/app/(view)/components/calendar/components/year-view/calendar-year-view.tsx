import { useMemo } from "react";
import { addMonths, endOfYear, startOfYear } from "date-fns";

import { useCalendar } from "../../contexts/calendar-context";

import { YearViewMonth } from "./year-view-month";
 
import { useTodos } from "@/hooks/use-event";

 

export function CalendarYearView() {
  const { selectedDate } = useCalendar();


  const startTime = startOfYear(selectedDate);
  const endTime = endOfYear(selectedDate);
  
  const { data:  filteredEvents = [] } = useTodos(
    startTime.toISOString(), 
    endTime.toISOString()
  );
  
  const eventStartDates = useMemo(() => {
    return filteredEvents.map(event => ({ ...event, endDate: event.start_date }));
  }, [filteredEvents]); 

  const months = useMemo(() => {
    const yearStart = startOfYear(selectedDate);
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  }, [selectedDate]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map(month => (
          <YearViewMonth key={month.toString()} month={month} events={eventStartDates} />
        ))}
      </div>
    </div>
  );
}
