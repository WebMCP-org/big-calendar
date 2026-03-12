"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useEventDialog, type DialogResult } from "@/calendar/contexts/event-dialog-context";
import { EventFormDialogContent, buildEventDraft, eventToEventFormValues } from "@/calendar/components/dialogs/event-form-dialog-content";

import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { eventSchema } from "@/calendar/schemas";

import type { IEvent } from "@/calendar/interfaces";
import type { TEventFormData } from "@/calendar/schemas";

function EditEventFormFields({ event, isAI, onClose }: { event: IEvent; isAI: boolean; onClose: (result: DialogResult) => void }) {
  const { users, updateEvent } = useCalendar();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventToEventFormValues(event),
  });

  const handleSubmit = useCallback(
    async (values: TEventFormData) => {
      const user = users.find(u => u.id === values.user);
      if (!user) {
        throw new Error(`User with ID ${values.user} not found`);
      }

      const updatedEvent: IEvent = {
        ...event,
        ...buildEventDraft(values, user),
      };

      await updateEvent(updatedEvent);
      onClose({ success: true, event: updatedEvent });
    },
    [users, event, updateEvent, onClose]
  );

  return (
    <EventFormDialogContent
      form={form}
      formId="edit-event-form"
      idPrefix="edit-event"
      isAI={isAI}
      users={users}
      submitLabel="Save changes"
      onCancel={() => onClose({ success: false, cancelled: true })}
      onSubmit={handleSubmit}
    />
  );
}

// Controlled mode — rendered once in ControlledDialogs, driven by EventDialogContext
export function ControlledEditEventDialog() {
  const { editDialogState, closeEditDialog } = useEventDialog();

  return (
    <Dialog
      open={editDialogState.isOpen}
      onOpenChange={open => {
        if (!open) closeEditDialog({ success: false, cancelled: true });
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the event details below.</DialogDescription>
        </DialogHeader>
        {editDialogState.isOpen && editDialogState.data && (
          <EditEventFormFields event={editDialogState.data} isAI={editDialogState.source === "ai"} onClose={result => closeEditDialog(result)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Trigger mode — used inline with a button trigger (e.g. "Edit" button in details dialog)
export function EditEventDialog({ children, event }: { children: React.ReactNode; event: IEvent }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the event details below.</DialogDescription>
        </DialogHeader>
        {isOpen && <EditEventFormFields event={event} isAI={false} onClose={() => setIsOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
