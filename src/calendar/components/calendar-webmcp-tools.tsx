"use client";

import { useCallback } from "react";
import { useWebMCP, useWebMCPPrompt } from "@mcp-b/react-webmcp";
import { endOfDay, format, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useEventDialog } from "@/calendar/contexts/event-dialog-context";

import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TBadgeVariant, TEventColor, TVisibleHours } from "@/calendar/types";

const EVENT_COLORS = ["blue", "green", "red", "yellow", "purple", "orange", "gray"] as const satisfies ReadonlyArray<TEventColor>;
const BADGE_VARIANTS = ["dot", "colored", "mixed"] as const satisfies ReadonlyArray<TBadgeVariant>;
const CALENDAR_VIEWS = ["month", "day"] as const;
const READ_ONLY_ANNOTATIONS = { readOnlyHint: true, idempotentHint: true, destructiveHint: false };
const MUTATING_ANNOTATIONS = { readOnlyHint: false, idempotentHint: false, destructiveHint: false };
const CONFIGURATION_ANNOTATIONS = { readOnlyHint: false, idempotentHint: true, destructiveHint: false };
const DESTRUCTIVE_ANNOTATIONS = { readOnlyHint: false, idempotentHint: false, destructiveHint: true };

type CalendarView = (typeof CALENDAR_VIEWS)[number];
type SerializedEvent = ReturnType<typeof serializeEvent>;
type GetEventsOutput = {
  count: number;
  events: SerializedEvent[];
  searchFailed?: boolean;
  searchQuery?: string;
};
type CalendarInfoOutput = {
  colors: readonly TEventColor[];
  state: {
    badgeVariant: TBadgeVariant;
    selectedDateFormatted: string;
    todayFormatted: string;
    totalEvents: number;
    userFilter: string;
    visibleHours: { description: string };
  };
  users: Array<{ id: string; name: string }>;
};
type MessageOutput = { message: string };

interface CalendarToolDependencies {
  badgeVariant: TBadgeVariant;
  events: IEvent[];
  navigateToDateInView: (date: Date, view?: CalendarView) => void;
  openAddDialog: ReturnType<typeof useEventDialog>["openAddDialog"];
  openDeleteDialog: ReturnType<typeof useEventDialog>["openDeleteDialog"];
  openEditDialog: ReturnType<typeof useEventDialog>["openEditDialog"];
  selectedDate: Date;
  selectedUserId: IUser["id"] | "all";
  setBadgeVariant: (variant: TBadgeVariant) => void;
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  setVisibleHours: (hours: TVisibleHours) => void;
  users: IUser[];
  visibleHours: TVisibleHours;
}

function parseRequiredIsoDate(value: string, label: string): Date {
  const parsedDate = parseISO(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${label} must be a valid ISO 8601 date`);
  }

  return parsedDate;
}

function resolveDayRange(value: string): { start: Date; end: Date } {
  const targetDate = value === "today" ? new Date() : parseRequiredIsoDate(value, "date");

  return {
    start: startOfDay(targetDate),
    end: endOfDay(targetDate),
  };
}

function resolveMonthRange(month: string): { start: Date; end: Date } {
  const [year, monthIndex] = month.split("-").map(Number);

  return {
    start: new Date(year, monthIndex - 1, 1),
    end: new Date(year, monthIndex, 0, 23, 59, 59, 999),
  };
}

function eventOverlapsRange(event: IEvent, range: { start: Date; end: Date }): boolean {
  const eventStart = parseISO(event.startDate);
  const eventEnd = parseISO(event.endDate);

  return isWithinInterval(eventStart, range) || isWithinInterval(eventEnd, range) || (eventStart <= range.start && eventEnd >= range.end);
}

function filterEventsByRange(events: IEvent[], range: { start: Date; end: Date }): IEvent[] {
  return events.filter(event => eventOverlapsRange(event, range));
}

function sortEventsChronologically(events: IEvent[]): IEvent[] {
  return [...events].sort((left, right) => parseISO(left.startDate).getTime() - parseISO(right.startDate).getTime());
}

function serializeEvent(event: IEvent, options?: { includePicture?: boolean }) {
  const includePicture = options?.includePicture ?? false;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    startDateFormatted: format(parseISO(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
    endDateFormatted: format(parseISO(event.endDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
    color: event.color,
    user: includePicture ? { id: event.user.id, name: event.user.name, picturePath: event.user.picturePath } : { id: event.user.id, name: event.user.name },
  };
}

function formatEventListItem(event: SerializedEvent): string {
  return `- [ID: ${event.id}] "${event.title}" (${event.startDateFormatted}) - ${event.user.name}`;
}

function formatEventDetails(event: SerializedEvent): string {
  return [
    `Event ID: ${event.id}`,
    `Title: ${event.title}`,
    `Assigned to: ${event.user.name}`,
    `Start: ${event.startDateFormatted}`,
    `End: ${event.endDateFormatted}`,
    `Color: ${event.color}`,
    `Description: ${event.description}`,
  ].join("\n");
}

function formatVisibleHours(hours: TVisibleHours): string {
  return `${hours.from}:00 - ${hours.to}:00`;
}

function requireEvent(events: IEvent[], eventId: number): IEvent {
  const event = events.find(candidate => candidate.id === eventId);

  if (!event) {
    throw new Error(`Event with ID ${eventId} not found`);
  }

  return event;
}

function requireUser(users: IUser[], userId: string): IUser {
  const user = users.find(candidate => candidate.id === userId);

  if (!user) {
    throw new Error(`User with ID ${userId} not found. Use get_calendar_info to see available users.`);
  }

  return user;
}

function formatMutationResult(event: IEvent, action: "created" | "updated"): string {
  const eventDate = parseISO(event.startDate);

  return [
    `Event "${event.title}" ${action} and calendar navigated to ${format(eventDate, "MMMM d, yyyy")}`,
    "",
    `Event ID: ${event.id}`,
    `Assigned to: ${event.user.name}`,
    `Start: ${format(parseISO(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}`,
    `End: ${format(parseISO(event.endDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}`,
    `Color: ${event.color}`,
  ].join("\n");
}

function formatGetEventsOutput(output: unknown): string {
  const typedOutput = output as GetEventsOutput;

  if (typedOutput.count === 0) {
    return typedOutput.searchFailed && typedOutput.searchQuery ? `No events found matching "${typedOutput.searchQuery}".` : "No events found.";
  }

  if (typedOutput.count === 1 && typedOutput.events.length === 1 && "picturePath" in typedOutput.events[0].user) {
    return formatEventDetails(typedOutput.events[0]);
  }

  const header =
    typedOutput.searchFailed && typedOutput.searchQuery
      ? `No events found matching "${typedOutput.searchQuery}". Showing ${typedOutput.count} event(s) from the broader selection instead.`
      : `Found ${typedOutput.count} event(s):`;

  return [header, ...typedOutput.events.map(formatEventListItem)].join("\n");
}

function formatCalendarInfoOutput(output: unknown): string {
  const typedOutput = output as CalendarInfoOutput;

  return [
    "Calendar Info:",
    `- Today: ${typedOutput.state.todayFormatted}`,
    `- Selected Date: ${typedOutput.state.selectedDateFormatted}`,
    `- User Filter: ${typedOutput.state.userFilter}`,
    `- Badge Style: ${typedOutput.state.badgeVariant}`,
    `- Visible Hours: ${typedOutput.state.visibleHours.description}`,
    `- Total Events: ${typedOutput.state.totalEvents}`,
    `- Users: ${typedOutput.users.map(user => `${user.name} (${user.id})`).join(", ")}`,
    `- Colors: ${typedOutput.colors.join(", ")}`,
  ].join("\n");
}

function formatMessageOutput(output: unknown): string {
  return (output as MessageOutput).message;
}

function useCalendarQueryTools({
  badgeVariant,
  events,
  selectedDate,
  selectedUserId,
  users,
  visibleHours,
}: Pick<CalendarToolDependencies, "badgeVariant" | "events" | "selectedDate" | "selectedUserId" | "users" | "visibleHours">) {
  useWebMCP({
    name: "get_events",
    description:
      "Get calendar events with flexible filtering. Use id for a single event, date:'today' for today's events, month:'YYYY-MM' for a month, or no params for all events. Params compose together.",
    annotations: READ_ONLY_ANNOTATIONS,
    inputSchema: {
      id: z.number().int().positive().optional().describe("Get a single event by ID with full details"),
      month: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Month must use YYYY-MM format")
        .optional()
        .describe("Filter events by month"),
      date: z.string().optional().describe("Filter by date: 'today' or an ISO 8601 date"),
      userId: z.string().optional().describe("Filter events by user ID. Use 'all' or omit to show all users."),
      searchQuery: z.string().optional().describe("Search events by title or description (case-insensitive)"),
    },
    handler: async ({ id, month, date, userId, searchQuery }) => {
      if (id !== undefined) {
        const event = requireEvent(events, id);

        return {
          count: 1,
          events: [serializeEvent(event, { includePicture: true })],
        };
      }

      let filteredEvents = [...events];

      if (date) {
        filteredEvents = filterEventsByRange(filteredEvents, resolveDayRange(date));
      }

      if (month) {
        filteredEvents = filterEventsByRange(filteredEvents, resolveMonthRange(month));
      }

      if (userId && userId !== "all") {
        filteredEvents = filteredEvents.filter(event => event.user.id === userId);
      }

      let searchFailed = false;
      if (searchQuery) {
        const normalizedQuery = searchQuery.toLowerCase();
        const matchingEvents = filteredEvents.filter(event => {
          return event.title.toLowerCase().includes(normalizedQuery) || event.description.toLowerCase().includes(normalizedQuery);
        });

        if (matchingEvents.length === 0) {
          searchFailed = true;
        } else {
          filteredEvents = matchingEvents;
        }
      }

      return {
        count: filteredEvents.length,
        searchFailed,
        searchQuery,
        events: sortEventsChronologically(filteredEvents).map(event => serializeEvent(event)),
      };
    },
    formatOutput: formatGetEventsOutput,
  });

  useWebMCP({
    name: "get_calendar_info",
    description: "Get all calendar metadata in one call: users, calendar state (today's date, selected date, filters, settings), and available event colors.",
    annotations: READ_ONLY_ANNOTATIONS,
    inputSchema: {},
    handler: async () => {
      const now = new Date();
      const selectedUser = selectedUserId === "all" ? null : users.find(user => user.id === selectedUserId);

      return {
        users: users.map(user => ({ id: user.id, name: user.name, hasPicture: Boolean(user.picturePath) })),
        state: {
          today: now.toISOString(),
          todayFormatted: format(now, "EEEE, MMMM d, yyyy"),
          selectedDate: selectedDate.toISOString(),
          selectedDateFormatted: format(selectedDate, "EEEE, MMMM d, yyyy"),
          userFilterId: selectedUserId,
          userFilter: selectedUserId === "all" ? "all" : (selectedUser?.name ?? selectedUserId),
          badgeVariant,
          visibleHours: {
            from: visibleHours.from,
            to: visibleHours.to,
            description: formatVisibleHours(visibleHours),
          },
          totalEvents: events.length,
        },
        colors: EVENT_COLORS,
      };
    },
    formatOutput: formatCalendarInfoOutput,
  });
}

function useCalendarMutationTools({
  events,
  navigateToDateInView,
  openAddDialog,
  openDeleteDialog,
  openEditDialog,
  users,
}: Pick<CalendarToolDependencies, "events" | "navigateToDateInView" | "openAddDialog" | "openDeleteDialog" | "openEditDialog" | "users">) {
  useWebMCP({
    name: "create_event",
    description:
      "Create a new calendar event by opening the Add Event dialog pre-filled with data. The dialog shows a countdown before auto-submitting. The user can cancel or edit before submission. Call get_calendar_info first to know today's date and get valid user IDs.",
    annotations: MUTATING_ANNOTATIONS,
    inputSchema: {
      title: z.string().min(1).describe("The title of the event"),
      description: z.string().min(1).describe("A description of the event"),
      startDate: z.string().describe("Start date/time in ISO 8601 format"),
      endDate: z.string().describe("End date/time in ISO 8601 format"),
      userId: z.string().describe("The ID of the user to assign the event to"),
      color: z.enum(EVENT_COLORS).describe("The color of the event badge"),
    },
    handler: async ({ title, description, startDate, endDate, userId, color }) => {
      const requestedUser = requireUser(users, userId);
      const requestedStartDate = parseRequiredIsoDate(startDate, "startDate");
      const requestedEndDate = parseRequiredIsoDate(endDate, "endDate");

      if (requestedStartDate >= requestedEndDate) {
        throw new Error("Start date must be before end date");
      }

      const result = await openAddDialog(
        {
          title,
          description,
          startDate: requestedStartDate,
          startTime: { hour: requestedStartDate.getHours(), minute: requestedStartDate.getMinutes() },
          endDate: requestedEndDate,
          endTime: { hour: requestedEndDate.getHours(), minute: requestedEndDate.getMinutes() },
          userId,
          color,
        },
        { source: "ai" }
      );

      if (result.cancelled || !result.event) {
        return { success: false, message: "Event creation was cancelled by the user." };
      }

      navigateToDateInView(parseISO(result.event.startDate), "month");

      return {
        success: true,
        message: formatMutationResult(result.event, "created"),
        event: result.event,
        requestedUser: requestedUser.name,
      };
    },
    formatOutput: formatMessageOutput,
  });

  useWebMCP({
    name: "update_event",
    description:
      "Update an existing calendar event by opening the Edit dialog pre-filled. The dialog shows a countdown before auto-submitting. Only include fields you want to change.",
    annotations: CONFIGURATION_ANNOTATIONS,
    inputSchema: {
      eventId: z.number().int().positive().describe("The ID of the event to update"),
      title: z.string().optional().describe("New title for the event"),
      description: z.string().optional().describe("New description for the event"),
      startDate: z.string().optional().describe("New start date/time in ISO 8601 format"),
      endDate: z.string().optional().describe("New end date/time in ISO 8601 format"),
      userId: z.string().optional().describe("New user ID to reassign the event to"),
      color: z.enum(EVENT_COLORS).optional().describe("New color for the event badge"),
    },
    handler: async ({ eventId, title, description, startDate, endDate, userId, color }) => {
      const existingEvent = requireEvent(events, eventId);
      const updatedUser = userId ? requireUser(users, userId) : existingEvent.user;
      const updatedStartDate = startDate ? parseRequiredIsoDate(startDate, "startDate") : parseISO(existingEvent.startDate);
      const updatedEndDate = endDate ? parseRequiredIsoDate(endDate, "endDate") : parseISO(existingEvent.endDate);

      if (updatedStartDate >= updatedEndDate) {
        throw new Error("Start date must be before end date");
      }

      const result = await openEditDialog(
        {
          ...existingEvent,
          title: title ?? existingEvent.title,
          description: description ?? existingEvent.description,
          startDate: updatedStartDate.toISOString(),
          endDate: updatedEndDate.toISOString(),
          color: color ?? existingEvent.color,
          user: updatedUser,
        },
        { source: "ai" }
      );

      if (result.cancelled || !result.event) {
        return { success: false, message: "Event update was cancelled by the user." };
      }

      navigateToDateInView(parseISO(result.event.startDate), "month");

      return {
        success: true,
        message: formatMutationResult(result.event, "updated"),
        event: result.event,
      };
    },
    formatOutput: formatMessageOutput,
  });

  useWebMCP({
    name: "delete_event",
    description:
      "Delete a calendar event by opening a confirmation dialog. The dialog shows a countdown before auto-confirming. The user can cancel during the countdown.",
    annotations: DESTRUCTIVE_ANNOTATIONS,
    inputSchema: {
      eventId: z.number().int().positive().describe("The ID of the event to delete"),
    },
    handler: async ({ eventId }) => {
      const event = requireEvent(events, eventId);
      const result = await openDeleteDialog(event, { source: "ai" });

      if (result.cancelled) {
        return { success: false, message: "Event deletion was cancelled by the user." };
      }

      return {
        success: true,
        message: `Event "${event.title}" (ID: ${event.id}) has been permanently deleted`,
      };
    },
    formatOutput: formatMessageOutput,
  });
}

function useCalendarUiTools({
  badgeVariant,
  events,
  navigateToDateInView,
  setBadgeVariant,
  setSelectedUserId,
  setVisibleHours,
  users,
  visibleHours,
}: Pick<
  CalendarToolDependencies,
  "badgeVariant" | "events" | "navigateToDateInView" | "setBadgeVariant" | "setSelectedUserId" | "setVisibleHours" | "users" | "visibleHours"
>) {
  useWebMCP({
    name: "navigate",
    description:
      "Navigate the calendar UI. No params goes to today, date goes to a specific day, and eventId jumps to an event. Choose month or day view with view.",
    annotations: CONFIGURATION_ANNOTATIONS,
    inputSchema: {
      date: z.string().optional().describe("The date to navigate to in ISO 8601 format"),
      eventId: z.number().int().positive().optional().describe("Navigate to the date of this event"),
      view: z.enum(CALENDAR_VIEWS).optional().describe("Calendar view to use. Default is 'month'."),
    },
    handler: async ({ date, eventId, view = "month" }) => {
      if (date && eventId !== undefined) {
        throw new Error("Provide either date or eventId, not both");
      }

      let targetDate = new Date();
      let message = `Calendar navigated to ${format(targetDate, "EEEE, MMMM d, yyyy")} in ${view} view`;

      if (eventId !== undefined) {
        const event = requireEvent(events, eventId);
        targetDate = parseISO(event.startDate);
        message = `Calendar navigated to "${event.title}" on ${format(targetDate, "EEEE, MMMM d, yyyy")} in ${view} view`;
      } else if (date) {
        targetDate = parseRequiredIsoDate(date, "date");
        message = `Calendar navigated to ${format(targetDate, "EEEE, MMMM d, yyyy")} in ${view} view`;
      }

      navigateToDateInView(targetDate, view);

      return {
        success: true,
        message,
      };
    },
    formatOutput: formatMessageOutput,
  });

  useWebMCP({
    name: "configure",
    description: "Change calendar display settings. Include only the settings you want to change: userFilter, badgeVariant, visibleHoursFrom, visibleHoursTo.",
    annotations: CONFIGURATION_ANNOTATIONS,
    inputSchema: {
      userFilter: z.string().optional().describe("User ID to filter by, or 'all' to show all users"),
      badgeVariant: z.enum(BADGE_VARIANTS).optional().describe("Badge display variant"),
      visibleHoursFrom: z.number().min(0).max(23).optional().describe("Start of visible hours"),
      visibleHoursTo: z.number().min(1).max(24).optional().describe("End of visible hours"),
    },
    handler: async ({ userFilter, badgeVariant: requestedBadgeVariant, visibleHoursFrom, visibleHoursTo }) => {
      const changes: string[] = [];

      if (userFilter !== undefined) {
        if (userFilter === "all") {
          setSelectedUserId("all");
          changes.push("User filter: all");
        } else {
          const user = requireUser(users, userFilter);
          setSelectedUserId(user.id);
          changes.push(`User filter: ${user.name}`);
        }
      }

      if (requestedBadgeVariant !== undefined && requestedBadgeVariant !== badgeVariant) {
        setBadgeVariant(requestedBadgeVariant);
        changes.push(`Badge variant: ${requestedBadgeVariant}`);
      }

      if (visibleHoursFrom !== undefined || visibleHoursTo !== undefined) {
        const nextVisibleHours = {
          from: visibleHoursFrom ?? visibleHours.from,
          to: visibleHoursTo ?? visibleHours.to,
        };

        if (nextVisibleHours.from >= nextVisibleHours.to) {
          throw new Error("Start hour must be before end hour");
        }

        setVisibleHours(nextVisibleHours);
        changes.push(`Visible hours: ${formatVisibleHours(nextVisibleHours)}`);
      }

      return {
        success: true,
        message: changes.length === 0 ? "No settings changed." : `Settings updated:\n${changes.map(change => `- ${change}`).join("\n")}`,
      };
    },
    formatOutput: formatMessageOutput,
  });
}

function useCalendarPrompts() {
  useWebMCPPrompt({
    name: "reschedule_event",
    description: "Move an event to a different day",
    get: async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Find the 'Team stand-up' event that's currently scheduled and move it to next Thursday at 10am. First briefly explain what you're doing, then use the tools to find the event, update it, and navigate to show me the change.",
          },
        },
      ],
    }),
  });

  useWebMCPPrompt({
    name: "create_meeting",
    description: "Schedule a new meeting",
    get: async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Create a new 1-hour meeting called 'Project Review' with Leonardo Ramos for tomorrow at 2pm. Use a blue color. First call get_calendar_info to get today's date and user IDs, briefly explain what you're doing, then create the event and navigate to show me the new meeting on the calendar.",
          },
        },
      ],
    }),
  });

  useWebMCPPrompt({
    name: "show_this_week",
    description: "Show this week's events",
    get: async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Show me all the events happening this week. First call get_calendar_info to know today's date and current month, briefly explain what you're doing, then use get_events with the current month filter, and give me a nice summary of this week's schedule. Also navigate the calendar to today.",
          },
        },
      ],
    }),
  });
}

export function CalendarWebMCPTools() {
  const { badgeVariant, events, selectedDate, selectedUserId, setBadgeVariant, setSelectedDate, setSelectedUserId, setVisibleHours, users, visibleHours } =
    useCalendar();
  const { openAddDialog, openDeleteDialog, openEditDialog } = useEventDialog();
  const pathname = usePathname();
  const router = useRouter();

  const navigateToDateInView = useCallback(
    (date: Date, view: CalendarView = "month") => {
      setSelectedDate(date);

      const targetPath = view === "day" ? "/day-view" : "/month-view";
      if (pathname !== targetPath) {
        router.push(targetPath);
      }

      if (view === "day") {
        window.setTimeout(() => {
          const hourElement = document.querySelector(`[data-hour="${date.getHours()}"]`);
          if (hourElement instanceof HTMLElement) {
            hourElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    },
    [pathname, router, setSelectedDate]
  );

  useCalendarQueryTools({
    badgeVariant,
    events,
    selectedDate,
    selectedUserId,
    users,
    visibleHours,
  });
  useCalendarMutationTools({
    events,
    navigateToDateInView,
    openAddDialog,
    openDeleteDialog,
    openEditDialog,
    users,
  });
  useCalendarUiTools({
    badgeVariant,
    events,
    navigateToDateInView,
    setBadgeVariant,
    setSelectedUserId,
    setVisibleHours,
    users,
    visibleHours,
  });
  useCalendarPrompts();

  return null;
}
