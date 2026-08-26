import { AlertCircle, CheckCircle2 } from "lucide-react";
import { C } from "../../components/dashboard/theme";
import type { SyncBannerState } from "./useSteamSync";

export function SyncBanner({ status, message }: SyncBannerState) {
  const isFailed = status === "failed";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: C.bgPanel,
        border: `1px solid ${isFailed ? C.red : C.green}`,
        borderRadius: 4,
        padding: "10px 14px",
        marginBottom: 18,
        fontSize: 13,
        color: isFailed ? C.red : C.green,
      }}
    >
      {isFailed ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
      <span>{message}</span>
    </div>
  );
}
