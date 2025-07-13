
import { Settings } from "lucide-react";

import { CalendarProvider } from "./contexts/calendar-context";

import { ChangeBadgeVariantInput } from "./components/change-badge-variant-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { getEvents } from "./requests";
import { ClientContainer } from "./components/client-container";

export async function Calendar() {
  const [events] = await Promise.all([getEvents()]);
  return (
    <CalendarProvider events={events}>
      <ClientContainer/>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="flex-none gap-2 py-0 hover:no-underline">
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <p className="text-base font-semibold">Calendar settings</p>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="mt-4 flex flex-col gap-6">
                <ChangeBadgeVariantInput />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </CalendarProvider>
  );
}
