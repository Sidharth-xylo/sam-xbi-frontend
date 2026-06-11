import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, ClipboardList, FileText, LogOut, Radar, Search, ShieldCheck, Sparkles } from "lucide-react";
import { clearToken, fetchMe, getToken, SAM_APP_URL } from "./api.js";
import Pulse from "./pages/Pulse.jsx";
import Operations from "./pages/Operations.jsx";
import Performance from "./pages/Performance.jsx";
import Reports from "./pages/Reports.jsx";
import Chat from "./pages/Chat.jsx";
import ShareReportCard from "./pages/ShareReportCard.jsx";
import CommandPalette from "./components/CommandPalette.jsx";

const navItems = [
  { to: "/", label: "Pulse", module: "feed", icon: Radar },
  { to: "/operations", label: "Attendance & Fees", module: "operations", icon: ClipboardList },
  { to: "/performance", label: "Performance", module: "performance", icon: Activity },
  { to: "/reports", label: "Reports", module: "reports", icon: FileText },
  { to: "/chat", label: "Assistant", module: "chat", icon: Sparkles },
];

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("XBI page error:", error, info); }
  componentDidUpdate(prev) { if (prev.routeKey !== this.props.routeKey && this.state.error) this.setState({ error: null }); }
  render() {
    if (this.state.error) {
      return (
        <div className="empty-state">
          <ShieldCheck size={32} />
          <h2>This view hit an error</h2>
          <p style={{ maxWidth: 640, color: "var(--xbi-red)" }}>{String(this.state.error?.message || this.state.error)}</p>
          <button className="button" onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AccessDenied({ title = "No access" }) {
  return (
    <div className="empty-state">
      <ShieldCheck size={32} />
      <h2>{title}</h2>
      <p>Your SAM role or permissions do not include this analytics module.</p>
    </div>
  );
}

function Protected({ module, modules, children }) {
  if (!modules?.[module]) return <AccessDenied title="Module restricted" />;
  return children;
}

function NoSession() {
  return (
    <main className="login-shell">
      <section className="login-panel" style={{ textAlign: "center", maxWidth: 480 }}>
        <BarChart3 size={40} style={{ color: "var(--xbi-cyan)" }} />
        <p className="eyebrow">SAM Analytics</p>
        <h1>No active session</h1>
        <p>Open XBI from SAM: sign in to the SAM dashboard, then click the <strong>XBI</strong> button in the top bar. Your role and access carry over automatically.</p>
        <button className="button primary-button" onClick={() => { window.location.href = SAM_APP_URL; }}>Go to SAM</button>
      </section>
    </main>
  );
}

export default function App() {
  const [authVersion, setAuthVersion] = useState(0);
  const location = useLocation();

  // Public, unauthenticated report-card share — rendered with no nav chrome, outside the auth gate.
  if (location.pathname.startsWith("/share/rc/")) {
    return <ShareReportCard token={location.pathname.split("/").pop()} />;
  }

  const hasToken = Boolean(getToken());
  const me = useQuery({ queryKey: ["me", authVersion], queryFn: fetchMe, enabled: hasToken });

  function logout() {
    clearToken();
    setAuthVersion((version) => version + 1);
  }

  if (!hasToken) return <NoSession />;
  if (me.isLoading) return <div className="boot">Loading secure analytics…</div>;
  if (me.isError) return <NoSession />;

  const user = me.data?.user;
  const modules = me.data?.modules || {};
  const visibleNav = navItems.filter((item) => modules[item.module]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">X</div>
          <div>
            <strong>SAM XBI</strong>
            <span>{user?.role}</span>
          </div>
        </div>
        <nav>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Secure business intelligence</p>
            <h1>Analytics scoped to your SAM access</h1>
          </div>
          <button className="ghost-button" title="Search (Ctrl/Cmd+K)" onClick={() => window.dispatchEvent(new Event("xbi-open-cmdk"))}><Search size={16} /> Search</button>
          <div className="user-chip">{user?.name || user?.email}</div>
          <button className="ghost-button" onClick={logout}><LogOut size={16} /> Logout</button>
        </header>
        <ErrorBoundary routeKey={location.pathname}>
          <Routes>
            <Route path="/" element={<Protected module="feed" modules={modules}><Pulse modules={modules} /></Protected>} />
            <Route path="/operations" element={<Protected module="operations" modules={modules}><Operations modules={modules} /></Protected>} />
            <Route path="/performance" element={<Protected module="performance" modules={modules}><Performance /></Protected>} />
            <Route path="/reports" element={<Protected module="reports" modules={modules}><Reports modules={modules} /></Protected>} />
            <Route path="/chat" element={<Protected module="chat" modules={modules}><Chat /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
        <CommandPalette modules={modules} />
      </main>
    </div>
  );
}
