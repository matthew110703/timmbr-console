"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Button,
  Select,
  FormField,
  Textarea,
} from "@timmbr/ui";
import { strings } from "../strings";
import {
  logOrderActivitySchema,
  zodResolver,
  type LogOrderActivityFormValues,
} from "../validationSchema";
import type { ManufacturingEventType } from "../types";

export interface LogActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowedEventTypes: ManufacturingEventType[];
  isSubmitting: boolean;
  onSubmit: (values: LogOrderActivityFormValues) => Promise<void>;
}

export const LogActivityDialog: React.FC<LogActivityDialogProps> = ({
  open,
  onOpenChange,
  allowedEventTypes,
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<LogOrderActivityFormValues>({
    resolver: zodResolver(logOrderActivitySchema),
    defaultValues: {
      eventType: allowedEventTypes[0] ?? "MANUFACTURING_UPDATE",
      description: "",
    },
  });

  useEffect(() => {
    if (open && allowedEventTypes.length > 0) {
      form.reset({
        eventType: allowedEventTypes[0],
        description: "",
      });
    }
  }, [open, allowedEventTypes, form]);

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      description: values.description?.trim() || undefined,
    });
  });

  const eventOptions = allowedEventTypes.map((t) => ({
    value: t,
    label:
      strings.events[t as keyof typeof strings.events] ??
      t.replaceAll("_", " "),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{strings.dialogs.logActivityTitle}</DialogTitle>
          <DialogDescription>
            {strings.dialogs.logActivityDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <DialogBody className="space-y-4">
            {allowedEventTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {strings.dialogs.noActivitiesAvailable}
              </p>
            ) : (
              <>
                <FormField label={strings.dialogs.eventType}>
                  <Select
                    options={eventOptions}
                    value={form.watch("eventType")}
                    onValueChange={(val) =>
                      form.setValue("eventType", val as ManufacturingEventType)
                    }
                  />
                </FormField>
                <FormField label={strings.dialogs.description}>
                  <Textarea
                    rows={4}
                    value={form.watch("description") ?? ""}
                    onChange={(e) =>
                      form.setValue("description", e.target.value)
                    }
                  />
                </FormField>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {strings.dialogs.cancel}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={allowedEventTypes.length === 0}
            >
              {isSubmitting
                ? strings.dialogs.logSaving
                : strings.dialogs.logConfirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
