import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Leg } from '../lib/types';
import { Breakeven, autoXRange, samplePayoff, summary } from '../lib/payoff';
import { getLegColor } from '../lib/legColors';

interface Props {
  legs: Leg[];
  spot: number;
  showPerLeg: boolean;
  showCombined: boolean;
  hoveredLegId: string | null;
}

const fmt = (v: number) => {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const fmtPrice = (v: number) =>
  v.toLocaleString(undefined, { maximumFractionDigits: 2 });

const fmtBreakeven = (b: Breakeven): string =>
  typeof b === 'number'
    ? fmtPrice(b)
    : `${fmtPrice(b.from)} – ${fmtPrice(b.to)}`;

export function PayoffChart({
  legs,
  spot,
  showPerLeg,
  showCombined,
  hoveredLegId,
}: Props) {
  const { data, summ, range } = useMemo(() => {
    const range = autoXRange(legs, spot);
    const samples = samplePayoff(legs, range[0], range[1], 200);
    const data = samples.map((s) => {
      const row: Record<string, number> = { S: s.S, total: s.total };
      s.perLeg.forEach((p, i) => (row[`leg${i}`] = p));
      return row;
    });
    return { data, summ: summary(samples), range };
  }, [legs, spot]);

  const showEmpty = legs.length === 0;
  const flatRanges = summ.breakevens.filter(
    (b): b is { from: number; to: number } => typeof b !== 'number',
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <SectionHeader index="02" label="Payoff at expiration" />

      <div className="panel relative min-h-0 flex-1 p-4">
        <span className="absolute -top-2 left-3 z-10 bg-[var(--bg)] px-1 text-[9px] tracking-[0.2em] text-[var(--text-dim)]">
          P/L · UNDERLYING
        </span>
        <span className="num absolute -top-2 right-3 z-10 bg-[var(--bg)] px-1 text-[9px] tracking-[0.2em] text-[var(--text-dim)]">
          AUTO {fmtPrice(range[0])} → {fmtPrice(range[1])}
        </span>

        {showEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="display-serif text-[28px] text-[var(--text-mid)]">
              awaiting legs
            </div>
            <div className="label">Construct a strategy to see the curve</div>
          </div>
        ) : (
          <div className="h-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 12, right: 28, bottom: 24, left: 12 }}
              >
                <defs>
                  <linearGradient id="profitFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lossFade" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#221e18"
                  strokeDasharray="2 4"
                  vertical={true}
                />

                <XAxis
                  dataKey="S"
                  type="number"
                  domain={range}
                  tickFormatter={fmtPrice}
                  stroke="#3a342b"
                  tickLine={false}
                  axisLine={{ stroke: '#3a342b' }}
                  label={{
                    value: 'UNDERLYING PRICE',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#6b6359',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                  }}
                />
                <YAxis
                  tickFormatter={(v) => fmt(Number(v))}
                  stroke="#3a342b"
                  tickLine={false}
                  axisLine={false}
                  width={68}
                />

                {flatRanges.map((r, i) => (
                  <ReferenceArea
                    key={`flat-${i}`}
                    x1={r.from}
                    x2={r.to}
                    y1={-0.5}
                    y2={0.5}
                    fill="#ffae00"
                    fillOpacity={0.18}
                    stroke="none"
                  />
                ))}

                <Tooltip
                  cursor={{ stroke: '#5a4f3a', strokeDasharray: '2 3' }}
                  contentStyle={{
                    background: '#0a0908',
                    border: '1px solid #2a2620',
                    borderRadius: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    padding: '8px 10px',
                  }}
                  itemStyle={{ color: '#f5f0e6', padding: 0 }}
                  labelStyle={{
                    color: '#ffae00',
                    fontWeight: 600,
                    marginBottom: 4,
                    letterSpacing: '0.08em',
                  }}
                  labelFormatter={(v) => `S = ${fmtPrice(Number(v))}`}
                  formatter={(value: number, name: string) => {
                    if (name === 'total') return [fmt(value), 'NET'];
                    const idx = Number(name.replace('leg', ''));
                    const leg = legs[idx];
                    const tag = leg
                      ? `${leg.side === 'long' ? '+' : '−'}${leg.qty} ${leg.kind === 'call' ? 'C' : 'P'} ${leg.strike}`
                      : name;
                    return [fmt(value), tag];
                  }}
                />

                <ReferenceLine y={0} stroke="#3a342b" strokeWidth={1} />
                <ReferenceLine
                  x={spot}
                  stroke="#5a4f3a"
                  strokeDasharray="3 3"
                  label={{
                    value: `SPOT ${fmtPrice(spot)}`,
                    position: 'insideTopRight',
                    fill: '#a8a097',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    offset: 8,
                  }}
                />

                {legs.map((leg, i) => {
                  const isHovered = hoveredLegId === leg.id;
                  const dimmed = hoveredLegId !== null && !isHovered;
                  // visible if: per-leg toggle on, or this is the actively hovered leg
                  if (!showPerLeg && !isHovered) return null;
                  const color = getLegColor(i);
                  return (
                    <Line
                      key={leg.id}
                      type="linear"
                      dataKey={`leg${i}`}
                      stroke={color}
                      strokeWidth={isHovered ? 2.25 : 1}
                      strokeOpacity={isHovered ? 1 : dimmed ? 0.18 : 0.55}
                      strokeDasharray={isHovered ? undefined : '3 3'}
                      dot={false}
                      isAnimationActive={false}
                      style={
                        isHovered
                          ? { filter: `drop-shadow(0 0 4px ${color})` }
                          : undefined
                      }
                    />
                  );
                })}

                {showCombined && (
                  <Line
                    type="linear"
                    dataKey="total"
                    stroke="#ffae00"
                    strokeWidth={2.25}
                    strokeOpacity={hoveredLegId ? 0.35 : 1}
                    dot={false}
                    isAnimationActive={false}
                    style={{
                      filter: hoveredLegId
                        ? 'none'
                        : 'drop-shadow(0 0 4px rgba(255,174,0,0.45))',
                    }}
                  />
                )}

              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-px bg-[var(--border)] panel">
        <Stat
          label="Max profit"
          value={
            summ.flat
              ? '$0'
              : summ.maxProfit === 'unlimited'
                ? '∞ Unlimited'
                : fmt(summ.maxProfit)
          }
          tone="var(--green)"
        />
        <Stat
          label="Max loss"
          value={
            summ.flat
              ? '$0'
              : summ.maxLoss === 'unlimited'
                ? '∞ Unlimited'
                : fmt(summ.maxLoss)
          }
          tone="var(--red)"
        />
        <Stat
          label="Breakeven"
          value={
            summ.flat
              ? 'Flat — net zero across range'
              : summ.breakevens.length === 0
                ? '—'
                : summ.breakevens.map(fmtBreakeven).join('  ·  ')
          }
          tone="var(--amber)"
        />
      </div>
    </div>
  );
}

function SectionHeader({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="num text-[var(--amber)] text-[11px] font-semibold">{index}</span>
      <span className="display-serif text-[18px] text-[var(--text)]">{label}</span>
      <div className="ml-2 flex-1 border-t border-dashed border-[var(--border)]" />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="bg-[var(--panel)] px-4 py-3">
      <div className="label mb-1">{label}</div>
      <div
        className="num truncate text-[15px] font-semibold tracking-tight"
        style={{ color: tone }}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
