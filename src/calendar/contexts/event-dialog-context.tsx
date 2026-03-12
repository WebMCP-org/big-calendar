"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

import type { IEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

export interface AddEventPrefill {
  title?: string;
  description?: string;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  endDate?: Date;
  endTime?: { hour: number; minute: number };
  userId?: string;
  color?: TEventColor;
}

export type DialogSource = "human" | "ai";

export interface DialogResult {
  success: boolean;
  cancelled?: boolean;
  event?: IEvent;
}

interface DialogState<T> {
  isOpen: boolean;
  source: DialogSource;
  data?: T;
}

interface DialogController<T> {
  close: (result?: DialogResult) => void;
  open: (data?: T, options?: { source?: DialogSource }) => Promise<DialogResult>;
  state: DialogState<T>;
}

interface IEventDialogContext {
  addDialogState: DialogState<AddEventPrefill>;
  openAddDialog: (prefill?: AddEventPrefill, options?: { source?: DialogSource }) => Promise<DialogResult>;
  closeAddDialog: (result?: DialogResult) => void;

  editDialogState: DialogState<IEvent>;
  openEditDialog: (event: IEvent, options?: { source?: DialogSource }) => Promise<DialogResult>;
  closeEditDialog: (result?: DialogResult) => void;

  deleteDialogState: DialogState<IEvent>;
  openDeleteDialog: (event: IEvent, options?: { source?: DialogSource }) => Promise<DialogResult>;
  closeDeleteDialog: (result?: DialogResult) => void;
}

const EventDialogContext = createContext<IEventDialogContext | null>(null);

function useDialogController<T>(initialState: DialogState<T>): DialogController<T> {
  const [state, setState] = useState<DialogState<T>>(initialState);
  const resolverRef = useRef<((result: DialogResult) => void) | null>(null);

  const open = useCallback((data?: T, options?: { source?: DialogSource }) => {
    return new Promise<DialogResult>(resolve => {
      resolverRef.current = resolve;
      setState({
        isOpen: true,
        source: options?.source ?? "human",
        data,
      });
    });
  }, []);

  const close = useCallback((result?: DialogResult) => {
    setState({
      isOpen: false,
      source: "human",
    });

    resolverRef.current?.(result ?? { success: false, cancelled: true });
    resolverRef.current = null;
  }, []);

  return { state, open, close };
}

export function EventDialogProvider({ children }: { children: React.ReactNode }) {
  const addDialog = useDialogController<AddEventPrefill>({
    isOpen: false,
    source: "human",
  });
  const editDialog = useDialogController<IEvent>({
    isOpen: false,
    source: "human",
  });
  const deleteDialog = useDialogController<IEvent>({
    isOpen: false,
    source: "human",
  });

  return (
    <EventDialogContext.Provider
      value={{
        addDialogState: addDialog.state,
        openAddDialog: addDialog.open,
        closeAddDialog: addDialog.close,
        editDialogState: editDialog.state,
        openEditDialog: editDialog.open,
        closeEditDialog: editDialog.close,
        deleteDialogState: deleteDialog.state,
        openDeleteDialog: deleteDialog.open,
        closeDeleteDialog: deleteDialog.close,
      }}
    >
      {children}
    </EventDialogContext.Provider>
  );
}

export function useEventDialog(): IEventDialogContext {
  const context = useContext(EventDialogContext);
  if (!context) throw new Error("useEventDialog must be used within an EventDialogProvider.");
  return context;
}
