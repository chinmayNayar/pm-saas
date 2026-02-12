import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col">
      <Link href="/dashboard" className="px-4 py-3 text-lg font-semibold hover:opacity-90">
        PM SaaS
      </Link>
      <nav className="flex-1 px-2 space-y-1 text-sm">
        <Link className="block rounded px-3 py-2 hover:bg-slate-800" href="/dashboard">
          Dashboard
        </Link>
        <Link className="block rounded px-3 py-2 hover:bg-slate-800" href="/boards/demo">
          Board (demo)
        </Link>
        <Link className="block rounded px-3 py-2 hover:bg-slate-800" href="/billing">
          Billing
        </Link>
      </nav>
    </aside>
  );
}

