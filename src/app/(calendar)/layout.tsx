/**
 * Calendar Feature Layout
 *
 * Wraps all calendar pages with CalendarProvider, EventDialogProvider, and WebMCP tools.
 *
 * @see https://docs.mcp-b.ai/tutorials/first-react-tool for integration patterns
 * @see https://docs.mcp-b.ai/packages/react-webmcp/overview for useWebMCP and useWebMCPPrompt
 */

import { Settings } from "lucide-react";

import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { EventDialogProvider } from "@/calendar/contexts/event-dialog-context";
import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";
import { CalendarWebMCPTools } from "@/calendar/components/calendar-webmcp-tools";
import { ControlledDialogs } from "@/calendar/components/controlled-dialogs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CalendarProvider>
      <EventDialogProvider>
        <CalendarWebMCPTools />
        <ControlledDialogs />
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
          {children}

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
                  <ChangeVisibleHoursInput />
                  <ChangeWorkingHoursInput />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </EventDialogProvider>
    </CalendarProvider>
  );
}
