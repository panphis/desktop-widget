import { startOfWeek,endOfWeek, addDays, parseISO, isSameDay, areIntervalsOverlapping } from "date-fns";

import { useCalendar } from "../../contexts/calendar-context";

import { ScrollArea } from "@/components/ui/scroll-area";

import { AddEventDialog } from "../dialogs/add-event-dialog";
import { EventBlock } from "./event-block";
import { DroppableTimeBlock } from "../dnd/droppable-time-block";
import { CalendarTimeline } from "./calendar-time-line";
import { WeekViewMultiDayEventsRow } from "./week-view-multi-day-events-row";

import { cn } from "@/lib/utils";
import { groupEvents, getEventBlockStyle, getVisibleHours } from "../../helpers";

import { formatTime } from "@/lib/format";
import { useTodos } from "@/hooks/use-event";



export function CalendarWeekView() {
  const { selectedDate, visibleHours } = useCalendar();

  
  
  const startTime = startOfWeek(selectedDate);
  const endTime = endOfWeek(selectedDate);
  
  const { data:  filteredEvents = [] } = useTodos(
    startTime.toISOString(), 
    endTime.toISOString()
  );
  

  const singleDayEvents = filteredEvents.filter(event => {
    const startDate = parseISO(event.start_date);
    const endDate = parseISO(event.end_date);
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = filteredEvents.filter(event => {
    const startDate = parseISO(event.start_date);
    const endDate = parseISO(event.end_date);
    return !isSameDay(startDate, endDate);
  });


  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(visibleHours, singleDayEvents);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <>
      <div className="hidden flex-col sm:flex">
        <div>
          <WeekViewMultiDayEventsRow selectedDate={selectedDate} multiDayEvents={multiDayEvents} />

          {/* Week header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day, index) => (
                <span key={index} className="py-2 text-center text-xs font-medium text-muted-foreground">
                  {formatTime(day, "dddd")} <span className="ml-1 font-semibold text-foreground">{formatTime(day, "D")}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[736px]" type="always">
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: "96px" }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && <span className="text-xs text-muted-foreground">{formatTime(new Date().setHours(hour, 0, 0, 0), "a H点")}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = singleDayEvents.filter(event => isSameDay(parseISO(event.start_date), day) || isSameDay(parseISO(event.end_date), day));
                  const groupedEvents = groupEvents(dayEvents);

                  return (
                    <div key={dayIndex} className="relative">
                      {hours.map((hour, index) => {
                        return (
                          <div key={hour} className={cn("relative")} style={{ height: "96px" }}>
                            {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>}

                            <DroppableTimeBlock date={day} hour={hour} minute={0}>
                              <AddEventDialog start_date={day} startTime={{ hour, minute: 0 }}>
                                <div className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>

                            <DroppableTimeBlock date={day} hour={hour} minute={15}>
                              <AddEventDialog start_date={day} startTime={{ hour, minute: 15 }}>
                                <div className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>

                            <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                            <DroppableTimeBlock date={day} hour={hour} minute={30}>
                              <AddEventDialog start_date={day} startTime={{ hour, minute: 30 }}>
                                <div className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>

                            <DroppableTimeBlock date={day} hour={hour} minute={45}>
                              <AddEventDialog start_date={day} startTime={{ hour, minute: 45 }}>
                                <div className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>
                          </div>
                        );
                      })}

                      {groupedEvents.map((group, groupIndex) =>
                        group.map(event => {
                          let style = getEventBlockStyle(event, day, groupIndex, groupedEvents.length, { from: earliestEventHour, to: latestEventHour });
                          const hasOverlap = groupedEvents.some(
                            (otherGroup, otherIndex) =>
                              otherIndex !== groupIndex &&
                              otherGroup.some(otherEvent =>
                                areIntervalsOverlapping(
                                  { start: parseISO(event.start_date), end: parseISO(event.end_date) },
                                  { start: parseISO(otherEvent.start_date), end: parseISO(otherEvent.end_date) }
                                )
                              )
                          );

                          if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

                          return (
                            <div key={event.id} className="absolute p-1" style={style}>
                              <EventBlock event={event} />
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>

              <CalendarTimeline firstVisibleHour={earliestEventHour} lastVisibleHour={latestEventHour} />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
