"use client";

import React, { useMemo, useState } from "react";
import {
  DataTable,
  TablePagination,
  Button,
  Input,
  Select,
  Card,
  EmptyState,
  Inline,
  Stack,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
} from "@timmbr/ui";
import { Users, Search, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { strings } from "@/app/(console)/users/strings";
import type { AdminUserListItem } from "@/app/(console)/users/types";
import type { PaginationMeta } from "@/app/(console)/transactions/hooks/useTransactionList";
import {
  useAuthUser,
  useIsMaster,
  useAnyPermission,
} from "@/components/AuthContext";
import { CONSOLE_PERMISSIONS } from "@/lib/auth/permissions";
import { createUserColumns } from "./userColumns";
import {
  useUserList,
  type RoleFilterValue,
  type StatusFilterValue,
} from "./useUserList";
import { CreateUserDialog } from "./CreateUserDialog";
import { UserDetailsDrawer } from "./UserDetailsDrawer";

export interface UserListViewProps {
  initialData: AdminUserListItem[];
  meta: PaginationMeta;
}

const ROLE_TABS: { label: string; value: RoleFilterValue }[] = [
  { label: strings.tabs.all, value: "ALL" },
  { label: strings.tabs.customers, value: "USER" },
  { label: strings.tabs.staff, value: "STAFF" },
  { label: strings.tabs.admins, value: "ADMIN" },
];

const STATUS_OPTIONS: { label: string; value: StatusFilterValue }[] = [
  { label: strings.toolbar.statusFilterAll, value: "ALL" },
  { label: strings.statusBadge.ACTIVE, value: "ACTIVE" },
  { label: strings.statusBadge.DELETED, value: "DELETED" },
];

export const UserListView: React.FC<UserListViewProps> = ({
  initialData,
  meta: initialMeta,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const authUser = useAuthUser();
  const isMaster = useIsMaster();
  const canInviteAny = useAnyPermission([
    CONSOLE_PERMISSIONS.USERS_CREATE,
    CONSOLE_PERMISSIONS.ADMINS_CREATE,
  ]);

  const {
    users,
    meta,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    handleRoleChange,
    statusFilter,
    handleStatusChange,
    pageSize,
    isFiltered,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    refresh,
  } = useUserList(initialData, initialMeta);

  const columns = useMemo(() => createUserColumns(), []);

  return (
    <Stack gap={4} className="flex-1 min-h-0">
      <PageHeader
        title={strings.header.title}
        description={strings.header.subtitle}
        action={
          canInviteAny ? (
            <Button
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="size-4" />}
            >
              {strings.header.newUser}
            </Button>
          ) : (
            <Tooltip content={strings.tooltips.noInvitePermission}>
              <span className="inline-flex">
                <Button disabled leftIcon={<Plus className="size-4" />}>
                  {strings.header.newUser}
                </Button>
              </span>
            </Tooltip>
          )
        }
      />

      {/* ── Role Filter Tabs ── */}
      <Tabs
        value={roleFilter}
        onValueChange={(val) => handleRoleChange(val as RoleFilterValue)}
        variant="underline"
      >
        <TabsList>
          {ROLE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Search & Filter Toolbar ── */}
      <Inline
        gap={3}
        align="center"
        wrap
        justify="between"
        className="shrink-0"
      >
        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-md">
          <Input
            placeholder={strings.toolbar.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftAdornment={<Search className="size-4 text-muted-foreground" />}
            rightAdornment={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              ) : undefined
            }
          />
        </div>

        <Inline gap={2} wrap align="center" className="shrink-0">
          <Select
            containerClassName="w-48 shrink-0"
            className={
              statusFilter !== "ALL"
                ? "border-primary ring-1 ring-primary/20 shadow-xs"
                : undefined
            }
            options={STATUS_OPTIONS}
            value={statusFilter}
            onValueChange={(val) =>
              handleStatusChange(val as StatusFilterValue)
            }
          />

          {isFiltered ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              leftIcon={<X className="size-4" />}
            >
              {strings.toolbar.clearFilters}
            </Button>
          ) : null}
        </Inline>
      </Inline>

      {/* ── Content View: EmptyState or DataTable ── */}
      {users.length === 0 && !isLoading ? (
        <Card
          variant="subtle"
          className="flex-1 min-h-[260px] flex items-center justify-center border border-dashed border-border rounded-2xl bg-card"
        >
          <EmptyState
            fullWidth
            icon={<Users className="size-8 text-primary" />}
            title={strings.empty.title}
            description={
              isFiltered || roleFilter !== "ALL"
                ? strings.empty.filteredDescription
                : strings.empty.description
            }
            action={
              isFiltered ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  leftIcon={<X className="size-4" />}
                >
                  {strings.toolbar.clearFilters}
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <DataTable
            data={users}
            columns={columns}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            stickyHeader
            containerClassName="flex-1 min-h-0 h-full overflow-auto border-0 rounded-none [&_tbody_tr]:transition-colors [&_tbody_tr]:hover:bg-muted/40 cursor-pointer"
            onRowClick={(row) => {
              setSelectedUser(row.original);
              setIsDetailsOpen(true);
            }}
            emptyMessage={
              <div className="p-8 text-center text-muted-foreground">
                {strings.empty.filteredDescription}
              </div>
            }
          />

          <TablePagination
            className="shrink-0 bg-card border-t border-border"
            page={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* ── Create User Modal ── */}
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refresh}
        isCallerMaster={isMaster}
      />

      {/* ── User Details & Edit Drawer ── */}
      <UserDetailsDrawer
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        user={selectedUser}
        onSuccess={refresh}
        callerId={authUser?.id}
        isCallerMaster={isMaster}
      />
    </Stack>
  );
};
