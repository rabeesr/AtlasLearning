# ATLAS — Light · Indigo + Amber Redesign

Aesthetic: Swiss Minimalism + Bento Grid + dense-dashboard density. Light surfaces, hairline borders, sharp 6–8px corners, shadow-on-hover only, indigo primary, amber CTA.

## 1. `src/app/globals.css` — full rewrite (already done in prior turn)

Tokens:
```css
:root {
  --bg: #F8FAFC;           --bg-alt: #F1F5F9;
  --panel: #FFFFFF;        --panel-alt: #F8FAFC;   --panel-muted: #F1F5F9;
  --border: #E2E8F0;       --border-strong: #CBD5E1;
  --text: #1E293B;         --text-strong: #0F172A; --text-muted: #64748B;
  --accent: #1E40AF;       --accent-strong: #1E3A8A; --accent-soft: #EEF2FF;
  --cta: #D97706;          --cta-strong: #B45309;    --cta-soft: #FEF3C7;
  --success: #16A34A;      --warning: #D97706;       --danger: #DC2626;
  --shadow-card: 0 1px 2px rgba(15,23,42,0.04);
  --shadow-hover: 0 4px 14px rgba(15,23,42,0.08);
}
```
- Body: `background: var(--bg); color: var(--text); font-family: "Inter", system-ui, sans-serif`.
- `.atlas-background { background: var(--bg); }` — drop the dark gradients/grid.
- `.atlas-prose` rules: dark text, indigo links, slate-900 headings, amber-tinted inline `code` is OK but use `var(--accent)` for color and `var(--panel-muted)` for bg; pre/code stays dark (`#0F172A` bg, `#E2E8F0` text) for syntax legibility on light pages.

## 2. `src/components/shared/toolbar.tsx`

- Container: `bg-white/95 backdrop-blur border-b border-[var(--border)]` (replace `rgba(7,17,31,0.85)`).
- Logo chip: `bg-[var(--accent)] text-white` (solid indigo square, white "A"). Drop the `tracking-[0.28em]` brand mark — keep "ATLAS" in `text-slate-900 font-semibold tracking-tight`.
- Nav link inactive: `text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--panel-muted)]`.
- Nav link active: `bg-[var(--accent-soft)] text-[var(--accent)]` (already correct via vars — just confirm contrast holds with new tokens).
- Settings link: same active/inactive scheme as nav.

## 3. `src/components/shared/app-shell.tsx`

- Drop the dark `text-[var(--text)]` override on the wrapper — base body color is already correct.
- Footer: `border-t border-[var(--border)] bg-white text-[var(--text-muted)]`.

## 4. `src/components/shared/ui.tsx` — token + shape adjustments

### `Card`
- Replace `rounded-xl` → `rounded-lg` (8px corners).
- Add `shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-hover)]`.
- `border-[var(--border)] bg-[var(--panel)]` already correct.

### `SectionHeader`
- `eyebrow`: change `text-[var(--accent)]` → `text-[var(--cta)]` (amber eyebrow pops on light bg).
- Title: `text-[var(--text-strong)]` instead of `text-[var(--text)]` for stronger hierarchy.
- Description: keep `text-[var(--text-muted)]`.

### `ProgressBar`
- Track: `bg-[var(--panel-muted)]` → keep, but bump height from `h-1.5` to `h-2` for legibility on light bg.
- Fill: keep tone-driven — indigo (`--accent`) replaces cyan automatically.

### `Badge`
- Rewrite `styles` map:
  ```ts
  neutral: "border-[var(--border)] bg-[var(--panel-muted)] text-[var(--text-muted)]",
  accent:  "border-[#C7D2FE] bg-[var(--accent-soft)] text-[var(--accent)]",
  success: "border-[#BBF7D0] bg-[#F0FDF4] text-[var(--success)]",
  warning: "border-[#FDE68A] bg-[var(--cta-soft)] text-[var(--cta-strong)]",
  danger:  "border-[#FECACA] bg-[#FEF2F2] text-[var(--danger)]",
  ```
- Keep uppercase-tracking-wider styling.

### `Stat`
- Label: keep muted.
- Value: `text-[var(--text-strong)] tabular-nums`.
- Add tabular-nums everywhere a number is shown next to a label.

## 5. `src/components/shared/toolbar.tsx` — primary CTA pattern

There is no global CTA today. When you add primary buttons (e.g. "Save preferences" on Settings), use:
```tsx
className="rounded-md bg-[var(--cta)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition hover:bg-[var(--cta-strong)]"
```
Replace the current Settings save button which uses `border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]` — switch to amber filled per above.

Secondary buttons stay outline indigo:
```tsx
className="rounded-md border border-[var(--border-strong)] bg-white px-3 py-1.5 text-sm text-[var(--text-strong)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
```

## 6. `src/components/dashboard/phase-progress-card.tsx`

- Eyebrow phase name: `text-[var(--cta)]` (amber).
- Big "%" number: `text-[var(--text-strong)] tabular-nums`.
- "avg proficiency" caption: keep muted.
- Topic chip links inside the card: replace pill style with subtle row chips `border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]`.

## 7. `src/components/dashboard/topic-proficiency-grid.tsx`

- Topic title hover: `hover:text-[var(--accent)]` (already indigo via var — confirm).
- Branch eyebrow: `text-[var(--cta)] uppercase tracking-wider`.
- Subtopic list separator: `border-t border-[var(--border)]` already correct.
- Numbers in `<span class="tabular-nums">`.

## 8. `src/components/topic/topic-tabs.tsx`

- Active underline: `border-[var(--accent)] text-[var(--accent)]` — keep.
- Inactive: `text-[var(--text-muted)] hover:text-[var(--text-strong)]`.
- Container: `border-b border-[var(--border)]` — keep.
- Add `font-medium` to all tab labels for clearer hierarchy on light bg.

## 9. `src/components/practice/practice-card.tsx`

- Kind eyebrow ("Quiz", "Challenge", "Project"): `text-[var(--cta)]` (amber) instead of indigo — turns the kind into a visual category marker, leaves indigo for navigation/links.
- Title: `text-[var(--text-strong)] font-semibold`.
- "Spans N topics" badge: `tone="accent"` (indigo) — remains the cross-topic signal.
- Topic tag chips: `border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]`.

## 10. `src/components/practice/practice-filters.tsx`

- Container: replace bespoke `rounded-xl border bg-[var(--panel)] p-4` with `Card` component for consistency.
- "Filters" eyebrow: `text-[var(--cta)]`.
- Active chip: `border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]` — keep.
- Inactive chip: `border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]`.
- "Clear all" button: `text-[var(--text-muted)] hover:text-[var(--danger)]` so it reads as destructive.

## 11. `src/app/dashboard/page.tsx`

- Replace eyebrow color implicit through `SectionHeader` (handled by #4).
- Decay alert cards: add an amber left border accent: `border-l-4 border-l-[var(--danger)]` on the `Card` for "Decaying" entries to make them scannable.
- Status legend: leave as-is once `Badge` is rewired.
- Stat values: ensure `tabular-nums` (handled in `Stat`).

## 12. `src/app/topics/[topicSlug]/layout.tsx`

- Header card: keep, but split into a 3-column bento at `md:grid-cols-3`:
  - col 1–2: title block.
  - col 3: proficiency big stat with progress bar.
- Big proficiency number: `text-[var(--text-strong)] tabular-nums`.
- Phase/branch eyebrow: `text-[var(--cta)]`.
- "Blocked by" line: render as a `Badge tone="warning"` block instead of plain warning-colored text.

## 13. `src/app/topics/[topicSlug]/page.tsx` (Overview)

- Three "at a glance" tiles (Quizzes / Challenges / Projects): make them larger, give each a colored top accent stripe (`border-t-2 border-t-[var(--accent)]` for quizzes, `border-t-[var(--cta)]` for challenges, `border-t-[var(--success)]` for projects) so each kind has a consistent visual identity site-wide.
- "Subtopics" list rows: hover `bg-[var(--accent-soft)] border-[var(--accent)]`.
- Prerequisites / Unlocks side cards: smaller padding (`p-4` instead of `p-5`), eyebrow in amber.

## 14. `src/app/topics/page.tsx` (Topics index)

- Phase section heading `text-2xl font-semibold text-[var(--text-strong)] tracking-tight`.
- Phase description: `max-w-3xl text-sm text-[var(--text-muted)]`.
- Branch eyebrow: amber, uppercase, tracking-[0.32em].
- Topic cards: same Card treatment from #4 plus a thin colored top stripe based on phase index (P1=indigo, P2=amber, P3=emerald) so phases are scannable in the grid.
- "Blocked by" line: convert to `Badge tone="warning"` chip row.

## 15. `src/app/settings/page.tsx`

- All `inputClass` updates:
  ```ts
  const inputClass =
    "w-full rounded-md border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";
  ```
- Save button: amber-filled (see #5).
- Section headings: `text-[var(--text-strong)]`.
- Topic checkbox grid items: hover `border-[var(--accent)] bg-[var(--accent-soft)]`.

## 16. Sharper corners pass (global)

Replace across the codebase:
- `rounded-xl` → `rounded-lg` (cards, filter container)
- `rounded-2xl` → `rounded-lg`
- `rounded-md` (buttons, chips) → keep
- `rounded-full` (badges) → keep
- `rounded-[var(--atlas-radius)]` (any leftover) → `rounded-lg`

Files to sweep: every file under `src/components/` and every page under `src/app/`. A single repo-wide find-and-replace covers it.

## 17. Typography tightening

- Add `font-family: "Inter", system-ui, sans-serif` on body (handled in globals.css).
- Headings: `tracking-tight font-semibold`.
- Stat numbers + table data: `tabular-nums`.
- Eyebrows / category labels: `uppercase tracking-[0.28em] text-[10px] font-semibold`.
- Body copy: `leading-7`.

## 18. Verification

After applying:
1. `npm run typecheck` — should pass (no API changes).
2. `npm run lint` — should pass.
3. `npm run build` — should pass.
4. `npm run dev` — eyeball:
   - Toolbar is white with hairline bottom border, indigo logo chip, amber-on-indigo for active states.
   - Dashboard reads as light Bento; numbers are tabular; phase cards have colored accent stripes.
   - Decay alerts have a red left bar.
   - Topic hub header is bento-split (title left, big proficiency right).
   - Settings inputs have visible focus ring; Save button is solid amber.
   - Cards lift subtly on hover (shadow-hover).
5. Print-screen the dashboard and topic hub to confirm hierarchy reads at a glance.

## Out of scope (do later)

- Replacing `tabular-nums` utility with a proper Tailwind v4 plugin if needed.
- Adding chart components beyond progress bars (e.g. sparklines for phase trend).
- Dark-mode toggle. Tokens are structured to support it: redefine the `:root` block under a `[data-theme="dark"]` selector when ready.
- Custom font loading (`next/font`) for Inter — currently relies on system fallback chain.
