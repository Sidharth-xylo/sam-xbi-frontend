import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_XBI_API_URL || "http://localhost:8000",
});

const samApi = axios.create({
  baseURL: import.meta.env.VITE_SAM_API_URL || "http://localhost:3000",
});

// URL of the main SAM frontend, used to bounce the user back when there is no session.
export const SAM_APP_URL = import.meta.env.VITE_SAM_APP_URL || "http://localhost:5173";

// When SAM's "XBI" button opens this app it appends ?token=<jwt>&role=<role>. Capture it once on
// load, persist it like SAM does (auth_token), then strip it from the URL so it isn't bookmarked.
(function captureTokenFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const handoff = params.get("token");
    if (!handoff) return;
    localStorage.setItem("auth_token", handoff);
    localStorage.setItem("samToken", handoff);
    const role = params.get("role");
    if (role) localStorage.setItem("samUserRole", role);
    params.delete("token");
    params.delete("role");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
  } catch {
    /* ignore */
  }
})();

export function getToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("samToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("samToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function fetchMe() {
  const { data } = await api.get("/api/xbi/me");
  return data;
}

export async function loginToSam({ loginType, identity, password }) {
  const endpointByType = {
    admin: "/api/v2/auth/admin-login",
    master: "/api/v2/auth/master-admin-login",
    venue: "/api/v2/auth/venue-admin-login",
    coach: "/api/v2/auth/coach-login",
  };
  const endpoint = endpointByType[loginType] || endpointByType.admin;
  const payload = loginType === "coach"
    ? { email: identity, password }
    : { email: identity, mobile: identity, password };
  const { data } = await samApi.post(endpoint, payload);
  if (!data?.token) {
    throw new Error(data?.message || data?.error || "Login did not return a token");
  }
  localStorage.setItem("samToken", data.token);
  localStorage.setItem("samUserRole", data.role || "");
  return data;
}

export function clearToken() {
  ["auth_token", "samToken", "token", "authToken"].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export async function fetchFilters(params = {}) {
  const { data } = await api.get("/api/xbi/filters", { params });
  return data;
}

export async function fetchDashboard(params = {}) {
  const { data } = await api.get("/api/xbi/dashboard", { params });
  return data;
}

export async function fetchInsights(params = {}) {
  const { data } = await api.get("/api/xbi/insights", { params });
  return data;
}

export async function fetchFeed(params = {}) {
  const { data } = await api.get("/api/xbi/insights/feed", { params });
  return data;
}

export async function fetchDelta(params = {}) {
  const { data } = await api.get("/api/xbi/insights/delta", { params });
  return data;
}

export async function draftMessage(payload) {
  const { data } = await api.post("/api/xbi/actions/draft-message", payload);
  return data;
}

export async function createShareLink(studentId, params = {}) {
  const { data } = await api.post(`/api/xbi/report-card/${studentId}/share`, null, { params });
  return data;
}

// Public — no auth header needed, but harmless if one is attached.
export async function fetchSharedReportCard(token) {
  const { data } = await api.get(`/api/xbi/share/rc/${token}`);
  return data;
}

export function reportCardPdfUrl(studentId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `${api.defaults.baseURL}/api/xbi/report-card/${studentId}/pdf${qs ? `?${qs}` : ""}`;
}

export async function downloadReportCardPdf(studentId, params = {}) {
  const response = await api.get(`/api/xbi/report-card/${studentId}/pdf`, { params, responseType: "blob" });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `report-card-${studentId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function search(q) {
  const { data } = await api.get("/api/xbi/search", { params: { q } });
  return data;
}

export async function sendChat({ message, conversationId }) {
  const { data } = await api.post("/api/xbi/chat", { message, conversationId });
  return data;
}

export async function fetchConversations() {
  const { data } = await api.get("/api/xbi/chat/conversations");
  return data;
}

export async function fetchConversationMessages(conversationId) {
  const { data } = await api.get(`/api/xbi/chat/conversations/${conversationId}/messages`);
  return data;
}

export async function fetchAttendance(params = {}) {
  const { data } = await api.get("/api/xbi/reports/attendance", { params });
  return data;
}

export async function fetchFees(params = {}) {
  const { data } = await api.get("/api/xbi/reports/fees", { params });
  return data;
}

export async function fetchPerformanceBatches(params = {}) {
  const { data } = await api.get("/api/xbi/reports/performance/batches", { params });
  return data;
}

export async function fetchPerformanceStudents(batchId, params = {}) {
  const { data } = await api.get(`/api/xbi/reports/performance/batches/${batchId}/students`, { params });
  return data;
}

export async function fetchPerformanceCompare(batchId, params = {}) {
  const { data } = await api.get(`/api/xbi/reports/performance/batches/${batchId}/compare`, { params });
  return data;
}

export async function fetchStudentPerformance(studentId, params = {}) {
  const { data } = await api.get(`/api/xbi/reports/performance/students/${studentId}`, { params });
  return data;
}

export async function generateReportCard(studentId, params = {}) {
  const { data } = await api.post(`/api/xbi/report-card/${studentId}`, null, { params });
  return data;
}

export function exportUrl(type) {
  return `${api.defaults.baseURL}/api/xbi/reports/${type}/export`;
}

export async function downloadExport(type) {
  const response = await api.get(`/api/xbi/reports/${type}/export`, { responseType: "blob" });
  const blob = new Blob([response.data], { type: response.headers["content-type"] });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xbi-${type}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default api;
