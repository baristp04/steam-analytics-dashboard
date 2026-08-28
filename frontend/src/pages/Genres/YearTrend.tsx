import { C } from "../../components/dashboard/theme";
import type { YearCount } from "./useGenresData";

export function YearTrend({ byYear, hue }: { byYear: YearCount[]; hue: number }) {
  const max = Math.max(...byYear.map((d) => d.count), 1);

  return (
    <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, marginBottom: 16 }}>
        Releases by year
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180, padding: "0 4px" }}>
        {byYear.map((d) => (
          <div key={d.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{d.count}</span>
            <div
              style={{
                width: "100%",
                maxWidth: 56,
                height: `${(d.count / max) * 100}%`,
                minHeight: d.count > 0 ? 4 : 0,
                background: `hsl(${hue},55%,55%)`,
                borderRadius: "3px 3px 0 0",
              }}
            />
            <span style={{ fontSize: 12, color: C.textDim }}>{d.year}</span>
          </div>
        ))}
        {byYear.length === 0 && (
          <div style={{ margin: "auto", color: C.textDim, fontSize: 13 }}>No data.</div>
        )}
      </div>
    </div>
  );
}
