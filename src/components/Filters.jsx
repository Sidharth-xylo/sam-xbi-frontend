import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "../api.js";

export default function Filters({ value, onChange }) {
  const filters = useQuery({ queryKey: ["filters", value.venueId, value.sportId, value.batchId], queryFn: () => fetchFilters(value) });
  const data = filters.data || { venues: [], sports: [], batches: [], students: [] };

  function set(field, nextValue) {
    const parsed = nextValue ? Number(nextValue) : undefined;
    const reset = field === "venueId" ? { sportId: undefined, batchId: undefined } : field === "sportId" ? { batchId: undefined } : {};
    onChange({ ...value, ...reset, [field]: parsed });
  }

  return (
    <section className="filter-bar">
      {data.venues.length > 1 && (
        <label>
          Venue
          <select value={value.venueId || ""} onChange={(e) => set("venueId", e.target.value)}>
            <option value="">All accessible</option>
            {data.venues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      )}
      <label>
        Sport
        <select value={value.sportId || ""} onChange={(e) => set("sportId", e.target.value)}>
          <option value="">All sports</option>
          {data.sports.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label>
        Batch
        <select value={value.batchId || ""} onChange={(e) => set("batchId", e.target.value)}>
          <option value="">All batches</option>
          {data.batches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label>
        From
        <input type="date" value={value.dateFrom || ""} onChange={(e) => onChange({ ...value, dateFrom: e.target.value || undefined })} />
      </label>
      <label>
        To
        <input type="date" value={value.dateTo || ""} onChange={(e) => onChange({ ...value, dateTo: e.target.value || undefined })} />
      </label>
    </section>
  );
}
