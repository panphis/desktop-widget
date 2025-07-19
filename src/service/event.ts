
import { invoke } from "@tauri-apps/api/core";
import { IEventFormData, IEvent } from "@/types";



export const getEvents = async (start_date: string, end_date: string): Promise<IEvent[]> => {
    const response = await invoke("get_events_by_date_range", {
        request: { start_date, end_date }
    });
    return response as IEvent[];
};


export const createEvent = async (event: IEventFormData): Promise<void> => {
    await invoke("create_event", {
        request: event
    });
};



export const updateEvent = async (event: IEvent): Promise<void> => {
    await invoke("update_event", {
        request: event
    });
}


export const deleteEvent = async (id: number): Promise<void> => {
    await invoke("delete_event", {
        id
    });
}


export const getUpcomingEvents = async (): Promise<IEvent[]> => {
    const response = await invoke("get_upcoming_events", {
        request: {
            limit: 10
        }
    });
    return response as IEvent[];
}