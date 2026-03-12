"use client";

import { ControlledAddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { ControlledEditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import { DeleteConfirmDialog } from "@/calendar/components/dialogs/delete-confirm-dialog";

export function ControlledDialogs() {
  return (
    <>
      <ControlledAddEventDialog />
      <ControlledEditEventDialog />
      <DeleteConfirmDialog />
    </>
  );
}
