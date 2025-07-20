
import { invoke } from "@tauri-apps/api/core";
import { IEventFormData, IEvent } from "@/types";



export const getTodos = async (start_date: string, end_date: string): Promise<IEvent[]> => {
    const response = await invoke("get_todos_by_date_range", {
        request: { start_date, end_date }
    });
    return response as IEvent[];
};


export const createTodo = async (event: IEventFormData): Promise<void> => {
    await invoke("create_todo", {
        request: event
    });
};



export const updateTodo = async (event: IEvent): Promise<void> => {
    await invoke("update_todo", {
        request: event
    });
}


export const deleteTodo = async (id: number): Promise<void> => {
    await invoke("delete_todo", {
        id
    });
}


export const getUpcomingTodos = async (): Promise<IEvent[]> => {
    const response = await invoke("get_upcoming_todos", {
        request: {
            limit: 10
        }
    });
    return response as IEvent[];
}