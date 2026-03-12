"use client";

import { useCallback, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { parseISO } from "date-fns";

import { useAICountdown } from "@/calendar/hooks/use-ai-countdown";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";
import type { AddEventPrefill } from "@/calendar/contexts/event-dialog-context";
import type { TEventFormData } from "@/calendar/schemas";
import type { TimeValue } from "react-aria-components";

const EVENT_COLOR_OPTIONS = [
  { value: "blue", label: "Blue", swatchClassName: "bg-blue-600" },
  { value: "green", label: "Green", swatchClassName: "bg-green-600" },
  { value: "red", label: "Red", swatchClassName: "bg-red-600" },
  { value: "yellow", label: "Yellow", swatchClassName: "bg-yellow-600" },
  { value: "purple", label: "Purple", swatchClassName: "bg-purple-600" },
  { value: "orange", label: "Orange", swatchClassName: "bg-orange-600" },
  { value: "gray", label: "Gray", swatchClassName: "bg-neutral-600" },
] as const satisfies ReadonlyArray<{
  label: string;
  swatchClassName: string;
  value: TEventColor;
}>;

function DateTimeRow({
  dateId,
  dateLabel,
  timeLabel,
  dateName,
  timeName,
}: {
  dateId: string;
  dateLabel: string;
  timeLabel: string;
  dateName: "startDate" | "endDate";
  timeName: "startTime" | "endTime";
}) {
  return (
    <div className="flex items-start gap-2">
      <FormField
        name={dateName}
        render={({ field, fieldState }) => (
          <FormItem className="flex-1">
            <FormLabel htmlFor={dateId}>{dateLabel}</FormLabel>
            <FormControl>
              <SingleDayPicker
                id={dateId}
                value={field.value}
                onSelect={date => field.onChange(date as Date)}
                placeholder="Select a date"
                data-invalid={fieldState.invalid}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={timeName}
        render={({ field, fieldState }) => (
          <FormItem className="flex-1">
            <FormLabel>{timeLabel}</FormLabel>
            <FormControl>
              <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function UserField({ users }: { users: IUser[] }) {
  return (
    <FormField
      name="user"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Responsible</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger data-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id} className="flex-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                        <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="truncate">{user.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ColorField() {
  return (
    <FormField
      name="color"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Color</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger data-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_COLOR_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`size-3.5 rounded-full ${option.swatchClassName}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CountdownBar({ isRunning, progress, indicatorClassName }: { indicatorClassName: string; isRunning: boolean; progress: number }) {
  if (!isRunning) {
    return null;
  }

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full transition-none ${indicatorClassName}`} style={{ width: `${progress}%` }} />
    </div>
  );
}

export function prefillToEventFormValues(prefill?: AddEventPrefill): Partial<TEventFormData> {
  if (!prefill) {
    return { title: "", description: "" };
  }

  return {
    title: prefill.title ?? "",
    description: prefill.description ?? "",
    startDate: prefill.startDate,
    startTime: prefill.startTime,
    endDate: prefill.endDate,
    endTime: prefill.endTime,
    user: prefill.userId,
    color: prefill.color,
  };
}

export function eventToEventFormValues(event: IEvent): TEventFormData {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  return {
    user: event.user.id,
    title: event.title,
    description: event.description,
    startDate,
    startTime: { hour: startDate.getHours(), minute: startDate.getMinutes() },
    endDate,
    endTime: { hour: endDate.getHours(), minute: endDate.getMinutes() },
    color: event.color,
  };
}

export function buildEventDraft(values: TEventFormData, user: IUser): Omit<IEvent, "id"> {
  const startDate = new Date(values.startDate);
  startDate.setHours(values.startTime.hour, values.startTime.minute, 0, 0);

  const endDate = new Date(values.endDate);
  endDate.setHours(values.endTime.hour, values.endTime.minute, 0, 0);

  return {
    title: values.title,
    description: values.description,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    color: values.color,
    user,
  };
}

export function EventFormDialogContent({
  form,
  formId,
  idPrefix,
  isAI,
  users,
  submitLabel,
  countdownIndicatorClassName = "bg-primary",
  onCancel,
  onSubmit,
}: {
  countdownIndicatorClassName?: string;
  form: UseFormReturn<TEventFormData>;
  formId: string;
  idPrefix: string;
  isAI: boolean;
  onCancel: () => void;
  onSubmit: (values: TEventFormData) => Promise<void> | void;
  submitLabel: string;
  users: IUser[];
}) {
  const handleAutoSubmit = useCallback(() => {
    void form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  const { progress, isRunning, pause } = useAICountdown({
    isAI,
    duration: 5000,
    onComplete: handleAutoSubmit,
    onCancel,
  });

  useEffect(() => {
    if (!isAI || !isRunning) {
      return;
    }

    const subscription = form.watch((_, { type }) => {
      if (type === "change") {
        pause();
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isAI, isRunning, pause]);

  return (
    <>
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <UserField users={users} />

          <FormField
            name="title"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={`${idPrefix}-title`}>Title</FormLabel>
                <FormControl>
                  <Input id={`${idPrefix}-title`} placeholder="Enter a title" data-invalid={fieldState.invalid} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DateTimeRow dateId={`${idPrefix}-start-date`} dateLabel="Start Date" timeLabel="Start Time" dateName="startDate" timeName="startTime" />
          <DateTimeRow dateId={`${idPrefix}-end-date`} dateLabel="End Date" timeLabel="End Time" dateName="endDate" timeName="endTime" />

          <ColorField />

          <FormField
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <CountdownBar isRunning={isRunning} progress={progress} indicatorClassName={countdownIndicatorClassName} />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
