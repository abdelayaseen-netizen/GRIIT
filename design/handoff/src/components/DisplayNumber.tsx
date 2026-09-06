import React from 'react';
import { color, type, numberSize } from '../tokens';

// The only place the display face appears. Tabular figures so a count up cannot shift
// the layout. Size is one of the three sanctioned steps.
export function DisplayNumber({ value, size = 'home', onInk }: {
  value: number | string; size?: keyof typeof numberSize; onInk?: boolean;
}) {
  const px = numberSize[size];
  return (
    <div style={{ ...type.number, fontSize: px, lineHeight: `${px}px`, color: onInk ? color.textPrimary : color.textPrimary }}>
      {value}
    </div>
  );
}

// Counts up over motion.daySecuredMs. The only animation in the app.
export function useCountUp(to: number, from: number, ms: number, run: boolean) {
  const [n, setN] = React.useState(from);
  React.useEffect(() => {
    if (!run) return;
    const t0 = performance.now();
    let raf = 0;
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / ms);
      setN(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, from, ms, run]);
  return n;
}
