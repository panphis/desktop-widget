"use client";

import { parseISO } from "date-fns";
import { Calendar, Clock, Text } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditEventDialog } from "./edit-event-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { IEvent } from "@/types";
import { formatTime } from "@/lib/format";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const start_date = parseISO(event.start_date);
  const end_date = parseISO(event.end_date);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">开始时间</p>
                <p className="text-sm text-muted-foreground">{formatTime(start_date, "YYYY MMM D日 h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">结束时间</p>
                <p className="text-sm text-muted-foreground">{formatTime(end_date, "YYYY MMM D日 h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">描述</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <EditEventDialog event={event}>
              <Button type="button" variant="outline">
                编辑
              </Button>
            </EditEventDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
