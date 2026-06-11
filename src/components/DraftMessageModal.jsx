import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Copy, RefreshCw, Send, X } from "lucide-react";
import { draftMessage } from "../api.js";
import Select from "./Select.jsx";

const ALL_INTENTS = [
  { id: "fee_renewal", label: "Fee renewal", fee: true },
  { id: "attendance_nudge", label: "Attendance nudge" },
  { id: "progress_update", label: "Progress update" },
  { id: "re_engagement", label: "Re-engagement" },
];
const TONES = [{ id: "friendly", label: "Friendly" }, { id: "formal", label: "Formal" }];

function FactChips({ context = {} }) {
  const chips = [];
  if (context.planName) chips.push(context.planName);
  if (context.amountDueLabel) chips.push(context.amountDueLabel);
  if (context.validTill) chips.push(`expires ${context.validTill}`);
  if (context.attendancePctThisMonth != null) chips.push(`attendance ${context.attendancePctThisMonth}%`);
  if (context.strengthActivity) chips.push(`${context.strengthActivity}${context.strengthRating != null ? ` ${context.strengthRating}/5` : ""}`);
  if (!chips.length) return null;
  return <div className="fact-chips">{chips.map((c, i) => <span key={i}>{c}</span>)}</div>;
}

// Opened from at-risk rows, renewals, feed-card secondary actions, and the report-card actions bar.
export default function DraftMessageModal({ open, onClose, studentId, studentName, intent = "attendance_nudge",
  tone: initialTone = "friendly", allowFee = false }) {
  const [intentId, setIntentId] = React.useState(intent);
  const [tone, setTone] = React.useState(initialTone);
  const [draft, setDraft] = React.useState("");

  const intents = ALL_INTENTS.filter((i) => allowFee || !i.fee);

  const gen = useMutation({
    mutationFn: () => draftMessage({ studentId, intent: intentId, channel: "sms", tone }),
    onSuccess: (data) => setDraft(data.draft || ""),
  });

  // Reset selectors to the launch context each time the modal opens for a (new) student.
  React.useEffect(() => {
    if (open) { setIntentId(intent); setTone(initialTone); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, studentId, intent]);

  // (Re)draft whenever the modal is open and intent/tone settle.
  React.useEffect(() => {
    if (open && studentId) gen.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, studentId, intentId, tone]);

  if (!open) return null;
  const ctx = gen.data?.context || {};
  const aiAvailable = gen.data?.aiAvailable;

  function copy() { navigator.clipboard?.writeText(draft); }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <p className="eyebrow"><Send size={13} /> Draft message</p>
            <h2>{studentName || `Student #${studentId}`}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </header>

        <div className="modal-controls">
          <label>Intent
            <Select value={intentId} onChange={setIntentId} clearable={false} options={intents.map((i) => ({ value: i.id, label: i.label }))} accent="var(--xbi-magenta)" />
          </label>
          <label>Tone
            <Select value={tone} onChange={setTone} clearable={false} options={TONES.map((t) => ({ value: t.id, label: t.label }))} accent="var(--xbi-magenta)" />
          </label>
        </div>

        <FactChips context={ctx} />

        {gen.isError ? (
          <p className="ai-hint error">⚠️ {gen.error?.response?.data?.detail || "Couldn't draft a message."}</p>
        ) : (
          <textarea className="draft-textarea" rows={6} value={gen.isPending ? "Drafting…" : draft}
            onChange={(e) => setDraft(e.target.value)} disabled={gen.isPending} />
        )}

        <p className="draft-caption">{aiAvailable ? "AI draft — review before sending" : "Template draft — review before sending"}</p>

        <div className="modal-actions">
          <button className="ghost-button" onClick={() => gen.mutate()} disabled={gen.isPending}><RefreshCw size={15} /> Regenerate</button>
          <button className="button primary-button" onClick={copy} disabled={!draft}><Copy size={15} /> Copy message</button>
        </div>
      </div>
    </div>
  );
}
