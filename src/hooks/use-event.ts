import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getEvents, createEvent, updateEvent , deleteEvent, getUpcomingEvents} from "@/service";
import { IEvent, IEventFormData } from "@/types";

export const useEvents = (start_date: string, end_date: string) => {
    return useQuery({
        queryKey: ["events", start_date, end_date],
        queryFn: () => getEvents(start_date, end_date),
    });
};



export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (event: IEventFormData) => createEvent(event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
        },
    });
};


export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (event: IEvent) => updateEvent(event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
        },
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
        },
    });
};



export const useGetUpcomingEvents = () => {
    return useQuery({
        queryKey: ["upcoming-events"],
        queryFn: () => getUpcomingEvents(),
    });
}