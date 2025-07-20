
import { Columns, Grid3x3, List, Plus, Grid2x2, CalendarRange } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TodayButton } from "./today-button";
import { DateNavigator } from "./date-navigator";
import { AddEventDialog } from "../dialogs/add-event-dialog";

import { useCalendar } from "../../contexts/calendar-context";



export function CalendarHeader() {

  const { view, setView } = useCalendar();

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button title="按天" onClick={() => setView('day')} aria-label="View by day" size="icon" variant={view === "day" ? "default" : "outline"} className="rounded-r-none [&_svg]:size-5">
              <List strokeWidth={1.8} />
            </Button>

            <Button
              title="按周"
              aria-label="View by week"
              size="icon"
              variant={view === "week" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView('week')}
            >
              <Columns strokeWidth={1.8} />
            </Button>

            <Button
              title="按月"
              aria-label="View by month"
              size="icon"
              variant={view === "month" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView('month')}
            >
              <Grid2x2 strokeWidth={1.8} />
            </Button>

            <Button
              title="按年"
              aria-label="View by year"
              size="icon"
              variant={view === "year" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView('year')}
            >
              <Grid3x3 strokeWidth={1.8} />
            </Button>

            <Button
              title="按日程"
              aria-label="View by agenda"
              size="icon"
              variant={view === "agenda" ? "default" : "outline"}
              className="-ml-px rounded-l-none [&_svg]:size-5"
              onClick={() => setView('agenda')}
            >
              <CalendarRange strokeWidth={1.8} />
            </Button>
          </div>
        </div>

        <AddEventDialog>
          <Button className="w-full sm:w-auto">
            <Plus />
            创建待办
          </Button>
        </AddEventDialog>
      </div>
    </div>
  );
}
