import { ExternalLink, Layers } from "lucide-react";
import { steamUrl } from "./theme";
import type { DashboardGame, DashboardGenre } from "./types";

export function GameTile({ g, allGenres }: { g: DashboardGame; allGenres: DashboardGenre[] }) {
  const genreNames = g.genres.map((gid) => allGenres.find((x) => x.id === gid)?.name).filter(Boolean);
  return (
    <a
      className="sga-tile"
      href={steamUrl(g.appid)}
      target="_blank"
      rel="noreferrer"
      style={{
        background: `linear-gradient(150deg, hsl(${g.hue},42%,24%) 0%, hsl(${g.hue},55%,10%) 100%)`,
      }}
    >
      {/* EĞER RESİM VARSA GÖSTER, YOKSA ESKİ İKONU GÖSTER */}
      {g.grid_image ? (
        <img
          src={g.grid_image}
          alt={g.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className="sga-icon">
          <Layers size={34} color={`hsl(${g.hue},55%,70%)`} strokeWidth={1.3} />
        </div>
      )}

      <div className="sga-title-strip">
        <span>{g.name}</span>
      </div>

      <div className="sga-hover-panel">
        <div className="sga-hover-name">{g.name}</div>
        <div className="sga-hover-meta">{g.date} · #{g.appid}</div>
        <div className="sga-hover-tags">
          {genreNames.map((n) => (
            <span key={n} className="sga-hover-tag">{n}</span>
          ))}
        </div>
        <div className="sga-hover-link">
          View on Steam <ExternalLink size={11} />
        </div>
      </div>
    </a>
  );
}
