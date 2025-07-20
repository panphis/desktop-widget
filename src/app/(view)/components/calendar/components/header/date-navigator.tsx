import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCalendar } from "../../contexts/calendar-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getEventsCount, navigateDate, rangeText } from "../../helpers";
;
import { formatTime } from "@/lib/format";
import { endOfDay, startOfDay } from "date-fns";
import { useTodos } from "@/hooks/use-event";



export function DateNavigator() {
  const { selectedDate, setSelectedDate, view } = useCalendar();

  const startTime = startOfDay(selectedDate);
  const endTime = endOfDay(selectedDate);
  
  const { data: events = [] } = useTodos(
    startTime.toISOString(), 
    endTime.toISOString()
  );
  


  const eventCount = useMemo(() => getEventsCount(events, selectedDate, view), [events, selectedDate, view]);

  const handlePrevious = () => setSelectedDate(navigateDate(selectedDate, view, "previous"));
  const handleNext = () => setSelectedDate(navigateDate(selectedDate, view, "next"));

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {formatTime(selectedDate, "YYYY MMMM")}
        </span>
        <Badge variant="outline" className="px-1.5" title={`${eventCount} 件待办`}>
          {eventCount} 件待办
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" title="上一月" onClick={handlePrevious}>
          <ChevronLeft />
        </Button>

        <p className="text-sm text-muted-foreground">{rangeText(view, selectedDate)}</p>

        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" title="下一月" onClick={handleNext}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
