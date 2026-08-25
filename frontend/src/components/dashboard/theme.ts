import type React from "react";

// ---- Steam-ish design tokens ----
export const C = {
  bgDarkest: "#131f2c",
  bg: "#1e3044",
  bgPanel: "#1d2e40",
  bgCard: "#263a4f",
  bgCardHover: "#304862",
  border: "#3a5674",
  blue: "#66c0f4",
  blueDim: "#82abc4",
  green: "#a4d007",
  text: "#d3e1ec",
  textDim: "#9db0c0",
  white: "#f1f5f9",
  red: "#e74c3c",
};

export const FONT = "'Segoe UI', 'Motiva Sans', Arial, sans-serif";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const HUES: Record<string, number> = {
  action: 200,
  indie: 260,
  adventure: 30,
  rpg: 340,
  casual: 100,
  strategy: 15,
  simulation: 170,
  puzzle: 55,
};

export const steamUrl = (appid: number) => `https://store.steampowered.com/app/${appid}`;

export const selectStyle: React.CSSProperties = {
  background: C.bgPanel,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  padding: "6px 10px",
  color: C.text,
  fontSize: 13,
  outline: "none",
};
