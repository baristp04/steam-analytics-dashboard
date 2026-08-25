import { C } from "../../components/dashboard/theme";
import type { DashboardGenre } from "../../components/dashboard/types";

interface GenreBreakdownProps {
  genres: DashboardGenre[];
  activeGenre: string | null;
  maxCount: number;
  onSelectGenre: (id: string | null) => void;
}

export function GenreBreakdown({ genres, activeGenre, maxCount, onSelectGenre }: GenreBreakdownProps) {
  return (
    <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, marginBottom: 12 }}>
        Breakdown by genre
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {genres.map((g) => {
          const isActive = activeGenre === g.id;
          return (
            <div
              key={g.id}
              onClick={() => onSelectGenre(isActive ? null : g.id)}
              style={{
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: 3,
                background: isActive ? C.bgCardHover : "transparent",
                border: `1px solid ${isActive ? C.blueDim : "transparent"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: isActive ? C.blue : C.text }}>{g.name}</span>
                <span style={{ color: C.textDim }}>{g.count}</span>
              </div>
              <div style={{ height: 5, background: C.bgDarkest, borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(g.count / maxCount) * 100}%`,
                    height: "100%",
                    background: isActive ? C.blue : `hsl(${g.hue},50%,58%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
