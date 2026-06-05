import Link from "next/link";

import { PublicSongFilters } from "@/components/public-song-filters";
import { SongListInfinite } from "@/components/song-list-infinite";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getHomepageStats, listSongYears, listSongs, resolveYearFilter, SONGS_PAGE_SIZE } from "@/lib/songs";

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    year?: string;
    rating?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const yearParam = params.year?.trim();
  const rating = params.rating ? Number(params.rating) : undefined;

  let songs;
  let years;

  try {
    years = await listSongYears();
    songs = await listSongs({ q, year: resolveYearFilter(yearParam, years[0]).year, rating, limit: SONGS_PAGE_SIZE, offset: 0 });
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Singles archive is not configured yet"
          description="The public list needs a database connection before it can load your singles ratings."
        />
      );
    }

    throw error;
  }

  const latestYear = years[0];
  const { value: selectedYearValue, year: selectedYear } = resolveYearFilter(yearParam, latestYear);
  const defaultYearValue = latestYear ? String(latestYear) : "all";
  const { total, averageRating, highRatedCount } = await getHomepageStats({ q, year: selectedYear, rating });

  return (
    <main className="page-shell flex flex-1 flex-col gap-6 pb-12">
      <header className="card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 border-b border-foreground/12 pb-8 lg:grid-cols-[1.75fr_0.95fr] lg:gap-10">
          <div className="space-y-5">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-foreground/58">Behroozreview single song rating</p>
            <div className="max-w-4xl space-y-4">
              <h1 className="text-5xl leading-none sm:text-7xl lg:text-[5.5rem]" style={{ fontFamily: "var(--font-title)" }}>
                Behroozreview single song rating archive
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-foreground/78 sm:text-base">
                Behroozreview tracks individual RapFarsi songs through rating, year, and source context with a cleaner editorial lens.
              </p>
            </div>

            <div className="grid gap-2 border-t border-foreground/12 pt-5 sm:max-w-3xl sm:grid-cols-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Total</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{total}</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Average</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{averageRating}/9</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">7+ Rated</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{highRatedCount}</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Year</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{selectedYearValue === "all" ? "All" : selectedYearValue}</p>
              </div>
            </div>
          </div>

          <aside className="flex flex-col justify-between gap-6 border-t border-foreground/12 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <div className="space-y-3 text-sm text-foreground/78">
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-foreground/55">Elsewhere</p>
              <a className="block border-b border-foreground/12 pb-2 transition-colors hover:text-foreground/100" href="https://x.com/behroozreview" target="_blank" rel="noreferrer">
                Twitter
              </a>
              <a className="block border-b border-foreground/12 pb-2 transition-colors hover:text-foreground/100" href="https://behroozqa.wordpress.com/" target="_blank" rel="noreferrer">
                Articles
              </a>
              <a className="block border-b border-foreground/12 pb-2 transition-colors hover:text-foreground/100" href="https://soundcloud.com/davandeh" target="_blank" rel="noreferrer">
                Podcast
              </a>
            </div>

            <div className="grid gap-2">
              <Link className="button button-primary" href="/stats">
                Read the stats
              </Link>
            </div>
          </aside>
        </div>

        <PublicSongFilters
          key={`${q ?? ""}|${selectedYearValue}|${params.rating ?? ""}`}
          years={years}
          initialQ={q}
          initialYear={selectedYearValue}
          defaultYear={defaultYearValue}
          initialRating={params.rating}
        />
      </header>

      <section className="card overflow-hidden">
        <div className="grid gap-2 border-b border-foreground/10 bg-[var(--surface-muted)] px-5 py-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-foreground/55">Archive</p>
            <p className="mt-1 text-2xl leading-none" style={{ fontFamily: "var(--font-title)" }}>
              {total} singles in view
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/55">Sorted by latest year</p>
        </div>

        <SongListInfinite
          key={`${q ?? ""}|${selectedYearValue}|${params.rating ?? ""}`}
          initialSongs={songs}
          total={total}
          q={q}
          year={selectedYearValue}
          rating={params.rating}
        />
      </section>
    </main>
  );
}
