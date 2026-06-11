import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { fetchSharedReportCard } from "../api.js";
import ReportCardView from "../components/ReportCardView.jsx";

// Public, logged-out view of a shared report card. No nav chrome, same visuals as the in-app card.
export default function ShareReportCard({ token: tokenProp }) {
  const params = useParams();
  const token = tokenProp || params.token;
  const q = useQuery({ queryKey: ["share", token], queryFn: () => fetchSharedReportCard(token), enabled: !!token, retry: false });

  if (q.isLoading) return <div className="boot">Loading report card…</div>;
  if (q.isError) {
    const status = q.error?.response?.status;
    const detail = q.error?.response?.data?.detail || "This report card link is not available.";
    return (
      <main className="login-shell">
        <section className="login-panel" style={{ textAlign: "center", maxWidth: 460 }}>
          <BarChart3 size={36} style={{ color: "var(--xbi-cyan)" }} />
          <h1 style={{ fontSize: 24 }}>{status === 410 ? "Link expired" : "Link not found"}</h1>
          <p style={{ color: "var(--xbi-muted)" }}>{detail}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="share-shell">
      <div className="share-wrap">
        <div className="share-brand"><div className="brand-mark">X</div><strong>SAM XBI</strong></div>
        <ReportCardView card={q.data} eyebrow="Progress report" />
        <p className="share-foot">Shared by the academy · read-only</p>
      </div>
    </main>
  );
}
