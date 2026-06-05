"use client";

import Link from "next/link";
import { useState } from "react";

import { getPublicRatingClass } from "@/lib/song-colors";
import { SongSourceLink } from "@/components/song-source-link";

type PublicSongTableSong = {
  id: number;
  title: string;
  artist: string | null;
  persianYear: number;
  rating: number;
  url: string | null;
};

type PublicSongTableProps = {
  songs: PublicSongTableSong[];
};

function getYouTubeEmbedUrl(href: string): string | null {
  try {
    const url = new URL(href);
    const host = url.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }

    if (host.endsWith("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
      }

      const pathParts = url.pathname.split("/").filter(Boolean);
      const shortsIndex = pathParts.indexOf("shorts");
      if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
        return `https://www.youtube-nocookie.com/embed/${pathParts[shortsIndex + 1]}?rel=0`;
      }

      const embedIndex = pathParts.indexOf("embed");
      if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
        return `https://www.youtube-nocookie.com/embed/${pathParts[embedIndex + 1]}?rel=0`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getSoundCloudEmbedUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.hostname.toLowerCase().endsWith("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&color=%231a120e&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
    }
  } catch {
    return null;
  }

  return null;
}

function getPreview(href: string) {
  const youtube = getYouTubeEmbedUrl(href);
  if (youtube) {
    return { src: youtube, title: "YouTube preview", height: 196 };
  }

  const soundcloud = getSoundCloudEmbedUrl(href);
  if (soundcloud) {
    return { src: soundcloud, title: "SoundCloud preview", height: 196 };
  }

  return null;
}

export function PublicSongTable({ songs }: PublicSongTableProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="hidden w-full min-w-[700px] text-left md:table">
        <thead>
          <tr className="bg-[var(--surface-strong)] text-sm uppercase tracking-wide text-foreground/70">
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Artist</th>
            <th className="px-5 py-3">Year</th>
            <th className="px-5 py-3">Rating</th>
            <th className="px-5 py-3">Source</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => {
            const preview = song.url ? getPreview(song.url) : null;
            const showPreview = hoveredId === song.id && preview;

            return (
              <tr
                key={song.id}
                className={`${getPublicRatingClass(song.rating)} border-b border-foreground/10 transition-colors hover:bg-black/5 last:border-b-0`}
                onMouseEnter={() => setHoveredId(song.id)}
                onMouseLeave={() => setHoveredId((prev) => (prev === song.id ? null : prev))}
              >
                <td className="px-5 py-3">
                  <Link href={`/songs/${song.id}`} className="text-xl hover:underline" style={{ fontFamily: "var(--font-title)" }}>
                    {song.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-foreground/80">{song.artist || "-"}</td>
                <td className="px-5 py-3">{song.persianYear}</td>
                <td className="px-5 py-3">{song.rating}/9</td>
                <td className="relative px-5 py-3">
                  {song.url ? <SongSourceLink href={song.url} compact /> : <span className="text-foreground/60">-</span>}

                  {showPreview ? (
                    <div className="pointer-events-none absolute right-5 top-[calc(100%+0.35rem)] z-30 w-[320px] overflow-hidden border border-foreground/15 bg-[var(--surface)] shadow-xl">
                      <iframe
                        src={preview.src}
                        title={preview.title}
                        width="320"
                        height={String(preview.height)}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
