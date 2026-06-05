import Link from "next/link";

export function AuthSetupNotice() {
  return (
    <main className="page-shell flex flex-1 flex-col gap-4 pb-10">
      <section className="card p-6 sm:p-7">
        <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Setup required</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl" style={{ fontFamily: "var(--font-title)" }}>
          Admin access is not configured yet
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75 sm:text-base">
          The admin area needs GitHub auth settings before sign-in can start.
        </p>
        <p className="mt-3 rounded-lg border border-foreground/10 bg-[var(--surface-muted)] px-3 py-2 text-sm leading-6 text-foreground/78">
          Add <strong>GITHUB_ID</strong>, <strong>GITHUB_SECRET</strong>, and <strong>NEXTAUTH_SECRET</strong>
          , then reload the page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="button button-primary" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}