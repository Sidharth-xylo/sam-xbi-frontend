import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, ClipboardList, FileText, MessageSquare, Radar, Search, Sparkles, User, Users } from "lucide-react";
import { search } from "../api.js";

const NAV = [
  { id: "nav-pulse", label: "Pulse", module: "feed", icon: Radar, to: "/" },
  { id: "nav-ops", label: "Attendance & Fees", module: "operations", icon: ClipboardList, to: "/operations" },
  { id: "nav-perf", label: "Performance", module: "performance", icon: Activity, to: "/performance" },
  { id: "nav-reports", label: "Reports", module: "reports", icon: FileText, to: "/reports" },
  { id: "nav-chat", label: "Assistant", module: "chat", icon: Sparkles, to: "/chat" },
];

function useDebounced(value, delay) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function CommandPalette({ modules = {} }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const navigate = useNavigate();
  const inputRef = React.useRef(null);
  const debounced = useDebounced(q.trim(), 200);

  // Global Cmd/Ctrl+K toggle.
  React.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() { setOpen(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("xbi-open-cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("xbi-open-cmdk", onOpen);
    };
  }, []);

  React.useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);

  const results = useQuery({
    queryKey: ["cmdk-search", debounced],
    queryFn: () => search(debounced),
    enabled: open && debounced.length >= 2,
  });

  const navItems = NAV.filter((n) => modules[n.module])
    .filter((n) => !q || n.label.toLowerCase().includes(q.toLowerCase()))
    .map((n) => ({ ...n, kind: "nav" }));
  const entityItems = (results.data?.results || []).map((r) => ({
    id: `${r.type}-${r.id}`, kind: r.type, label: r.name, sub: r.sub,
    icon: r.type === "student" ? User : Users,
    to: r.type === "student" ? `/reports?studentId=${r.id}` : "/performance",
  }));
  const askItem = q.trim()
    ? [{ id: "ask", kind: "ask", label: `Ask assistant: "${q.trim()}"`, icon: MessageSquare }]
    : [];
  const items = [...navItems, ...entityItems, ...askItem];

  function run(item) {
    setOpen(false);
    if (!item) return;
    if (item.kind === "ask") {
      sessionStorage.setItem("xbi_chat_prefill", q.trim());
      navigate("/chat");
    } else {
      navigate(item.to);
    }
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); run(items[active]); }
  }

  if (!open) return null;
  const safeActive = Math.min(active, Math.max(items.length - 1, 0));

  return (
    <div className="cmdk-backdrop" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input">
          <Search size={16} />
          <input ref={inputRef} value={q} placeholder="Search students, batches, pages — or ask the assistant…"
            onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKeyDown} />
          <kbd>esc</kbd>
        </div>
        <ul className="cmdk-list">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className={i === safeActive ? "active" : ""}
                  onMouseEnter={() => setActive(i)} onClick={() => run(item)}>
                <Icon size={15} />
                <span className="cmdk-label">{item.label}</span>
                {item.sub && <span className="cmdk-sub">{item.sub}</span>}
                <span className="cmdk-kind">{item.kind}</span>
              </li>
            );
          })}
          {!items.length && <li className="cmdk-empty">Type at least 2 characters to search.</li>}
        </ul>
      </div>
    </div>
  );
}
