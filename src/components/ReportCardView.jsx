import React from "react";
import { Award, Minus, Quote, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";
import { RadialGauge, Radar, Sparkline } from "./Charts.jsx";

const T = { lime: "#d4ff3a", cyan: "#38f0e8", magenta: "#ff3da8", violet: "#a98aff", orange: "#ff8a3d", red: "#ff5470", green: "#3ddc97" };
const BAND_COLOR = { excellent: T.green, good: T.cyan, fair: T.orange, "needs-attention": T.red, "no-data": T.violet };
const BAND_LABEL = { excellent: "Excellent", good: "Good", fair: "Fair", "needs-attention": "Needs attention", "no-data": "No data" };
const TREND = {
  improving: { icon: TrendingUp, color: T.green, label: "Improving" },
  declining: { icon: TrendingDown, color: T.red, label: "Declining" },
  steady: { icon: Minus, color: T.cyan, label: "Steady" },
  "not-enough-history": { icon: Minus, color: T.violet, label: "Not enough history" },
};
const num = (v, suffix = "") => (v == null ? "—" : `${v}${suffix}`);

// A concrete next-step line for a focus activity — taken from the AI narrative if present, else a
// sensible deterministic template so the card looks complete with no API key.
function nextStep(activity, narrativeFocus) {
  const fromAI = (narrativeFocus || []).find((f) => (f.activity || f.name) === activity);
  if (fromAI && (fromAI.nextStep || fromAI.step)) return fromAI.nextStep || fromAI.step;
  return `Add a few focused reps of ${activity} each session.`;
}

function halfDelta(timeline = []) {
  const pts = timeline.filter((t) => t.rating != null);
  if (pts.length < 2) return null;
  const mid = Math.floor(pts.length / 2);
  const early = pts.slice(0, mid).reduce((a, t) => a + t.rating, 0) / mid;
  const late = pts.slice(mid).reduce((a, t) => a + t.rating, 0) / (pts.length - mid);
  return Math.round((late - early) * 100) / 100;
}

export default function ReportCardView({ card, actions = null, eyebrow }) {
  if (!card) return null;
  const metrics = card.metrics || {};
  const band = metrics.band || "no-data";
  const trend = card.trend ? TREND[card.trend] : null;
  const narrative = card.narrative && !card.narrative.error ? card.narrative : null;
  const radarData = (card.radar || []).map((r) => {
    const bench = (card.batchBenchmark || []).find((b) => b.activity === r.activity);
    return { axis: r.activity, value: r.rating, benchmark: bench?.rating ?? null };
  });
  const timeline = (card.ratingTimeline || []).map((t) => ({ date: t.date, rating: t.rating }));
  const delta = halfDelta(timeline);
  const insufficient = card.status === "insufficient_data";

  // Deterministic narrative fallback so the layout looks complete without an AI key.
  const fallbackHeadline = `${card.studentName || "This student"} — ${BAND_LABEL[band].toLowerCase()} this period.`;
  const fallbackSummary = (() => {
    const bits = [];
    if (metrics.performanceScore != null) bits.push(`Overall score ${metrics.performanceScore}/100 (${BAND_LABEL[band].toLowerCase()}).`);
    if (card.strengths?.length) bits.push(`Strongest at ${card.strengths.map((s) => s.activity).join(", ")}.`);
    if (card.focusAreas?.length) bits.push(`Worth focusing on ${card.focusAreas.map((s) => s.activity).join(", ")}.`);
    if (trend) bits.push(`Recent trend: ${trend.label.toLowerCase()}.`);
    return bits.join(" ");
  })();

  return (
    <div className="page-stack report-card-view">
      <section className="panel report-head" style={{ "--accent": BAND_COLOR[band] }}>
        <div className="report-head-id">
          <div>
            <p className="eyebrow">{eyebrow || [card.period?.from, card.period?.to].filter(Boolean).join(" → ")}</p>
            <h2>{card.studentName || `Student #${card.studentId || ""}`}</h2>
          </div>
          <span className={`band-pill band-${band}`}>{BAND_LABEL[band]}</span>
          {trend && <span className="trend-pill" style={{ color: trend.color }}><trend.icon size={14} /> {trend.label}</span>}
        </div>
        <div className="report-head-score">
          <RadialGauge value={metrics.performanceScore ?? 0} max={100} suffix="" color={BAND_COLOR[band]} label="performance score" height={150} />
        </div>
      </section>

      {actions}

      {insufficient ? (
        <section className="panel" style={{ "--accent": T.violet }}>
          <h2><Sparkles size={16} /> Report card</h2>
          <p className="ai-hint">{card.message}</p>
        </section>
      ) : (
        <>
          {/* Signature element — the skill radar with batch-average overlay. */}
          {radarData.length >= 3 && (
            <section className="panel" style={{ "--accent": T.lime }}>
              <h2><Target size={16} /> Skill profile <span className="h2-note">rating out of 5 · vs batch average</span></h2>
              <Radar data={radarData} height={320} />
            </section>
          )}

          {/* Trend row */}
          {timeline.length > 1 && (
            <section className="panel" style={{ "--accent": T.magenta }}>
              <h2>Rating trend</h2>
              <Sparkline data={timeline} dataKey="rating" color={T.orange} height={64} />
              <div className="trend-row-foot">
                {trend && <span className="trend-pill" style={{ color: trend.color }}><trend.icon size={14} /> {trend.label}</span>}
                {delta != null && <span className="muted-note">{delta >= 0 ? "+" : ""}{delta} pts first half → second half</span>}
              </div>
            </section>
          )}

          {/* Narrative */}
          <section className="panel ai-briefing" style={{ "--accent": T.magenta }}>
            <div className="ai-briefing-head"><h2><Sparkles size={15} /> Summary</h2></div>
            <div className="ai-briefing-body">
              <p className="report-headline">{narrative?.headline || fallbackHeadline}</p>
              <p>{narrative?.summary || fallbackSummary}</p>
            </div>
          </section>

          {/* Strength / focus badges */}
          <div className="grid-2-1">
            <article className="panel" style={{ "--accent": T.green }}>
              <h2><Award size={16} /> Strengths</h2>
              {card.strengths?.length ? (
                <ul className="skill-list">
                  {card.strengths.map((s) => (
                    <li key={s.activity}><span className="skill-name">{s.activity}</span><span className="tag tag-green">{s.rating} / 5</span></li>
                  ))}
                </ul>
              ) : <div className="empty-inline">No standout strengths yet — still building consistency.</div>}
            </article>
            <article className="panel" style={{ "--accent": T.orange }}>
              <h2><Target size={16} /> Focus areas</h2>
              {card.focusAreas?.length ? (
                <ul className="skill-list focus-list">
                  {card.focusAreas.map((s) => (
                    <li key={s.activity}>
                      <div className="focus-top"><span className="skill-name">{s.activity}</span><span className="tag tag-orange">{s.rating} / 5</span></div>
                      <p className="focus-step">{nextStep(s.activity, narrative?.focusAreas)}</p>
                    </li>
                  ))}
                </ul>
              ) : <div className="empty-inline">No activity is lagging — nice and balanced.</div>}
            </article>
          </div>

          {/* Coach notes */}
          {card.recentNotes?.length > 0 && (
            <section className="panel" style={{ "--accent": T.cyan }}>
              <h2><Quote size={16} /> Recent coach notes</h2>
              <ul className="note-list">
                {card.recentNotes.map((n, i) => (
                  <li key={i}>
                    <div className="note-meta"><strong>{n.activity}</strong>{n.rating != null && <span className="tag tag-magenta">{n.rating} / 5</span>}<em>{n.date}</em></div>
                    <p>{n.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export { num };
