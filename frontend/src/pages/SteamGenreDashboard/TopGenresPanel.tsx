import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { C } from "../../components/dashboard/theme";
import type { DashboardGenre } from "../../components/dashboard/types";

interface TopGenresPanelProps {
  topGenres: DashboardGenre[];
  monthLabel: string;
  year: number;
}

const MEDAL = ["#f4c542", "#c8d0d8", "#cd7f45"];

export function TopGenresPanel({ topGenres, monthLabel, year }: TopGenresPanelProps) {
  return (
    <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <Trophy size={13} color={C.green} />
        Top genres by releases
      </div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
        {monthLabel} {year}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {topGenres.map((g, i) => (
          <Link
            key={g.id}
            to={`/genres?genre=${g.id}`}
            title={`View ${g.name} genre analytics`}
            className="sga-genre-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 4,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: C.bgDarkest,
                background: MEDAL[i] ?? C.blueDim,
              }}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1, fontSize: 14, color: C.white }}>{g.name}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>{g.count}</span>
          </Link>
        ))}
        {topGenres.length === 0 && (
          <div style={{ color: C.textDim, fontSize: 13, padding: 12, textAlign: "center" }}>
            No releases in this period.
          </div>
        )}
      </div>
    </div>
  );
}
