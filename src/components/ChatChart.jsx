import React from "react";
import { AreaTrend, CalendarHeatmap, Donut, HBar, Radar, Sparkline } from "./Charts.jsx";

const COLORS = ["#d4ff3a", "#38f0e8", "#ff3da8", "#a98aff", "#ff8a3d"];

// Merge multiple series into one row-per-x table: { x, "<series name>": y, ... }.
function mergeSeries(series = []) {
  const rows = new Map();
  series.forEach((s) => (s.data || []).forEach((p) => {
    const row = rows.get(p.x) || { x: p.x };
    row[s.name] = p.y;
    rows.set(p.x, row);
  }));
  return [...rows.values()];
}

// Maps a closed chart spec from the assistant onto the existing Charts.jsx kit. Renders nothing on a
// malformed spec, so a bad block can never crash the thread (the text block still shows).
export default function ChatChart({ spec }) {
  if (!spec || !Array.isArray(spec.series) || !spec.series.length) return null;
  const { chartType, title, series } = spec;
  let body = null;

  try {
    if (chartType === "area") {
      const data = mergeSeries(series);
      body = <AreaTrend data={data} xKey="x" areas={series.map((s, i) => ({ key: s.name, color: COLORS[i % COLORS.length] }))} height={260} />;
    } else if (chartType === "bar") {
      const data = (series[0].data || []).map((p) => ({ label: String(p.x), value: p.y }));
      body = <HBar data={data} labelKey="label" valueKey="value" height={Math.max(160, data.length * 30)} />;
    } else if (chartType === "donut") {
      const data = (series[0].data || []).map((p) => ({ name: String(p.x), value: p.y }));
      body = <Donut data={data} height={240} />;
    } else if (chartType === "sparkline") {
      const data = (series[0].data || []).map((p) => ({ v: p.y }));
      body = <Sparkline data={data} dataKey="v" height={64} />;
    } else if (chartType === "radar") {
      const primary = series[0]?.data || [];
      const bench = series[1]?.data || [];
      const benchByX = new Map(bench.map((p) => [p.x, p.y]));
      const data = primary.map((p) => ({ axis: String(p.x), value: p.y, benchmark: benchByX.get(p.x) ?? null }));
      body = <Radar data={data} height={300} showBenchmark={series.length > 1} />;
    } else if (chartType === "heatmap") {
      const data = (series[0].data || []).map((p) => ({ date: p.x, value: p.y }));
      body = <CalendarHeatmap data={data} height={132} />;
    }
  } catch {
    return null;
  }
  if (!body) return null;

  return (
    <div className="chat-chart">
      {title && <div className="chat-chart-title">{title}</div>}
      {body}
    </div>
  );
}
