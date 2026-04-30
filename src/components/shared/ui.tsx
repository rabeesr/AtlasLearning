import type { ReactNode } from "react";

/**
 * Card — borderless tile (Apple-style). Soft gray background, generous radius.
 * Pass `interactive` (or wrap in a Link/button) to opt into the hover lift.
 */
export type CardSwatch = {
  bg: string;
  hover: string;
};

export function Card({
  children,
  className = "",
  variant = "tile",
  interactive = true,
  swatch,
}: {
  children: ReactNode;
  className?: string;
  variant?: "tile" | "white" | "deep";
  interactive?: boolean;
  swatch?: CardSwatch;
}) {
  const bg =
    variant === "white"
      ? "bg-white"
      : variant === "deep"
        ? "bg-[var(--tile-deep)]"
        : "bg-[var(--tile)]";
  const swatchStyle = swatch
    ? ({
        backgroundColor: swatch.bg,
        ["--tile-hover" as string]: swatch.hover,
      } as React.CSSProperties)
    : undefined;
  return (
    <div
      className={`tile ${interactive ? "tile-hover" : ""} ${swatch ? "" : bg} p-6 md:p-7 ${className}`}
      style={swatchStyle}
    >
      {children}
    </div>
  );
}

/**
 * SectionHeader — large display headline with optional eyebrow.
 * No dividing rule — whitespace handles separation.
 */
export function SectionHeader({
  eyebrow,
  index,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  index?: string | number;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const eyebrowText = eyebrow
    ? index !== undefined
      ? `${String(index).padStart(2, "0")} · ${eyebrow}`
      : eyebrow
    : index !== undefined
      ? String(index).padStart(2, "0")
      : null;

  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrowText ? <p className="eyebrow">{eyebrowText}</p> : null}
        <h1 className="display-headline mt-2 text-[2rem] md:text-[2.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[18px] leading-[1.65] text-[var(--ink-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * ProgressBar — pill-rounded, ink fill on tile-gray track.
 */
export function ProgressBar({
  value,
  tone = "accent",
  className = "",
}: {
  value: number;
  tone?: "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const fill =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "danger"
          ? "var(--danger)"
          : "var(--ink)";
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-[var(--tile-deep)] ${className}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: fill }}
      />
    </div>
  );
}

/**
 * Badge — pill, soft tonal fill, no border.
 */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}) {
  const styles: Record<string, string> = {
    neutral: "bg-[var(--tile)] text-[var(--ink-muted)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    success: "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]",
    warning: "bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
    danger: "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium tracking-[0.01em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Stat — large display number on a tile.
 */
export function Stat({
  label,
  value,
  detail,
  swatch,
  swatchLabel,
}: {
  label: string;
  value: string | number;
  detail?: string;
  swatch?: CardSwatch;
  swatchLabel?: string;
}) {
  return (
    <Card swatch={swatch}>
      {swatchLabel ? (
        <p
          className="eyebrow-mono mb-3 inline-block rounded-full px-2.5 py-1 text-[10px]"
          style={{ background: "rgba(15,23,42,0.10)", color: "#0F172A" }}
        >
          {swatchLabel}
        </p>
      ) : null}
      <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
        {label}
      </p>
      <p className="display-headline mt-3 text-[2.5rem] tabular-nums">{value}</p>
      {detail ? (
        <p className="mt-2 text-[15px] leading-6 text-[var(--ink-muted)]">{detail}</p>
      ) : null}
    </Card>
  );
}

/**
 * Button — pill, ink-filled by default, soft hover.
 */
export function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-out";
  const sizing =
    size === "sm" ? "h-8 px-4 text-[13px]" : "h-11 px-6 text-[15px]";
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--ink)] text-white hover:bg-black hover:scale-[1.02] active:scale-[0.99]",
    secondary:
      "bg-[var(--tile)] text-[var(--ink)] hover:bg-[var(--tile-deep)] hover:scale-[1.02] active:scale-[0.99]",
    ghost:
      "bg-transparent text-[var(--ink)] hover:bg-[var(--tile)]",
    accent:
      "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] hover:scale-[1.02] active:scale-[0.99]",
  };
  const classes = `${base} ${sizing} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

/**
 * SectionBand — full-bleed alternating-tone section band. Generous vertical padding.
 */
export function SectionBand({
  children,
  variant = "white",
  className = "",
}: {
  children: ReactNode;
  variant?: "white" | "tile";
  className?: string;
}) {
  const bg = variant === "tile" ? "bg-[var(--tile)]" : "bg-white";
  return (
    <section
      className={`${bg} -mx-4 px-4 py-16 md:-mx-8 md:px-8 md:py-24 ${className}`}
    >
      {children}
    </section>
  );
}
