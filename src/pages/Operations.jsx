import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, ClipboardList, IndianRupee, ShieldAlert } from "lucide-react";
import { fetchAttendance, fetchFees, fetchInsights } from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import DataTable from "../components/DataTable.jsx";
import { AreaTrend, AttendanceStackedBar, Donut, HBar } from "../components/Charts.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", magenta: "#ff3da8", violet: "#a98aff", orange: "#ff8a3d", red: "#ff5470", green: "#3ddc97", muted: "#b4b4b4" };
const fmtPct = (v) => (v == null ? "—" : `${v}%`);
const inr = (v) => Number(v || 0).toLocaleString("en-IN");
const tagClass = (r) => (r.includes("attendance") ? "tag-red" : r.includes("completion") ? "tag-orange" : "tag-magenta");

export default function Operations({ modules = {} }) {
  const [filters, setFilters] = useState({});
  const [threshold, setThreshold] = useState(50);
  const [dangerOpen, setDangerOpen] = useState(false);
  const params = { ...filters, threshold };

  const insights = useQuery({ queryKey: ["ops-insights", params], queryFn: () => fetchInsights(params) });
  const attendance = useQuery({ queryKey: ["ops-att", filters], queryFn: () => fetchAttendance(filters), enabled: !!modules.attendance });
  const fees = useQuery({ queryKey: ["ops-fees", filters], queryFn: () => fetchFees(filters), enabled: !!modules.fees });

  const ins = insights.data || {};
  const revenue = ins.revenue || {};
  const signals = ins.signals || {};
  const atRisk = ins.atRisk || [];
  const atRiskCount = ins.counts?.atRisk ?? 0;

  const attData = attendance.data || {};
  const attBatches = attData.byBatch || [];
  const belowCount = attBatches.filter((b) => b.attendancePct != null && b.attendancePct < threshold).length;
  const attBatchPct = attBatches.map((b) => {
    const seen = (b.present || 0) + (b.absent || 0);
    return {
      ...b,
      present: seen ? Math.round(((b.present || 0) / seen) * 100) : 0,
      absent: seen ? Math.round(((b.absent || 0) / seen) * 100) : 0,
    };
  });
  const attTrend = (attData.byDate || []).map((d) => ({
    date: d.date,
    present: d.present || 0,
    absent: d.absent || 0,
  }));

  const feesData = fees.data || {};
  const feeBatches = feesData.byBatch || [];

  const riskColumns = useMemo(() => [
    { header: "Student", accessorKey: "name" },
    { header: "Batch", accessorKey: "batchName" },
    ...(signals.attendance ? [{ header: "Attend %", accessorKey: "attendancePct", cell: ({ getValue }) => fmtPct(getValue()) }] : []),
    ...(signals.completion ? [{ header: "Completion %", accessorKey: "completionPct", cell: ({ getValue }) => fmtPct(getValue()) }] : []),
    ...(signals.fees ? [{ header: "Fee till", accessorKey: "feeValidTill", cell: ({ getValue }) => getValue() || "—" }] : []),
    { header: "Flags", accessorKey: "reasons", cell: ({ getValue }) => (
      <span className="reason-tags">{(getValue() || []).map((r) => <em key={r} className={`tag ${tagClass(r)}`}>{r}</em>)}</span>
    ) },
  ], [signals]);

  const reasonDonut = useMemo(() => {
    const counts = {};
    atRisk.forEach((s) => (s.reasons || []).forEach((r) => { counts[r] = (counts[r] || 0) + 1; }));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [atRisk]);

  const attStudentColumns = useMemo(() => [
    { header: "Student", accessorKey: "name" },
    { header: "Batch", accessorKey: "batchName" },
    { header: "Present", accessorKey: "present" },
    { header: "Absent", accessorKey: "absent" },
    { header: "Sessions", accessorKey: "total", cell: ({ row }) => `${row.original.present || 0}/${row.original.total || 0}` },
    { header: "Attend %", accessorKey: "attendancePct", cell: ({ getValue }) => {
      const v = getValue();
      return <strong style={{ color: v == null ? T.muted : v < threshold ? T.red : T.green }}>{fmtPct(v)}</strong>;
    } },
  ], [threshold]);

  const feeStudentColumns = useMemo(() => [
    { header: "Student", accessorKey: "studentName" },
    { header: "Batch", accessorKey: "batchName" },
    { header: "Plan", accessorKey: "planName", cell: ({ getValue }) => getValue() || "—" },
    { header: "Status", accessorKey: "paymentStatus", cell: ({ getValue }) => {
      const v = getValue() || "unpaid";
      return <em className={`tag ${v === "paid" ? "tag-green" : "tag-orange"}`}>{v}</em>;
    } },
    { header: "Collected", accessorKey: "collected", cell: ({ getValue }) => `₹${inr(getValue())}` },
    { header: "Valid till", accessorKey: "validTill", cell: ({ getValue }) => getValue() || "—" },
  ], []);

  const attStudents = attData.students || [];
  const feeStudents = feesData.students || [];
  const payMethods = (feesData.paymentMethods || []).map((m) => ({ name: m.method, value: m.amount }));
  const planStudents = useMemo(() => {
    const plans = new Map();
    feeStudents.filter((row) => row.isActive !== false).forEach((row) => {
      const name = row.planName || "Unassigned";
      if (!plans.has(name)) plans.set(name, new Set());
      plans.get(name).add(row.studentId ?? row.feeId);
    });
    return [...plans.entries()]
      .map(([planName, ids]) => ({ planName, students: ids.size }))
      .sort((a, b) => b.students - a.students || a.planName.localeCompare(b.planName));
  }, [feeStudents]);

  return (
    <div className="page-stack">
      <Filters value={filters} onChange={setFilters} />

      {/* Danger / needs-attention */}
      <section className={`panel danger-bar ${dangerOpen ? "danger-open" : ""}`} style={{ "--accent": T.red }}>
        <div className="danger-head">
          <div>
            <span className="eyebrow"><ShieldAlert size={14} /> Needs attention</span>
            <h2>{insights.isLoading ? "Scanning…" : `${atRiskCount} student${atRiskCount === 1 ? "" : "s"} at risk`}</h2>
            <p>Flagged for low attendance{signals.completion ? ", low completion" : ""}{signals.fees ? ", or an expired fee" : ""} — below the {threshold}% line.</p>
          </div>
          <button className="button danger-button" onClick={() => setDangerOpen((o) => !o)}>
            <AlertTriangle size={16} /> {dangerOpen ? "Hide" : "Show at-risk"}
          </button>
        </div>
        {dangerOpen && (
          <div className="danger-body">
            <div className="threshold-control inline">
              <label>Risk threshold</label>
              <input type="range" min="10" max="90" step="5" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
              <strong>{threshold}%</strong>
            </div>
            <div className="grid-2-1">
              <article className="panel subtle" style={{ "--accent": T.red }}>
                <h2>At-risk students</h2>
                <DataTable columns={riskColumns} data={atRisk} empty="No students below the threshold in your scope. 🎉" />
              </article>
              <article className="panel subtle" style={{ "--accent": T.orange }}>
                <h2>Risk reasons</h2>
                {reasonDonut.length ? <Donut data={reasonDonut} height={220} centerValue={atRiskCount} centerLabel="at risk" /> : <div className="empty-inline">No flags 🎉</div>}
              </article>
            </div>
            {signals.fees && (revenue.renewalsDue || []).length > 0 && (
              <article className="panel subtle" style={{ "--accent": T.orange }}>
                <h2><CalendarClock size={16} /> Renewals due (next 14 days)</h2>
                <ul className="renewal-list">
                  {(revenue.renewalsDue || []).map((r) => (
                    <li key={r.studentId}><strong>{r.name}</strong><span>{r.batchName || "—"}</span><em>{r.validTill}</em></li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        )}
      </section>

      {/* Attendance */}
      {modules.attendance && (
        <>
          <div className="section-head">
            <h2 className="section-title"><ClipboardList size={16} /> Attendance</h2>
          </div>
          <KpiGrid cards={[
            { key: "rate", label: "Attendance rate", value: attData.summary?.attendancePct ?? 0, suffix: "%", color: T.lime },
            { key: "below", label: `Batches below ${threshold}%`, value: belowCount, color: belowCount ? T.red : T.green },
            { key: "batches", label: "Batches tracked", value: attBatches.length, color: T.cyan },
          ]} />
          <article className="panel" style={{ "--accent": T.cyan }}>
            <h2>Attendance by batch <span className="h2-note">present + absent percentage</span></h2>
            {attBatches.length
              ? <AttendanceStackedBar data={attBatchPct} height={Math.max(160, attBatches.length * 34)} maxValue={100} valueSuffix="%" />
              : <div className="empty-inline">No attendance recorded in this scope yet.</div>}
          </article>
          {attTrend.length > 1 && (
            <article className="panel" style={{ "--accent": T.lime }}>
              <h2>Attendance count trend</h2>
              <AreaTrend data={attTrend} xKey="date" areas={[{ key: "present", color: T.green }, { key: "absent", color: T.red }]} height={220} />
            </article>
          )}
        </>
      )}

      {/* Fees */}
      {modules.fees && (
        <>
          <div className="section-head">
            <h2 className="section-title"><IndianRupee size={16} /> Fees & revenue</h2>
          </div>
          <KpiGrid cards={[
            { key: "collected", label: "Collected", value: `₹${inr(revenue.collected ?? feesData.summary?.collected)}`, color: T.magenta, delta: revenue.momGrowthPct },
            { key: "outstanding", label: "Outstanding", value: `₹${inr(revenue.outstanding)}`, color: T.orange },
            { key: "renewals", label: "Renewals due (14d)", value: (revenue.renewalsDue || []).length, color: T.violet },
            { key: "arpu", label: "ARPU / active", value: `₹${inr(revenue.arpu)}`, color: T.cyan },
          ]} />
          <div className="grid-2-1">
            <article className="panel" style={{ "--accent": T.magenta }}>
              <h2>Collection by batch</h2>
              {feeBatches.length
                ? <HBar data={feeBatches} labelKey="batchName" valueKey="collected" height={Math.max(160, feeBatches.length * 34)} />
                : <div className="empty-inline">No collection in this scope yet.</div>}
            </article>
            <article className="panel" style={{ "--accent": T.violet }}>
              <h2>Monthly collection</h2>
              <AreaTrend data={revenue.byMonth || feesData.byMonth || []} xKey="month" areas={[{ key: "collected", color: T.magenta }]} height={220} />
            </article>
          </div>
          {(payMethods.length > 0 || planStudents.length > 0) && (
            <div className="grid-two">
              <article className="panel" style={{ "--accent": T.cyan }}>
                <h2>Payment methods <span className="h2-note">share of collection</span></h2>
                {payMethods.length
                  ? <Donut data={payMethods} height={240} centerLabel="methods" />
                  : <div className="empty-inline">No payment method data in this scope yet.</div>}
              </article>
              <article className="panel" style={{ "--accent": T.green }}>
                <h2>Plan-wise students <span className="h2-note">active enrollments</span></h2>
                {planStudents.length
                  ? <HBar data={planStudents} labelKey="planName" valueKey="students" height={Math.max(180, planStudents.length * 38)} colorBy={() => T.green} />
                  : <div className="empty-inline">No active plan data in this scope yet.</div>}
              </article>
            </div>
          )}
        </>
      )}

      {(modules.attendance || modules.fees) && (
        <>
          <div className="section-head">
            <h2 className="section-title">Details</h2>
          </div>
          <div className={modules.attendance && modules.fees ? "details-grid" : "page-stack"}>
            {modules.attendance && (
              <section className="panel drill-panel" style={{ "--accent": T.green }}>
                <h2>Student attendance <span className="h2-note">lowest first</span></h2>
                <DataTable columns={attStudentColumns} data={attStudents} empty="No student attendance recorded in this scope yet." />
              </section>
            )}
            {modules.fees && (
              <section className="panel drill-panel" style={{ "--accent": T.green }}>
                <h2>Student fee status <span className="h2-note">active first</span></h2>
                <DataTable columns={feeStudentColumns} data={feeStudents} empty="No fee records in this scope yet." />
              </section>
            )}
          </div>
        </>
      )}

      {!modules.attendance && !modules.fees && (
        <div className="empty-state">
          <ShieldAlert size={28} />
          <h2>No access</h2>
          <p>Your SAM role doesn't include attendance or fee analytics.</p>
        </div>
      )}
    </div>
  );
}
