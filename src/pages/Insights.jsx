import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, Sparkles, TrendingUp } from "lucide-react";
import { fetchInsights, sendChat } from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import DataTable from "../components/DataTable.jsx";
import { AreaTrend, Donut, HBar } from "../components/Charts.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", magenta: "#ff3da8", violet: "#a98aff", orange: "#ff8a3d", red: "#ff5470", green: "#3ddc97" };
const fmtMoney = (v) => (v == null ? "—" : `₹${Number(v).toLocaleString("en-IN")}`);
const fmtPct = (v) => (v == null ? "—" : `${v}%`);
const tagClass = (r) => (r.includes("attendance") ? "tag-red" : r.includes("completion") ? "tag-orange" : "tag-magenta");

export default function Insights() {
  const [filters, setFilters] = useState({});
  const [threshold, setThreshold] = useState(50);
  const params = { ...filters, threshold };
  const report = useQuery({ queryKey: ["insights", params], queryFn: () => fetchInsights(params) });
  const data = report.data || {};
  const revenue = data.revenue || {};
  const signals = data.signals || {};

  const briefing = useMutation({
    mutationFn: () => sendChat({ message: "Give me a short executive briefing (3-4 bullets) on students at risk and revenue health for everything I can access. Be specific with names and numbers." }),
  });

  const reasonDonut = useMemo(() => {
    const counts = {};
    (data.atRisk || []).forEach((s) => (s.reasons || []).forEach((r) => { counts[r] = (counts[r] || 0) + 1; }));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const riskColumns = useMemo(() => [
    { header: "Student", accessorKey: "name" },
    { header: "Batch", accessorKey: "batchName" },
    ...(signals.attendance ? [{ header: "Attendance", accessorKey: "attendancePct", cell: ({ getValue }) => fmtPct(getValue()) }] : []),
    ...(signals.completion ? [{ header: "Completion", accessorKey: "completionPct", cell: ({ getValue }) => fmtPct(getValue()) }] : []),
    ...(signals.fees ? [{ header: "Fee till", accessorKey: "feeValidTill", cell: ({ getValue }) => getValue() || "—" }] : []),
    { header: "Flags", accessorKey: "reasons", cell: ({ getValue }) => (
      <span className="reason-tags">{(getValue() || []).map((r) => <em key={r} className={`tag ${tagClass(r)}`}>{r}</em>)}</span>
    ) },
  ], [signals]);

  const revenueCards = [
    ...(signals.fees ? [{ key: "collected", label: "Collected", value: revenue.collected ?? 0, prefix: "₹", color: T.magenta, delta: revenue.momGrowthPct }] : []),
    ...(signals.fees ? [{ key: "arpu", label: "ARPU / active", value: revenue.arpu ?? 0, prefix: "₹", color: T.cyan }] : []),
    ...(signals.fees ? [{ key: "outstanding", label: "Outstanding", value: revenue.outstanding ?? 0, prefix: "₹", color: T.orange }] : []),
    ...(signals.fees ? [{ key: "active", label: "Active students", value: revenue.activeStudents ?? 0, color: T.green }] : []),
  ];

  return (
    <div className="page-stack">
      <Filters value={filters} onChange={setFilters} />

      {/* AI briefing */}
      <section className="panel ai-briefing" style={{ "--accent": T.magenta }}>
        <div className="ai-briefing-head">
          <h2><Sparkles size={15} /> AI briefing</h2>
          <button className="button primary-button" onClick={() => briefing.mutate()} disabled={briefing.isPending}>
            {briefing.isPending ? "Thinking…" : "Generate"}
          </button>
        </div>
        {!briefing.data && !briefing.isPending && !briefing.error && <p className="ai-hint">Let the assistant summarise who's at risk and how revenue is tracking — in plain English, scoped to your access.</p>}
        {briefing.isPending && <div className="chat-typing"><span /><span /><span /></div>}
        {briefing.error && <p className="ai-hint error">⚠️ {briefing.error?.response?.data?.detail || "Add your OpenAI key to enable AI briefings."}</p>}
        {briefing.data && <div className="ai-briefing-body">{briefing.data.reply}</div>}
      </section>

      {/* threshold */}
      <section className="panel threshold-bar" style={{ "--accent": T.orange }}>
        <div>
          <span className="eyebrow"><AlertTriangle size={14} /> Risk threshold</span>
          <h2>Flag students below {threshold}%</h2>
          <p>At risk when attendance or completion drops under this line, or a fee has expired.</p>
        </div>
        <div className="threshold-control">
          <input type="range" min="10" max="90" step="5" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
          <strong>{threshold}%</strong>
        </div>
      </section>

      <KpiGrid cards={[
        { key: "atRisk", label: "Students at risk", value: data.counts?.atRisk ?? 0, color: T.red },
        { key: "total", label: "Students in scope", value: data.counts?.totalStudents ?? 0, color: T.violet },
        ...(signals.fees ? [{ key: "renewals", label: "Renewals due (14d)", value: revenue.renewalsDue?.length ?? 0, color: T.orange }] : []),
        ...(signals.fees ? [{ key: "active", label: "Active students", value: revenue.activeStudents ?? 0, color: T.green }] : []),
      ]} />

      <div className="grid-2-1">
        <article className="panel" style={{ "--accent": T.red }}>
          <h2>Risk reasons</h2>
          {reasonDonut.length ? <Donut data={reasonDonut} height={240} centerValue={data.counts?.atRisk ?? 0} centerLabel="at risk" /> : <div className="empty-inline">No students at risk 🎉</div>}
        </article>
        {signals.fees && (
          <article className="panel" style={{ "--accent": T.magenta }}>
            <h2>Monthly collection</h2>
            <AreaTrend data={revenue.byMonth || []} xKey="month" areas={[{ key: "collected", color: T.magenta }]} height={240} />
          </article>
        )}
      </div>

      {signals.fees && (
        <>
          <h2 className="section-title"><TrendingUp size={16} /> Revenue health</h2>
          <KpiGrid cards={revenueCards} />
        </>
      )}

      <h2 className="section-title"><AlertTriangle size={16} /> Students at risk</h2>
      {report.isLoading && <div className="empty-inline">Analysing…</div>}
      <section className="panel" style={{ "--accent": T.red }}>
        <DataTable columns={riskColumns} data={data.atRisk || []} empty="No students are below the threshold in your scope. 🎉" />
      </section>

      {signals.fees && (
        <section className="panel" style={{ "--accent": T.orange }}>
          <h2><CalendarClock size={16} /> Renewals due (next 14 days)</h2>
          {(revenue.renewalsDue || []).length === 0 && <div className="empty-inline">No renewals due in the window.</div>}
          <ul className="renewal-list">
            {(revenue.renewalsDue || []).map((r) => (
              <li key={r.studentId}><strong>{r.name}</strong><span>{r.batchName || "—"}</span><em>{r.validTill}</em></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
