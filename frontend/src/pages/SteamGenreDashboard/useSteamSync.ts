import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api";

export type SyncBannerState = { status: 'completed' | 'failed'; message: string };

const POLL_INTERVAL_MS = 3000;
const BANNER_TIMEOUT_MS = 8000;

export function useSteamSync(onSynced: () => void) {
  const [syncing, setSyncing] = useState(false);
  const [syncBanner, setSyncBanner] = useState<SyncBannerState | null>(null);
  const pollTimeout = useRef<number | null>(null);
  const bannerTimeout = useRef<number | null>(null);

  const showBanner = useCallback((banner: SyncBannerState) => {
    setSyncBanner(banner);
    if (bannerTimeout.current) window.clearTimeout(bannerTimeout.current);
    bannerTimeout.current = window.setTimeout(() => setSyncBanner(null), BANNER_TIMEOUT_MS);
  }, []);

  const poll = useCallback(async () => {
    try {
      const status = await api.getSyncStatus();

      if (!('status' in status)) {
        setSyncing(false);
        showBanner({ status: 'failed', message: status.message || 'Sync durumu okunamadı.' });
        return;
      }

      if (status.status === 'RUNNING') {
        pollTimeout.current = window.setTimeout(poll, POLL_INTERVAL_MS);
        return;
      }

      setSyncing(false);
      if (status.status === 'FAILED') {
        showBanner({ status: 'failed', message: status.error_message ?? 'Senkronizasyon başarısız oldu.' });
      } else {
        showBanner({
          status: 'completed',
          message: `Senkronizasyon tamamlandı: ${status.inserted_count} yeni oyun eklendi.`,
        });
        onSynced();
      }
    } catch (e) {
      setSyncing(false);
      showBanner({ status: 'failed', message: e instanceof Error ? e.message : 'Sync durumu alınamadı.' });
    }
  }, [onSynced, showBanner]);

  const triggerSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncBanner(null);
    try {
      await api.syncSteam();
    } catch (e) {
      setSyncing(false);
      showBanner({ status: 'failed', message: e instanceof Error ? e.message : 'Sync başlatılamadı.' });
      return;
    }
    pollTimeout.current = window.setTimeout(poll, 1500);
  }, [syncing, poll, showBanner]);

  useEffect(() => {
    return () => {
      if (pollTimeout.current) window.clearTimeout(pollTimeout.current);
      if (bannerTimeout.current) window.clearTimeout(bannerTimeout.current);
    };
  }, []);

  return { syncing, syncBanner, triggerSync };
}
