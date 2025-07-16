"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

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
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
  refreshEvents: () => Promise<void>;
  loading: boolean;
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
  events: initialEvents,
}: {
  children: React.ReactNode;
  events: EventResponse[];
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] =
    useState<TVisibleHours>(VISIBLE_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // 转换初始事件
  const [localEvents, setLocalEvents] = useState<IEvent[]>(
    initialEvents.map(convertEventResponseToIEvent)
  );
  const [view, setView] = useState<TCalendarView>("day");

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const refreshEvents = async () => {
    setLoading(true);
    try {
      const events = await invoke<EventResponse[]>("get_all_events");
      setLocalEvents(events.map(convertEventResponseToIEvent));
    } catch (error) {
      console.error("刷新事件失败:", error);
    } finally {
      setLoading(false);
    }
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
        events: localEvents,
        setLocalEvents,
        refreshEvents,
        loading,
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
