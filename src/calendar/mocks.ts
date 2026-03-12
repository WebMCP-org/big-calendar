import type { TEventColor } from "@/calendar/types";
import type { IEvent, IUser } from "@/calendar/interfaces";

// ================================== //

export const USERS_MOCK: IUser[] = [
  {
    id: "dd503cf9-6c38-43cf-94cc-0d4032e2f77a",
    name: "Leonardo Ramos",
    picturePath: null,
  },
  {
    id: "f3b035ac-49f7-4e92-a715-35680bf63175",
    name: "Michael Doe",
    picturePath: null,
  },
  {
    id: "3e36ea6e-78f3-40dd-ab8c-a6c737c3c422",
    name: "Alice Johnson",
    picturePath: null,
  },
  {
    id: "a7aff6bd-a50a-4d6a-ab57-76f76bb27cf5",
    name: "Robert Smith",
    picturePath: null,
  },
];

// Helper to create a date in the current month at a given day and hour
function currentMonthDate(day: number, hour: number, minute = 0): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), day, hour, minute, 0, 0);
  return date.toISOString();
}

// Events are generated relative to the current month so the calendar
// always has data to display when it first loads.
export const CALENDAR_ITEMS_MOCK: IEvent[] = [
  {
    id: 1,
    title: "Team stand-up",
    description: "Daily sync with the engineering team",
    startDate: currentMonthDate(1, 9, 0),
    endDate: currentMonthDate(1, 9, 30),
    color: "blue" as TEventColor,
    user: USERS_MOCK[0],
  },
  {
    id: 2,
    title: "Project planning",
    description: "Quarterly roadmap discussion",
    startDate: currentMonthDate(2, 14, 0),
    endDate: currentMonthDate(2, 15, 30),
    color: "purple" as TEventColor,
    user: USERS_MOCK[1],
  },
  {
    id: 3,
    title: "Client presentation",
    description: "Demo for Acme Corp",
    startDate: currentMonthDate(3, 10, 0),
    endDate: currentMonthDate(3, 11, 0),
    color: "green" as TEventColor,
    user: USERS_MOCK[0],
  },
  {
    id: 4,
    title: "Lunch with team",
    description: "Team lunch at Italian restaurant",
    startDate: currentMonthDate(4, 12, 0),
    endDate: currentMonthDate(4, 13, 30),
    color: "yellow" as TEventColor,
    user: USERS_MOCK[2],
  },
  {
    id: 5,
    title: "Code review",
    description: "Review PR #234 - new feature implementation",
    startDate: currentMonthDate(5, 15, 0),
    endDate: currentMonthDate(5, 16, 0),
    color: "orange" as TEventColor,
    user: USERS_MOCK[3],
  },
  {
    id: 6,
    title: "Doctor's appointment",
    description: "Annual check-up",
    startDate: currentMonthDate(8, 9, 0),
    endDate: currentMonthDate(8, 10, 0),
    color: "red" as TEventColor,
    user: USERS_MOCK[0],
  },
  {
    id: 7,
    title: "Sprint retrospective",
    description: "Review of last sprint",
    startDate: currentMonthDate(9, 14, 0),
    endDate: currentMonthDate(9, 15, 0),
    color: "blue" as TEventColor,
    user: USERS_MOCK[1],
  },
  {
    id: 8,
    title: "Workshop",
    description: "AI tools workshop",
    startDate: currentMonthDate(10, 9, 0),
    endDate: currentMonthDate(10, 12, 0),
    color: "green" as TEventColor,
    user: USERS_MOCK[2],
  },
  {
    id: 9,
    title: "1:1 with manager",
    description: "Monthly check-in",
    startDate: currentMonthDate(11, 11, 0),
    endDate: currentMonthDate(11, 11, 30),
    color: "orange" as TEventColor,
    user: USERS_MOCK[0],
  },
  {
    id: 10,
    title: "Gym workout",
    description: "Leg day",
    startDate: currentMonthDate(12, 7, 0),
    endDate: currentMonthDate(12, 8, 0),
    color: "orange" as TEventColor,
    user: USERS_MOCK[3],
  },
  {
    id: 11,
    title: "Design review",
    description: "Review new UI mockups",
    startDate: currentMonthDate(14, 14, 0),
    endDate: currentMonthDate(14, 15, 30),
    color: "purple" as TEventColor,
    user: USERS_MOCK[2],
  },
  {
    id: 12,
    title: "Team lunch",
    description: "Welcome new team member",
    startDate: currentMonthDate(15, 12, 0),
    endDate: currentMonthDate(15, 13, 0),
    color: "green" as TEventColor,
    user: USERS_MOCK[0],
  },
  {
    id: 13,
    title: "Sprint planning",
    description: "Plan next sprint",
    startDate: currentMonthDate(16, 10, 0),
    endDate: currentMonthDate(16, 12, 0),
    color: "blue" as TEventColor,
    user: USERS_MOCK[3],
  },
  {
    id: 14,
    title: "Product demo",
    description: "Demo new features to stakeholders",
    startDate: currentMonthDate(17, 15, 0),
    endDate: currentMonthDate(17, 16, 0),
    color: "green" as TEventColor,
    user: USERS_MOCK[1],
  },
  {
    id: 15,
    title: "Yoga class",
    description: "Morning yoga session",
    startDate: currentMonthDate(18, 7, 0),
    endDate: currentMonthDate(18, 8, 0),
    color: "yellow" as TEventColor,
    user: USERS_MOCK[0],
  },
  {
    id: 16,
    title: "Conference call",
    description: "Call with remote team",
    startDate: currentMonthDate(20, 16, 0),
    endDate: currentMonthDate(20, 17, 0),
    color: "gray" as TEventColor,
    user: USERS_MOCK[1],
  },
  {
    id: 17,
    title: "Dentist appointment",
    description: "Regular cleaning",
    startDate: currentMonthDate(21, 14, 0),
    endDate: currentMonthDate(21, 15, 0),
    color: "red" as TEventColor,
    user: USERS_MOCK[2],
  },
  {
    id: 18,
    title: "Birthday celebration",
    description: "Alice's birthday party",
    startDate: currentMonthDate(22, 15, 0),
    endDate: currentMonthDate(22, 16, 0),
    color: "yellow" as TEventColor,
    user: USERS_MOCK[2],
  },
  {
    id: 19,
    title: "Monthly all-hands",
    description: "Company-wide meeting",
    startDate: currentMonthDate(24, 14, 0),
    endDate: currentMonthDate(24, 15, 0),
    color: "blue" as TEventColor,
    user: USERS_MOCK[0],
  },
  {
    id: 20,
    title: "End of month review",
    description: "Review monthly progress",
    startDate: currentMonthDate(28, 10, 0),
    endDate: currentMonthDate(28, 11, 0),
    color: "orange" as TEventColor,
    user: USERS_MOCK[3],
  },
];
