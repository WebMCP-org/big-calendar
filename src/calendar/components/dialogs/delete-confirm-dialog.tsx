"use client";

import { useCallback } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useEventDialog } from "@/calendar/contexts/event-dialog-context";
import { useAICountdown } from "@/calendar/hooks/use-ai-countdown";
import { CountdownBar } from "@/calendar/components/dialogs/event-form-dialog-content";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function DeleteConfirmDialog() {
  const { deleteEvent } = useCalendar();
  const { deleteDialogState, closeDeleteDialog } = useEventDialog();

  const event = deleteDialogState.data;
  const isAI = deleteDialogState.source === "ai" && deleteDialogState.isOpen;

  const handleConfirm = useCallback(async () => {
    if (!event) return;
    await deleteEvent(event.id);
    closeDeleteDialog({ success: true, event });
  }, [event, deleteEvent, closeDeleteDialog]);

  const handleCancel = useCallback(() => {
    closeDeleteDialog({ success: false, cancelled: true });
  }, [closeDeleteDialog]);

  const { progress, isRunning } = useAICountdown({
    isAI,
    duration: 5000,
    onComplete: handleConfirm,
    onCancel: handleCancel,
  });

  return (
    <Dialog
      open={deleteDialogState.isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{event?.title}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <CountdownBar isRunning={isRunning} progress={progress} indicatorClassName="bg-destructive" />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
