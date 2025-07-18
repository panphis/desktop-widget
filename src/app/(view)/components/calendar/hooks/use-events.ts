import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { TEventFormData } from "../schemas";
import type { IEvent } from "../interfaces";

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setError(null);
    try {
      const result = await invoke<EventResponse[]>("get_all_events");
      setEvents(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取事件失败");
    } finally {
    }
  }, []);

  const createEvent = useCallback(async (eventData: TEventFormData) => {
    setError(null);
    try {
      const newEvent = await invoke<EventResponse>("create_event", {
        request: {
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.startDate.toISOString(),
          end_date: eventData.endDate.toISOString(),
          color: eventData.color,
        },
      });
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建事件失败");
      throw err;
    } finally {
    }
  }, []);

  const updateEvent = useCallback(async (id: number, eventData: TEventFormData) => {
    setError(null);
    try {
      const updatedEvent = await invoke<EventResponse>("update_event", {
        request: {
          id,
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.startDate.toISOString(),
          end_date: eventData.endDate.toISOString(),
          color: eventData.color,
        },
      });
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新事件失败");
      throw err;
    } finally {
    }
  }, []);

  const deleteEvent = useCallback(async (id: number) => {
    setError(null);
    try {
      const success = await invoke<boolean>("delete_event", { id });
      if (success) {
        setEvents(prev => prev.filter(event => event.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除事件失败");
      throw err;
    } finally {
    }
  }, []);

  const getEventsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    setError(null);
    try {
      const result = await invoke<EventResponse[]>("get_events_by_date_range", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取日期范围内事件失败");
      throw err;
    } finally {
    }
  }, []);

  return {
    events,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByDateRange,
  };
} 