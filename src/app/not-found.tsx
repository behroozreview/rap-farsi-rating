import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="card p-6">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
          Not found
        </h1>
        <p className="mt-2 text-foreground/70">The requested page or single does not exist.</p>
        <Link className="button button-primary mt-4 inline-block" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
