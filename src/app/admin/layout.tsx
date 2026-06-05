import Link from "next/link";

import { auth } from "@/auth";
import { AuthSetupNotice } from "@/components/auth-setup-notice";
import { isAuthConfigured } from "@/lib/auth-config";
import { isAdminEmail } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!isAuthConfigured()) {
    return <AuthSetupNotice />;
  }

  const session = await auth();

  if (!session?.user?.email) {
    return (
      <main className="page-shell pb-10">
        <section className="card p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl" style={{ fontFamily: "var(--font-title)" }}>
            Sign in to access admin panel
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75">
            You need to sign in with an allowed admin account before you can manage songs.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="button button-primary" href="/api/auth/signin">
              Sign in
            </Link>
            <Link className="button" href="/">
              Back to home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="page-shell pb-10">
        <section className="card p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl" style={{ fontFamily: "var(--font-title)" }}>
            This account is not authorized
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75">
            Your account is signed in, but it is not included in ADMIN_EMAILS.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="button" href="/api/auth/signout">
              Sign out
            </Link>
            <Link className="button" href="/">
              Back to home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell pb-10">
      <header className="card mb-4 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Admin</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl" style={{ fontFamily: "var(--font-title)" }}>
              RapFarsi Control Panel
            </h1>
            <p className="text-sm text-foreground/70">Signed in as {session.user?.email}</p>
          </div>
          <Link className="button" href="/api/auth/signout">
            Sign out
          </Link>
        </div>

        <nav className="mt-5 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Link className="button" href="/admin">
            Dashboard
          </Link>
          <Link className="button" href="/admin/songs">
            Songs
          </Link>
          <Link className="button" href="/admin/songs/new">
            Add Song
          </Link>
          <Link className="button" href="/admin/import">
            CSV Import
          </Link>
          <Link className="button" href="/">
            Public View
          </Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
