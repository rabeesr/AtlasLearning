import type { ReactNode } from "react";

/**
 * Card — flat, square, ink hairline. No shadow, no radius.
 */
export function Card({
  children,
  className = "",
  variant = "white",
}: {
  children: ReactNode;
  className?: string;
  variant?: "white" | "cream" | "paper";
}) {
  const bg =
    variant === "cream"
      ? "bg-[var(--bg)]"
      : variant === "paper"
        ? "bg-[var(--bg-paper)]"
        : "bg-[var(--bg-white)]";
  return (
    <div className={`border border-[var(--ink)] ${bg} p-5 ${className}`}>
      {children}
    </div>
  );
}

/**
 * SectionHeader — numbered editorial header. Mono eyebrow + display headline.
 * Optional `index` renders as `01 — EYEBROW` mono numeric prefix.
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
      ? `${String(index).padStart(2, "0")} — ${eyebrow}`
      : eyebrow
    : index !== undefined
      ? String(index).padStart(2, "0")
      : null;

  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-[var(--ink)] pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrowText ? (
          <p className="eyebrow-mono">{eyebrowText}</p>
        ) : null}
        <h1 className="display-headline mt-2 text-[1.75rem] md:text-[2.25rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--ink-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * ProgressBar — square, 1px ink rule + ink fill. No radius, no gradient.
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
      className={`relative h-[6px] w-full border border-[var(--ink)] bg-[var(--bg-white)] ${className}`}
    >
      <div
        className="h-full"
        style={{ width: `${clamped}%`, backgroundColor: fill }}
      />
    </div>
  );
}

/**
 * Badge — flat hairline box, mono uppercase label.
 */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}) {
  const styles: Record<string, string> = {
    neutral: "border-[var(--ink)] bg-transparent text-[var(--ink)]",
    accent: "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    success: "border-[var(--success)] bg-transparent text-[var(--success)]",
    warning: "border-[var(--warning)] bg-transparent text-[var(--warning)]",
    danger: "border-[var(--danger)] bg-transparent text-[var(--danger)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Stat — large display number on a flat card with mono label.
 */
export function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <p className="eyebrow-mono">{label}</p>
      <p className="display-headline text-[2.25rem] tabular-nums">{value}</p>
      {detail ? (
        <p className="text-xs leading-5 text-[var(--ink-muted)]">{detail}</p>
      ) : null}
    </Card>
  );
}

/**
 * Button — square, ink-filled by default. Hover inverts. No transitions over 120ms.
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
    "inline-flex items-center justify-center font-mono uppercase tracking-[0.08em] border transition-colors duration-100 ease-out";
  const sizing = size === "sm" ? "h-7 px-3 text-[11px]" : "h-9 px-4 text-[12px]";
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--ink)] text-[var(--bg-white)] border-[var(--ink)] hover:bg-[var(--bg-white)] hover:text-[var(--ink)]",
    secondary:
      "bg-transparent text-[var(--ink)] border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg-white)]",
    ghost:
      "bg-transparent text-[var(--ink)] border-transparent hover:border-[var(--ink)]",
    accent:
      "bg-[var(--accent)] text-[var(--bg-white)] border-[var(--accent)] hover:bg-[var(--accent-strong)] hover:border-[var(--accent-strong)]",
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
 * SectionBand — full-bleed alternating section background.
 * Use inside a page; it breaks out of any max-width container via negative margins.
 */
export function SectionBand({
  children,
  variant = "cream",
  className = "",
}: {
  children: ReactNode;
  variant?: "cream" | "paper";
  className?: string;
}) {
  const bg = variant === "paper" ? "bg-[var(--bg-paper)]" : "bg-[var(--bg)]";
  return (
    <section
      className={`section-band ${bg} -mx-4 px-4 py-10 md:-mx-8 md:px-8 md:py-14 ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * CornerMarks — Palantir-style L-tick registration marks at the four corners,
 * with an optional mono coordinate label in the top-right.
 *
 * Usage: wrap content. Children render inside a `position: relative` container.
 */
export function CornerMarks({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`corner-marks ${className}`}>
      {children}
      <span className="corner-marks__bl" aria-hidden />
      <span className="corner-marks__br" aria-hidden />
      {label ? (
        <span className="coordinate pointer-events-none absolute right-2 top-2">
          {label}
        </span>
      ) : null}
    </div>
  );
}
