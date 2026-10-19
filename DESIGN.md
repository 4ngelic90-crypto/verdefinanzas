# Design Brief

## Direction

Ledger Green — a dark-first mobile finance tracker where money is the only thing that glows.

## Tone

Restrained premium fintech: near-black neutral-grey surfaces, one botanical green accent, zero decoration that does not carry data.

## Differentiation

Every monetary amount is set in monospace tabular figures, so columns of numbers align like a real ledger; the balance card carries a soft green glow ring as the single expressive flourish.

## Color Palette

| Token      | OKLCH           | Role                                      |
| ---------- | --------------- | ----------------------------------------- |
| background | 0.145 0.008 160 | App canvas, deep cool grey                |
| foreground | 0.95 0.006 150  | Primary text                              |
| card       | 0.185 0.01 160  | Elevated surfaces, list + chart cards     |
| primary    | 0.78 0.19 152   | Green accent: CTAs, active tab, top bar   |
| accent     | 0.78 0.19 152   | Same green for highlights/active states   |
| muted      | 0.235 0.012 160 | Inputs, chips, inactive bar track         |
| income     | 0.78 0.19 152   | Positive amounts / Ingresos               |
| expense    | 0.63 0.2 22     | Negative amounts / Gastos                 |
| border     | 0.27 0.012 160  | 1px hairline separators                   |

Category chart ramp (dominant → muted): `--chart-1` 0.78 0.19 152, `--chart-2` 0.68 0.14 158, `--chart-3` 0.58 0.1 162, `--chart-4` 0.5 0.07 165, `--chart-5` 0.42 0.045 165.

## Typography

- Display: Space Grotesk — headings, balance figure, section titles, tab labels
- Body: DM Sans — labels, notes, list metadata, form fields
- Mono: Geist Mono — every amount via `.tabular` utility (tabular-nums)
- Scale: hero `text-4xl font-bold tracking-tight`, h2 `text-lg font-semibold`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm`

## Elevation & Depth

Three-step surface ladder: `background` (canvas) → `card` (content) → `popover` (sheets/modals), separated by 1px `border` hairlines; shadows `shadow-subtle` on list cards and `shadow-elevated` on the balance card, never neon glow except the single green `balance-glow` ring.

## Structural Zones

| Zone           | Background        | Border      | Notes                                                      |
| -------------- | ----------------- | ----------- | ---------------------------------------------------------- |
| Header         | `bg-card`         | `border-b`  | Sticky app title + period filter, safe-area top padding    |
| Balance hero   | `bg-card` + glow  | `border`    | Largest card, green ring, Ingresos/Gastos stat chips       |
| Chart section  | `bg-background`   | —           | Horizontal category bars, top category in `primary`        |
| Movements list | `bg-card` rows    | `border-b`  | Icon tile, category, date, right-aligned `.tabular` amount |
| Bottom nav     | `bg-card`         | `border-t`  | Fixed, 3 tabs (Inicio/Movimientos/Estadísticas), `.safe-bottom` |

## Spacing & Rhythm

Mobile-first single column: `px-4` gutters, `gap-3` between cards, `gap-4` between sections, `p-5` inside cards, `py-3` per list row; content capped at `max-w-md mx-auto` on larger screens.

## Component Patterns

- Buttons: full-width `rounded-xl` primary in green with `primary-foreground` text; secondary is `bg-secondary` with `border`; press state scales to 0.98
- Cards: `rounded-xl` (12px), `bg-card`, 1px `border`, `shadow-subtle`; hero balance card uses `shadow-elevated` + `balance-glow`
- Badges/Chips: pill `rounded-full`, `bg-muted` with `text-muted-foreground`; income chip green tint, expense chip red tint
- Inputs: `rounded-lg`, `bg-input`, focus ring in `ring` green
- Progress bars: `h-2.5 rounded-full` track in `muted`, fill in `primary` (top category) or chart ramp

## Motion

- Entrance: cards `animate-fade-in-up` staggered 60ms; amounts `animate-count-up`
- Hover/press: `transition-smooth` on all interactive elements; buttons scale 0.98 on press
- Decorative: category bars `animate-bar-grow` (scaleX origin-left) on mount; no looping or ambient motion

## Constraints

- Dark mode is the product default; light tokens exist but are not the target experience
- Never use raw color literals or arbitrary color classes — semantic tokens only
- Amounts always use `.tabular` (Geist Mono + tabular-nums); positive green, negative red
- Mobile-first, optimized for Android 14–16 viewports (360–430px wide)
- Do not design budget-limit alerts or CSV/PDF export surfaces

## Signature Detail

Monospace tabular ledger figures paired with a single soft green glow ring on the balance card — financial clarity as the visual identity.
