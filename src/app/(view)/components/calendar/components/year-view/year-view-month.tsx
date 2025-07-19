import { useMemo } from "react";
import {  isSameDay, parseISO, getDaysInMonth, startOfMonth } from "date-fns";

import { useCalendar } from "../../contexts/calendar-context";

import { YearViewDayCell } from "./year-view-day-cell";

import type { IEvent } from "@/types";
import { formatTime } from "@/lib/format";

interface IProps {
  month: Date;
  events: IEvent[];
}

export function YearViewMonth({ month, events }: IProps) {
  const { setSelectedDate, setView } = useCalendar();


  const daysInMonth = useMemo(() => {
    const totalDays = getDaysInMonth(month);
    const firstDay = startOfMonth(month).getDay();
    // 将周日(0)转换为6，其他日期减1，这样周一(1)变成0，周二(2)变成1，以此类推
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanks = Array(adjustedFirstDay).fill(null);

    return [...blanks, ...days];
  }, [month]);

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  const handleClick = () => {
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
    setView("month");
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-t-lg border px-3 py-2 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {formatTime(month, "MMMM")}
      </button>

      <div className="flex-1 space-y-2 rounded-b-lg border border-t-0 p-3">
        <div className="grid grid-cols-7 gap-x-0.5 text-center">
          {weekDays.map((day, index) => (
            <div key={index} className="text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-0.5 gap-y-2">
          {daysInMonth.map((day, index) => {
            if (day === null) return <div key={`blank-${index}`} className="h-10" />;

            const date = new Date(month.getFullYear(), month.getMonth(), day + 1);
            const dayEvents = events.filter(event => isSameDay(parseISO(event.start_date), date) || isSameDay(parseISO(event.end_date), date));

            return <YearViewDayCell key={`day-${day}`} day={day} date={date} events={dayEvents} />;
          })}
        </div>
      </div>
    </div>
  );
}
