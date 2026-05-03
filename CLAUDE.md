# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # vite dev server, http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview    # serve the production build
npx tsc -b         # type-check only (no test runner is configured)
```

There are no tests, no linter, and no formatter. Type-checking is the only correctness gate.

After UI changes, verify in a real browser via the playwright-cli skill — TypeScript catches nothing about visual output, layout, or chart correctness.

## Architecture

A single-page React + Vite + TS + Tailwind app. One screen, one chart, no router, no store. State lives in `App.tsx` and flows down through props.

**Math is decoupled from rendering.** All option-pricing logic is pure functions in `src/lib/payoff.ts`; components only consume samples and a summary. If a behavior can be expressed as math, put it there and unit-think (mentally) before reaching for component state.

### Data flow

```
App  ──► legs, spot, showCombined, showPerLeg, hoveredLegId
 ├─► LegEditor      (mutates legs/spot/toggles, sets hoveredLegId on row mouseenter/leave)
 └─► PayoffChart    (samples + summarizes via payoff.ts on each render, memoized;
                      reads hoveredLegId to drive line highlighting)
```

`PayoffChart` recomputes its own samples and summary inside a `useMemo` keyed on `[legs, spot]` — App holds no derived state. Toggle and hover state live in App so the editor and the chart can stay in sync.

### Hover-highlight rule

When `hoveredLegId` is set, the chart enters a focused mode:
- the matching leg line goes solid (no dash), bright, with a colored drop-shadow glow — **even if `showPerLeg` is off**, so hovering a row always reveals its line;
- other per-leg lines fade to ~18% opacity;
- the combined amber line drops to ~35% opacity and loses its glow so the focused leg is the brightest thing on the canvas.

If you add new chart elements, decide explicitly how they react to hover — silent neglect makes the focused-state feel inconsistent.

### Math conventions you must respect

- **Per-leg payoff is "per single contract":** `legPayoff` returns `intrinsic - premium` (long) or `premium - intrinsic` (short), multiplied by `qty`. The 100× contract multiplier is **applied once at the strategy level** in `strategyPayoff` and `samplePayoff`, never inside `legPayoff`. Don't bake the multiplier into per-leg math.
- **Sampling injects exact strike prices** so the piecewise-linear kinks render crisply (Recharts draws straight segments between samples; a kink between samples would show as a diagonal). Any future math that introduces new break-points (e.g. dividend dates, barriers) must add them to the x-set.
- **Breakevens are `number | { from, to }`** (`Breakeven` type). A flat-zero strategy (e.g. long+short call at the same strike & premium) used to flood the chart with hundreds of breakeven dots; ranges collapse those into a single interval. Anywhere you render or process breakevens, handle both cases.
- **`summary().flat = true`** when P/L is identically zero across the whole sample range — UI uses this to short-circuit "$0 / $0 / Flat — net zero across range" instead of showing meaningless extrema.
- **"Unlimited" is detected by endpoint slope**, not by checking strikes. If `payoff.ts` ever stops sampling far enough out, this detection silently breaks.

### Presets

`src/lib/presets.ts` exports `PRESETS: Record<string, (spot: number) => Leg[]>`. Each preset is a *factory* — strikes are anchored relative to the current spot. Default premiums are hand-picked to look reasonable, not derived from any pricing model. Presets *replace* the entire leg list (the UI labels this "replaces current legs"); they never append. `+ Add Leg` appends.

## Design system

The app commits to a **financial-terminal aesthetic** (amber-on-near-black, monospaced, sharp corners, editorial serif italic accent). This is a deliberate choice, not a default — see `~/.claude/projects/-Users-ivan-ong-cl-workbench-options-payoff-viz/memory/feedback_aesthetic_direction.md`.

- All colors, fonts, and decorative layers live in CSS variables and `@layer components` classes in `src/index.css`. **Don't introduce new colors inline** (`bg-slate-900`, `text-emerald-400`, etc.) — extend the variable set or use existing tokens (`var(--amber)`, `var(--green)`, `var(--red)`, `var(--text)`, `var(--text-mid)`, `var(--text-dim)`, `var(--border)`, `var(--panel)`).
- Reusable component classes: `.panel`, `.field`, `.field-select`, `.btn-primary`, `.btn-ghost`, `.chip`, `.label`, `.num`, `.display-serif`, `.pulse-dot`. Prefer these over re-implementing styles.
- Numbers use `.num` (JetBrains Mono + tabular-nums). Display headlines use `.display-serif` (Instrument Serif italic). Uppercase tracked metadata uses `.label`.
- `body::before` and `body::after` paint a CRT vignette and scanline overlay over the whole app. They sit at `z-index: 1`/`2`; main content uses `z-10` to stay above.
- **Leg colors are cool-only on purpose.** `src/lib/legColors.ts` exports a sky/teal/violet/pink/cyan/lavender/emerald/rose palette. Amber is reserved for the combined line (and brand accents like `LIVE`, breakeven values, focus rings). Keep leg colors out of the warm half of the spectrum so the combined line never visually merges with a leg overlay. Both `LegEditor` (row dot, hover left-border) and `PayoffChart` (overlay strokes) consume `getLegColor(i)` from this file — single source of truth.
