import { invoke } from "@tauri-apps/api/core";
import type { EventResponse } from "./hooks/use-events";

export const getTodo = async (): Promise<EventResponse[]> => {
  try {
    const events = await invoke<EventResponse[]>("get_all_events");
    return events;
  } catch (error) {
    console.error("获取事件失败:", error);
    return [];
  }
};
