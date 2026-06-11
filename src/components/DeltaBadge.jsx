import React from "react";

// Period-over-period pill: "▲ +12.4% vs prev". Success token when the move is good, error when bad,
// muted when ~flat. `invert` flips the good/bad sense (e.g. outstanding fees — going down is good).
// Renders nothing when there is no comparable change (deltaPct null), so KPIs stay clean on cold data.
export default function DeltaBadge({ deltaPct, suffix = "%", invert = false, label = "vs prev", neutralBand = 0.5 }) {
  if (deltaPct == null) return null;
  const near0 = Math.abs(deltaPct) < neutralBand;
  const good = invert ? deltaPct < 0 : deltaPct > 0;
  const cls = near0 ? "neutral" : good ? "up" : "down";
  const arrow = near0 ? "→" : deltaPct > 0 ? "▲" : "▼";
  const sign = deltaPct > 0 ? "+" : "";
  return (
    <span className={`delta-badge ${cls}`} title={`${sign}${deltaPct}${suffix} ${label}`}>
      {arrow} {sign}{deltaPct}{suffix}{label ? <em> {label}</em> : null}
    </span>
  );
}
