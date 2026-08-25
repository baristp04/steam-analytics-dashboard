import { Loader2 } from "lucide-react";
import { C, FONT } from "../../components/dashboard/theme";

export function LoadingView() {
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
      }}
    >
      <Loader2 size={32} style={{ animation: 'sga-spin 1s linear infinite' }} color={C.blue} />
      <span style={{ color: C.textDim }}>Loading analytics...</span>
    </div>
  );
}
