import {useCallback, useEffect, useRef, useState} from 'react';
import {RECITERS, ReciterId} from '../data/baqarah';

export const AUDIO_CACHE_NAME = 'quran-audio-cache';
export const TOTAL_VERSES = 286;

export type CachedCountMap = Record<ReciterId, number>;

export interface DownloadProgress {
  reciterId: ReciterId;
  completed: number;
  total: number;
}

function createEmptyCounts(): CachedCountMap {
  return RECITERS.reduce((acc, reciter) => {
    acc[reciter.id] = 0;
    return acc;
  }, {} as CachedCountMap);
}

function getReciterPathSegment(reciterId: ReciterId): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
  const sampleUrl = reciter.buildAudioUrl(1);
  const parts = sampleUrl.split('/');
  return parts[parts.length - 2] ?? '';
}

export function getReciterOfflineTotal(reciterId: ReciterId): number {
  const reciter = RECITERS.find((r) => r.id === reciterId);
  if (!reciter || reciter.audioMode === 'youtube') return 0;
  return reciter.audioMode === 'verse' ? TOTAL_VERSES : 1;
}

export function useOfflineAudio() {
  const [cachedCounts, setCachedCounts] = useState<CachedCountMap>(createEmptyCounts);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const isSupported = typeof window !== 'undefined' && 'caches' in window;

  const refreshCounts = useCallback(async () => {
    if (!isSupported) return;
    try {
      const cache = await window.caches.open(AUDIO_CACHE_NAME);
      const keys = await cache.keys();
      const cachedUrlSet = new Set(keys.map((req) => req.url));

      const nextCounts = createEmptyCounts();
      const verseSets: Partial<Record<ReciterId, Set<string>>> = {};
      const verseSegments: Partial<Record<ReciterId, string>> = {};

      for (const reciter of RECITERS) {
        if (reciter.audioMode === 'youtube') {
          nextCounts[reciter.id] = 0;
        } else if (reciter.audioMode === 'verse') {
          verseSets[reciter.id] = new Set();
          verseSegments[reciter.id] = getReciterPathSegment(reciter.id);
        } else if (reciter.surahAudioUrl && cachedUrlSet.has(reciter.surahAudioUrl)) {
          nextCounts[reciter.id] = 1;
        }
      }

      for (const url of cachedUrlSet) {
        for (const reciter of RECITERS) {
          if (reciter.audioMode !== 'verse') continue;
          const segment = verseSegments[reciter.id];
          if (segment && url.includes(`/${segment}/`)) {
            const filename = url.split('/').pop() ?? '';
            if (/^002\d{3}\.mp3$/.test(filename)) {
              verseSets[reciter.id]?.add(filename);
            }
          }
        }
      }

      for (const reciter of RECITERS) {
        if (reciter.audioMode === 'verse') {
          nextCounts[reciter.id] = verseSets[reciter.id]?.size ?? 0;
        }
      }

      if (isMountedRef.current) {
        setCachedCounts(nextCounts);
      }
    } catch {
      // Ignore cache read failures gracefully
    }
  }, [isSupported]);

  useEffect(() => {
    isMountedRef.current = true;
    refreshCounts();
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [refreshCounts]);

  const cancelDownload = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setDownloadProgress(null);
  }, []);

  const downloadReciter = useCallback(
    async (reciterId: ReciterId) => {
      const targetReciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
      if (targetReciter.audioMode === 'youtube') {
        return;
      }

      if (!isSupported) {
        setDownloadError('المتصفح لا يدعم التخزين الصوتي بدون إنترنت.');
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setDownloadError(null);

      try {
        if (navigator.storage?.persist) {
          navigator.storage.persist().catch(() => undefined);
        }

        const cache = await window.caches.open(AUDIO_CACHE_NAME);
        const reciter = targetReciter;

        if (reciter.audioMode !== 'verse' && reciter.surahAudioUrl) {
          const surahUrl = reciter.surahAudioUrl;
          const existing = await cache.match(surahUrl);
          if (existing) {
            await refreshCounts();
            setDownloadProgress(null);
            return;
          }

          if (isMountedRef.current) {
            setDownloadProgress({reciterId, completed: 0, total: 1});
          }

          if (reciter.ayatTimingUrl) {
            try {
              const timingResp = await fetch(reciter.ayatTimingUrl, {
                signal: controller.signal,
              });
              if (timingResp.ok) {
                await cache.put(reciter.ayatTimingUrl, timingResp);
              }
            } catch {
              // Ignore timing prefetch failures cleanly
            }
          }

          const response = await fetch(surahUrl, {
            mode: 'cors',
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error('Failed to fetch surah audio');
          }

          await cache.put(surahUrl, response);

          if (!controller.signal.aborted && isMountedRef.current) {
            await refreshCounts();
            setDownloadProgress(null);
          }
          return;
        }

        const missingVerses: number[] = [];
        let alreadyCached = 0;

        for (let v = 1; v <= TOTAL_VERSES; v++) {
          const url = reciter.buildAudioUrl(v);
          const match = await cache.match(url);
          if (match) {
            alreadyCached++;
          } else {
            missingVerses.push(v);
          }
        }

        if (missingVerses.length === 0) {
          await refreshCounts();
          setDownloadProgress(null);
          return;
        }

        let completed = alreadyCached;
        if (isMountedRef.current) {
          setDownloadProgress({reciterId, completed, total: TOTAL_VERSES});
        }

        let cursor = 0;
        let failedCount = 0;
        const CONCURRENCY = 6;

        const worker = async () => {
          while (cursor < missingVerses.length && !controller.signal.aborted) {
            const idx = cursor++;
            const verseNum = missingVerses[idx];
            const url = reciter.buildAudioUrl(verseNum);

            try {
              const response = await fetch(url, {
                mode: 'cors',
                signal: controller.signal,
              });
              if (!response.ok) {
                failedCount++;
                continue;
              }
              await cache.put(url, response.clone());
              completed++;
              if (isMountedRef.current && !controller.signal.aborted) {
                setDownloadProgress({reciterId, completed, total: TOTAL_VERSES});
                if (completed % 8 === 0 || completed === TOTAL_VERSES) {
                  setCachedCounts((prev) => ({
                    ...prev,
                    [reciterId]: Math.max(prev[reciterId] ?? 0, completed),
                  }));
                }
              }
            } catch (err) {
              if ((err as DOMException)?.name === 'AbortError') {
                return;
              }
              failedCount++;
            }
          }
        };

        await Promise.all(Array.from({length: CONCURRENCY}, () => worker()));

        if (!controller.signal.aborted && isMountedRef.current) {
          await refreshCounts();
          setDownloadProgress(null);
          if (failedCount > 0) {
            setDownloadError(
              `تم تنزيل ${completed} من ${TOTAL_VERSES} آية. اضغط استكمال لإحضار الباقي عند توفر الشبكة.`
            );
          }
        }
      } catch (err) {
        if ((err as DOMException)?.name !== 'AbortError' && isMountedRef.current) {
          setDownloadProgress(null);
          setDownloadError('تعذّر إكمال تنزيل الصوتيات. تأكد من الاتصال بالإنترنت.');
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [isSupported, refreshCounts]
  );

  const removeReciterCache = useCallback(
    async (reciterId: ReciterId) => {
      if (!isSupported) return;
      const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
      if (reciter.audioMode === 'youtube') return;
      try {
        const cache = await window.caches.open(AUDIO_CACHE_NAME);
        if (reciter.audioMode !== 'verse' && reciter.surahAudioUrl) {
          await cache.delete(reciter.surahAudioUrl);
          if (reciter.ayatTimingUrl) {
            await cache.delete(reciter.ayatTimingUrl);
          }
        } else {
          await Promise.all(
            Array.from({length: TOTAL_VERSES}, (_, idx) => cache.delete(reciter.buildAudioUrl(idx + 1)))
          );
        }
        await refreshCounts();
      } catch {
        // Ignore deletion errors cleanly
      }
    },
    [isSupported, refreshCounts]
  );

  return {
    isSupported,
    cachedCounts,
    downloadProgress,
    downloadError,
    downloadReciter,
    cancelDownload,
    removeReciterCache,
    refreshCounts,
  };
}
