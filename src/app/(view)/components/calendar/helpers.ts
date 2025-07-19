import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  parseISO,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
  differenceInDays,
  endOfYear,
  startOfYear,
  subYears,
  addYears,
  isSameYear,
  isWithinInterval,
} from "date-fns";

import type { ICalendarCell, IEvent, TCalendarView, TVisibleHours } from "@/types";
import { formatTime } from "@/lib/format";

// ================ Header helper functions ================ //

export function rangeText(view: TCalendarView, date: Date) {
  const formatString = "YYYY年 MMM D日";
  let start: Date;
  let end: Date;

  switch (view) {
    case "agenda":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "week":
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case "day":
      return formatTime(date, formatString);
    default:
      return "Error while formatting ";
  }

  return `${formatTime(start, formatString)} - ${formatTime(end, formatString)}`;
}

export function navigateDate(date: Date, view: TCalendarView, direction: "previous" | "next"): Date {
  const operations = {
    agenda: direction === "next" ? addMonths : subMonths,
    year: direction === "next" ? addYears : subYears,
    month: direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
  };

  return operations[view](date, 1);
}

export function getEventsCount(events: IEvent[], date: Date, view: TCalendarView): number {
  const compareFns = {
    agenda: isSameMonth,
    year: isSameYear,
    day: isSameDay,
    week: (date1: Date, date2: Date) => isSameWeek(date1, date2, { weekStartsOn: 1 }),
    month: isSameMonth,
  };

  return events.filter(event => compareFns[view](new Date(event.start_date), date)).length;
}

// ================ Week and day view helper functions ================ //

export function getCurrentEvents(events: IEvent[]) {
  const now = new Date();
  return events.filter(event => isWithinInterval(now, { start: parseISO(event.start_date), end: parseISO(event.end_date) })) || null;
}

export function groupEvents(dayEvents: IEvent[]) {
  const sortedEvents = dayEvents.sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime());
  const groups: IEvent[][] = [];

  for (const event of sortedEvents) {
    const eventStart = parseISO(event.start_date);

    let placed = false;
    for (const group of groups) {
      const lastEventInGroup = group[group.length - 1];
      const lastEventEnd = parseISO(lastEventInGroup.end_date);

      if (eventStart >= lastEventEnd) {
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([event]);
  }

  return groups;
}

export function getEventBlockStyle(event: IEvent, day: Date, groupIndex: number, groupSize: number, visibleHoursRange?: { from: number; to: number }) {
  const start_date = parseISO(event.start_date);
  const dayStart = new Date(day.setHours(0, 0, 0, 0));
  const eventStart = start_date < dayStart ? dayStart : start_date;
  const startMinutes = differenceInMinutes(eventStart, dayStart);

  let top;

  if (visibleHoursRange) {
    const visibleStartMinutes = visibleHoursRange.from * 60;
    const visibleEndMinutes = visibleHoursRange.to * 60;
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
    top = ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
  } else {
    top = (startMinutes / 1440) * 100;
  }

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}


export function getVisibleHours(visibleHours: TVisibleHours, singleDayEvents: IEvent[]) {
  let earliestEventHour = visibleHours.from;
  let latestEventHour = visibleHours.to;

  singleDayEvents.forEach(event => {
    const startHour = parseISO(event.start_date).getHours();
    const endTime = parseISO(event.end_date);
    const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
    if (startHour < earliestEventHour) earliestEventHour = startHour;
    if (endHour > latestEventHour) latestEventHour = endHour;
  });

  latestEventHour = Math.min(latestEventHour, 24);

  const hours = Array.from({ length: latestEventHour - earliestEventHour }, (_, i) => i + earliestEventHour);

  return { hours, earliestEventHour, latestEventHour };
}

// ================ Month view helper functions ================ //

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    // 将周日(0)转换为6，其他日期减1，这样周一(1)变成0，周二(2)变成1，以此类推
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const nextMonthCells = Array.from({ length: (7 - (totalDays % 7)) % 7 }, (_, i) => ({
    day: i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth + 1, i + 1),
  }));

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(multiDayEvents: IEvent[], singleDayEvents: IEvent[], selectedDate: Date) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const eventPositions: { [key: string]: number } = {};
  const occupiedPositions: { [key: string]: boolean[] } = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(day => {
    occupiedPositions[day.toISOString()] = [false, false, false];
  });

  const sortedEvents = [
    ...multiDayEvents.sort((a, b) => {
      const aDuration = differenceInDays(parseISO(a.end_date), parseISO(a.start_date));
      const bDuration = differenceInDays(parseISO(b.end_date), parseISO(b.start_date));
      return bDuration - aDuration || parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime();
    }),
    ...singleDayEvents.sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime()),
  ];

  sortedEvents.forEach(event => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    const eventDays = eachDayOfInterval({
      start: eventStart < monthStart ? monthStart : eventStart,
      end: eventEnd > monthEnd ? monthEnd : eventEnd,
    });

    let position = -1;

    for (let i = 0; i < 3; i++) {
      if (
        eventDays.every(day => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
          return dayPositions && !dayPositions[i];
        })
      ) {
        position = i;
        break;
      }
    }

    if (position !== -1) {
      eventDays.forEach(day => {
        const dayKey = startOfDay(day).toISOString();
        occupiedPositions[dayKey][position] = true;
      });
      eventPositions[event.id] = position;
    }
  });

  return eventPositions;
}

export function getMonthCellEvents(date: Date, events: IEvent[], eventPositions: Record<string, number>) {
  const eventsForDate = events.filter(event => {
    const eventStart = parseISO(event.start_date);
    const eventEnd = parseISO(event.end_date);
    return (date >= eventStart && date <= eventEnd) || isSameDay(date, eventStart) || isSameDay(date, eventEnd);
  });

  return eventsForDate
    .map(event => ({
      ...event,
      position: eventPositions[event.id] ?? -1,
      isMultiDay: event.start_date !== event.end_date,
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1;
      if (!a.isMultiDay && b.isMultiDay) return 1;
      return a.position - b.position;
    });
}

// ================ 月份日期范围辅助函数 ================ //

/**
 * 根据指定日期获取这个月的月初和月末
 * @param date 指定日期
 * @returns 包含月初和月末的对象
 */
export function getMonthRange(date: Date): { startOfMonth: Date; endOfMonth: Date } {
  return {
    startOfMonth: startOfMonth(date),
    endOfMonth: endOfMonth(date),
  };
}

/**
 * 根据指定日期获取这个月的月初和月末（ISO字符串格式）
 * @param date 指定日期
 * @returns 包含月初和月末ISO字符串的对象
 */
export function getMonthRangeISO(date: Date): { startOfMonth: string; endOfMonth: string } {
  const range = getMonthRange(date);
  return {
    startOfMonth: range.startOfMonth.toISOString(),
    endOfMonth: range.endOfMonth.toISOString(),
  };
}

/**
 * 根据指定日期获取这个月的月初和月末（带时间）
 * @param date 指定日期
 * @param startTime 月初的时间，默认为 00:00:00
 * @param endTime 月末的时间，默认为 23:59:59.999
 * @returns 包含月初和月末的对象
 */
export function getMonthRangeWithTime(
  date: Date, 
  startTime: { hour: number; minute: number; second: number; millisecond: number } = { hour: 0, minute: 0, second: 0, millisecond: 0 },
  endTime: { hour: number; minute: number; second: number; millisecond: number } = { hour: 23, minute: 59, second: 59, millisecond: 999 }
): { startOfMonth: Date; endOfMonth: Date } {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  return {
    startOfMonth: new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      monthStart.getDate(),
      startTime.hour,
      startTime.minute,
      startTime.second,
      startTime.millisecond
    ),
    endOfMonth: new Date(
      monthEnd.getFullYear(),
      monthEnd.getMonth(),
      monthEnd.getDate(),
      endTime.hour,
      endTime.minute,
      endTime.second,
      endTime.millisecond
    ),
  };
}
