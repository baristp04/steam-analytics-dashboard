import { Calendar } from "lucide-react";
import { C, MONTHS, selectStyle } from "../../components/dashboard/theme";

interface FilterBarProps {
  year: number;
  onYearChange: (year: number) => void;
  years: number[];
  month: number;
  onMonthChange: (month: number) => void;
}

export function FilterBar({ year, onYearChange, years, month, onMonthChange }: FilterBarProps) {
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
    </div>
  );
}
