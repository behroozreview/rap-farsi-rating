import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, actions, className = "" }: SectionHeadingProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`.trim()}>
      <div>
        {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-foreground/60">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold sm:text-3xl" style={{ fontFamily: "var(--font-title)" }}>
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-foreground/72">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
