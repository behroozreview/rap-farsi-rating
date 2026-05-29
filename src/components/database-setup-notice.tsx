import Link from "next/link";

type DatabaseSetupNoticeProps = {
  title: string;
  description: string;
};

export function DatabaseSetupNotice({ title, description }: DatabaseSetupNoticeProps) {
  return (
    <main className="page-shell flex flex-1 flex-col gap-4 pb-10">
      <section className="card p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-foreground/65">Setup required</p>
        <h1 className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75">{description}</p>
        <p className="mt-3 text-sm leading-6 text-foreground/75">
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