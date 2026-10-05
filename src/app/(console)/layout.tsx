import Link from "next/link";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@timmbr/ui";
import { ConsoleSidebar } from "@/components";
import {
  ACCESS_TOKEN_COOKIE,
  isTokenExpired,
  isTokenAuthorized,
} from "@timmbr/utils";
import { authApi } from "@/app/(auth)/api";
import { strings } from "./strings";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const headersList = await headers();
  const activePath = headersList.get("x-pathname") || "/overview";

  if (!token || isTokenExpired(token) || !isTokenAuthorized(token)) {
    redirect(`/login?from=${encodeURIComponent(activePath)}`);
  }

  const userProfile = await authApi.getProfile(token);

  const isCollapsed =
    cookieStore.get("timmbr_sidebar_collapsed")?.value === "true";

  return (
    <div className="h-screen w-full flex overflow-hidden bg-grey-50">
      {/* Enterprise SideBarNavigation Shell */}
      <aside className="shrink-0 h-screen sticky top-0 z-30">
        <ConsoleSidebar
          initialActivePath={activePath}
          defaultCollapsed={isCollapsed}
          user={userProfile}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-grey-200 bg-white flex items-center justify-between px-8 shrink-0 z-20">
          <div className="text-sm font-semibold text-grey-900 tracking-tight">
            {strings.header.administration}
          </div>
          <Link
            href="/login"
            className="text-xs font-medium text-grey-500 hover:text-grey-900 transition-colors"
          >
            {strings.header.logout}
          </Link>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Container maxWidth="2xl" padded={false}>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
