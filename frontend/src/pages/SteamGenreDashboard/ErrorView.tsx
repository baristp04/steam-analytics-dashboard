import { AlertCircle } from "lucide-react";
import { C, FONT } from "../../components/dashboard/theme";

export function ErrorView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      style={{
        fontFamily: FONT,
        background: `radial-gradient(circle at 50% 40%, #274b68 0%, #1d3650 35%, ${C.bgDarkest} 75%, #0e1a28 100%)`,
        color: C.text,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        padding: 20,
      }}
    >
      <AlertCircle size={32} color={C.red} />
      <span style={{ color: C.red }}>{error}</span>
      <button
        onClick={onRetry}
        style={{
          background: C.blue,
          color: C.bgDarkest,
          border: 'none',
          borderRadius: 4,
          padding: '8px 16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  );
}
