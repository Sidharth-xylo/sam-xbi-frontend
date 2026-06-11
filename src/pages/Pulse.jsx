import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowDownRight, CalendarClock, CheckCircle, ChevronDown, ChevronRight,
  ClipboardList, Sparkles, TrendingDown, TrendingUp, UserX, Wallet,
} from "lucide-react";
import { fetchDelta, fetchFeed, fetchFees } from "../api.js";
import Filters from "../components/Filters.jsx";
import KpiGrid from "../components/KpiGrid.jsx";
import DeltaBadge from "../components/DeltaBadge.jsx";
import CountUp from "../components/CountUp.jsx";
import DraftMessageModal from "../components/DraftMessageModal.jsx";
import { AreaTrend } from "../components/Charts.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", orange: "#ff8a3d", red: "#ff5470", green: "#3ddc97", violet: "#a98aff" };

// Map lucide icon names (from the backend card schema) to components.
const ICONS = {
  "alert-triangle": AlertTriangle, "calendar-clock": CalendarClock, "trending-down": TrendingDown,
  "trending-up": TrendingUp, "arrow-down-right": ArrowDownRight, sparkles: Sparkles, wallet: Wallet,
  "user-x": UserX, "clipboard-list": ClipboardList, "check-circle": CheckCircle,
};
// Severity -> accent token (success/info/warning/error, mapped to the locked XBI palette).
const SEVERITY_ACCENT = { alert: T.red, warning: T.orange, win: T.green, info: T.cyan };

function metricText(metric) {
  if (!metric || metric.value == null) return null;
  const v = metric.value;
  const label = String(metric.label || "");
  if (label.includes("vs prev") || label.includes("MoM")) return `${v > 0 ? "+" : ""}${v}%`;
  if (label === "due" || label === "outstanding") return <CountUp value={v} prefix="₹" />;
  if (label.includes("rating")) return v;
  return <CountUp value={v} />;
}

function FeedCard({ card, index, onDraft, onNavigate }) {
  const Icon = ICONS[card.icon] || Sparkles;
  const accent = SEVERITY_ACCENT[card.severity] || T.cyan;
  const metric = card.metric || {};
  return (
    <article className="feed-card" style={{ "--accent": accent, "--i": index }}>
      <span className="feed-strip" />
      <div className="feed-icon"><Icon size={18} /></div>
      <div className="feed-body">
        <h3>{card.headline}</h3>
        <p>{card.detail}</p>
        <div className="feed-foot">
          {card.action && (
            <button className="ghost-button" onClick={() => onNavigate(card)}>
              {card.action.label} <ChevronRight size={14} />
            </button>
          )}
          {card.secondaryAction?.type === "draft-message" && (
            <button className="ghost-button" onClick={() => onDraft(card.secondaryAction.payload)}>
              {card.secondaryAction.label}
            </button>
          )}
        </div>
      </div>
      {metric.value != null && (
        <div className="feed-metric">
          <strong>{metricText(metric)}</strong>
          {metric.label && <span>{metric.label}</span>}
          {metric.deltaPct != null && <DeltaBadge deltaPct={metric.deltaPct} label="" />}
        </div>
      )}
    </article>
  );
}

function SkeletonFeed() {
  return (
    <div className="feed-list">
      {[0, 1, 2, 3].map((i) => <div key={i} className="feed-card skeleton" style={{ "--i": i }} />)}
    </div>
  );
}

export default function Pulse({ modules = {} }) {
  const [filters, setFilters] = React.useState({});
  const [draft, setDraft] = React.useState(null);
  const [chartsOpen, setChartsOpen] = React.useState(false);
  const navigate = useNavigate();

  const feed = useQuery({ queryKey: ["feed", filters], queryFn: () => fetchFeed(filters) });
  const delta = useQuery({ queryKey: ["delta", filters], queryFn: () => fetchDelta(filters) });
  const fees = useQuery({ queryKey: ["pulse-fees", filters], queryFn: () => fetchFees(filters), enabled: !!modules.fees });

  const cards = feed.data?.cards || [];
  const metrics = delta.data?.metrics || {};

  function onDraft(payload) {
    if (!payload) return;
    const studentId = payload.studentId ?? payload.studentIds?.[0];
    if (studentId) setDraft({ studentId, intent: payload.intent || "attendance_nudge" });
  }

  // Deep-link a card into the existing drill-through: batches/students -> Performance; money -> Fees.
  function onNavigate(card) {
    const refs = card.entityRefs || {};
    if (refs.batchIds?.length || refs.studentIds?.length) navigate("/performance");
    else navigate("/operations");
  }

  const kpiCards = [];
  if (metrics.attendancePct) kpiCards.push({ key: "att", label: "Attendance", value: metrics.attendancePct.current, suffix: "%", color: T.lime, delta: metrics.attendancePct.deltaPct });
  if (metrics.completionPct) kpiCards.push({ key: "comp", label: "Completion", value: metrics.completionPct.current, suffix: "%", color: T.cyan, delta: metrics.completionPct.deltaPct });
  if (metrics.averageRating) kpiCards.push({ key: "rating", label: "Avg rating", value: metrics.averageRating.current, suffix: " / 5", color: T.violet, decimals: 1 });
  if (metrics.collected) kpiCards.push({ key: "coll", label: "Collected", value: metrics.collected.current, prefix: "₹", color: T.orange, delta: metrics.collected.deltaPct });

  return (
    <div className="page-stack">
      <div className="pulse-head">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> Your briefing</p>
          <h1>Pulse</h1>
        </div>
      </div>
      <Filters value={filters} onChange={setFilters} />

      <div className="feed-wrap">
        {feed.isLoading && <SkeletonFeed />}
        {feed.isError && (
          <div className="empty-inline feed-error">
            Couldn't load your briefing.
            <button className="ghost-button" onClick={() => feed.refetch()}>Retry</button>
          </div>
        )}
        {!feed.isLoading && !feed.isError && (
          <div className="feed-list">
            {cards.map((card, i) => (
              <FeedCard key={card.id} card={card} index={i} onDraft={onDraft} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>

      {/* Charts move below the feed, behind a divider — quiet by default. */}
      <button className="charts-divider" onClick={() => setChartsOpen((o) => !o)} aria-expanded={chartsOpen}>
        <span>Charts</span>
        <ChevronDown size={16} style={{ transform: chartsOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {chartsOpen && (
        <div className="fade-in">
          {kpiCards.length > 0 && <KpiGridWithDelta cards={kpiCards} metrics={metrics} />}
          {modules.fees && (
            <article className="panel" style={{ "--accent": T.orange }}>
              <h2>Monthly collection</h2>
              <AreaTrend data={fees.data?.byMonth || []} xKey="month" areas={[{ key: "collected", color: T.orange }]} height={220} />
            </article>
          )}
        </div>
      )}

      <DraftMessageModal
        open={!!draft}
        onClose={() => setDraft(null)}
        studentId={draft?.studentId}
        intent={draft?.intent}
        allowFee={!!modules.fees}
      />
    </div>
  );
}

// KPI grid where each card shows a CountUp value and a period-over-period DeltaBadge.
function KpiGridWithDelta({ cards }) {
  return (
    <section className="kpi-grid">
      {cards.map((c) => (
        <article className="stat-card" key={c.key} style={{ "--accent": c.color }}>
          <div className="stat-row">
            <span className="stat-label">{c.label}</span>
            {c.delta != null && <DeltaBadge deltaPct={c.delta} label="vs prev" />}
          </div>
          <strong className="stat-value">
            {c.prefix || ""}<CountUp value={c.value ?? 0} decimals={c.decimals || 0} format={(n) => Number(n).toLocaleString("en-IN")} />{c.suffix || ""}
          </strong>
        </article>
      ))}
    </section>
  );
}
