import Link from "next/link";

import { requireAdminPage } from "@/lib/admin-guard";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminPage();

  return (
    <main className="page-shell pb-10">
      <header className="card mb-4 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-foreground/65">Admin</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
              RapFarsi Control Panel
            </h1>
            <p className="text-sm text-foreground/70">Signed in as {session.user?.email}</p>
          </div>
          <Link className="pill" href="/api/auth/signout">
            Sign out
          </Link>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link className="pill" href="/admin">
            Dashboard
          </Link>
          <Link className="pill" href="/admin/songs">
            Songs
          </Link>
          <Link className="pill" href="/admin/songs/new">
            Add Song
          </Link>
          <Link className="pill" href="/admin/import">
            CSV Import
          </Link>
          <Link className="pill" href="/">
            Public View
          </Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
