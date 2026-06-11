import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Download, FileText, Link2, MessageSquare, RefreshCw, Sparkles, User } from "lucide-react";
import { createShareLink, downloadReportCardPdf, fetchFilters, generateReportCard } from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import ReportCardView, { num } from "../components/ReportCardView.jsx";
import DraftMessageModal from "../components/DraftMessageModal.jsx";
import Select from "../components/Select.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", magenta: "#ff3da8", violet: "#a98aff", red: "#ff5470" };

export default function Reports({ modules = {} }) {
  const [filters, setFilters] = React.useState({});
  const [params, setParams] = useSearchParams();
  const [studentId, setStudentId] = React.useState(params.get("studentId") || "");
  const [shareInfo, setShareInfo] = React.useState(null);
  const [draftOpen, setDraftOpen] = React.useState(false);

  const filterData = useQuery({
    queryKey: ["filters", filters.venueId, filters.sportId, filters.batchId],
    queryFn: () => fetchFilters(filters),
  });
  const students = filterData.data?.students || [];

  const dates = { dateFrom: filters.dateFrom, dateTo: filters.dateTo };
  const card = useMutation({ mutationFn: () => generateReportCard(studentId, dates) });
  const data = card.data;
  const metrics = data?.metrics || {};

  // Deep-link: /reports?studentId=123 (e.g. from the Performance "Report card" button) auto-generates.
  React.useEffect(() => {
    const sid = params.get("studentId");
    if (sid && sid !== studentId) setStudentId(sid);
    if (sid) card.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mint a private, read-only link to the report card and copy it to the clipboard (no
  // third-party messaging app involved).
  const share = useMutation({
    mutationFn: () => createShareLink(studentId, dates),
    onSuccess: (res) => {
      const url = `${window.location.origin}${res.url}`;
      setShareInfo({ ...res, absolute: url });
      navigator.clipboard?.writeText(url);
    },
  });

  function pickStudent(val) {
    setStudentId(val);
    setParams(val ? { studentId: val } : {});
    card.reset();
    setShareInfo(null);
  }

  function copyLink() {
    if (shareInfo?.absolute) { navigator.clipboard?.writeText(shareInfo.absolute); return; }
    share.mutate(); // mint one (it copies on success)
  }

  const metricCards = data ? [
    { key: "att", label: "Attendance", value: num(metrics.attendancePct), suffix: metrics.attendancePct != null ? "%" : "", color: T.cyan },
    { key: "comp", label: "Completion", value: num(metrics.completionPct), suffix: metrics.completionPct != null ? "%" : "", color: T.violet },
    { key: "rating", label: "Avg quality rating", value: num(metrics.averageRating), suffix: metrics.averageRating != null ? " / 5" : "", color: T.lime },
  ] : [];

  const actionsBar = data && data.status !== "insufficient_data" ? (
    <section className="panel report-actions" style={{ "--accent": T.magenta }}>
      <button className="ghost-button" onClick={copyLink} disabled={share.isPending}>
        <Link2 size={15} /> {share.isPending ? "Creating link…" : shareInfo ? "Link copied" : "Copy private link"}
      </button>
      <button className="ghost-button" onClick={() => downloadReportCardPdf(studentId, dates)}><Download size={15} /> Download PDF</button>
      <button className="ghost-button" onClick={() => setDraftOpen(true)}><MessageSquare size={15} /> Draft update</button>
      <button className="ghost-button" onClick={() => card.mutate()} disabled={card.isPending}><RefreshCw size={15} /> Regenerate</button>
      {shareInfo && <span className="muted-note">Link valid until {String(shareInfo.expiresAt).slice(0, 10)}</span>}
    </section>
  ) : null;

  return (
    <div className="page-stack">
      <Filters value={filters} onChange={setFilters} />

      <section className="panel report-picker" style={{ "--accent": T.magenta }}>
        <div className="report-picker-field">
          <span className="eyebrow"><User size={14} /> Student</span>
          <Select value={studentId} onChange={pickStudent} options={students.map((s) => ({ value: s.id, label: s.name }))} placeholder="Select a student…" accent="var(--xbi-magenta)" />
          <small>{students.length} student{students.length === 1 ? "" : "s"} in your current scope</small>
        </div>
        <button className="button primary-button" disabled={!studentId || card.isPending} onClick={() => card.mutate()}>
          <FileText size={16} /> {card.isPending ? "Generating…" : "Generate report card"}
        </button>
      </section>

      {!data && !card.isPending && !card.error && (
        <div className="empty-state">
          <Sparkles size={30} />
          <h2>AI report cards</h2>
          <p style={{ maxWidth: 560 }}>Pick a student and generate a parent-friendly progress report — skill radar, recent trend, coach notes, and an overall score, ready to share as a private link or download as a PDF.</p>
        </div>
      )}
      {card.isPending && <div className="empty-inline">Reading {students.find((s) => String(s.id) === String(studentId))?.name || "student"}'s training history…</div>}
      {card.error && (
        <section className="panel" style={{ "--accent": T.red }}>
          <p className="ai-hint error">⚠️ {card.error?.response?.data?.detail || card.error.message || "Could not generate the report card."}</p>
        </section>
      )}

      {data && (
        <>
          <ReportCardView card={data} actions={actionsBar} />
          {data.status !== "insufficient_data" && <KpiGrid cards={metricCards} />}
          <DraftMessageModal open={draftOpen} onClose={() => setDraftOpen(false)} studentId={Number(studentId)}
            studentName={data.studentName} intent="progress_update" allowFee={!!modules.fees} />
        </>
      )}
    </div>
  );
}
