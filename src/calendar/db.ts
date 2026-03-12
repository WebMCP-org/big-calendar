import Dexie, { type EntityTable } from "dexie";

import type { IEvent, IUser } from "@/calendar/interfaces";

const db = new Dexie("BigCalendarDB") as Dexie & {
  events: EntityTable<IEvent, "id">;
  users: EntityTable<IUser, "id">;
};

db.version(1).stores({
  events: "++id, startDate, endDate, user.id",
  users: "id",
});

export { db };
