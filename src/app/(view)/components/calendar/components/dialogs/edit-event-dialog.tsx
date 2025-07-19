"use client";

import { useId } from "react";
import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDisclosure } from "@/hooks/use-disclosure";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { eventSchema } from "../../schemas";

import type { IEvent } from "@/types";
import type { TEventFormData } from "../../schemas";
import { EventForm } from "./event-form";
import { useUpdateEvent } from "@/hooks/use-event";

interface IProps {
  children: React.ReactNode;
  event: IEvent;
}

export function EditEventDialog({ children, event }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const { mutateAsync: updateEvent } = useUpdateEvent();
  const formId = useId();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      start_date: parseISO(event.start_date),
      end_date: parseISO(event.end_date),
      color: event.color,
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    try {
      const payload = {
        ...values, 
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        id: event.id,
      };
      await updateEvent({ ...payload });
      onClose();
      form.reset();
    } catch (error) {
      console.error("更新事件失败:", error);
    }
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
