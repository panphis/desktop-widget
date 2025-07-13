import type { TEventColor } from "./types";

export interface IEvent {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
