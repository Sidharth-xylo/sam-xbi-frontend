import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "../api.js";
import Select from "./Select.jsx";

export default function Filters({ value, onChange }) {
  const filters = useQuery({ queryKey: ["filters", value.venueId, value.sportId, value.batchId], queryFn: () => fetchFilters(value) });
  const data = filters.data || { venues: [], sports: [], batches: [], students: [] };

  function set(field, nextValue) {
    const parsed = nextValue ? Number(nextValue) : undefined;
    const reset = field === "venueId" ? { sportId: undefined, batchId: undefined } : field === "sportId" ? { batchId: undefined } : {};
    onChange({ ...value, ...reset, [field]: parsed });
  }

  const opts = (items) => items.map((i) => ({ value: i.id, label: i.name }));

  return (
    <section className="filter-bar">
      {data.venues.length > 1 && (
        <label>
          Venue
          <Select value={value.venueId || ""} onChange={(v) => set("venueId", v)} options={opts(data.venues)} placeholder="All accessible" accent="var(--xbi-cyan)" />
        </label>
      )}
      <label>
        Sport
        <Select value={value.sportId || ""} onChange={(v) => set("sportId", v)} options={opts(data.sports)} placeholder="All sports" accent="var(--xbi-cyan)" />
      </label>
      <label>
        Batch
        <Select value={value.batchId || ""} onChange={(v) => set("batchId", v)} options={opts(data.batches)} placeholder="All batches" accent="var(--xbi-lime)" />
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
