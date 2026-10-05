"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Package,
  Tags,
  Award,
  User,
  LogOut,
} from "lucide-react";
import {
  SideBarNavigation,
  toast,
  type NavItem,
  type SidebarBrandingConfig,
  type SidebarProfileConfig,
} from "@timmbr/ui";
import { ASSETS } from "@/../public";
import { authApi } from "@/app/(auth)/api/auth";
import { strings } from "@/app/(console)/strings";
import type { UserProfile } from "@/types/auth";
import { ProfileDialog } from "./ProfileDialog";

interface ConsoleSidebarProps {
  initialActivePath?: string;
  defaultCollapsed?: boolean;
  user?: UserProfile | null;
}

export function ConsoleSidebar({
  initialActivePath,
  defaultCollapsed = false,
  user,
}: ConsoleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || initialActivePath || "/overview";
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = React.useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      router.replace("/login");
    } catch (err: unknown) {
      setIsLoggingOut(false);
      const message =
        err instanceof Error && err.message
          ? err.message
          : strings.profile.logoutErrorDescription;
      toast.error(strings.profile.logoutErrorTitle, message);
    }
  }, [isLoggingOut, router]);

  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        label: strings.nav.overview,
        href: "/overview",
        icon: <LayoutDashboard className="size-5" />,
      },
      {
        label: strings.nav.catalog,
        icon: <Layers className="size-5" />,
        items: [
          {
            label: strings.nav.products,
            href: "/products",
            icon: <Package className="size-4" />,
          },
          {
            label: strings.nav.categories,
            href: "/categories",
            icon: <Tags className="size-4" />,
          },
          {
            label: strings.nav.brands,
            href: "/brands",
            icon: <Award className="size-4" />,
          },
        ],
      },
    ],
    [],
  );

  const brandingConfig: SidebarBrandingConfig = React.useMemo(
    () => ({
      logo: (
        <Image
          src={ASSETS.miniLogo}
          alt={strings.branding.logoAlt}
          width={32}
          height={32}
          priority
          className="size-8 object-contain shrink-0"
        />
      ),
      collapsedLogo: (
        <Image
          src={ASSETS.miniLogo}
          alt={strings.branding.logoAlt}
          width={32}
          height={32}
          priority
          className="size-8 object-contain shrink-0"
        />
      ),
      title: strings.branding.title,
      subtitle: strings.branding.subtitle,
      href: "/overview",
    }),
    [],
  );

  const profileConfig: SidebarProfileConfig = React.useMemo(
    () => ({
      name: user?.name || "—",
      email: user?.email || "—",
      items: [
        {
          label: strings.profile.viewProfile,
          onClick: () => setIsProfileOpen(true),
          icon: <User className="size-4" />,
        },
        {
          label: strings.profile.logout,
          onClick: handleLogout,
          disabled: isLoggingOut,
          destructive: true,
          icon: <LogOut className="size-4" />,
        },
      ],
    }),
    [user?.name, user?.email, handleLogout, isLoggingOut],
  );

  return (
    <>
      <SideBarNavigation
        items={navItems}
        activePath={currentPath}
        defaultCollapsed={defaultCollapsed}
        branding={brandingConfig}
        profile={profileConfig}
        linkComponent={Link}
      />

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profile={user}
      />
    </>
  );
}
