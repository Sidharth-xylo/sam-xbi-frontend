import React from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const inrGroup = (n) => Number(n).toLocaleString("en-IN");

// Animates a KPI number from 0 to `value` once, on first mount (~600ms). Respects reduced motion
// (jumps straight to the final value). `format` controls digit grouping — defaults to Indian grouping.
export default function CountUp({ value = 0, prefix = "", suffix = "", duration = 600, decimals = 0, format = inrGroup }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = React.useState(prefersReducedMotion() ? target : 0);

  React.useEffect(() => {
    if (prefersReducedMotion()) { setDisplay(target); return; }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Animate on first mount only — re-runs only if the target value actually changes.
  }, [target, duration]);

  const shown = decimals > 0 ? Number(display.toFixed(decimals)) : Math.round(display);
  return <>{prefix}{format(shown)}{suffix}</>;
}
