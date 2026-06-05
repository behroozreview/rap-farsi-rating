"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PublicSongFiltersProps = {
  years: number[];
  initialQ?: string;
  initialYear: string;
  defaultYear: string;
  initialRating?: string;
};

export function PublicSongFilters({
  years,
  initialQ,
  initialYear,
  defaultYear,
  initialRating,
}: PublicSongFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ ?? "");
  const [year, setYear] = useState(initialYear);
  const [rating, setRating] = useState(initialRating ?? "");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      const trimmedQ = q.trim();
      if (trimmedQ) {
        params.set("q", trimmedQ);
      } else {
        params.delete("q");
      }

      if (year === "all") {
        params.set("year", "all");
      } else if (year && year !== defaultYear) {
        params.set("year", year);
      } else {
        params.delete("year");
      }

      const trimmedRating = rating.trim();
      if (trimmedRating) {
        params.set("rating", trimmedRating);
      } else {
        params.delete("rating");
      }

      const query = params.toString();
      const currentQuery = searchParams.toString();
      if (query === currentQuery) {
        return;
      }

      const nextUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [q, year, rating, searchParams, pathname, router, defaultYear]);

  return (
    <form className="mt-8 grid gap-3 border-t border-foreground/12 pt-6 md:grid-cols-[1.8fr_0.8fr_0.8fr_auto]" action="/" method="get" onSubmit={(event) => event.preventDefault()}>
      <label className="flex flex-col gap-1.5 text-[0.8rem] font-medium uppercase tracking-[0.18em] text-foreground/72">
        Search
        <input
          className="pill min-w-0"
          type="search"
          name="q"
          placeholder="Song title or artist"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[0.8rem] font-medium uppercase tracking-[0.18em] text-foreground/72">
        Year
        <select className="pill" name="year" value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="all">All years</option>
          {years.map((itemYear) => (
            <option key={itemYear} value={itemYear}>
              {itemYear}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-[0.8rem] font-medium uppercase tracking-[0.18em] text-foreground/72">
        Min rating
        <select className="pill" name="rating" value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="">Any</option>
          {Array.from({ length: 10 }, (_, item) => (
            <option key={item} value={item}>
              {item}+
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end">
        <Link className="button w-full md:w-auto" href="/">
          Reset filters
        </Link>
      </div>

      <p className="text-xs uppercase tracking-[0.18em] text-foreground/55 md:col-span-4">Filters update automatically as you type and select.</p>
    </form>
  );
}
