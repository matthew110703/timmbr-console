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
  Input,
  Textarea,
} from "@timmbr/ui";
import { strings } from "../strings";
import {
  updateOrderStatusSchema,
  zodResolver,
  type UpdateOrderStatusFormValues,
} from "../validationSchema";
import type { OrderStatus } from "../types";

export interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowedStatuses: OrderStatus[];
  isSubmitting: boolean;
  onSubmit: (values: UpdateOrderStatusFormValues) => Promise<void>;
}

export const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  open,
  onOpenChange,
  allowedStatuses,
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<UpdateOrderStatusFormValues>({
    resolver: zodResolver(updateOrderStatusSchema),
    defaultValues: {
      status: allowedStatuses[0],
      notes: "",
      verificationCode: "",
    },
  });

  const selectedStatus = form.watch("status");

  useEffect(() => {
    if (open && allowedStatuses.length > 0) {
      form.reset({
        status: allowedStatuses[0],
        notes: "",
        verificationCode: "",
      });
    }
  }, [open, allowedStatuses, form]);

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      notes: values.notes?.trim() || undefined,
      verificationCode: values.verificationCode?.trim() || undefined,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{strings.dialogs.updateStatusTitle}</DialogTitle>
          <DialogDescription>
            {strings.dialogs.updateStatusDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <DialogBody className="space-y-4">
            {allowedStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {strings.dialogs.noTransitions}
              </p>
            ) : (
              <>
                <FormField label={strings.dialogs.newStatus}>
                  <Select
                    options={allowedStatuses.map((s) => ({
                      value: s,
                      label: strings.orderStatus[s],
                    }))}
                    value={form.watch("status")}
                    onValueChange={(val) =>
                      form.setValue("status", val as OrderStatus)
                    }
                  />
                </FormField>
                <FormField label={strings.dialogs.notes}>
                  <Textarea
                    rows={3}
                    value={form.watch("notes") ?? ""}
                    onChange={(e) => form.setValue("notes", e.target.value)}
                  />
                </FormField>
                {selectedStatus === "DELIVERED" ? (
                  <FormField label={strings.dialogs.verificationCode}>
                    <Input
                      value={form.watch("verificationCode") ?? ""}
                      onChange={(e) =>
                        form.setValue("verificationCode", e.target.value)
                      }
                    />
                  </FormField>
                ) : null}
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
              disabled={allowedStatuses.length === 0}
            >
              {isSubmitting ? strings.dialogs.saving : strings.dialogs.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
