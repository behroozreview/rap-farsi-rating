type SongSourceLinkProps = {
  href: string;
  className?: string;
  compact?: boolean;
};

function getSourceInfo(href: string) {
  try {
    const url = new URL(href);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "youtu.be" || hostname.endsWith("youtube.com")) {
      return {
        label: "YouTube",
        title: "Open on YouTube",
        accentClass: "text-red-600",
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
            <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.1 5 12 5 12 5s-6.1 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26.5 26.5 0 0 0 2 12a26.5 26.5 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.7.4 7.8.4 7.8.4s6.1 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26.5 26.5 0 0 0 22 12a26.5 26.5 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
          </svg>
        ),
      };
    }

    if (hostname === "soundcloud.com" || hostname.endsWith("soundcloud.com")) {
      return {
        label: "SoundCloud",
        title: "Open on SoundCloud",
        accentClass: "text-orange-500",
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
            <path d="M7.5 12.3a4.7 4.7 0 0 1 .7-.1 4.3 4.3 0 0 1 4.3 4.3v.2h4.6a3.4 3.4 0 0 0 0-6.8c-.5 0-1 .1-1.4.3a5.1 5.1 0 0 0-9-1.6c-.1 0-.1-.1-.2-.1a3.6 3.6 0 0 0-3.5 3.6A3.6 3.6 0 0 0 7 16.3h.5v-4Z" />
          </svg>
        ),
      };
    }
  } catch {
    // fall through to generic link rendering
  }

  return {
    label: "Link",
    title: "Open external link",
    accentClass: "text-[var(--accent-strong)]",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2]">
        <path d="M14 5h5v5" />
        <path d="M10 14 19 5" />
        <path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
      </svg>
    ),
  };
}

export function SongSourceLink({ href, className = "", compact = false }: SongSourceLinkProps) {
  const source = getSourceInfo(href);
  const useInheritedColor = className.includes("button-primary");

  return (
    <a
      className={`${className} inline-flex items-center gap-2 whitespace-nowrap transition hover:-translate-y-px hover:opacity-90 ${useInheritedColor ? "text-inherit" : source.accentClass}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={source.title}
      title={source.title}
    >
      {source.icon}
      <span className={compact ? "text-xs font-semibold" : "font-semibold"}>{source.label}</span>
    </a>
  );
}