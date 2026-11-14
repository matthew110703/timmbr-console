"use client";

import React, { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Inline,
  Input,
  Select,
  Stack,
  Text,
  toast,
} from "@timmbr/ui";
import { strings } from "@/app/(console)/users/strings";
import {
  createUserSchema,
  zodResolver,
  type CreateUserFormValues,
} from "@/app/(console)/users/validationSchema";
import { useIsMaster, usePermission } from "@/components/AuthContext";
import { CONSOLE_PERMISSIONS, type Permission } from "@/lib/auth/permissions";
import { STAFF_ASSIGNABLE_PERMISSIONS } from "@/app/(console)/users/types";
import { PermissionMatrix } from "./PermissionMatrix";

export interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isCallerMaster?: boolean;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  isCallerMaster = false,
}) => {
  const [formError, setFormError] = useState<string | null>(null);

  const isMasterHook = useIsMaster();
  const isMaster = Boolean(isCallerMaster || isMasterHook);
  const canCreateUsers = usePermission(CONSOLE_PERMISSIONS.USERS_CREATE);
  const canCreateAdmins = usePermission(CONSOLE_PERMISSIONS.ADMINS_CREATE);

  const canStaff = isMaster || canCreateUsers;
  const canAdmin = isMaster || canCreateAdmins;
  const defaultRole: "STAFF" | "ADMIN" = canStaff ? "STAFF" : "ADMIN";

  const roleOptions = useMemo(
    () => [
      {
        value: "STAFF",
        label: strings.createDialog.roleStaff,
        disabled: !canStaff,
      },
      {
        value: "ADMIN",
        label: strings.createDialog.roleAdmin,
        disabled: !canAdmin,
      },
    ],
    [canStaff, canAdmin],
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: defaultRole,
      permissions: [],
    },
  });

  const selectedRole = useWatch({
    control,
    name: "role",
    defaultValue: defaultRole,
  });
  const selectedPermissions = useWatch({
    control,
    name: "permissions",
    defaultValue: [],
  });

  const onSubmit = async (values: CreateUserFormValues) => {
    setFormError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || strings.toasts.createError);
      }

      toast.success(
        strings.toasts.inviteSuccess,
        strings.toasts.inviteSuccessDesc,
      );
      reset({
        name: "",
        email: "",
        role: defaultRole,
        permissions: [],
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : strings.toasts.createError,
      );
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormError(null);
    reset({
      name: "",
      email: "",
      role: defaultRole,
      permissions: [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b border-border/40">
          <DialogTitle>{strings.createDialog.title}</DialogTitle>
          <DialogDescription>
            {strings.createDialog.description}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
            {formError && (
              <Alert variant="destructive" title={strings.toasts.createError}>
                <Text
                  variant="caption"
                  className="text-destructive-foreground mt-1"
                >
                  {formError}
                </Text>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={strings.createDialog.nameLabel}
                placeholder={strings.createDialog.namePlaceholder}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                type="email"
                label={strings.createDialog.emailLabel}
                placeholder={strings.createDialog.emailPlaceholder}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <Select
              containerClassName="w-full"
              label={strings.createDialog.roleLabel}
              options={roleOptions}
              value={selectedRole}
              onValueChange={(val) => {
                const nextRole = val as "STAFF" | "ADMIN";
                setValue("role", nextRole);
                if (nextRole === "STAFF") {
                  setValue(
                    "permissions",
                    selectedPermissions.filter((p) =>
                      STAFF_ASSIGNABLE_PERMISSIONS.includes(p as Permission),
                    ),
                  );
                }
              }}
            />

            <Stack gap={3} className="pt-4 border-t border-border/40">
              <Stack gap={1}>
                <Text
                  variant="body-2"
                  className="font-semibold text-foreground"
                >
                  {strings.createDialog.permissionsTitle}
                </Text>
                <Text variant="caption" foreground="muted">
                  {strings.createDialog.permissionsDescription}
                </Text>
              </Stack>

              <PermissionMatrix
                selectedPermissions={selectedPermissions}
                onChange={(perms) => setValue("permissions", perms)}
                targetRole={selectedRole}
                isCallerMaster={isMaster}
              />
            </Stack>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-border/40 bg-muted/20 shrink-0">
            <Inline gap={2} justify="end" align="center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {strings.createDialog.cancel}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isSubmitting
                  ? strings.createDialog.submitting
                  : strings.createDialog.submit}
              </Button>
            </Inline>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
