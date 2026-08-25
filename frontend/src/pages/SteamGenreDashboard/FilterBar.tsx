import { Calendar, Search } from "lucide-react";
import { C, MONTHS, selectStyle } from "../../components/dashboard/theme";

interface FilterBarProps {
  year: number;
  onYearChange: (year: number) => void;
  years: number[];
  month: number;
  onMonthChange: (month: number) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function FilterBar({ year, onYearChange, years, month, onMonthChange, query, onQueryChange }: FilterBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.textDim, fontSize: 12 }}>
        <Calendar size={14} />
        <span>Period</span>
      </div>
      <select value={year} onChange={(e) => onYearChange(Number(e.target.value))} style={selectStyle}>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month} onChange={(e) => onMonthChange(Number(e.target.value))} style={selectStyle}>
        <option value={-1}>All months</option>
        {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
      </select>

      <div style={{ marginLeft: "auto", position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: C.textDim }} />
        <input
          placeholder="Search games..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            background: C.bgPanel,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            padding: "7px 10px 7px 30px",
            color: C.text,
            fontSize: 13,
            outline: "none",
            width: 200,
          }}
        />
      </div>
    </div>
  );
}
