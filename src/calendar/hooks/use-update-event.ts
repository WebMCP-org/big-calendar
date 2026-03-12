import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";

export function useUpdateEvent() {
  const { updateEvent: persistEvent } = useCalendar();

  const updateEvent = async (event: IEvent) => {
    await persistEvent({
      ...event,
      startDate: new Date(event.startDate).toISOString(),
      endDate: new Date(event.endDate).toISOString(),
    });
  };

  return { updateEvent };
}
