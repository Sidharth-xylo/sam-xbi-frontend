import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { downloadExport, fetchAttendance } from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import DataTable from "../components/DataTable.jsx";
import { AreaTrend, Donut, HBar } from "../components/Charts.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", green: "#3ddc97", red: "#ff5470", violet: "#a98aff" };
const fmtPct = (v) => (v == null ? "—" : `${v}%`);

export default function Attendance() {
  const [filters, setFilters] = useState({});
  const report = useQuery({ queryKey: ["attendance", filters], queryFn: () => fetchAttendance(filters) });
  const data = report.data || {};
  const s = data.summary || {};
  const columns = useMemo(() => [
    { header: "Student", accessorKey: "name" },
    { header: "Batch", accessorKey: "batchName" },
    { header: "Present", accessorKey: "present" },
    { header: "Absent", accessorKey: "absent" },
    { header: "Attendance %", accessorKey: "attendancePct", cell: ({ getValue }) => fmtPct(getValue()) },
  ], []);

  return (
    <div className="page-stack">
      <Filters value={filters} onChange={setFilters} />
      <div className="page-actions"><button className="button" onClick={() => downloadExport("attendance")}><Download size={16} /> Export</button></div>
      <KpiGrid cards={[
        { key: "attendance", label: "Attendance", value: s.attendancePct || 0, suffix: "%", color: T.lime },
        { key: "present", label: "Present", value: s.present || 0, color: T.green },
        { key: "absent", label: "Absent", value: s.absent || 0, color: T.red },
        { key: "total", label: "Records", value: s.total || 0, color: T.violet },
      ]} />
      <div className="grid-2-1">
        <article className="panel" style={{ "--accent": T.lime }}><h2>Attendance trend</h2>
          <AreaTrend data={data.byDate || []} xKey="date" areas={[{ key: "present", color: T.green }, { key: "absent", color: T.red }]} height={260} />
        </article>
        <article className="panel" style={{ "--accent": T.cyan }}><h2>Present vs absent</h2>
          <Donut height={240} centerValue={fmtPct(s.attendancePct || 0)} centerLabel="present"
            data={[{ name: "Present", value: s.present || 0 }, { name: "Absent", value: s.absent || 0 }].filter((d) => d.value > 0)} />
        </article>
      </div>
      <article className="panel" style={{ "--accent": T.cyan }}><h2>Attendance by batch</h2>
        <HBar data={data.byBatch || []} labelKey="batchName" valueKey="attendancePct" height={Math.max(180, (data.byBatch || []).length * 34)} />
      </article>
      <section className="panel" style={{ "--accent": T.violet }}><h2>Student attendance</h2><DataTable columns={columns} data={data.students || []} /></section>
    </div>
  );
}
