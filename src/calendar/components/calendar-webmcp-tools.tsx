"use client";

/**
 * WebMCP Tools for Calendar Application
 *
 * Registers tools that allow AI agents to interact with the calendar.
 *
 * @see https://docs.mcp-b.ai/packages/react-webmcp for useWebMCP hook
 */

import { useWebMCP, useWebMCPPrompt } from "@mcp-b/react-webmcp";
import { useRouter, usePathname } from "next/navigation";
import { z } from "zod";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";
import type { TEventColor, TBadgeVariant } from "@/calendar/types";

/** Available colors for calendar events */
const EVENT_COLORS: TEventColor[] = ["blue", "green", "red", "yellow", "purple", "orange", "gray"];

/** Available badge display variants */
const BADGE_VARIANTS: TBadgeVariant[] = ["dot", "colored", "mixed"];

export function CalendarWebMCPTools() {
  const {
    events,
    setLocalEvents,
    users,
    selectedDate,
    setSelectedDate,
    selectedUserId,
    setSelectedUserId,
    badgeVariant,
    setBadgeVariant,
    workingHours,
    setWorkingHours,
    visibleHours,
    setVisibleHours,
  } = useCalendar();

  const router = useRouter();
  const pathname = usePathname();

  // ╔════════════════════════════════════════════════════════════════════════════╗
  // ║                           READ OPERATIONS                                  ║
  // ╚════════════════════════════════════════════════════════════════════════════╝

  /**
   * Tool: get_events
   * Retrieves calendar events with filtering by month, user, and search query.
   * If search returns no results, falls back to showing all events for the month.
   */
  useWebMCP({
    name: "get_events",
    description:
      "Get calendar events. ALWAYS provide a 'month' parameter (e.g., '2025-12') to filter by month. If searching by title and no results found, returns the full month's events so you can see what's available.",
    inputSchema: {
      month: z
        .string()
        .describe("REQUIRED: Filter events by month in YYYY-MM format (e.g., '2025-12' for December 2025)."),
      userId: z.string().optional().describe("Filter events by user ID. Use 'all' or omit to show all users."),
      searchQuery: z.string().optional().describe("Search events by title (case-insensitive). If no match found, returns all events for the month."),
    },
    handler: async ({ month, userId, searchQuery }) => {
      let filteredEvents = [...events];
      let searchFailed = false;
      let originalQuery = searchQuery;

      // Filter by month (YYYY-MM format) - REQUIRED
      const [year, monthNum] = month.split("-").map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0, 23, 59, 59); // Last day of month

      filteredEvents = filteredEvents.filter(event => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return (
          isWithinInterval(eventStart, { start: monthStart, end: monthEnd }) ||
          isWithinInterval(eventEnd, { start: monthStart, end: monthEnd }) ||
          (eventStart <= monthStart && eventEnd >= monthEnd)
        );
      });

      const monthEvents = [...filteredEvents]; // Keep copy of month events

      // Filter by user
      if (userId && userId !== "all") {
        filteredEvents = filteredEvents.filter(event => event.user.id === userId);
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchResults = filteredEvents.filter(
          event => event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query)
        );

        // If search returns nothing, fall back to showing the month's events
        if (searchResults.length === 0) {
          searchFailed = true;
          filteredEvents = monthEvents; // Reset to month events
        } else {
          filteredEvents = searchResults;
        }
      }

      // Sort by start date
      filteredEvents.sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

      return {
        count: filteredEvents.length,
        searchFailed,
        searchQuery: originalQuery,
        month: format(monthStart, "MMMM yyyy"),
        events: filteredEvents.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          startDateFormatted: format(parseISO(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
          endDateFormatted: format(parseISO(event.endDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
          color: event.color,
          user: {
            id: event.user.id,
            name: event.user.name,
          },
        })),
      };
    },
    formatOutput: output => {
      let header = "";
      if (output.searchFailed && output.searchQuery) {
        header = `NOTE: No events found matching "${output.searchQuery}". Showing all ${output.count} events for ${output.month} instead:\n\n`;
      } else if (output.count === 0) {
        return `No events found for ${output.month}.`;
      }
      return `${header}Found ${output.count} event(s) for ${output.month}:\n${output.events
        .map(
          (e: { title: string; startDateFormatted: string; user: { name: string }; id: number }) =>
            `- [ID: ${e.id}] "${e.title}" (${e.startDateFormatted}) - ${e.user.name}`
        )
        .join("\n")}`;
    },
  });

  /**
   * Tool: get_event_by_id
   * Retrieves detailed information about a specific event.
   */
  useWebMCP({
    name: "get_event_by_id",
    description: "Get detailed information about a specific event by its ID.",
    inputSchema: {
      eventId: z.number().describe("The unique ID of the event to retrieve"),
    },
    handler: async ({ eventId }) => {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        startDateFormatted: format(parseISO(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
        endDateFormatted: format(parseISO(event.endDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
        color: event.color,
        user: {
          id: event.user.id,
          name: event.user.name,
          picturePath: event.user.picturePath,
        },
      };
    },
    formatOutput: output =>
      `Event: "${output.title}"\nAssigned to: ${output.user.name}\nStart: ${output.startDateFormatted}\nEnd: ${output.endDateFormatted}\nColor: ${output.color}\nDescription: ${output.description}`,
  });

  // ╔════════════════════════════════════════════════════════════════════════════╗
  // ║                           WRITE OPERATIONS                                 ║
  // ╚════════════════════════════════════════════════════════════════════════════╝

  /**
   * Tool: create_event
   * Creates a new calendar event. Instructs the agent to get calendar state first
   * to know today's date, and to navigate to the event after creation.
   */
  useWebMCP({
    name: "create_event",
    description:
      "Create a new calendar event. IMPORTANT: First call get_calendar_state to know today's date, then use that to create events relative to today (e.g., 'tomorrow' = today + 1 day). After creating, ALWAYS use navigate_to_event with the returned event ID to show the user their new event.",
    inputSchema: {
      title: z.string().min(1).describe("The title of the event (required)"),
      description: z.string().min(1).describe("A description of the event (required)"),
      startDate: z.string().describe("Start date in ISO 8601 format (e.g., '2025-12-09T14:00:00'). Use get_calendar_state first to know today's date."),
      endDate: z.string().describe("End date in ISO 8601 format (e.g., '2025-12-09T15:00:00')"),
      userId: z.string().describe("The ID of the user to assign the event to. Use get_users to see available users."),
      color: z
        .enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"])
        .describe("The color of the event badge"),
    },
    handler: async ({ title, description, startDate, endDate, userId, color }) => {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found. Use get_users to see available users.`);
      }

      const parsedStart = parseISO(startDate);
      const parsedEnd = parseISO(endDate);

      if (parsedStart >= parsedEnd) {
        throw new Error("Start date must be before end date");
      }

      // Generate a new unique ID
      const maxId = events.reduce((max, event) => Math.max(max, event.id), 0);
      const newId = maxId + 1;

      const newEvent: IEvent = {
        id: newId,
        title,
        description,
        startDate: parsedStart.toISOString(),
        endDate: parsedEnd.toISOString(),
        color,
        user,
      };

      setLocalEvents(prev => [...prev, newEvent]);

      return {
        success: true,
        message: `Event "${title}" created successfully`,
        event: {
          id: newEvent.id,
          title: newEvent.title,
          startDateFormatted: format(parsedStart, "EEEE, MMMM d, yyyy 'at' h:mm a"),
          endDateFormatted: format(parsedEnd, "EEEE, MMMM d, yyyy 'at' h:mm a"),
          assignedTo: user.name,
          color,
        },
      };
    },
    formatOutput: output =>
      `${output.message}\n\n**Event ID: ${output.event.id}** (use this ID with navigate_to_event to show the event)\n\nAssigned to: ${output.event.assignedTo}\nStart: ${output.event.startDateFormatted}\nEnd: ${output.event.endDateFormatted}`,
  });

  /**
   * Tool: update_event
   * Updates an existing calendar event with new values.
   */
  useWebMCP({
    name: "update_event",
    description:
      "Update an existing calendar event. You can update any combination of fields: title, description, dates, user, or color. IMPORTANT: After updating an event, ALWAYS use navigate_to_event with the event ID to show the user their updated event in the month view.",
    inputSchema: {
      eventId: z.number().describe("The ID of the event to update"),
      title: z.string().optional().describe("New title for the event"),
      description: z.string().optional().describe("New description for the event"),
      startDate: z.string().optional().describe("New start date in ISO 8601 format"),
      endDate: z.string().optional().describe("New end date in ISO 8601 format"),
      userId: z.string().optional().describe("New user ID to assign the event to"),
      color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"]).optional().describe("New color"),
    },
    handler: async ({ eventId, title, description, startDate, endDate, userId, color }) => {
      const eventIndex = events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      const existingEvent = events[eventIndex];
      let updatedUser = existingEvent.user;

      if (userId) {
        const user = users.find(u => u.id === userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
        updatedUser = user;
      }

      const newStartDate = startDate ? parseISO(startDate).toISOString() : existingEvent.startDate;
      const newEndDate = endDate ? parseISO(endDate).toISOString() : existingEvent.endDate;

      if (parseISO(newStartDate) >= parseISO(newEndDate)) {
        throw new Error("Start date must be before end date");
      }

      const updatedEvent: IEvent = {
        ...existingEvent,
        title: title ?? existingEvent.title,
        description: description ?? existingEvent.description,
        startDate: newStartDate,
        endDate: newEndDate,
        color: color ?? existingEvent.color,
        user: updatedUser,
      };

      setLocalEvents(prev => {
        const newEvents = [...prev];
        newEvents[eventIndex] = updatedEvent;
        return newEvents;
      });

      return {
        success: true,
        message: `Event "${updatedEvent.title}" (ID: ${eventId}) updated successfully`,
        event: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          startDateFormatted: format(parseISO(updatedEvent.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
          endDateFormatted: format(parseISO(updatedEvent.endDate), "EEEE, MMMM d, yyyy 'at' h:mm a"),
          assignedTo: updatedUser.name,
          color: updatedEvent.color,
        },
      };
    },
    formatOutput: output =>
      `${output.message}\n\n**Event ID: ${output.event.id}** (use this ID with navigate_to_event to show the event)\n\nAssigned to: ${output.event.assignedTo}\nStart: ${output.event.startDateFormatted}\nEnd: ${output.event.endDateFormatted}`,
  });

  /**
   * Tool: delete_event
   * Permanently removes a calendar event.
   */
  useWebMCP({
    name: "delete_event",
    description: "Delete a calendar event by its ID. This action cannot be undone.",
    inputSchema: {
      eventId: z.number().describe("The ID of the event to delete"),
    },
    handler: async ({ eventId }) => {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      setLocalEvents(prev => prev.filter(e => e.id !== eventId));

      return {
        success: true,
        message: `Event "${event.title}" (ID: ${eventId}) deleted successfully`,
        deletedEvent: {
          id: event.id,
          title: event.title,
        },
      };
    },
    formatOutput: output => output.message,
  });

  // ╔════════════════════════════════════════════════════════════════════════════╗
  // ║                           USER & STATE QUERIES                             ║
  // ╚════════════════════════════════════════════════════════════════════════════╝

  /**
   * Tool: get_users
   * Lists all users who can be assigned to events.
   */
  useWebMCP({
    name: "get_users",
    description:
      "Get a list of all users who can be assigned to calendar events. Returns user IDs and names for use in create_event and update_event.",
    inputSchema: {},
    handler: async () => {
      return {
        count: users.length,
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          hasPicture: !!user.picturePath,
        })),
      };
    },
    formatOutput: output =>
      `${output.count} user(s) available:\n${output.users
        .map((u: { id: string; name: string }) => `- ${u.name} (ID: ${u.id})`)
        .join("\n")}`,
  });

  /**
   * Tool: get_calendar_state
   * Returns current calendar state including today's date, selected date, and settings.
   * Agents should call this first to understand the current context.
   */
  useWebMCP({
    name: "get_calendar_state",
    description:
      "Get the current state of the calendar including TODAY'S DATE, selected date, user filter, and display settings. IMPORTANT: Always call this first to know what today's date is before creating events.",
    inputSchema: {},
    handler: async () => {
      const now = new Date();
      const selectedUser = selectedUserId === "all" ? null : users.find(u => u.id === selectedUserId);
      return {
        today: now.toISOString(),
        todayFormatted: format(now, "EEEE, MMMM d, yyyy"),
        currentMonth: format(now, "MMMM yyyy"),
        selectedDate: selectedDate.toISOString(),
        selectedDateFormatted: format(selectedDate, "EEEE, MMMM d, yyyy"),
        userFilter: selectedUserId === "all" ? "all" : selectedUser?.name ?? selectedUserId,
        userFilterId: selectedUserId,
        badgeVariant,
        visibleHours: {
          from: visibleHours.from,
          to: visibleHours.to,
          description: `${visibleHours.from}:00 - ${visibleHours.to}:00`,
        },
        totalEvents: events.length,
      };
    },
    formatOutput: output =>
      `Calendar State:\n- Today's Date: ${output.todayFormatted}\n- Current Month: ${output.currentMonth}\n- Selected Date: ${output.selectedDateFormatted}\n- User Filter: ${output.userFilter}\n- Badge Style: ${output.badgeVariant}\n- Visible Hours: ${output.visibleHours.description}\n- Total Events: ${output.totalEvents}`,
  });

  // ╔════════════════════════════════════════════════════════════════════════════╗
  // ║                           NAVIGATION TOOLS                                 ║
  // ╚════════════════════════════════════════════════════════════════════════════╝

  /**
   * Tool: navigate_to_date
   * Changes the calendar's selected date to show a specific day/week/month.
   */
  useWebMCP({
    name: "navigate_to_date",
    description:
      "Navigate the calendar to a specific date. This changes which day/week/month is displayed based on the current view.",
    inputSchema: {
      date: z.string().describe("The date to navigate to in ISO 8601 format (e.g., '2025-01-15')"),
    },
    handler: async ({ date }) => {
      const parsedDate = parseISO(date);
      setSelectedDate(parsedDate);

      return {
        success: true,
        message: `Calendar navigated to ${format(parsedDate, "EEEE, MMMM d, yyyy")}`,
        date: parsedDate.toISOString(),
        dateFormatted: format(parsedDate, "EEEE, MMMM d, yyyy"),
      };
    },
    formatOutput: output => output.message,
  });

  /**
   * Tool: navigate_to_today
   * Quickly jumps the calendar to today's date.
   */
  useWebMCP({
    name: "navigate_to_today",
    description: "Navigate the calendar to today's date.",
    inputSchema: {},
    handler: async () => {
      const today = new Date();
      setSelectedDate(today);

      return {
        success: true,
        message: `Calendar navigated to today (${format(today, "EEEE, MMMM d, yyyy")})`,
        date: today.toISOString(),
        dateFormatted: format(today, "EEEE, MMMM d, yyyy"),
      };
    },
    formatOutput: output => output.message,
  });

  // ╔════════════════════════════════════════════════════════════════════════════╗
  // ║                           SETTINGS & DISPLAY                               ║
  // ╚════════════════════════════════════════════════════════════════════════════╝

  /**
   * Tool: set_user_filter
   * Filters the calendar to show only events for a specific user.
   */
  useWebMCP({
    name: "set_user_filter",
    description:
      "Filter the calendar to show events for a specific user, or show all users. This affects all calendar views.",
    inputSchema: {
      userId: z.string().describe("The user ID to filter by, or 'all' to show all users' events"),
    },
    handler: async ({ userId }) => {
      if (userId === "all") {
        setSelectedUserId("all");
        return {
          success: true,
          message: "Calendar is now showing events for all users",
          filter: "all",
        };
      }

      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found. Use get_users to see available users.`);
      }

      setSelectedUserId(userId);
      return {
        success: true,
        message: `Calendar is now showing events for ${user.name}`,
        filter: user.name,
        userId: user.id,
      };
    },
    formatOutput: output => output.message,
  });

  /**
   * Tool: set_badge_variant
   * Changes how event badges appear in the calendar views.
   */
  useWebMCP({
    name: "set_badge_variant",
    description:
      "Change how event badges are displayed in the calendar. Options: 'dot' (simple dots), 'colored' (colored badges with text), or 'mixed' (combination).",
    inputSchema: {
      variant: z
        .enum(["dot", "colored", "mixed"])
        .describe("The badge display variant: 'dot', 'colored', or 'mixed'"),
    },
    handler: async ({ variant }) => {
      setBadgeVariant(variant);
      return {
        success: true,
        message: `Badge display changed to "${variant}"`,
        variant,
      };
    },
    formatOutput: output => output.message,
  });

  /**
   * Tool: set_visible_hours
   * Adjusts the time range shown in week and day views.
   */
  useWebMCP({
    name: "set_visible_hours",
    description:
      "Set the visible hour range for the week and day views. Hours outside this range will be hidden to focus on the relevant time period.",
    inputSchema: {
      from: z.number().min(0).max(23).describe("Start hour (0-23, e.g., 8 for 8:00 AM)"),
      to: z.number().min(1).max(24).describe("End hour (1-24, e.g., 18 for 6:00 PM)"),
    },
    handler: async ({ from, to }) => {
      if (from >= to) {
        throw new Error("Start hour must be before end hour");
      }
      setVisibleHours({ from, to });
      return {
        success: true,
        message: `Visible hours set to ${from}:00 - ${to}:00`,
        from,
        to,
      };
    },
    formatOutput: output => output.message,
  });

  /**
   * Tool: get_todays_events
   * Quick access to today's schedule, sorted by time.
   */
  useWebMCP({
    name: "get_todays_events",
    description: "Get all events happening today, sorted by start time.",
    inputSchema: {},
    handler: async () => {
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      const todaysEvents = events.filter(event => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return (
          isWithinInterval(eventStart, { start: todayStart, end: todayEnd }) ||
          isWithinInterval(eventEnd, { start: todayStart, end: todayEnd }) ||
          (eventStart <= todayStart && eventEnd >= todayEnd)
        );
      });

      todaysEvents.sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

      return {
        date: format(today, "EEEE, MMMM d, yyyy"),
        count: todaysEvents.length,
        events: todaysEvents.map(event => ({
          id: event.id,
          title: event.title,
          startTime: format(parseISO(event.startDate), "h:mm a"),
          endTime: format(parseISO(event.endDate), "h:mm a"),
          user: event.user.name,
          color: event.color,
        })),
      };
    },
    formatOutput: output => {
      if (output.count === 0) return `No events scheduled for today (${output.date}).`;
      return `Events for today (${output.date}):\n${output.events
        .map(
          (e: { title: string; startTime: string; endTime: string; user: string }) =>
            `- ${e.startTime} - ${e.endTime}: "${e.title}" (${e.user})`
        )
        .join("\n")}`;
    },
  });

  /**
   * Tool: get_event_colors
   * Lists available event color options.
   */
  useWebMCP({
    name: "get_event_colors",
    description: "Get the list of available colors for calendar events.",
    inputSchema: {},
    handler: async () => {
      return {
        colors: EVENT_COLORS,
        description: "These colors can be used when creating or updating events.",
      };
    },
    formatOutput: output => `Available event colors: ${output.colors.join(", ")}`,
  });

  /**
   * Tool: navigate_to_event
   * Navigates to show a specific event in the calendar.
   * Should be called after create_event or update_event to show the result.
   */
  useWebMCP({
    name: "navigate_to_event",
    description:
      "Navigate the calendar to show a specific event by its ID. This navigates to the month view by default (best for seeing events in context). Optionally use view='day' to see the event in detail with time slots. Use this after creating or updating an event to show it to the user.",
    inputSchema: {
      eventId: z.number().describe("The ID of the event to navigate to"),
      view: z
        .enum(["month", "day"])
        .optional()
        .describe("The calendar view to navigate to. Defaults to 'month' (recommended). Use 'day' only when detailed time view is needed."),
    },
    handler: async ({ eventId, view = "month" }) => {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      const eventDate = parseISO(event.startDate);
      setSelectedDate(eventDate);

      // Navigate to the appropriate view
      const targetView = view === "day" ? "/day-view" : "/month-view";
      if (pathname !== targetView) {
        router.push(targetView);
      }

      // If navigating to day view, scroll to the event time after a short delay
      if (view === "day") {
        setTimeout(() => {
          const eventHour = eventDate.getHours();
          const hourElement = document.querySelector(`[data-hour="${eventHour}"]`);
          if (hourElement) {
            hourElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }

      return {
        success: true,
        message: `Calendar navigated to "${event.title}" on ${format(eventDate, "EEEE, MMMM d, yyyy")} in ${view} view`,
        event: {
          id: event.id,
          title: event.title,
          date: eventDate.toISOString(),
          dateFormatted: format(eventDate, "EEEE, MMMM d, yyyy"),
          time: format(eventDate, "h:mm a"),
        },
        view,
      };
    },
    formatOutput: output => output.message,
  });

  // ╔════════════════════════════════════════════════════════════════════════════╗
  // ║                           EXAMPLE PROMPTS                                  ║
  // ╚════════════════════════════════════════════════════════════════════════════╝

  /**
   * Prompt: reschedule_event
   * Demonstrates finding an event and moving it to a new time.
   */
  useWebMCPPrompt({
    name: "reschedule_event",
    description: "Move an event to a different day",
    get: async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Find the 'Team stand-up' event that's currently scheduled and move it to next Thursday at 10am. First briefly explain what you're doing, then use the tools to find the event, update it, and navigate to show me the change."
          },
        },
      ],
    }),
  });

  /**
   * Prompt: create_meeting
   * Demonstrates creating a new event with proper date awareness.
   */
  useWebMCPPrompt({
    name: "create_meeting",
    description: "Schedule a new meeting",
    get: async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Create a new 1-hour meeting called 'Project Review' with Leonardo Ramos for tomorrow at 2pm. Use a blue color. First call get_calendar_state to get today's date, briefly explain what you're doing, then get_users for the user ID, create the event for tomorrow, and navigate to show me the new meeting on the calendar."
          },
        },
      ],
    }),
  });

  /**
   * Prompt: show_this_week
   * Demonstrates querying and summarizing events for the current week.
   */
  useWebMCPPrompt({
    name: "show_this_week",
    description: "Show this week's events",
    get: async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Show me all the events happening this week. First call get_calendar_state to know today's date and current month, briefly explain what you're doing, then use get_events with the current month filter, and give me a nice summary of this week's schedule. Also navigate the calendar to today."
          },
        },
      ],
    }),
  });

  return null;
}
