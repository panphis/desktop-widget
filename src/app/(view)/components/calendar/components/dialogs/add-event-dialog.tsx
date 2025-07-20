"use client";

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDisclosure } from "@/hooks/use-disclosure";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { eventSchema } from "../../schemas";
import type { TEventFormData } from "../../schemas";
import { EventForm } from "./event-form";

import { useCreateTodo } from "@/hooks/use-event";

interface IProps {
  children: React.ReactNode;
  start_date?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, start_date }: IProps) {

  const { isOpen, onClose, onToggle } = useDisclosure();
  const formId = useId();
  const { mutateAsync: createEvent } = useCreateTodo();
  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: typeof start_date !== "undefined" ? start_date : undefined,
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    try {
      const payload = {
        ...values, 
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      };
      await createEvent({ ...payload });
      onClose();
      form.reset();
    } catch (error) {
      console.error("创建事件失败:", error);
    }
  };

  useEffect(() => {
    form.reset({
      start_date,
    });
  }, [start_date, form.reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建待办</DialogTitle>
        </DialogHeader>

        <EventForm onSubmit={onSubmit} formId={formId} onCancel={onClose} />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              取消
            </Button>
          </DialogClose>

          <Button form={formId} type="submit">
              新建待办
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
