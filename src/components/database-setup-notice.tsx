import Link from "next/link";

type DatabaseSetupNoticeProps = {
  title: string;
  description: string;
};

export function DatabaseSetupNotice({ title, description }: DatabaseSetupNoticeProps) {
  return (
    <main className="page-shell flex flex-1 flex-col gap-4 pb-10">
      <section className="card p-6 sm:p-7">
        <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Setup required</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl" style={{ fontFamily: "var(--font-title)" }}>
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75 sm:text-base">{description}</p>
        <p className="mt-3 rounded-lg border border-foreground/10 bg-[var(--surface-muted)] px-3 py-2 text-sm leading-6 text-foreground/78">
          Add a <strong>DATABASE_URL</strong> environment variable in your local env or in Vercel project
          settings, then reload the page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="button button-primary" href="/">
            Back to home
          </Link>
          <Link className="button" href="/admin">
            Admin panel
          </Link>
        </div>
      </section>
    </main>
  );
}