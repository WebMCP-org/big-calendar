"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useEventDialog, type AddEventPrefill, type DialogResult } from "@/calendar/contexts/event-dialog-context";
import { EventFormDialogContent, buildEventDraft, prefillToEventFormValues } from "@/calendar/components/dialogs/event-form-dialog-content";

import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { eventSchema } from "@/calendar/schemas";

import type { IEvent } from "@/calendar/interfaces";
import type { TEventFormData } from "@/calendar/schemas";

interface IProps {
  children?: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

function AddEventFormFields({ isAI, prefill, onClose }: { isAI: boolean; prefill?: AddEventPrefill; onClose: (result: DialogResult) => void }) {
  const { users, addEvent } = useCalendar();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: prefillToEventFormValues(prefill),
  });

  const handleSubmit = useCallback(
    async (values: TEventFormData) => {
      const user = users.find(u => u.id === values.user);
      if (!user) {
        throw new Error(`User with ID ${values.user} not found`);
      }

      const eventDraft = buildEventDraft(values, user);
      const newId = await addEvent(eventDraft);
      const event: IEvent = { id: newId, ...eventDraft };

      onClose({
        success: true,
        event,
      });
      form.reset();
    },
    [users, addEvent, onClose, form]
  );

  return (
    <EventFormDialogContent
      form={form}
      formId="add-event-form"
      idPrefix="add-event"
      isAI={isAI}
      users={users}
      submitLabel="Create Event"
      onCancel={() => onClose({ success: false, cancelled: true })}
      onSubmit={handleSubmit}
    />
  );
}

// Controlled mode — rendered once in ControlledDialogs, driven by EventDialogContext
export function ControlledAddEventDialog() {
  const { addDialogState, closeAddDialog } = useEventDialog();

  return (
    <Dialog
      open={addDialogState.isOpen}
      onOpenChange={open => {
        if (!open) closeAddDialog({ success: false, cancelled: true });
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Fill in the details below to create a new calendar event.</DialogDescription>
        </DialogHeader>
        {addDialogState.isOpen && (
          <AddEventFormFields isAI={addDialogState.source === "ai"} prefill={addDialogState.data} onClose={result => closeAddDialog(result)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Trigger mode — used inline with a button trigger (e.g. "+ Add Event")
export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Fill in the details below to create a new calendar event.</DialogDescription>
        </DialogHeader>
        {isOpen && <AddEventFormFields isAI={false} prefill={{ startDate, startTime }} onClose={() => setIsOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
