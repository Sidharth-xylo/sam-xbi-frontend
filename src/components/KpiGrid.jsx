import React from "react";
import { Sparkline } from "./Charts.jsx";

const ACCENTS = ["#d4ff3a", "#38f0e8", "#ff3da8", "#a98aff", "#ff8a3d", "#3ddc97", "#ffd23d"];

export default function KpiGrid({ cards = [] }) {
  return (
    <section className="kpi-grid">
      {cards.map((card, index) => {
        const accent = card.color || ACCENTS[index % ACCENTS.length];
        return (
          <article className="stat-card" key={card.key} style={{ "--accent": accent }}>
            <div className="stat-row">
              <span className="stat-label">{card.label}</span>
              {card.delta != null && (
                <span className={`stat-delta ${card.delta >= 0 ? "up" : "down"}`}>
                  {card.delta >= 0 ? "▲" : "▼"} {Math.abs(card.delta)}%
                </span>
              )}
            </div>
            <strong className="stat-value">{card.prefix || ""}{card.value ?? 0}{card.suffix || ""}</strong>
            {card.spark?.length > 0 && (
              <div className="stat-spark"><Sparkline data={card.spark} dataKey={card.sparkKey || "v"} color={accent} height={36} /></div>
            )}
          </article>
        );
      })}
    </section>
  );
}
