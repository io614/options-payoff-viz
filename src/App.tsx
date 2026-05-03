import { useState } from 'react';
import { LegEditor } from './components/LegEditor';
import { PayoffChart } from './components/PayoffChart';
import { Leg } from './lib/types';
import { PRESETS } from './lib/presets';

export default function App() {
  const [spot, setSpot] = useState(100);
  const [legs, setLegs] = useState<Leg[]>(() => PRESETS['Long Call'](100));
  const [showPerLeg, setShowPerLeg] = useState(true);
  const [showCombined, setShowCombined] = useState(true);
  const [hoveredLegId, setHoveredLegId] = useState<string | null>(null);

  return (
    <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col gap-6 px-6 py-6">
      <Header />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <section className="min-h-0">
          <LegEditor
            legs={legs}
            spot={spot}
            onLegsChange={setLegs}
            onSpotChange={setSpot}
            showPerLeg={showPerLeg}
            onShowPerLegChange={setShowPerLeg}
            showCombined={showCombined}
            onShowCombinedChange={setShowCombined}
            hoveredLegId={hoveredLegId}
            onHoverLeg={setHoveredLegId}
          />
        </section>
        <section className="min-h-[480px]">
          <PayoffChart
            legs={legs}
            spot={spot}
            showPerLeg={showPerLeg}
            showCombined={showCombined}
            hoveredLegId={hoveredLegId}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-end justify-between border-b border-[var(--border)] pb-4">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl leading-none" aria-hidden>📈</span>
        <div className="flex items-baseline gap-3">
          <h1 className="num text-[22px] font-bold tracking-[0.06em] text-[var(--text)]">
            OPTIONS&nbsp;PAYOFF
          </h1>
          <span className="display-serif text-[26px] leading-none text-[var(--amber)]">
            visualizer
          </span>
        </div>
      </div>
      <div className="flex items-center gap-5 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="pulse-dot" aria-hidden />
          <span className="label" style={{ color: 'var(--amber)' }}>LIVE</span>
        </div>
        <span className="label">PAYOFF&nbsp;@&nbsp;EXPIRY</span>
        <span className="label">100×&nbsp;MULT</span>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="flex justify-between border-t border-[var(--border-soft)] pt-3 text-[10px] text-[var(--text-dim)]">
      <span className="label">v0.1 · piecewise-linear · zero-IV</span>
      <span className="label">tooltip on hover</span>
    </footer>
  );
}
