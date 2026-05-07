import { Leg } from './types';

// Cool-toned palette intentionally avoiding yellow/amber/orange so the
// amber combined line owns the warm end of the spectrum on its own.
// These are *defaults* — a leg may override via `leg.color`.
export const LEG_COLORS = [
  '#7dd3fc', // sky
  '#5eead4', // teal
  '#a78bfa', // violet
  '#f472b6', // pink
  '#22d3ee', // cyan
  '#c4b5fd', // lavender
  '#34d399', // emerald
  '#fb7185', // rose
];

export const DEFAULT_COMBINED_COLOR = '#ffae00';

export const getLegColor = (i: number) => LEG_COLORS[i % LEG_COLORS.length];

export const resolveLegColor = (leg: Leg, i: number) =>
  leg.color ?? getLegColor(i);
