"use client";

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDisclosure } from "@/hooks/use-disclosure";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { eventSchema } from "../../schemas";
import type { TEventFormData } from "../../schemas";
import { EventForm } from "./event-form";
import { useEvents } from "../../hooks/use-events";
import { useCalendar } from "../../contexts/calendar-context";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate }: IProps) {

  const { isOpen, onClose, onToggle } = useDisclosure();
  const formId = useId();
  const { createEvent } = useEvents();
  const { refreshEvents } = useCalendar();
  
  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: typeof startDate !== "undefined" ? startDate : undefined,
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    try {
      await createEvent(values);
      await refreshEvents();
      onClose();
      form.reset();
    } catch (error) {
      console.error("创建事件失败:", error);
    }
  };

  useEffect(() => {
    form.reset({
      startDate,
    });
  }, [startDate, form.reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建事件</DialogTitle>
        </DialogHeader>

        <EventForm onSubmit={onSubmit} formId={formId} onCancel={onClose} />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              取消
            </Button>
          </DialogClose>

          <Button form={formId} type="submit">
            创建事件
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
