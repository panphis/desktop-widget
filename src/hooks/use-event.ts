import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getTodos, createTodo, updateTodo, deleteTodo, getUpcomingTodos } from "@/service";
import { IEvent, IEventFormData } from "@/types";

export const useTodos = (start_date: string, end_date: string) => {
    return useQuery({
        queryKey: ["todo", start_date, end_date],
        queryFn: () => getTodos(start_date, end_date),
    });
};



export const useCreateTodo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (event: IEventFormData) => createTodo(event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todo"] });
            queryClient.invalidateQueries({ queryKey: ["upcoming-todo"] });
        },
    });
};


export const useUpdateTodo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (event: IEvent) => updateTodo(event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todo"] });
            queryClient.invalidateQueries({ queryKey: ["upcoming-todo"] });
        },
    });
};

export const useDeleteTodo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todo"] });
            queryClient.invalidateQueries({ queryKey: ["upcoming-todo"] });
        },
    });
};



export const useGetUpcomingTodos = () => {
    return useQuery({
        queryKey: ["upcoming-todo"],
        queryFn: () => getUpcomingTodos(),
    });
}

