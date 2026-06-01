"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PublicSongFiltersProps = {
  years: number[];
  initialQ?: string;
  initialYear: string;
  initialRating?: string;
};

export function PublicSongFilters({ years, initialQ, initialYear, initialRating }: PublicSongFiltersProps) {
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

      if (year && year !== initialYear) {
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
  }, [q, year, rating, searchParams, pathname, router, initialYear]);

  return (
    <form className="mt-5 flex flex-wrap gap-2" action="/" method="get" onSubmit={(event) => event.preventDefault()}>
      <input
        className="pill min-w-60"
        type="search"
        name="q"
        placeholder="Search single title or artist"
        value={q}
        onChange={(event) => setQ(event.target.value)}
      />
      <select className="pill w-40" name="year" value={year} onChange={(event) => setYear(event.target.value)}>
        <option value="all">All years</option>
        {years.map((itemYear) => (
          <option key={itemYear} value={itemYear}>
            {itemYear}
          </option>
        ))}
      </select>
      <input
        className="pill w-28"
        type="number"
        min={0}
        max={9}
        name="rating"
        placeholder="Rating"
        value={rating}
        onChange={(event) => setRating(event.target.value)}
      />
      <Link className="button" href="/">
        Reset
      </Link>
    </form>
  );
}
