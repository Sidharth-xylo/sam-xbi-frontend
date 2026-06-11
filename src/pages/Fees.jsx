import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { downloadExport, fetchFees } from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import DataTable from "../components/DataTable.jsx";
import { AreaTrend, Donut, HBar } from "../components/Charts.jsx";

const T = { magenta: "#ff3da8", cyan: "#38f0e8", green: "#3ddc97", orange: "#ff8a3d", violet: "#a98aff" };
const fmtMoney = (v) => (v == null ? "—" : `₹${Number(v).toLocaleString("en-IN")}`);

export default function Fees() {
  const [filters, setFilters] = useState({});
  const report = useQuery({ queryKey: ["fees", filters], queryFn: () => fetchFees(filters) });
  const data = report.data || {};
  const s = data.summary || {};
  const columns = useMemo(() => [
    { header: "Student", accessorKey: "studentName" },
    { header: "Batch", accessorKey: "batchName" },
    { header: "Plan", accessorKey: "planName" },
    { header: "Status", accessorKey: "paymentStatus" },
    { header: "Collected", accessorKey: "collected", cell: ({ getValue }) => fmtMoney(getValue()) },
    { header: "Valid Till", accessorKey: "validTill" },
  ], []);

  return (
    <div className="page-stack">
      <Filters value={filters} onChange={setFilters} />
      <div className="page-actions"><button className="button" onClick={() => downloadExport("fees")}><Download size={16} /> Export</button></div>
      <KpiGrid cards={[
        { key: "collected", label: "Fee collected", value: s.collected || 0, prefix: "₹", color: T.magenta },
        { key: "active", label: "Active enrollments", value: s.activeEnrollments || 0, color: T.green },
        { key: "expired", label: "Expired enrollments", value: s.expiredEnrollments || 0, color: T.orange },
        { key: "records", label: "Fee records", value: s.records || 0, color: T.violet },
      ]} />
      <div className="grid-2-1">
        <article className="panel" style={{ "--accent": T.magenta }}><h2>Monthly collection</h2>
          <AreaTrend data={data.byMonth || []} xKey="month" areas={[{ key: "collected", color: T.magenta }]} height={260} />
        </article>
        <article className="panel" style={{ "--accent": T.violet }}><h2>Payment methods</h2>
          <Donut data={(data.paymentMethods || []).map((m) => ({ name: m.method, value: m.amount }))} height={240} centerLabel="methods" />
        </article>
      </div>
      <article className="panel" style={{ "--accent": T.cyan }}><h2>Collection by batch</h2>
        <HBar data={data.byBatch || []} labelKey="batchName" valueKey="collected" height={Math.max(180, (data.byBatch || []).length * 34)} />
      </article>
      <section className="panel" style={{ "--accent": T.green }}><h2>Student fee status</h2><DataTable columns={columns} data={data.students || []} /></section>
    </div>
  );
}
