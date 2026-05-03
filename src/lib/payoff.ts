import { CONTRACT_MULTIPLIER, Leg } from './types';

const EPS = 1e-9;

export function legPayoff(leg: Leg, S: number): number {
  const intrinsic =
    leg.kind === 'call' ? Math.max(S - leg.strike, 0) : Math.max(leg.strike - S, 0);
  const signed = leg.side === 'long' ? intrinsic - leg.premium : leg.premium - intrinsic;
  return signed * leg.qty;
}

export function strategyPayoff(legs: Leg[], S: number): number {
  let total = 0;
  for (const leg of legs) total += legPayoff(leg, S);
  return total * CONTRACT_MULTIPLIER;
}

export interface Sample {
  S: number;
  total: number;
  perLeg: number[];
}

export function samplePayoff(
  legs: Leg[],
  xMin: number,
  xMax: number,
  n = 200,
): Sample[] {
  const xs = new Set<number>();
  if (n < 2) n = 2;
  const step = (xMax - xMin) / (n - 1);
  for (let i = 0; i < n; i++) xs.add(xMin + i * step);
  for (const leg of legs) {
    if (leg.strike >= xMin && leg.strike <= xMax) xs.add(leg.strike);
  }
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted.map((S) => {
    const perLeg = legs.map((leg) => legPayoff(leg, S) * CONTRACT_MULTIPLIER);
    const total = perLeg.reduce((a, b) => a + b, 0);
    return { S, total, perLeg };
  });
}

export type Breakeven = number | { from: number; to: number };

/**
 * Locate prices at which the strategy P/L crosses or touches zero.
 * Sign-change crossings are linearly interpolated. Contiguous intervals
 * where P/L is identically zero are returned as ranges, not as a flood
 * of point breakevens.
 */
export function findBreakevens(samples: Sample[]): Breakeven[] {
  if (samples.length === 0) return [];
  const isZero = (v: number) => Math.abs(v) < EPS;
  const out: Breakeven[] = [];

  let i = 0;
  while (i < samples.length) {
    if (isZero(samples[i].total)) {
      let j = i;
      while (j + 1 < samples.length && isZero(samples[j + 1].total)) j++;
      if (j === i) {
        out.push(samples[i].S);
      } else {
        out.push({ from: samples[i].S, to: samples[j].S });
      }
      i = j + 1;
      continue;
    }
    if (i + 1 < samples.length) {
      const a = samples[i];
      const b = samples[i + 1];
      if (a.total * b.total < 0) {
        const t = a.total / (a.total - b.total);
        out.push(a.S + t * (b.S - a.S));
      }
    }
    i++;
  }
  return out;
}

export interface Summary {
  maxProfit: number | 'unlimited';
  maxLoss: number | 'unlimited';
  breakevens: Breakeven[];
  flat: boolean;
}

export function summary(samples: Sample[]): Summary {
  if (samples.length < 2) {
    return { maxProfit: 0, maxLoss: 0, breakevens: [], flat: false };
  }
  let maxP = -Infinity;
  let maxL = Infinity;
  let allZero = true;
  for (const s of samples) {
    if (s.total > maxP) maxP = s.total;
    if (s.total < maxL) maxL = s.total;
    if (Math.abs(s.total) > EPS) allZero = false;
  }
  const left = samples[0];
  const left2 = samples[1];
  const right = samples[samples.length - 1];
  const right2 = samples[samples.length - 2];
  const leftSlope = (left2.total - left.total) / (left2.S - left.S);
  const rightSlope = (right.total - right2.total) / (right.S - right2.S);

  let maxProfit: number | 'unlimited' = maxP;
  let maxLoss: number | 'unlimited' = maxL;
  if (rightSlope > EPS) maxProfit = 'unlimited';
  if (rightSlope < -EPS) maxLoss = 'unlimited';
  if (leftSlope < -EPS) maxProfit = 'unlimited';
  if (leftSlope > EPS) maxLoss = 'unlimited';

  return {
    maxProfit,
    maxLoss,
    breakevens: findBreakevens(samples),
    flat: allZero,
  };
}

export function autoXRange(legs: Leg[], spot: number): [number, number] {
  if (legs.length === 0) return [spot * 0.7, spot * 1.3];
  const strikes = legs.map((l) => l.strike);
  const lo = Math.min(spot, ...strikes);
  const hi = Math.max(spot, ...strikes);
  return [Math.max(0, lo * 0.7), hi * 1.3];
}
