"use client";

import { useDrop } from "react-dnd";
import { parseISO, differenceInMilliseconds } from "date-fns";

import { cn } from "@/lib/utils";
import { ItemTypes } from "./draggable-event";

import type { IEvent } from "@/types";

import { useUpdateEvent } from "@/hooks/use-event";
interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

export function DroppableTimeBlock({ date, hour, minute, children }: DroppableTimeBlockProps) {
  
  const { mutateAsync: updateEvent } = useUpdateEvent();
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      drop: async (item: { event: IEvent }) => {
        const droppedEvent = item.event;

        const eventStartDate = parseISO(droppedEvent.start_date);
        const eventEndDate = parseISO(droppedEvent.end_date);

        const eventDurationMs = differenceInMilliseconds(eventEndDate, eventStartDate);

        const newStartDate = new Date(date);
        newStartDate.setHours(hour, minute, 0, 0);
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
    [date, hour, minute]
  );

  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>} className={cn("h-[24px]", isOver && canDrop && "bg-accent/50")}>
      {children}
    </div>
  );
}
