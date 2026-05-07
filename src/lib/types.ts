export type Side = 'long' | 'short';
export type Kind = 'call' | 'put';

export interface Leg {
  id: string;
  side: Side;
  kind: Kind;
  strike: number;
  premium: number;
  qty: number;
  color?: string;
}

export const CONTRACT_MULTIPLIER = 100;
