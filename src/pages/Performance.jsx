import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, FileText, Home, Plus, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPerformanceBatches, fetchPerformanceCompare, fetchPerformanceStudents, fetchStudentPerformance } from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import DataTable from "../components/DataTable.jsx";
import { AreaTrend, Donut, HBar, RadialGauge } from "../components/Charts.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", magenta: "#ff3da8", violet: "#a98aff", orange: "#ff8a3d", red: "#ff5470", green: "#3ddc97", muted: "#b4b4b4" };
const fmtPct = (v) => (v == null ? "—" : `${v}%`);
const fmtNum = (v) => Number(v || 0).toLocaleString();
const fmtMin = (v) => `${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} min`;
const fmtRating = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}★`);
const tier = (p) => (p >= 80 ? T.green : p >= 60 ? T.cyan : p >= 40 ? T.violet : p >= 20 ? T.orange : T.red);
const linkBtn = { background: "none", border: 0, color: T.cyan, cursor: "pointer", padding: 0, font: "inherit", textAlign: "left", fontWeight: 600 };
const MAX_COMPARE = 4;

// Heatmap cell colour: red (rating 1) -> green (rating 5).
function ratingBg(r) {
  if (r == null) return "rgba(255,255,255,0.03)";
  const t = Math.max(0, Math.min(1, (r - 1) / 4));
  const lerp = (a, b) => Math.round(a + (b - a) * t);
  return `rgba(${lerp(255, 61)},${lerp(84, 220)},${lerp(112, 151)},0.28)`;
}
const mean = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
const ratingColor = (r) => (r == null ? T.muted : r >= 4 ? T.green : r >= 3 ? T.lime : r >= 2 ? T.orange : T.red);

export default function Performance() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [batch, setBatch] = useState(null);
  const [student, setStudent] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const dates = { dateFrom: filters.dateFrom, dateTo: filters.dateTo };

  const batches = useQuery({ queryKey: ["perf-batches", filters], queryFn: () => fetchPerformanceBatches(filters) });
  const students = useQuery({ queryKey: ["perf-students", batch?.batchId, dates], queryFn: () => fetchPerformanceStudents(batch.batchId, dates), enabled: Boolean(batch) });
  const compare = useQuery({ queryKey: ["perf-compare", batch?.batchId, dates], queryFn: () => fetchPerformanceCompare(batch.batchId, dates), enabled: Boolean(batch) });
  const detail = useQuery({ queryKey: ["perf-detail", student?.studentId, dates], queryFn: () => fetchStudentPerformance(student.studentId, dates), enabled: Boolean(student) });

  function resetTo(level) {
    if (level === "root") { setBatch(null); setStudent(null); setCompareIds([]); }
    if (level === "batch") setStudent(null);
  }
  function openBatch(b) { setBatch(b); setStudent(null); setCompareIds([]); }
  function toggleCompare(id) {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : (prev.length >= MAX_COMPARE ? prev : [...prev, id]));
  }

  const studentColumns = useMemo(() => [
    { id: "cmp", header: "", cell: ({ row }) => {
      const id = row.original.studentId;
      const on = compareIds.includes(id);
      return <button className={`compare-toggle ${on ? "on" : ""}`} title={on ? "Remove from comparison" : "Add to comparison"} onClick={() => toggleCompare(id)}>{on ? <Check size={13} /> : <Plus size={13} />}</button>;
    } },
    { header: "Student", accessorKey: "name", cell: ({ row, getValue }) => <button style={linkBtn} onClick={() => setStudent(row.original)}>{getValue()}</button> },
    { header: "Score", accessorKey: "performanceScore", cell: ({ getValue }) => { const v = getValue(); return <strong style={{ color: tier(v || 0) }}>{v != null ? v : "—"}</strong>; } },
    { header: "Avg rating", accessorKey: "averageRating", cell: ({ getValue }) => fmtRating(getValue()) },
    { header: "Completion", accessorKey: "completionPct", cell: ({ getValue }) => fmtPct(getValue()) },
    { header: "Sessions", accessorKey: "completed", cell: ({ row }) => `${row.original.completed || 0}/${row.original.total || 0}` },
    { id: "actions", header: "", cell: ({ row }) => <button className="icon-button" onClick={() => setStudent(row.original)}><ChevronRight size={16} /></button> },
  ], [compareIds]);

  const activityColumns = useMemo(() => [
    { header: "Activity", accessorKey: "activityName" },
    { header: "Sport", accessorKey: "sportName" },
    { header: "Completion", accessorKey: "completionPct", cell: ({ getValue }) => fmtPct(getValue()) },
    { header: "Reps", accessorKey: "reps", cell: ({ getValue }) => fmtNum(getValue()) },
    { header: "Minutes", accessorKey: "minutes", cell: ({ getValue }) => fmtMin(getValue()) },
    { header: "Rating", accessorKey: "averageRating", cell: ({ getValue }) => fmtRating(getValue()) },
  ], []);

  const bd = batches.data || {};
  const studentRows = students.data?.students || [];
  const byScore = (a, b) => (b.performanceScore || 0) - (a.performanceScore || 0);

  const compareData = compare.data || {};
  const compareActivities = compareData.activities || [];
  const compareList = compareIds.map((id) => {
    const fromCompare = (compareData.students || []).find((s) => s.studentId === id) || { perActivity: {} };
    const fromRoster = studentRows.find((s) => s.studentId === id) || {};
    return { studentId: id, name: fromRoster.name || fromCompare.name || `#${id}`, performanceScore: fromRoster.performanceScore, perActivity: fromCompare.perActivity || {} };
  });

  return (
    <div className="page-stack">
      <Filters value={filters} onChange={(next) => { setFilters(next); resetTo("root"); }} />

      <div className="breadcrumb">
        <button onClick={() => resetTo("root")}><Home size={14} /> All batches</button>
        {batch && <><span>/</span><button onClick={() => resetTo("batch")}>{batch.batchName}</button></>}
        {student && <><span>/</span><strong>{student.name}</strong></>}
      </div>

      <div className="page-actions">
        {student && (
          <button className="button" onClick={() => navigate(`/reports?studentId=${student.studentId}`)}>
            <FileText size={16} /> Report card
          </button>
        )}
      </div>

      {/* ===== ALL BATCHES ===== */}
      {!batch && (
        <div className="fade-in">
          <KpiGrid cards={[
            { key: "completion", label: "Completion", value: bd.summary?.completionPct || 0, suffix: "%", color: T.cyan },
            { key: "completed", label: "Completed", value: bd.summary?.completed || 0, color: T.green },
            { key: "incomplete", label: "Incomplete", value: bd.summary?.incomplete || 0, color: T.red },
            { key: "total", label: "Activities tracked", value: bd.summary?.totalActivities || 0, color: T.violet },
          ]} />

          <article className="panel" style={{ "--accent": T.lime }}>
            <h2>Batch performance score <span className="h2-note">completion + coach rating, 0–100</span></h2>
            <HBar data={(bd.batches || []).filter((b) => b.performanceScore != null)} labelKey="batchName" valueKey="performanceScore" colorBy={(r) => tier(r.performanceScore)} height={Math.max(180, (bd.batches || []).length * 32)} />
          </article>

          <section className="panel drill-panel" style={{ "--accent": T.lime }}>
            <h2>Batches — click to drill into students</h2>
            {batches.isLoading && <div className="empty-inline">Loading…</div>}
            {!batches.isLoading && !(bd.batches || []).length && <div className="empty-inline">No batches in your scope.</div>}
            <div className="batch-grid">
              {(bd.batches || []).map((b) => (
                <button className="batch-card" key={b.batchId} onClick={() => openBatch(b)}>
                  <span>{[b.venueName, b.sportName].filter(Boolean).join(" / ")}</span>
                  <strong>{b.batchName}</strong>
                  <div className="batch-metrics">
                    <em style={{ color: tier(b.performanceScore || 0) }}>{b.performanceScore != null ? `${b.performanceScore} score` : "—"}</em>
                    <em style={{ color: T.orange }}>{fmtRating(b.averageRating)}</em>
                    <em style={{ color: T.muted }}>{b.students} students</em>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ===== BATCH -> STUDENTS ===== */}
      {batch && !student && (
        <div className="fade-in">
          <div className="grid-3">
            <article className="panel" style={{ "--accent": T.cyan }}>
              <h2>Avg performance score</h2>
              <RadialGauge value={mean(studentRows.map((s) => s.performanceScore || 0))} color={T.cyan} label="across students" height={200} />
            </article>
            <article className="panel" style={{ "--accent": T.violet }}>
              <h2>{batch.batchName}</h2>
              <div className="mini-stats">
                <div><span>Students</span><strong style={{ color: T.violet }}>{studentRows.length}</strong></div>
                <div><span>Top performer</span><strong style={{ color: T.green, fontSize: 16 }}>{[...studentRows].sort(byScore)[0]?.name || "—"}</strong></div>
                <div><span>Needs focus</span><strong style={{ color: T.red, fontSize: 16 }}>{[...studentRows].sort((a, b) => -byScore(a, b))[0]?.name || "—"}</strong></div>
              </div>
            </article>
            <article className="panel" style={{ "--accent": T.orange }}>
              <h2>Score spread</h2>
              <Donut height={200} centerLabel="students" centerValue={studentRows.length}
                data={[
                  { name: "≥80", value: studentRows.filter((s) => (s.performanceScore || 0) >= 80).length },
                  { name: "50–79", value: studentRows.filter((s) => (s.performanceScore || 0) >= 50 && (s.performanceScore || 0) < 80).length },
                  { name: "<50", value: studentRows.filter((s) => (s.performanceScore || 0) < 50).length },
                ].filter((d) => d.value > 0)} />
            </article>
          </div>

          <section className="panel drill-panel" style={{ "--accent": T.cyan }}>
            <h2>Students — tap ⊕ to compare, name to drill in</h2>
            {students.isLoading && <div className="empty-inline">Loading students…</div>}
            {!students.isLoading && !studentRows.length && <div className="empty-inline">This batch has no enrolled students with activity records yet.</div>}
            {studentRows.length > 0 && (
              <>
                <HBar data={[...studentRows].sort(byScore)} labelKey="name" valueKey="performanceScore" colorBy={(r) => tier(r.performanceScore)} height={Math.max(180, studentRows.length * 30)} />
                <DataTable columns={studentColumns} data={[...studentRows].sort(byScore)} empty="No student performance records." />
              </>
            )}
          </section>

          {/* ===== STUDENT COMPARISON HEATMAP ===== */}
          {compareList.length >= 2 ? (
            <section className="panel" style={{ "--accent": T.magenta }}>
              <h2><Users size={16} /> Head-to-head — average rating per activity (out of 5)</h2>
              <div className="compare-grid" style={{ gridTemplateColumns: `minmax(150px, 1.6fr) repeat(${compareList.length}, minmax(72px, 1fr))` }}>
                <div className="compare-corner">Activity</div>
                {compareList.map((s) => (
                  <div key={s.studentId} className="compare-head">
                    <strong>{s.name}</strong>
                    <span className="compare-score" style={{ color: tier(s.performanceScore || 0) }}>{s.performanceScore != null ? s.performanceScore : "—"}<em>score</em></span>
                  </div>
                ))}
                {compareActivities.map((a) => (
                  <React.Fragment key={a.activityId}>
                    <div className="compare-activity">{a.activityName}</div>
                    {compareList.map((s) => {
                      const r = s.perActivity?.[String(a.activityId)]?.averageRating;
                      return <div key={s.studentId} className="compare-cell" style={{ background: ratingBg(r) }}>{r != null ? r.toFixed(1) : "—"}</div>;
                    })}
                  </React.Fragment>
                ))}
              </div>
              <p className="compare-hint">Greener = stronger on that drill. Up to {MAX_COMPARE} students; toggle with the ⊕ in the table.</p>
            </section>
          ) : compareIds.length === 1 ? (
            <div className="empty-inline">Pick one more student (⊕) to compare head-to-head.</div>
          ) : null}
        </div>
      )}

      {/* ===== STUDENT DETAIL ===== */}
      {student && (() => {
        const d = detail.data || {};
        const tot = d.totals || {};
        const sports = d.sports || [];
        const acts = d.activities || [];
        const matrix = d.matrix || [];
        const comp = Math.round(tot.completionPct || 0);
        const score = tot.performanceScore;
        const statusDonut = Object.entries(matrix.reduce((a, m) => { a[m.status || "pending"] = (a[m.status || "pending"] || 0) + 1; return a; }, {})).map(([name, value]) => ({ name, value }));
        return (
          <div className="fade-in">
            <KpiGrid cards={[
              { key: "score", label: "Performance score", value: score != null ? score : "—", color: tier(score || 0) },
              { key: "rating", label: "Avg coach rating", value: tot.averageRating != null ? Number(tot.averageRating).toFixed(1) : "—", suffix: tot.averageRating != null ? "★" : "", color: T.orange },
              { key: "completion", label: "Completion", value: tot.completionPct ?? 0, suffix: "%", color: T.violet },
              { key: "sessions", label: "Sessions done", value: `${tot.completed || 0}/${tot.total || 0}`, color: T.green },
              { key: "minutes", label: "Minutes trained", value: Math.round(tot.minutes || 0), color: T.cyan },
            ]} />

            <div className="grid-3">
              <article className="panel" style={{ "--accent": tier(score || 0) }}><h2>Performance score</h2><RadialGauge value={score || 0} max={100} suffix="" color={tier(score || 0)} label="composite" height={200} /></article>
              <article className="panel" style={{ "--accent": T.violet }}><h2>Session status</h2><Donut data={statusDonut} height={200} centerLabel="sessions" centerValue={matrix.length} /></article>
              <article className="panel" style={{ "--accent": T.lime }}><h2>Strongest activities (by rating)</h2>
                <div className="mini-stats">
                  {[...acts].filter((a) => a.averageRating != null).sort((a, b) => b.averageRating - a.averageRating).slice(0, 3).map((a) => (
                    <div key={`${a.sportId}-${a.activityId}`}><span>{a.activityName}</span><strong style={{ color: T.orange, fontSize: 18 }}>{fmtRating(a.averageRating)}</strong></div>
                  ))}
                  {!acts.some((a) => a.averageRating != null) && <div><span>No rated activities yet</span></div>}
                </div>
              </article>
            </div>

            {/* ===== PER-SPORT PERFORMANCE ===== */}
            <section className="panel" style={{ "--accent": T.lime }}>
              <h2>Performance by sport</h2>
              {detail.isLoading && <div className="empty-inline">Loading…</div>}
              {!detail.isLoading && !sports.length && <div className="empty-inline">No sport activity in this scope.</div>}
              {sports.length > 0 && (
                <>
                  <HBar data={sports} labelKey="sportName" valueKey="completionPct" colorBy={(r) => tier(r.completionPct || 0)} height={Math.max(150, sports.length * 44)} />
                  <div className="grid-3" style={{ marginTop: 12 }}>
                    {sports.map((s) => (
                      <article className="panel" key={s.sportId} style={{ "--accent": tier(s.completionPct || 0) }}>
                        <h2>{s.sportName}</h2>
                        <div className="mini-stats">
                          <div><span>Completion</span><strong style={{ color: tier(s.completionPct || 0) }}>{fmtPct(s.completionPct)}</strong></div>
                          <div><span>Sessions done</span><strong>{s.completed || 0}/{s.total || 0}</strong></div>
                          <div><span>Reps completed</span><strong style={{ color: T.lime }}>{fmtNum(s.reps)}</strong></div>
                          <div><span>Minutes trained</span><strong style={{ color: T.cyan }}>{fmtMin(s.minutes)}</strong></div>
                          <div><span>Avg rating</span><strong style={{ color: T.orange }}>{fmtRating(s.averageRating)}</strong></div>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>

            <div className="grid-two">
              <article className="panel" style={{ "--accent": T.magenta }}><h2>Day-wise rating trend</h2>
                <AreaTrend data={(d.timeline || []).filter((t) => t.averageRating != null)} xKey="scheduled_date" areas={[{ key: "averageRating", color: T.orange }]} height={230} />
              </article>
              <article className="panel" style={{ "--accent": T.cyan }}><h2>Activity quality (avg rating)</h2>
                <HBar data={[...acts].filter((a) => a.averageRating != null).sort((a, b) => b.averageRating - a.averageRating)} labelKey="activityName" valueKey="averageRating" colorBy={(row) => ratingColor(row.averageRating)} height={Math.max(180, acts.length * 28)} />
              </article>
            </div>

            {/* ===== PER-ACTIVITY TABLE (reps & minutes) ===== */}
            <section className="panel drill-panel" style={{ "--accent": T.green }}>
              <h2>Activity breakdown — reps, minutes &amp; rating</h2>
              {detail.isLoading && <div className="empty-inline">Loading…</div>}
              {!detail.isLoading && <DataTable columns={activityColumns} data={acts} empty="No activity records for this student." />}
            </section>

            <section className="panel drill-panel" style={{ "--accent": T.violet }}>
              <h2>Activity log</h2>
              {detail.isLoading && <div className="empty-inline">Loading…</div>}
              <div className="activity-matrix">
                {matrix.slice(0, 60).map((item) => (
                  <article key={`${item.id}-${item.activityName}-${item.scheduled_date}`} className={`matrix-cell ${item.status || "pending"}`}>
                    <strong>{item.activityName}</strong>
                    <span>{item.scheduled_date || "—"} · {item.status || "pending"}{item.rating ? ` · ${item.rating}★` : ""}</span>
                    {item.remarks && <p>{item.remarks}</p>}
                  </article>
                ))}
                {!detail.isLoading && !matrix.length && <div className="empty-inline">No activity records for this student.</div>}
              </div>
            </section>
          </div>
        );
      })()}
    </div>
  );
}
