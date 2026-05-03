export type Side = 'long' | 'short';
export type Kind = 'call' | 'put';

export interface Leg {
  id: string;
  side: Side;
  kind: Kind;
  strike: number;
  premium: number;
  qty: number;
}

export const CONTRACT_MULTIPLIER = 100;
