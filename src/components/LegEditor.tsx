import { Leg } from '../lib/types';
import { PRESET_NAMES, PRESETS, newEmptyLeg } from '../lib/presets';
import { resolveLegColor } from '../lib/legColors';

interface Props {
  legs: Leg[];
  spot: number;
  onLegsChange: (legs: Leg[]) => void;
  onSpotChange: (spot: number) => void;
  showPerLeg: boolean;
  onShowPerLegChange: (v: boolean) => void;
  showCombined: boolean;
  onShowCombinedChange: (v: boolean) => void;
  hoveredLegId: string | null;
  onHoverLeg: (id: string | null) => void;
  combinedColor: string;
  onCombinedColorChange: (v: string) => void;
}

export function LegEditor({
  legs,
  spot,
  onLegsChange,
  onSpotChange,
  showPerLeg,
  onShowPerLegChange,
  showCombined,
  onShowCombinedChange,
  hoveredLegId,
  onHoverLeg,
  combinedColor,
  onCombinedColorChange,
}: Props) {
  const updateLeg = (id: string, patch: Partial<Leg>) => {
    onLegsChange(legs.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };
  const removeLeg = (id: string) => {
    onLegsChange(legs.filter((l) => l.id !== id));
  };
  const addLeg = () => {
    onLegsChange([...legs, newEmptyLeg(spot)]);
  };
  const loadPreset = (name: string) => {
    if (!name) return;
    const fn = PRESETS[name];
    if (fn) onLegsChange(fn(spot));
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <SectionHeader index="01" label="Strategy" />

      <div className="panel relative p-4">
        <span className="absolute -top-2 left-3 bg-[var(--bg)] px-1 text-[9px] tracking-[0.2em] text-[var(--text-dim)]">
          MARKET
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-3">
            <span className="label">Spot</span>
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-dim)]">$</span>
              <input
                type="number"
                value={spot}
                onChange={(e) => onSpotChange(Number(e.target.value))}
                className="field w-24"
                step="0.5"
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="label">Display</span>
            <CombinedToggle
              checked={showCombined}
              onChange={onShowCombinedChange}
              color={combinedColor}
              onColorChange={onCombinedColorChange}
            />
            <ToggleChip
              checked={showPerLeg}
              onChange={onShowPerLegChange}
              label="Per-leg"
              swatch="var(--text-mid)"
              swatchDashed
            />
          </div>
        </div>
      </div>

      <div className="panel relative p-4">
        <span className="absolute -top-2 left-3 bg-[var(--bg)] px-1 text-[9px] tracking-[0.2em] text-[var(--text-dim)]">
          TEMPLATES
        </span>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <span className="display-serif text-[15px] italic text-[var(--text-mid)]">
            quick‑load a strategy
          </span>
          <span className="label !text-[var(--text-dim)]">replaces current legs</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_NAMES.map((n) => (
            <button
              key={n}
              onClick={() => loadPreset(n)}
              className="chip"
              type="button"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="panel relative flex-1 p-0">
        <span className="absolute -top-2 left-3 z-10 bg-[var(--bg)] px-1 text-[9px] tracking-[0.2em] text-[var(--text-dim)]">
          LEGS
        </span>

        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-3 py-2 pt-3">
          <span className="label">
            {legs.length === 0
              ? 'no legs'
              : `${legs.length} leg${legs.length === 1 ? '' : 's'} · custom build`}
          </span>
          <button onClick={addLeg} className="btn-primary whitespace-nowrap">
            + Add Leg
          </button>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <Th>#</Th>
              <Th>Side</Th>
              <Th>Type</Th>
              <Th align="right">Strike</Th>
              <Th align="right">Premium</Th>
              <Th align="right">Qty</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {legs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-[var(--text-dim)]">
                  <div className="display-serif text-[20px] text-[var(--text-mid)]">
                    no legs yet
                  </div>
                  <div className="label mt-2">Add a leg above or load a template</div>
                </td>
              </tr>
            )}
            {legs.map((leg, i) => {
              const isHovered = hoveredLegId === leg.id;
              const color = resolveLegColor(leg, i);
              return (
              <tr
                key={leg.id}
                className="group border-b border-[var(--border-soft)] transition-colors"
                style={{
                  background: isHovered ? '#13100b' : undefined,
                  boxShadow: isHovered ? `inset 3px 0 0 ${color}` : undefined,
                }}
                onMouseEnter={() => onHoverLeg(leg.id)}
                onMouseLeave={() => onHoverLeg(null)}
              >
                <td className="num w-7 px-2 py-2 text-[10px] text-[var(--text-dim)]">
                  <div className="flex items-center gap-1.5">
                    <label
                      className="relative inline-flex h-4 w-4 cursor-pointer items-center justify-center"
                      title="Click to change color"
                      aria-label={`Pick color for leg ${i + 1}`}
                    >
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rounded-full transition-transform"
                        style={{
                          background: color,
                          transform: isHovered ? 'scale(1.6)' : 'scale(1)',
                          boxShadow: isHovered ? `0 0 6px ${color}` : 'none',
                        }}
                      />
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateLeg(leg.id, { color: e.target.value })}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-hidden
                      />
                    </label>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </td>
                <td className="px-1 py-2">
                  <select
                    value={leg.side}
                    onChange={(e) =>
                      updateLeg(leg.id, { side: e.target.value as Leg['side'] })
                    }
                    className="field-select w-[72px]"
                    style={{
                      color: leg.side === 'long' ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    <option value="long">LONG</option>
                    <option value="short">SHORT</option>
                  </select>
                </td>
                <td className="px-1 py-2">
                  <select
                    value={leg.kind}
                    onChange={(e) =>
                      updateLeg(leg.id, { kind: e.target.value as Leg['kind'] })
                    }
                    className="field-select w-[68px]"
                  >
                    <option value="call">CALL</option>
                    <option value="put">PUT</option>
                  </select>
                </td>
                <td className="px-1 py-2 text-right">
                  <input
                    type="number"
                    value={leg.strike}
                    step="0.5"
                    onChange={(e) =>
                      updateLeg(leg.id, { strike: Number(e.target.value) })
                    }
                    className="field w-[72px] text-right"
                  />
                </td>
                <td className="px-1 py-2 text-right">
                  <input
                    type="number"
                    value={leg.premium}
                    step="0.05"
                    min="0"
                    onChange={(e) =>
                      updateLeg(leg.id, { premium: Number(e.target.value) })
                    }
                    className="field w-[72px] text-right"
                  />
                </td>
                <td className="px-1 py-2 text-right">
                  <input
                    type="number"
                    value={leg.qty}
                    step="1"
                    min="1"
                    onChange={(e) =>
                      updateLeg(leg.id, { qty: Math.max(1, Number(e.target.value)) })
                    }
                    className="field w-12 text-right"
                  />
                </td>
                <td className="w-7 px-1 py-2 text-right">
                  <button
                    aria-label="Remove leg"
                    onClick={() => removeLeg(leg.id)}
                    className="text-[var(--text-dim)] opacity-0 transition-all hover:text-[var(--red)] group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function CombinedToggle({
  checked,
  onChange,
  color,
  onColorChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color: string;
  onColorChange: (v: string) => void;
}) {
  return (
    <div
      className="flex items-stretch border transition-colors"
      style={{
        borderColor: checked ? 'var(--border)' : 'transparent',
        background: checked ? '#0d0b09' : 'transparent',
        opacity: checked ? 1 : 0.5,
      }}
    >
      <label
        className="relative flex cursor-pointer items-center px-2"
        title="Click to change color"
        aria-label="Pick combined line color"
      >
        <span
          aria-hidden
          className="inline-block h-[2px] w-4"
          style={{ background: color }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-hidden
        />
      </label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className="px-2 py-1"
      >
        <span
          className="label"
          style={{ color: checked ? 'var(--text-mid)' : 'var(--text-dim)' }}
        >
          Combined
        </span>
      </button>
    </div>
  );
}

function ToggleChip({
  checked,
  onChange,
  label,
  swatch,
  swatchDashed = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  swatch: string;
  swatchDashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex items-center gap-2 border px-2 py-1 transition-colors"
      style={{
        borderColor: checked ? 'var(--border)' : 'transparent',
        background: checked ? '#0d0b09' : 'transparent',
        opacity: checked ? 1 : 0.5,
      }}
    >
      <span
        aria-hidden
        className="inline-block h-[2px] w-4"
        style={{
          background: swatchDashed
            ? `repeating-linear-gradient(to right, ${swatch} 0 3px, transparent 3px 6px)`
            : swatch,
        }}
      />
      <span
        className="label"
        style={{ color: checked ? 'var(--text-mid)' : 'var(--text-dim)' }}
      >
        {label}
      </span>
    </button>
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

function Th({
  children,
  align = 'left',
}: {
  children?: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className="label px-1 py-2 first:pl-2 last:pr-2"
      style={{ textAlign: align, fontWeight: 500 }}
    >
      {children}
    </th>
  );
}
