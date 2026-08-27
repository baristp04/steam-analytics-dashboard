import { RefreshCw } from "lucide-react";
import { NavLink } from "react-router-dom";
import { C } from "../../components/dashboard/theme";

interface TopBarProps {
  syncing?: boolean;
  onSync?: () => void;
}

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? C.blue : C.textDim,
  cursor: "pointer",
  textDecoration: "none",
});

export function TopBar({ syncing, onSync }: TopBarProps) {
  return (
    <div style={{ background: C.bgDarkest, borderBottom: `1px solid ${C.border}`, padding: "12px 32px", display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1500 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 4, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: C.bgDarkest }}>
            S
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.white, letterSpacing: 0.3 }}>
            GENRE RELEASE ANALYTICS
          </span>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13, color: C.textDim, alignItems: "center" }}>
          <NavLink to="/" end style={navLinkStyle}>Dashboard</NavLink>
          <NavLink to="/games" style={navLinkStyle}>Games</NavLink>
          <span style={{ cursor: "pointer" }}>Genres</span>
          {onSync && (
            <span
              onClick={syncing ? undefined : onSync}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                cursor: syncing ? "default" : "pointer",
                color: syncing ? C.blue : C.textDim,
              }}
            >
              <RefreshCw size={12} style={syncing ? { animation: "sga-spin 1s linear infinite" } : undefined} />
              {syncing ? "Syncing..." : "Sync"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
