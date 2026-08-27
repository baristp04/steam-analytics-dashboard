import { C } from "../../components/dashboard/theme";
import type { DashboardGenre } from "../../components/dashboard/types";

interface GenreBreakdownProps {
  genres: DashboardGenre[];
  maxCount: number;
}

export function GenreBreakdown({ genres, maxCount }: GenreBreakdownProps) {
  return (
    <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, marginBottom: 12 }}>
        Game count by genre
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {genres.map((g) => (
          <div key={g.id} style={{ padding: "6px 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: C.text }}>{g.name}</span>
              <span style={{ color: C.textDim }}>{g.count}</span>
            </div>
            <div style={{ height: 5, background: C.bgDarkest, borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  width: `${(g.count / maxCount) * 100}%`,
                  height: "100%",
                  background: `hsl(${g.hue},50%,58%)`,
                }}
              />
            </div>
          </div>
        ))}
        {genres.length === 0 && (
          <div style={{ color: C.textDim, fontSize: 13, padding: 12, textAlign: "center" }}>
            No genre data for this period.
          </div>
        )}
      </div>
    </div>
  );
}
