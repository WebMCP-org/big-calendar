"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/calendar/db";
import { seedIfEmpty } from "@/calendar/db-seed";

import type { Dispatch, SetStateAction } from "react";
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TBadgeVariant, TVisibleHours, TWorkingHours } from "@/calendar/types";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  users: IUser[];
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  addEvent: (event: Omit<IEvent, "id">) => Promise<number>;
  updateEvent: (event: IEvent) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  isLoading: boolean;
}

const CalendarContext = createContext<ICalendarContext | null>(null);

const WORKING_HOURS = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 12 },
};

const VISIBLE_HOURS = { from: 7, to: 18 };

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] = useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");

  useEffect(() => {
    void seedIfEmpty();
  }, []);

  const liveEvents = useLiveQuery(() => db.events.toArray());
  const liveUsers = useLiveQuery(() => db.users.toArray());

  const events = liveEvents ?? [];
  const users = liveUsers ?? [];
  const isLoading = liveEvents === undefined || liveUsers === undefined;

  const addEvent = useCallback(async (event: Omit<IEvent, "id">): Promise<number> => {
    return db.events.add(event as IEvent);
  }, []);

  const updateEvent = useCallback(async (event: IEvent): Promise<void> => {
    await db.events.put(event);
  }, []);

  const deleteEvent = useCallback(async (id: number): Promise<void> => {
    await db.events.delete(id);
  }, []);

  const handleSelectDate = useCallback((date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  }, []);

  const value = useMemo<ICalendarContext>(
    () => ({
      selectedDate,
      setSelectedDate: handleSelectDate,
      selectedUserId,
      setSelectedUserId,
      badgeVariant,
      setBadgeVariant,
      users,
      visibleHours,
      setVisibleHours,
      workingHours,
      setWorkingHours,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      isLoading,
    }),
    [
      selectedDate,
      handleSelectDate,
      selectedUserId,
      badgeVariant,
      users,
      visibleHours,
      workingHours,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      isLoading,
    ]
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider.");
  }

  return context;
}
