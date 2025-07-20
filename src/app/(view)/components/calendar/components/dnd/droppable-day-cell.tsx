"use client";

import { useDrop } from "react-dnd";
import { parseISO, differenceInMilliseconds } from "date-fns";

import { cn } from "@/lib/utils";
import { ItemTypes } from "./draggable-event";

import type { IEvent, ICalendarCell } from "@/types";
import { useUpdateTodo } from "@/hooks/use-event";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
}

export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  
  const { mutateAsync: updateEvent } = useUpdateTodo();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      drop: async (item: { event: IEvent }) => {
        const droppedEvent = item.event;

        const eventStartDate = parseISO(droppedEvent.start_date);
        const eventEndDate = parseISO(droppedEvent.end_date);

        const eventDurationMs = differenceInMilliseconds(eventEndDate, eventStartDate);

        const newStartDate = new Date(cell.date);
        newStartDate.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), eventStartDate.getSeconds(), eventStartDate.getMilliseconds());
        const newEndDate = new Date(newStartDate.getTime() + eventDurationMs);

        // TODO: 更新事件
        const payload = {
          ...droppedEvent,
          start_date: newStartDate.toISOString(),
          end_date: newEndDate.toISOString(),
        };
        await updateEvent({ ...payload });
        return { moved: true };
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [cell.date]
  );

  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>} className={cn(isOver && canDrop && "bg-accent/50")}>
      {children}
    </div>
  );
}
