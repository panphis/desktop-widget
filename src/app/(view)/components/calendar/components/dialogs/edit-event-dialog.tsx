"use client";

import { useId } from "react";
import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDisclosure } from "@/hooks/use-disclosure";

import { useUpdateEvent } from "../../hooks/use-update-event";;
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { eventSchema } from "../../schemas";

import type { IEvent } from "../../interfaces";
import type { TEventFormData } from "../../schemas";
import { EventForm } from "./event-form";

interface IProps {
  children: React.ReactNode;
  event: IEvent;
}

export function EditEventDialog({ children, event }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const formId = useId();
  const { updateEvent } = useUpdateEvent();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      startDate: parseISO(event.startDate),
      endDate: parseISO(event.endDate),
      color: event.color,
    },
  });

  const onSubmit = (values: TEventFormData) => {
    const startDateTime = new Date(values.startDate);
    const endDateTime = new Date(values.endDate);
    updateEvent({
      ...event,
      title: values.title,
      color: values.color,
      description: values.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑事件</DialogTitle>
        </DialogHeader>

        <EventForm event={event} onSubmit={onSubmit} formId={formId} />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              取消
            </Button>
          </DialogClose>

          <Button form={formId} type="submit">
            保存更改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
