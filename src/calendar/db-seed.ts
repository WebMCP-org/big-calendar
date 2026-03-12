import { db } from "@/calendar/db";
import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "@/calendar/mocks";

export async function seedIfEmpty(): Promise<void> {
  const count = await db.events.count();
  if (count === 0) {
    await db.transaction("rw", db.users, db.events, async () => {
      await db.users.bulkAdd(USERS_MOCK);
      await db.events.bulkAdd(CALENDAR_ITEMS_MOCK);
    });
  }
}
