import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "@/calendar/mocks";

/**
 * Fetches all calendar events.
 * Currently returns mock data for demo purposes.
 * Replace with actual API call for production use.
 */
export const getEvents = async () => {
  return CALENDAR_ITEMS_MOCK;
};

/**
 * Fetches all available users.
 * Currently returns mock data for demo purposes.
 * Replace with actual API call for production use.
 */
export const getUsers = async () => {
  return USERS_MOCK;
};
