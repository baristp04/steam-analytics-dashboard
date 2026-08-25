import { ChevronRight, X } from "lucide-react";
import { C } from "../../components/dashboard/theme";
import { GameTile } from "../../components/dashboard/GameTile";
import type { DashboardGame, DashboardGenre } from "../../components/dashboard/types";

interface GameGridPanelProps {
  genreObj: DashboardGenre | undefined;
  monthLabel: string;
  year: number;
  filteredGames: DashboardGame[];
  allGenres: DashboardGenre[];
  onClearFilter: () => void;
}

export function GameGridPanel({ genreObj, monthLabel, year, filteredGames, allGenres, onClearFilter }: GameGridPanelProps) {
  return (
    <div style={{ background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
          {genreObj ? (
            <>
              <span>{genreObj.name}</span>
              <ChevronRight size={12} />
              <span style={{ color: C.text, textTransform: "none", letterSpacing: 0 }}>{filteredGames.length} games</span>
            </>
          ) : (
            <span>{monthLabel} {year} — all games ({filteredGames.length})</span>
          )}
        </div>
        {genreObj && (
          <button
            onClick={onClearFilter}
            style={{ background: "none", border: "none", color: C.textDim, display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}
          >
            <X size={13} /> Clear filter
          </button>
        )}
      </div>

      <div className="sga-grid">
        {filteredGames.map((g) => (
          <GameTile key={g.appid} g={g} allGenres={allGenres} />
        ))}
        {filteredGames.length === 0 && (
          <div style={{ gridColumn: "1 / -1", color: C.textDim, fontSize: 13, padding: 24, textAlign: "center" }}>
            No games match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
