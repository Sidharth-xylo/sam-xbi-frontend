import React from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar as RRadar, RadarChart, RadialBar, RadialBarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const XBI_COLORS = ["#d4ff3a", "#38f0e8", "#ff3da8", "#a98aff", "#ff8a3d", "#3ddc97", "#ffd23d", "#ff5470"];

const axisTick = { fill: "#b4b4b4", fontSize: 11, fontFamily: "JetBrains Mono, monospace" };
const tooltipStyle = {
  background: "rgba(255,255,255,0.98)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  color: "#1a1a1a",
  boxShadow: "0 12px 32px -8px rgba(0,0,0,0.24)",
  fontFamily: "Inter, sans-serif",
};
const tip = { contentStyle: tooltipStyle, labelStyle: { color: "#000", fontWeight: 700 }, cursor: { fill: "rgba(255,255,255,0.04)" } };

function EmptyChart({ height, label = "No data yet" }) {
  return <div className="chart-empty" style={{ height }}>{label}</div>;
}

export function SimpleBar({ data = [], xKey, yKey, height = 280, color }) {
  if (!data.length) return <EmptyChart height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} interval={0} angle={data.length > 6 ? -20 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={data.length > 6 ? 46 : 24} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={42} />
          <Tooltip {...tip} />
          <Bar dataKey={yKey} radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => <Cell key={i} fill={color || XBI_COLORS[i % XBI_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleLine({ data = [], xKey, lines = [], height = 280 }) {
  if (!data.length) return <EmptyChart height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={42} />
          <Tooltip {...tip} />
          {lines.map((l, i) => <Line key={l} type="monotone" dataKey={l} stroke={XBI_COLORS[i % XBI_COLORS.length]} strokeWidth={2.5} dot={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaTrend({ data = [], xKey, areas = [], height = 260 }) {
  if (!data.length) return <EmptyChart height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            {areas.map((a, i) => {
              const c = a.color || XBI_COLORS[i % XBI_COLORS.length];
              return (
                <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={42} />
          <Tooltip {...tip} />
          {areas.map((a, i) => {
            const c = a.color || XBI_COLORS[i % XBI_COLORS.length];
            return <Area key={a.key} type="monotone" dataKey={a.key} stroke={c} strokeWidth={2.5} fill={`url(#grad-${a.key})`} />;
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data = [], nameKey = "name", valueKey = "value", height = 240, centerLabel, centerValue }) {
  if (!data.length) return <EmptyChart height={height} />;
  return (
    <div className="donut-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip {...tip} />
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius="62%" outerRadius="90%" paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={XBI_COLORS[i % XBI_COLORS.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerValue != null || centerLabel) && (
        <div className="donut-center">
          {centerValue != null && <strong>{centerValue}</strong>}
          {centerLabel && <span>{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function RadialGauge({ value = 0, max = 100, color = "#d4ff3a", label, suffix = "%", height = 200 }) {
  const v = Math.max(0, Math.min(value, max));
  return (
    <div className="gauge-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: v }]} startAngle={220} endAngle={-40}>
          <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={20} fill={color} background={{ fill: "rgba(255,255,255,0.06)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="gauge-center">
        <strong style={{ color }}>{Math.round(v)}{suffix}</strong>
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}

export function Sparkline({ data = [], dataKey, color = "#38f0e8", height = 40 }) {
  if (!data.length) return <div style={{ height }} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#spark-${dataKey})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Skill radar — student ratings (0-5) with an optional translucent "batch average" benchmark series.
// data: [{ axis, value, benchmark? }]. Primary series uses the lime accent at low opacity + solid
// stroke; the benchmark is muted + dashed, exactly as the report-card design calls for.
export function Radar({ data = [], height = 300, showBenchmark = true,
  primaryName = "This student", benchmarkName = "Batch average", color = "#d4ff3a" }) {
  if (!data.length) return <EmptyChart height={height} label="Not enough rated activities yet" />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "#e2e2e2", fontSize: 11, fontFamily: "Inter, sans-serif" }} />
          <PolarRadiusAxis domain={[0, 5]} angle={90} tick={{ fill: "#b4b4b4", fontSize: 9 }} stroke="rgba(255,255,255,0.08)" tickCount={6} />
          <Tooltip {...tip} />
          {showBenchmark && (
            <RRadar name={benchmarkName} dataKey="benchmark" stroke="#b4b4b4" strokeWidth={1.5}
              strokeDasharray="4 3" fill="#b4b4b4" fillOpacity={0.06} isAnimationActive={false} />
          )}
          <RRadar name={primaryName} dataKey="value" stroke={color} strokeWidth={2.5}
            fill={color} fillOpacity={0.22} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// GitHub-style day grid. data: [{ date: "YYYY-MM-DD", value }]. Ramps from transparent to the
// chosen accent (primary lime, or "error" red for absence views) in 4 intensity steps.
const HEAT_RAMPS = {
  primary: ["rgba(212,255,58,0.10)", "rgba(212,255,58,0.30)", "rgba(212,255,58,0.55)", "rgba(212,255,58,0.85)"],
  error: ["rgba(255,84,112,0.12)", "rgba(255,84,112,0.32)", "rgba(255,84,112,0.58)", "rgba(255,84,112,0.88)"],
  info: ["rgba(56,240,232,0.12)", "rgba(56,240,232,0.32)", "rgba(56,240,232,0.58)", "rgba(56,240,232,0.88)"],
};
const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", ""];

export function CalendarHeatmap({ data = [], ramp = "primary", max, height = 132, label }) {
  const byDate = new Map(data.filter((d) => d?.date).map((d) => [String(d.date).slice(0, 10), Number(d.value) || 0]));
  if (!byDate.size) return <EmptyChart height={height} label={label || "No activity in this period"} />;
  const dates = [...byDate.keys()].sort();
  const start = new Date(dates[0] + "T00:00:00");
  const end = new Date(dates[dates.length - 1] + "T00:00:00");
  const peak = max ?? Math.max(...byDate.values(), 1);
  const ramps = HEAT_RAMPS[ramp] || HEAT_RAMPS.primary;

  // Walk from the Monday on/just before `start` to `end`, one column per ISO week.
  const cursor = new Date(start);
  const mondayOffset = (cursor.getDay() + 6) % 7; // 0 = Monday
  cursor.setDate(cursor.getDate() - mondayOffset);
  const weeks = [];
  while (cursor <= end) {
    const col = [];
    for (let d = 0; d < 7; d += 1) {
      const iso = cursor.toISOString().slice(0, 10);
      const inRange = cursor >= start && cursor <= end;
      const value = byDate.get(iso);
      let bg = "rgba(255,255,255,0.04)";
      if (inRange && value > 0) {
        const step = Math.min(3, Math.floor((value / peak) * 3.999));
        bg = ramps[step];
      }
      col.push({ iso, value: inRange ? value : null, bg });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(col);
  }

  return (
    <div className="heatmap" style={{ minHeight: height }}>
      <div className="heatmap-weekdays">{WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}</div>
      <div className="heatmap-grid">
        {weeks.map((col, ci) => (
          <div className="heatmap-col" key={ci}>
            {col.map((cell) => (
              <i key={cell.iso} style={{ background: cell.bg }}
                 title={cell.value == null ? "" : `${cell.iso}: ${cell.value}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBar({ data = [], labelKey, valueKey, height = 280, colorBy }) {
  if (!data.length) return <EmptyChart height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey={labelKey} tick={axisTick} axisLine={false} tickLine={false} width={120} />
          <Tooltip {...tip} />
          <Bar dataKey={valueKey} radius={[0, 6, 6, 0]} maxBarSize={26}>
            {data.map((row, i) => <Cell key={i} fill={colorBy ? colorBy(row) : XBI_COLORS[i % XBI_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
