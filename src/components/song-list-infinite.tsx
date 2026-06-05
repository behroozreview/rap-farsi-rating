"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { getPublicRatingClass } from "@/lib/song-colors";
import { SONGS_PAGE_SIZE } from "@/lib/constants";
import { SongSourceLink } from "@/components/song-source-link";
import { PublicSongTable } from "@/components/public-song-table";

export type SongRow = {
  id: number;
  title: string;
  artist: string | null;
  persianYear: number;
  rating: number;
  url: string | null;
};

type SongListInfiniteProps = {
  initialSongs: SongRow[];
  total: number;
  q?: string;
  year: string;
  rating?: string;
};

export function SongListInfinite({ initialSongs, total, q, year, rating }: SongListInfiniteProps) {
  const [songs, setSongs] = useState<SongRow[]>(initialSongs);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialSongs.length < total);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialSongs.length);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (year && year !== "all") params.set("year", year);
      else if (year === "all") params.set("year", "all");
      if (rating) params.set("rating", rating);
      params.set("offset", String(offsetRef.current));
      params.set("limit", String(SONGS_PAGE_SIZE));

      const res = await fetch(`/api/songs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load songs");

      const data = (await res.json()) as { songs: SongRow[]; total: number; hasMore: boolean };

      setSongs((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newSongs = data.songs.filter((s) => !existingIds.has(s.id));
        return [...prev, ...newSongs];
      });
      offsetRef.current += data.songs.length;
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, q, year, rating]);

  // Intersection observer on sentinel element
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      {/* Mobile card list */}
      <div className="md:hidden">
        <ul className="divide-y divide-foreground/10">
          {songs.map((song) => (
            <li key={song.id} className={`${getPublicRatingClass(song.rating)} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/songs/${song.id}`}
                    className="text-xl leading-snug hover:underline"
                    style={{ fontFamily: "var(--font-title)" }}
                  >
                    {song.title}
                  </Link>
                  <p className="text-sm text-foreground/75">{song.artist || "Unknown artist"}</p>
                </div>
                <span className="rounded-sm border border-foreground/15 bg-white/65 px-2 py-0.5 text-xs font-semibold">
                  {song.rating}/9
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-foreground/75">
                <span>{song.persianYear}</span>
                {song.url ? <SongSourceLink href={song.url} compact /> : <span>-</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop table with hover-preview */}
      <PublicSongTable songs={songs} />

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} aria-hidden="true" />

      {loading ? (
        <div className="flex items-center justify-center border-t border-foreground/10 py-6">
          <span className="text-xs uppercase tracking-[0.24em] text-foreground/55">Loading more…</span>
        </div>
      ) : null}

      {!hasMore && songs.length > 0 ? (
        <div className="flex items-center justify-center border-t border-foreground/10 py-4">
          <span className="text-xs uppercase tracking-[0.22em] text-foreground/45">
            All {total} singles loaded
          </span>
        </div>
      ) : null}
    </>
  );
}
