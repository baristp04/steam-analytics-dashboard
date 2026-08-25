import React from "react";
import { C } from "./theme";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}

export function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div
      style={{
        background: C.bgPanel,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: "16px 18px",
        flex: 1,
        minWidth: 160,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={15} color={accent} />
        <span style={{ fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: C.textDim }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: C.white }}>{value}</div>
    </div>
  );
}
