import Link from "next/link";

const navItems = [{ label: "Dashboard", href: "/dashboard" }];

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Foundational Navigation Shell Placeholder */}
      <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col p-4">
        <div className="font-bold text-lg px-3 py-2 mb-4 tracking-tight">
          Timmbr Console
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-neutral-200 text-xs text-neutral-400 px-3">
          Console Shell Foundation
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6">
          <div className="text-sm text-neutral-500 font-medium">
            Administration
          </div>
          <Link
            href="/login"
            className="text-xs text-neutral-500 hover:text-neutral-900"
          >
            Sign out
          </Link>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
