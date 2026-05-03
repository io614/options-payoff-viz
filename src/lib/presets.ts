import { Leg } from './types';

let nextId = 1;
const id = () => `leg-${Date.now()}-${nextId++}`;

const round = (v: number, step = 1) => Math.round(v / step) * step;

type PresetFn = (spot: number) => Leg[];

export const PRESETS: Record<string, PresetFn> = {
  'Long Call': (spot) => [
    { id: id(), side: 'long', kind: 'call', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
  ],
  'Long Put': (spot) => [
    { id: id(), side: 'long', kind: 'put', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
  ],
  'Short Call': (spot) => [
    { id: id(), side: 'short', kind: 'call', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
  ],
  'Short Put': (spot) => [
    { id: id(), side: 'short', kind: 'put', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
  ],
  'Long Straddle': (spot) => [
    { id: id(), side: 'long', kind: 'call', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
    { id: id(), side: 'long', kind: 'put', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
  ],
  'Long Strangle': (spot) => [
    { id: id(), side: 'long', kind: 'call', strike: round(spot * 1.05), premium: round(spot * 0.02, 0.05), qty: 1 },
    { id: id(), side: 'long', kind: 'put', strike: round(spot * 0.95), premium: round(spot * 0.02, 0.05), qty: 1 },
  ],
  'Bull Call Spread': (spot) => [
    { id: id(), side: 'long', kind: 'call', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
    { id: id(), side: 'short', kind: 'call', strike: round(spot * 1.05), premium: round(spot * 0.015, 0.05), qty: 1 },
  ],
  'Bear Put Spread': (spot) => [
    { id: id(), side: 'long', kind: 'put', strike: round(spot), premium: round(spot * 0.03, 0.05), qty: 1 },
    { id: id(), side: 'short', kind: 'put', strike: round(spot * 0.95), premium: round(spot * 0.015, 0.05), qty: 1 },
  ],
  'Iron Condor': (spot) => [
    { id: id(), side: 'long', kind: 'put', strike: round(spot * 0.9), premium: round(spot * 0.005, 0.05), qty: 1 },
    { id: id(), side: 'short', kind: 'put', strike: round(spot * 0.95), premium: round(spot * 0.015, 0.05), qty: 1 },
    { id: id(), side: 'short', kind: 'call', strike: round(spot * 1.05), premium: round(spot * 0.015, 0.05), qty: 1 },
    { id: id(), side: 'long', kind: 'call', strike: round(spot * 1.1), premium: round(spot * 0.005, 0.05), qty: 1 },
  ],
  'Long Call Butterfly': (spot) => [
    { id: id(), side: 'long', kind: 'call', strike: round(spot * 0.95), premium: round(spot * 0.045, 0.05), qty: 1 },
    { id: id(), side: 'short', kind: 'call', strike: round(spot), premium: round(spot * 0.025, 0.05), qty: 2 },
    { id: id(), side: 'long', kind: 'call', strike: round(spot * 1.05), premium: round(spot * 0.01, 0.05), qty: 1 },
  ],
};

export const PRESET_NAMES = Object.keys(PRESETS);

export const newEmptyLeg = (spot: number): Leg => ({
  id: id(),
  side: 'long',
  kind: 'call',
  strike: round(spot),
  premium: round(spot * 0.03, 0.05),
  qty: 1,
});
