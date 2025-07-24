import { Fragment } from "react";
import type { FC } from "react"
import type { IEvent } from "@/types";
import { getColorClass, getStatusColor, getStatusLabel } from "../calendar/helpers";
import { Badge, Button, Checkbox, Label } from "@/components/ui";
import { Trash2, Play, Pause } from "lucide-react";
import { useDeleteTodo, useUpdateTodo } from "@/hooks/use-event";

type EventItemProps = {
    event: IEvent;
};

export const EventItem: FC<EventItemProps> = ({ event }) => {

    const { mutateAsync: deleteEvent } = useDeleteTodo();

    const { mutateAsync: updateEvent } = useUpdateTodo();



    const deleteTodo = async (id: number) => {
        await deleteEvent(id);
    };


    const handleStart = async () => {
        await updateEvent({
            ...event,
            status: 'wip'
        });
    };

    const handlePause = async () => {
        await updateEvent({
            ...event,
            status: 'todo'
        });
    };


    const handleComplete = async () => {
        await updateEvent({
            ...event,
            status: 'done'
        });
    };

    const handleReset = async () => {
        await updateEvent({
            ...event,
            status: 'todo'
        });
    };

    const handleToggle = async (value: boolean) => {
        if (value) {
            await handleComplete();
        } else {
            await handleReset();
        }
    };

    return (<Fragment>

        <Label
            className="flex items-center gap-4 justify-between p-3 border rounded-lg">
            <Checkbox
                id="toggle-2"
                defaultChecked={event.status === 'done'}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                onCheckedChange={handleToggle}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{event.title}</h4>
                    {event.color && (
                        <Badge className={getColorClass(event.color)} variant="secondary">
                            {event.color}
                        </Badge>
                    )}
                    {event.status && (
                        <Badge className={getStatusColor(event.status)} variant="secondary">
                            {getStatusLabel(event.status)}
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {event.description}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                </div>
            </div>
            <div className="flex items-center gap-2">

                {
                    event.status === 'wip' && <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePause}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Pause className="h-4 w-4" />
                    </Button>
                }



                {
                    event.status === 'todo' &&
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStart}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <Play className="h-4 w-4" />
                    </Button>

                }
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(event.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </Label>
    </Fragment>);
};
export default EventItem