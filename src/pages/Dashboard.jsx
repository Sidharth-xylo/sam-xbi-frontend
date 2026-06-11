import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ChevronRight, ClipboardList, Home, IndianRupee } from "lucide-react";
import {
  fetchAttendance, fetchDashboard, fetchFees,
  fetchPerformanceStudents, fetchStudentPerformance,
} from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import DataTable from "../components/DataTable.jsx";
import { AreaTrend, Donut, HBar, RadialGauge, SimpleBar } from "../components/Charts.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", magenta: "#ff3da8", violet: "#a98aff", orange: "#ff8a3d", red: "#ff5470", green: "#3ddc97" };
const fmtMoney = (v) => (v == null ? "—" : `₹${Number(v).toLocaleString("en-IN")}`);
const fmtPct = (v) => (v == null ? "—" : `${v}%`);
const tierColor = (p) => (p >= 80 ? T.green : p >= 60 ? T.cyan : p >= 40 ? T.violet : p >= 20 ? T.orange : T.red);

function mergeBatches(attendance, performance, fees) {
  const map = new Map();
  const ensure = (id, name, extra = {}) => {
    const k = String(id);
    if (!map.has(k)) map.set(k, { batchId: id, batchName: name, venueName: "", sportName: "", attendancePct: null, completionPct: null, collected: null });
    const row = map.get(k);
    for (const [key, val] of Object.entries(extra)) if (val !== undefined && val !== null) row[key] = val;
    return row;
  };
  (attendance?.byBatch || []).forEach((b) => ensure(b.batchId, b.batchName, { venueName: b.venueName, sportName: b.sportName, attendancePct: b.attendancePct }));
  (performance?.batches || []).forEach((b) => ensure(b.batchId, b.batchName, { venueName: b.venueName, sportName: b.sportName, completionPct: b.completionPct }));
  (fees?.byBatch || []).forEach((b) => ensure(b.batchId, b.batchName, { collected: b.collected }));
  return Array.from(map.values());
}

function mergeStudents(attendance, perfStudents, fees) {
  const map = new Map();
  const ensure = (id, name, extra = {}) => {
    const k = String(id);
    if (!map.has(k)) map.set(k, { studentId: id, name, attendancePct: null, present: null, absent: null, completionPct: null, completed: null, collected: 0 });
    const row = map.get(k);
    for (const [key, val] of Object.entries(extra)) if (val !== undefined && val !== null) row[key] = val;
    return row;
  };
  (attendance?.students || []).forEach((s) => ensure(s.studentId, s.name, { attendancePct: s.attendancePct, present: s.present, absent: s.absent }));
  (perfStudents?.students || []).forEach((s) => ensure(s.studentId, s.name, { completionPct: s.completionPct, completed: s.completed }));
  (fees?.students || []).forEach((s) => { const r = ensure(s.studentId, s.studentName); r.collected = (r.collected || 0) + (s.collected || 0); });
  return Array.from(map.values());
}

export default function Dashboard({ modules = {} }) {
  const [filters, setFilters] = useState({});
  const [batch, setBatch] = useState(null);
  const [student, setStudent] = useState(null);
  const dates = { dateFrom: filters.dateFrom, dateTo: filters.dateTo };

  const overview = useQuery({ queryKey: ["dash", filters], queryFn: () => fetchDashboard(filters) });
  const data = overview.data || {};

  const batchAtt = useQuery({ queryKey: ["d-b-att", batch?.batchId, dates], queryFn: () => fetchAttendance({ batchId: batch.batchId, ...dates }), enabled: Boolean(batch) && Boolean(modules.attendance) });
  const batchFees = useQuery({ queryKey: ["d-b-fee", batch?.batchId, dates], queryFn: () => fetchFees({ batchId: batch.batchId, ...dates }), enabled: Boolean(batch) && Boolean(modules.fees) });
  const batchPerf = useQuery({ queryKey: ["d-b-perf", batch?.batchId, dates], queryFn: () => fetchPerformanceStudents(batch.batchId, dates), enabled: Boolean(batch) && Boolean(modules.performance) });

  const stuAtt = useQuery({ queryKey: ["d-s-att", student?.studentId, dates], queryFn: () => fetchAttendance({ studentId: student.studentId, ...dates }), enabled: Boolean(student) && Boolean(modules.attendance) });
  const stuFees = useQuery({ queryKey: ["d-s-fee", student?.studentId, dates], queryFn: () => fetchFees({ studentId: student.studentId, ...dates }), enabled: Boolean(student) && Boolean(modules.fees) });
  const stuPerf = useQuery({ queryKey: ["d-s-perf", student?.studentId, dates], queryFn: () => fetchStudentPerformance(student.studentId, dates), enabled: Boolean(student) && Boolean(modules.performance) });

  const batches = useMemo(() => mergeBatches(data.attendance, data.performance, data.fees), [data]);
  const batchStudents = useMemo(() => mergeStudents(batchAtt.data, batchPerf.data, batchFees.data), [batchAtt.data, batchPerf.data, batchFees.data]);

  const reset = () => { setBatch(null); setStudent(null); };

  const studentColumns = useMemo(() => [
    { header: "Student", accessorKey: "name" },
    ...(modules.attendance ? [{ header: "Attendance", accessorKey: "attendancePct", cell: ({ getValue }) => fmtPct(getValue()) }] : []),
    ...(modules.performance ? [{ header: "Completion", accessorKey: "completionPct", cell: ({ getValue }) => fmtPct(getValue()) }] : []),
    ...(modules.fees ? [{ header: "Collected", accessorKey: "collected", cell: ({ getValue }) => fmtMoney(getValue()) }] : []),
    { id: "actions", header: "", cell: ({ row }) => <button className="icon-button" onClick={() => setStudent(row.original)}><ChevronRight size={16} /></button> },
  ], [modules]);

  // ---- overview derived ----
  const overviewCards = [];
  if (modules.attendance) overviewCards.push({ key: "att", label: "Attendance", value: data.attendance?.summary?.attendancePct ?? 0, suffix: "%", color: T.lime });
  if (modules.performance) overviewCards.push({ key: "comp", label: "Completion", value: data.performance?.summary?.completionPct ?? 0, suffix: "%", color: T.cyan });
  if (modules.fees) overviewCards.push({ key: "fee", label: "Fee collected", value: data.fees?.summary?.collected ?? 0, prefix: "₹", color: T.magenta });
  overviewCards.push({ key: "stu", label: "Students in scope", value: (data.cards || []).find((c) => c.key === "students")?.value ?? 0, color: T.violet });
  overviewCards.push({ key: "bat", label: "Batches", value: batches.length, color: T.orange });

  const feeByBatch = (data.fees?.byBatch || []).map((b) => ({ name: b.batchName, value: b.collected }));
  const payMethods = (data.fees?.paymentMethods || []).map((m) => ({ name: m.method, value: m.amount }));
  const feeTotal = (data.fees?.summary?.collected) ?? 0;

  return (
    <div className="page-stack">
      <Filters value={filters} onChange={(next) => { setFilters(next); reset(); }} />

      <div className="breadcrumb">
        <button onClick={reset}><Home size={14} /> Overview</button>
        {batch && <><span>/</span><button onClick={() => setStudent(null)}>{batch.batchName}</button></>}
        {student && <><span>/</span><strong>{student.name}</strong></>}
      </div>

      {/* ===== OVERVIEW ===== */}
      {!batch && (
        <div className="fade-in">
          <KpiGrid cards={overviewCards} />

          <div className="grid-2-1">
            {modules.attendance && (
              <article className="panel" style={{ "--accent": T.lime }}>
                <h2>Attendance trend</h2>
                <AreaTrend data={data.attendance?.byDate || []} xKey="date" areas={[{ key: "present", color: T.lime }, { key: "absent", color: T.red }]} height={260} />
              </article>
            )}
            {modules.fees && (
              <article className="panel" style={{ "--accent": T.magenta }}>
                <h2>Fee by batch</h2>
                <Donut data={feeByBatch} centerValue={fmtMoney(feeTotal)} centerLabel="collected" height={240} />
              </article>
            )}
          </div>

          <div className="grid-3">
            {modules.performance && (
              <article className="panel" style={{ "--accent": T.cyan }}>
                <h2>Batch completion</h2>
                <HBar data={batches.filter((b) => b.completionPct != null)} labelKey="batchName" valueKey="completionPct" colorBy={(r) => tierColor(r.completionPct)} height={240} />
              </article>
            )}
            {modules.fees && (
              <article className="panel" style={{ "--accent": T.orange }}>
                <h2>Monthly collection</h2>
                <AreaTrend data={data.fees?.byMonth || []} xKey="month" areas={[{ key: "collected", color: T.orange }]} height={240} />
              </article>
            )}
            {modules.fees && (
              <article className="panel" style={{ "--accent": T.violet }}>
                <h2>Payment methods</h2>
                <Donut data={payMethods} centerLabel="methods" height={240} />
              </article>
            )}
          </div>

          <section className="panel drill-panel" style={{ "--accent": T.lime }}>
            <h2>Batches — click to drill in</h2>
            {overview.isLoading && <div className="empty-inline">Loading…</div>}
            {!overview.isLoading && !batches.length && <div className="empty-inline">No batches in your current scope.</div>}
            <div className="batch-grid">
              {batches.map((b) => (
                <button className="batch-card" key={b.batchId} onClick={() => { setBatch(b); setStudent(null); }}>
                  <span>{[b.venueName, b.sportName].filter(Boolean).join(" / ") || "Batch"}</span>
                  <strong>{b.batchName}</strong>
                  <div className="batch-metrics">
                    {modules.attendance && <em style={{ color: T.lime }}><ClipboardList size={12} /> {fmtPct(b.attendancePct)}</em>}
                    {modules.performance && <em style={{ color: T.cyan }}><Activity size={12} /> {fmtPct(b.completionPct)}</em>}
                    {modules.fees && <em style={{ color: T.magenta }}><IndianRupee size={12} /> {fmtMoney(b.collected)}</em>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ===== BATCH ===== */}
      {batch && !student && (
        <div className="fade-in">
          <div className="grid-3">
            {modules.attendance && (
              <article className="panel" style={{ "--accent": T.lime }}>
                <h2>Attendance</h2>
                <RadialGauge value={batchAtt.data?.summary?.attendancePct ?? 0} color={T.lime} label="present rate" height={200} />
              </article>
            )}
            {modules.performance && (
              <article className="panel" style={{ "--accent": T.cyan }}>
                <h2>Completion</h2>
                <RadialGauge value={batchStudents.length ? Math.round(batchStudents.reduce((a, s) => a + (s.completionPct || 0), 0) / batchStudents.length) : 0} color={T.cyan} label="avg completion" height={200} />
              </article>
            )}
            <article className="panel" style={{ "--accent": T.magenta }}>
              <h2>Batch summary</h2>
              <div className="mini-stats">
                {modules.fees && <div><span>Collected</span><strong style={{ color: T.magenta }}>{fmtMoney(batchFees.data?.summary?.collected ?? 0)}</strong></div>}
                <div><span>Students</span><strong style={{ color: T.violet }}>{batchStudents.length}</strong></div>
                {modules.fees && <div><span>Active</span><strong style={{ color: T.green }}>{batchFees.data?.summary?.activeEnrollments ?? 0}</strong></div>}
              </div>
            </article>
          </div>

          <div className="grid-two">
            {modules.attendance && (
              <article className="panel" style={{ "--accent": T.lime }}><h2>Attendance trend</h2>
                <AreaTrend data={batchAtt.data?.byDate || []} xKey="date" areas={[{ key: "present", color: T.lime }, { key: "absent", color: T.red }]} height={230} />
              </article>
            )}
            {modules.fees && (
              <article className="panel" style={{ "--accent": T.orange }}><h2>Fee by month</h2>
                <AreaTrend data={batchFees.data?.byMonth || []} xKey="month" areas={[{ key: "collected", color: T.orange }]} height={230} />
              </article>
            )}
          </div>

          <section className="panel drill-panel" style={{ "--accent": T.cyan }}>
            <h2>{batch.batchName} — students</h2>
            <HBar data={[...batchStudents].sort((a, b) => (b.completionPct || 0) - (a.completionPct || 0))} labelKey="name" valueKey={modules.performance ? "completionPct" : (modules.attendance ? "attendancePct" : "collected")} colorBy={(r) => tierColor(modules.performance ? r.completionPct : r.attendancePct)} height={Math.max(180, batchStudents.length * 30)} />
            <DataTable columns={studentColumns} data={batchStudents} empty="No students in this batch for your scope." />
          </section>
        </div>
      )}

      {/* ===== STUDENT ===== */}
      {student && (() => {
        const acts = stuPerf.data?.activities || [];
        const totals = acts.reduce((a, x) => ({ c: a.c + (x.completed || 0), t: a.t + (x.total || 0) }), { c: 0, t: 0 });
        const overallComp = totals.t ? Math.round((totals.c / totals.t) * 100) : 0;
        const statusCounts = (stuPerf.data?.matrix || []).reduce((a, m) => { a[m.status || "pending"] = (a[m.status || "pending"] || 0) + 1; return a; }, {});
        const statusDonut = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        return (
          <div className="fade-in">
            <KpiGrid cards={[
              ...(modules.attendance ? [{ key: "att", label: "Attendance", value: stuAtt.data?.summary?.attendancePct ?? 0, suffix: "%", color: T.lime }] : []),
              ...(modules.attendance ? [{ key: "pres", label: "Present", value: stuAtt.data?.summary?.present ?? 0, color: T.green }] : []),
              ...(modules.attendance ? [{ key: "abs", label: "Absent", value: stuAtt.data?.summary?.absent ?? 0, color: T.red }] : []),
              ...(modules.fees ? [{ key: "fee", label: "Collected", value: stuFees.data?.summary?.collected ?? 0, prefix: "₹", color: T.magenta }] : []),
            ]} />

            <div className="grid-3">
              {modules.attendance && <article className="panel" style={{ "--accent": T.lime }}><h2>Attendance</h2><RadialGauge value={stuAtt.data?.summary?.attendancePct ?? 0} color={T.lime} label="present rate" height={190} /></article>}
              {modules.performance && <article className="panel" style={{ "--accent": T.cyan }}><h2>Completion</h2><RadialGauge value={overallComp} color={T.cyan} label="activities done" height={190} /></article>}
              {modules.performance && <article className="panel" style={{ "--accent": T.violet }}><h2>Activity status</h2><Donut data={statusDonut} height={190} centerLabel="sessions" centerValue={(stuPerf.data?.matrix || []).length} /></article>}
            </div>

            <div className="grid-two">
              {modules.attendance && <article className="panel" style={{ "--accent": T.lime }}><h2>Attendance over time</h2><AreaTrend data={stuAtt.data?.byDate || []} xKey="date" areas={[{ key: "present", color: T.lime }, { key: "absent", color: T.red }]} height={220} /></article>}
              {modules.performance && <article className="panel" style={{ "--accent": T.cyan }}><h2>Activity strengths</h2><HBar data={acts} labelKey="activityName" valueKey="completionPct" colorBy={(r) => tierColor(r.completionPct)} height={Math.max(180, acts.length * 28)} /></article>}
            </div>

            {modules.performance && (
              <article className="panel" style={{ "--accent": T.magenta }}><h2>Day-wise progress</h2>
                <AreaTrend data={stuPerf.data?.timeline || []} xKey="scheduled_date" areas={[{ key: "completed", color: T.green }, { key: "incomplete", color: T.red }]} height={220} />
              </article>
            )}

            {modules.fees && Boolean(stuFees.data?.students?.length) && (
              <article className="panel" style={{ "--accent": T.orange }}><h2>Fee history</h2>
                <DataTable
                  columns={[
                    { header: "Plan", accessorKey: "planName" },
                    { header: "Status", accessorKey: "paymentStatus" },
                    { header: "Collected", accessorKey: "collected", cell: ({ getValue }) => fmtMoney(getValue()) },
                    { header: "Valid Till", accessorKey: "validTill" },
                  ]}
                  data={stuFees.data?.students || []}
                  empty="No fee records."
                />
              </article>
            )}

            {modules.performance && (
              <section className="panel drill-panel" style={{ "--accent": T.violet }}>
                <h2>Activity log</h2>
                <div className="activity-matrix">
                  {(stuPerf.data?.matrix || []).slice(0, 60).map((item) => (
                    <article key={`${item.id}-${item.activityName}-${item.scheduled_date}`} className={`matrix-cell ${item.status || "pending"}`}>
                      <strong>{item.activityName}</strong>
                      <span>{item.scheduled_date || "—"} · {item.status || "pending"}</span>
                      {item.remarks && !item.remarks.startsWith("[xbiseed]") && <p>{item.remarks}</p>}
                    </article>
                  ))}
                  {!(stuPerf.data?.matrix || []).length && <div className="empty-inline">No activity records.</div>}
                </div>
              </section>
            )}
          </div>
        );
      })()}
    </div>
  );
}
