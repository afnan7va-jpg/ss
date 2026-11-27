import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import {RECITERS, ReciterId, ReciterInfo, RepeatMode} from '../data/baqarah';
import {AUDIO_CACHE_NAME} from './useOfflineAudio';

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      width?: number | string;
      height?: number | string;
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number | undefined>;
      events?: {
        onReady?: (event: {target: YTPlayerInstance}) => void;
        onStateChange?: (event: {data: number; target: YTPlayerInstance}) => void;
        onError?: (event: {data: number}) => void;
      };
    }
  ) => YTPlayerInstance;
  PlayerState?: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiLoadPromise: Promise<YTNamespace | null> | null = null;

function loadYouTubeIframeApi(): Promise<YTNamespace | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiLoadPromise) return ytApiLoadPromise;

  ytApiLoadPromise = new Promise((resolve) => {
    const existingReady = window.onYouTubeIframeAPIReady;
    const finish = () => {
      resolve(window.YT?.Player ? window.YT : null);
    };

    window.onYouTubeIframeAPIReady = () => {
      if (typeof existingReady === 'function') {
        try {
          existingReady();
        } catch {
          // Ignore prior handler errors
        }
      }
      finish();
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        ytApiLoadPromise = null;
        resolve(null);
      };
      document.head.appendChild(script);
    }

    const timeout = window.setTimeout(() => {
      if (window.YT?.Player) {
        finish();
      } else {
        ytApiLoadPromise = null;
        resolve(null);
      }
    }, 10000);

    const checkInterval = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(checkInterval);
        window.clearTimeout(timeout);
        finish();
      }
    }, 120);
  });

  return ytApiLoadPromise;
}

interface UseQuranAudioOptions {
  reciterId: ReciterId;
  repeatMode: RepeatMode;
  ytContainerRef?: RefObject<HTMLDivElement | null>;
  onVerseChange?: (verseNumber: number) => void;
}

interface AyahTimingEntry {
  ayah: number;
  start_time: number;
  end_time: number;
}

const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

const MAX_PRELOADED_URLS = 4;

export function useQuranAudio({
  reciterId,
  repeatMode,
  ytContainerRef,
  onVerseChange,
}: UseQuranAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioUnlockedRef = useRef<boolean>(false);
  const isUnlockingRef = useRef<boolean>(false);
  const activeObjectUrlRef = useRef<string | null>(null);
  const activeSurahUrlRef = useRef<string | null>(null);
  const cachePromiseRef = useRef<Promise<Cache | null> | null>(null);
  const preloadedMapRef = useRef<Map<string, string>>(new Map());
  const preloadInFlightRef = useRef<Map<string, Promise<string | null>>>(new Map());
  const timingsCacheRef = useRef<Map<string, Map<number, AyahTimingEntry>>>(new Map());
  const loadRequestIdRef = useRef<number>(0);
  const activeVerseRef = useRef<number | null>(null);
  const loopCountRef = useRef<number>(1);
  const reciterIdRef = useRef<ReciterId>(reciterId);
  const loadedReciterIdRef = useRef<ReciterId | null>(null);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const onVerseChangeRef = useRef(onVerseChange);
  const pendingSeekSecRef = useRef<number | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytActiveVideoIdRef = useRef<string | null>(null);
  const ytAutoplayTimerRef = useRef<number | null>(null);
  const ytPollIntervalRef = useRef<number | null>(null);

  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentLoop, setCurrentLoop] = useState<number>(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [ytNeedsDirectTap, setYtNeedsDirectTap] = useState<boolean>(false);

  useEffect(() => {
    reciterIdRef.current = reciterId;
  }, [reciterId]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    onVerseChangeRef.current = onVerseChange;
  }, [onVerseChange]);

  const getCache = useCallback((): Promise<Cache | null> => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return Promise.resolve(null);
    }
    if (!cachePromiseRef.current) {
      cachePromiseRef.current = window.caches
        .open(AUDIO_CACHE_NAME)
        .catch(() => null);
    }
    return cachePromiseRef.current;
  }, []);

  const revokeActiveObjectUrl = useCallback(() => {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
    activeSurahUrlRef.current = null;
  }, []);

  const clearPreloadedMap = useCallback(() => {
    for (const objUrl of preloadedMapRef.current.values()) {
      if (objUrl !== activeObjectUrlRef.current) {
        URL.revokeObjectURL(objUrl);
      }
    }
    preloadedMapRef.current.clear();
    preloadInFlightRef.current.clear();
  }, []);

  const setPreloadedEntry = useCallback((url: string, objUrl: string) => {
    const map = preloadedMapRef.current;
    if (map.has(url)) {
      const old = map.get(url);
      if (old && old !== objUrl && old !== activeObjectUrlRef.current) {
        URL.revokeObjectURL(old);
      }
      map.delete(url);
    }
    map.set(url, objUrl);
    while (map.size > MAX_PRELOADED_URLS) {
      const oldestKey = map.keys().next().value;
      if (!oldestKey) break;
      const oldestVal = map.get(oldestKey);
      map.delete(oldestKey);
      if (oldestVal && oldestVal !== activeObjectUrlRef.current) {
        URL.revokeObjectURL(oldestVal);
      }
    }
  }, []);

  const getReciter = useCallback((id: ReciterId): ReciterInfo => {
    return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
  }, []);

  const loadTimingsForReciter = useCallback(
    async (reciter: ReciterInfo): Promise<Map<number, AyahTimingEntry> | null> => {
      if (!reciter.ayatTimingUrl) return null;
      const cached = timingsCacheRef.current.get(reciter.id);
      if (cached) return cached;

      try {
        const cache = await getCache();
        let data: AyahTimingEntry[] | null = null;
        if (cache) {
          const match = await cache.match(reciter.ayatTimingUrl);
          if (match) {
            data = (await match.json()) as AyahTimingEntry[];
          }
        }
        if (!data) {
          const resp = await fetch(reciter.ayatTimingUrl);
          if (!resp.ok) return null;
          if (cache) {
            void cache.put(reciter.ayatTimingUrl, resp.clone()).catch(() => undefined);
          }
          data = (await resp.json()) as AyahTimingEntry[];
        }
        if (!Array.isArray(data) || data.length === 0) return null;

        const map = new Map<number, AyahTimingEntry>();
        for (const item of data) {
          if (typeof item.ayah === 'number') {
            map.set(item.ayah, item);
          }
        }
        timingsCacheRef.current.set(reciter.id, map);
        return map;
      } catch {
        return null;
      }
    },
    [getCache]
  );

  const preloadVerseUrl = useCallback(
    (url: string): Promise<string | null> => {
      const cachedReady = preloadedMapRef.current.get(url);
      if (cachedReady) {
        return Promise.resolve(cachedReady);
      }
      const existing = preloadInFlightRef.current.get(url);
      if (existing) {
        return existing;
      }

      const task = (async () => {
        try {
          const cache = await getCache();
          if (cache) {
            const match = await cache.match(url);
            if (match) {
              const blob = await match.blob();
              const objUrl = URL.createObjectURL(blob);
              setPreloadedEntry(url, objUrl);
              return objUrl;
            }
          }

          if (!navigator.onLine) return null;

          const response = await fetch(url, {mode: 'cors'});
          if (!response.ok) return null;

          if (cache) {
            void cache.put(url, response.clone()).catch(() => undefined);
          }
          const blob = await response.blob();
          const objUrl = URL.createObjectURL(blob);
          setPreloadedEntry(url, objUrl);
          return objUrl;
        } catch {
          return null;
        } finally {
          preloadInFlightRef.current.delete(url);
        }
      })();

      preloadInFlightRef.current.set(url, task);
      return task;
    },
    [getCache, setPreloadedEntry]
  );

  const preloadUpcomingVerses = useCallback(
    (fromVerse: number, activeReciterId: ReciterId) => {
      const reciter = getReciter(activeReciterId);
      if (reciter.audioMode !== 'verse') return;
      if (fromVerse + 1 <= 286) {
        void preloadVerseUrl(reciter.buildAudioUrl(fromVerse + 1));
      }
      if (fromVerse + 2 <= 286) {
        void preloadVerseUrl(reciter.buildAudioUrl(fromVerse + 2));
      }
    },
    [getReciter, preloadVerseUrl]
  );

  const clearYtTimers = useCallback(() => {
    if (ytAutoplayTimerRef.current !== null) {
      window.clearTimeout(ytAutoplayTimerRef.current);
      ytAutoplayTimerRef.current = null;
    }
    if (ytPollIntervalRef.current !== null) {
      window.clearInterval(ytPollIntervalRef.current);
      ytPollIntervalRef.current = null;
    }
  }, []);

  const armYtAutoplayWatchdog = useCallback(() => {
    if (ytAutoplayTimerRef.current !== null) {
      window.clearTimeout(ytAutoplayTimerRef.current);
    }
    ytAutoplayTimerRef.current = window.setTimeout(() => {
      ytAutoplayTimerRef.current = null;
      const reciter = getReciter(reciterIdRef.current);
      if (reciter.audioMode !== 'youtube') return;
      const player = ytPlayerRef.current;
      const state = player?.getPlayerState?.() ?? -1;
      if (state !== 1 && state !== 3) {
        setIsLoading(false);
        setYtNeedsDirectTap(true);
      }
    }, 1800);
  }, [getReciter]);

  const stopAudio = useCallback(() => {
    loadRequestIdRef.current++;
    isUnlockingRef.current = false;
    pendingSeekSecRef.current = null;
    clearYtTimers();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // Ignore YT pause errors cleanly
      }
    }
    revokeActiveObjectUrl();
    clearPreloadedMap();
    activeVerseRef.current = null;
    loopCountRef.current = 1;
    setIsPlaying(false);
    setIsLoading(false);
    setPlayingVerse(null);
    setCurrentLoop(1);
    setAudioError(null);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setYtNeedsDirectTap(false);
  }, [clearPreloadedMap, clearYtTimers, revokeActiveObjectUrl]);

  const startVerse = useCallback(
    (verseNumber: number, loopIteration = 1) => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
        audioRef.current.setAttribute('playsinline', '');
        audioRef.current.setAttribute('webkit-playsinline', '');
      }
      const audio = audioRef.current;
      const currentReciterId = reciterIdRef.current;
      const reciter = getReciter(currentReciterId);
      loadedReciterIdRef.current = currentReciterId;

      // YouTube continuous recitation reciters (e.g., Ahmad Khader & Sherif Mostafa)
      if (reciter.audioMode === 'youtube' && reciter.youtubeVideoId) {
        const videoId = reciter.youtubeVideoId;
        const requestId = ++loadRequestIdRef.current;

        // Silence any active HTMLAudioElement before starting YouTube
        isUnlockingRef.current = false;
        pendingSeekSecRef.current = null;
        activeSurahUrlRef.current = null;
        if (!audio.paused) {
          audio.pause();
        }

        activeVerseRef.current = verseNumber;
        loopCountRef.current = 1;
        setPlayingVerse(verseNumber);
        setCurrentLoop(1);
        setAudioError(null);
        setYtNeedsDirectTap(false);

        const existingPlayer = ytPlayerRef.current;
        if (existingPlayer && ytActiveVideoIdRef.current === videoId) {
          const state = existingPlayer.getPlayerState?.() ?? -1;
          if (state === 1) {
            setIsPlaying(true);
            setIsLoading(false);
            return;
          }
          setIsLoading(true);
          try {
            existingPlayer.playVideo();
            armYtAutoplayWatchdog();
          } catch {
            setIsLoading(false);
            setYtNeedsDirectTap(true);
          }
          return;
        }

        setIsLoading(true);
        setAudioCurrentTime(0);
        setAudioDuration(0);

        if (existingPlayer) {
          ytActiveVideoIdRef.current = videoId;
          try {
            existingPlayer.loadVideoById(videoId);
            existingPlayer.playVideo();
            armYtAutoplayWatchdog();
            return;
          } catch {
            try {
              existingPlayer.destroy();
            } catch {
              // Ignore destroy errors
            }
            ytPlayerRef.current = null;
          }
        }

        const startYoutubePlayer = async () => {
          const YT = await loadYouTubeIframeApi();
          if (requestId !== loadRequestIdRef.current) return;
          if (!YT?.Player) {
            setIsLoading(false);
            setAudioError('تعذّر تحميل مشغل يوتيوب. تأكد من الاتصال بالإنترنت.');
            return;
          }

          const container = ytContainerRef?.current;
          if (!container) {
            setIsLoading(false);
            setAudioError('تعذّر تهيئة نافذة الصوت.');
            return;
          }

          container.innerHTML = '';
          const mountNode = document.createElement('div');
          container.appendChild(mountNode);
          ytActiveVideoIdRef.current = videoId;

          try {
            ytPlayerRef.current = new YT.Player(mountNode, {
              width: '100%',
              height: '100%',
              videoId,
              playerVars: {
                autoplay: 1,
                playsinline: 1,
                controls: 1,
                rel: 0,
                modestbranding: 1,
                fs: 0,
                enablejsapi: 1,
                origin: window.location.origin,
              },
              events: {
                onReady: (event) => {
                  if (requestId !== loadRequestIdRef.current) return;
                  const activeReciter = getReciter(reciterIdRef.current);
                  if (activeReciter.audioMode !== 'youtube') return;
                  const dur = event.target.getDuration?.() ?? 0;
                  if (Number.isFinite(dur) && dur > 0) {
                    setAudioDuration(dur);
                  }
                  try {
                    event.target.playVideo();
                    armYtAutoplayWatchdog();
                  } catch {
                    setIsLoading(false);
                    setYtNeedsDirectTap(true);
                  }
                },
                onStateChange: (event) => {
                  const activeReciter = getReciter(reciterIdRef.current);
                  if (activeReciter.audioMode !== 'youtube') return;
                  const state = event.data;
                  if (state === 1) {
                    // PLAYING
                    if (ytAutoplayTimerRef.current !== null) {
                      window.clearTimeout(ytAutoplayTimerRef.current);
                      ytAutoplayTimerRef.current = null;
                    }
                    setIsPlaying(true);
                    setIsLoading(false);
                    setAudioError(null);
                    setYtNeedsDirectTap(false);
                    const dur = event.target.getDuration?.() ?? 0;
                    if (Number.isFinite(dur) && dur > 0) {
                      setAudioDuration(dur);
                    }
                  } else if (state === 3) {
                    // BUFFERING
                    setIsLoading(true);
                  } else if (state === 2) {
                    // PAUSED
                    setIsPlaying(false);
                    setIsLoading(false);
                  } else if (state === 0) {
                    // ENDED
                    setIsPlaying(false);
                    setIsLoading(false);
                  }
                },
                onError: () => {
                  const activeReciter = getReciter(reciterIdRef.current);
                  if (activeReciter.audioMode !== 'youtube') return;
                  clearYtTimers();
                  setIsPlaying(false);
                  setIsLoading(false);
                  setYtNeedsDirectTap(false);
                  setAudioError('تعذّر تشغيل التلاوة من يوتيوب. تأكد من الاتصال بالإنترنت.');
                },
              },
            });
          } catch {
            setIsLoading(false);
            setAudioError('تعذّر تهيئة مشغل يوتيوب.');
          }
        };

        void startYoutubePlayer();
        return;
      }

      // Pause any active YouTube stream when playing HTML audio reciter
      if (ytPlayerRef.current) {
        clearYtTimers();
        setYtNeedsDirectTap(false);
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore pause errors
        }
      }

      // Full-surah continuous track reciters (without per-ayah timestamps):
      // Keep playing seamlessly if already loaded & active; otherwise start surah stream
      if (reciter.audioMode === 'surah' && reciter.surahAudioUrl) {
        const surahUrl = reciter.surahAudioUrl;
        activeVerseRef.current = verseNumber;
        loopCountRef.current = 1;
        setPlayingVerse(verseNumber);
        setCurrentLoop(1);
        setAudioError(null);

        if (activeSurahUrlRef.current === surahUrl && audio.src) {
          if (!audio.paused && !audio.ended) {
            return;
          }
          setIsLoading(true);
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setIsLoading(false);
              setAudioError('تعذّر تشغيل الصوت. تأكد من الاتصال بالإنترنت.');
            });
          return;
        }

        const requestId = ++loadRequestIdRef.current;
        pendingSeekSecRef.current = null;
        setIsLoading(true);
        setAudioCurrentTime(0);
        setAudioDuration(0);

        if (!isAudioUnlockedRef.current) {
          isAudioUnlockedRef.current = true;
          isUnlockingRef.current = true;
          try {
            audio.src = SILENT_WAV_DATA_URI;
            void audio.play().catch(() => {
              isUnlockingRef.current = false;
            });
          } catch {
            isUnlockingRef.current = false;
          }
        } else {
          isUnlockingRef.current = false;
          audio.pause();
        }

        const startSurahStream = async () => {
          let resolvedSrc = surahUrl;
          let usedObjectUrl = false;
          const cache = await getCache();
          if (requestId !== loadRequestIdRef.current) return;
          if (cache) {
            try {
              const cachedResp = await cache.match(surahUrl);
              if (requestId !== loadRequestIdRef.current) return;
              if (cachedResp) {
                const blob = await cachedResp.blob();
                if (requestId !== loadRequestIdRef.current) return;
                revokeActiveObjectUrl();
                const objUrl = URL.createObjectURL(blob);
                activeObjectUrlRef.current = objUrl;
                resolvedSrc = objUrl;
                usedObjectUrl = true;
              }
            } catch {
              revokeActiveObjectUrl();
            }
          }
          if (!usedObjectUrl) {
            revokeActiveObjectUrl();
          }
          if (requestId !== loadRequestIdRef.current) return;

          activeSurahUrlRef.current = surahUrl;
          isUnlockingRef.current = false;
          audio.src = resolvedSrc;

          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                if (requestId !== loadRequestIdRef.current) return;
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(() => {
                if (requestId !== loadRequestIdRef.current) return;
                setIsPlaying(false);
                setIsLoading(false);
                setAudioError(
                  'تعذّر تشغيل الصوت. حمّل صوت الشيخ للاستماع بدون إنترنت أو تأكد من الاتصال.'
                );
              });
          }
        };

        void startSurahStream();
        return;
      }

      // Timed full-surah reciter (e.g. Ahmad Khader Al-Tarabulsi with 286 exact timestamps)
      if (reciter.audioMode === 'timed-surah' && reciter.surahAudioUrl) {
        const surahUrl = reciter.surahAudioUrl;
        const requestId = ++loadRequestIdRef.current;

        activeVerseRef.current = verseNumber;
        loopCountRef.current = loopIteration;
        setPlayingVerse(verseNumber);
        setCurrentLoop(loopIteration);
        setAudioError(null);

        const cachedTimings = timingsCacheRef.current.get(reciter.id);
        const alreadyLoadedSameTrack =
          activeSurahUrlRef.current === surahUrl &&
          audio.src &&
          audio.readyState >= 1 &&
          cachedTimings;

        if (alreadyLoadedSameTrack) {
          const entry = cachedTimings.get(verseNumber);
          if (entry) {
            isAudioUnlockedRef.current = true;
            isUnlockingRef.current = false;
            pendingSeekSecRef.current = null;
            audio.currentTime = Math.max(0, entry.start_time / 1000);
            const p = audio.play();
            if (p) {
              p.then(() => {
                if (requestId !== loadRequestIdRef.current) return;
                setIsPlaying(true);
                setIsLoading(false);
              }).catch(() => {
                if (requestId !== loadRequestIdRef.current) return;
                setIsPlaying(false);
                setIsLoading(false);
                setAudioError('تعذّر تشغيل الصوت. تأكد من الاتصال بالإنترنت.');
              });
            }
            return;
          }
        }

        setIsLoading(true);
        if (!isAudioUnlockedRef.current) {
          isAudioUnlockedRef.current = true;
          isUnlockingRef.current = true;
          try {
            audio.src = SILENT_WAV_DATA_URI;
            void audio.play().catch(() => {
              isUnlockingRef.current = false;
            });
          } catch {
            isUnlockingRef.current = false;
          }
        } else {
          isUnlockingRef.current = false;
          if (activeSurahUrlRef.current !== surahUrl) {
            audio.pause();
          }
        }

        const fallbackToVerse = () => {
          if (requestId !== loadRequestIdRef.current) return;
          const fallbackUrl = reciter.buildAudioUrl(verseNumber);
          if (!fallbackUrl) {
            setIsPlaying(false);
            setIsLoading(false);
            setAudioError(
              'تعذّر تشغيل الصوت. حمّل صوت الشيخ للاستماع بدون إنترنت أو تأكد من الاتصال.'
            );
            return;
          }
          pendingSeekSecRef.current = null;
          activeSurahUrlRef.current = null;
          isUnlockingRef.current = false;
          audio.src = fallbackUrl;
          const fbPromise = audio.play();
          if (fbPromise) {
            fbPromise
              .then(() => {
                if (requestId !== loadRequestIdRef.current) return;
                setIsPlaying(true);
                setIsLoading(false);
                setAudioError(null);
              })
              .catch(() => {
                if (requestId !== loadRequestIdRef.current) return;
                setIsPlaying(false);
                setIsLoading(false);
                setAudioError(
                  'تعذّر تشغيل الصوت. حمّل صوت الشيخ للاستماع بدون إنترنت أو تأكد من الاتصال.'
                );
              });
          }
        };

        const beginTimedSurah = async () => {
          const [timingsMap, cache] = await Promise.all([
            loadTimingsForReciter(reciter),
            getCache(),
          ]);
          if (requestId !== loadRequestIdRef.current) return;

          const entry = timingsMap?.get(verseNumber);
          if (!entry) {
            fallbackToVerse();
            return;
          }
          const startSec = Math.max(0, entry.start_time / 1000);

          if (activeSurahUrlRef.current === surahUrl && audio.src && !isUnlockingRef.current) {
            if (audio.readyState >= 1) {
              pendingSeekSecRef.current = null;
              audio.currentTime = startSec;
            } else {
              pendingSeekSecRef.current = startSec;
            }
          } else {
            let resolvedSrc = surahUrl;
            let usedObjectUrl = false;
            if (cache) {
              try {
                const cachedResp = await cache.match(surahUrl);
                if (requestId !== loadRequestIdRef.current) return;
                if (cachedResp) {
                  const blob = await cachedResp.blob();
                  if (requestId !== loadRequestIdRef.current) return;
                  revokeActiveObjectUrl();
                  const objUrl = URL.createObjectURL(blob);
                  activeObjectUrlRef.current = objUrl;
                  resolvedSrc = objUrl;
                  usedObjectUrl = true;
                }
              } catch {
                revokeActiveObjectUrl();
              }
            }
            if (!usedObjectUrl) {
              revokeActiveObjectUrl();
            }
            if (requestId !== loadRequestIdRef.current) return;

            activeSurahUrlRef.current = surahUrl;
            isUnlockingRef.current = false;
            pendingSeekSecRef.current = startSec;
            audio.src = resolvedSrc;
          }

          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                if (requestId !== loadRequestIdRef.current) return;
                if (pendingSeekSecRef.current !== null && audio.readyState >= 1) {
                  audio.currentTime = pendingSeekSecRef.current;
                  pendingSeekSecRef.current = null;
                }
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(() => {
                fallbackToVerse();
              });
          }
        };

        void beginTimedSurah();
        return;
      }

      // Per-verse MP3 reciters (Maher, Sudais, Ajamy, Akhdar)
      const remoteUrl = reciter.buildAudioUrl(verseNumber);
      const requestId = ++loadRequestIdRef.current;
      pendingSeekSecRef.current = null;
      activeSurahUrlRef.current = null;

      activeVerseRef.current = verseNumber;
      loopCountRef.current = loopIteration;
      setPlayingVerse(verseNumber);
      setCurrentLoop(loopIteration);
      setAudioError(null);

      // Fast synchronous path: if next verse is already preloaded in memory as a Blob URL, play instantly (0ms gap!)
      const preloadedObjUrl = preloadedMapRef.current.get(remoteUrl);
      if (preloadedObjUrl) {
        preloadedMapRef.current.delete(remoteUrl);
        revokeActiveObjectUrl();
        activeObjectUrlRef.current = preloadedObjUrl;

        isAudioUnlockedRef.current = true;
        isUnlockingRef.current = false;
        audio.src = preloadedObjUrl;
        const playPromise = audio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              if (requestId !== loadRequestIdRef.current) return;
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              if (requestId !== loadRequestIdRef.current) return;
              setIsPlaying(false);
              setIsLoading(false);
              setAudioError(
                'تعذّر تشغيل الصوت. حمّل صوت الشيخ للاستماع بدون إنترنت أو تأكد من الاتصال.'
              );
            });
        }
        preloadUpcomingVerses(verseNumber, currentReciterId);
        return;
      }

      setIsLoading(true);

      // Synchronously bless this HTMLAudioElement within the tap gesture for iPhone/iPad Safari before async cache awaits
      if (!isAudioUnlockedRef.current) {
        isAudioUnlockedRef.current = true;
        isUnlockingRef.current = true;
        try {
          audio.src = SILENT_WAV_DATA_URI;
          void audio.play().catch(() => {
            isUnlockingRef.current = false;
          });
        } catch {
          isUnlockingRef.current = false;
        }
      } else {
        isUnlockingRef.current = false;
        audio.pause();
      }

      const beginPlayback = async () => {
        let resolvedSrc = remoteUrl;
        let usedObjectUrl = false;

        const inFlight = preloadInFlightRef.current.get(remoteUrl);
        if (inFlight) {
          const readyObjUrl = await inFlight;
          if (requestId !== loadRequestIdRef.current) return;
          if (readyObjUrl) {
            preloadedMapRef.current.delete(remoteUrl);
            revokeActiveObjectUrl();
            activeObjectUrlRef.current = readyObjUrl;
            resolvedSrc = readyObjUrl;
            usedObjectUrl = true;
          }
        } else {
          const cache = await getCache();
          if (requestId !== loadRequestIdRef.current) return;
          if (cache) {
            try {
              const cachedResp = await cache.match(remoteUrl);
              if (requestId !== loadRequestIdRef.current) return;
              if (cachedResp) {
                const blob = await cachedResp.blob();
                if (requestId !== loadRequestIdRef.current) return;
                revokeActiveObjectUrl();
                const objUrl = URL.createObjectURL(blob);
                activeObjectUrlRef.current = objUrl;
                resolvedSrc = objUrl;
                usedObjectUrl = true;
              }
            } catch {
              revokeActiveObjectUrl();
            }
          }
        }

        if (!usedObjectUrl) {
          revokeActiveObjectUrl();
        }

        if (requestId !== loadRequestIdRef.current) return;

        isUnlockingRef.current = false;
        audio.src = resolvedSrc;

        const playPromise = audio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              if (requestId !== loadRequestIdRef.current) return;
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              if (requestId !== loadRequestIdRef.current) return;
              setIsPlaying(false);
              setIsLoading(false);
              setAudioError(
                'تعذّر تشغيل الصوت. حمّل صوت الشيخ للاستماع بدون إنترنت أو تأكد من الاتصال.'
              );
            });
        }

        preloadUpcomingVerses(verseNumber, currentReciterId);
      };

      void beginPlayback();
    },
    [
      armYtAutoplayWatchdog,
      clearYtTimers,
      getCache,
      getReciter,
      loadTimingsForReciter,
      preloadUpcomingVerses,
      revokeActiveObjectUrl,
      ytContainerRef,
    ]
  );

  // Wire audio element events once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      audioRef.current.setAttribute('playsinline', '');
      audioRef.current.setAttribute('webkit-playsinline', '');
    }
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (isUnlockingRef.current) return;
      if (Number.isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
      if (pendingSeekSecRef.current !== null) {
        audio.currentTime = pendingSeekSecRef.current;
        setAudioCurrentTime(audio.currentTime);
        pendingSeekSecRef.current = null;
      }
    };

    const handleDurationChange = () => {
      if (isUnlockingRef.current) return;
      if (Number.isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (isUnlockingRef.current || pendingSeekSecRef.current !== null) return;
      setAudioCurrentTime(audio.currentTime);

      const reciter = getReciter(reciterIdRef.current);
      if (reciter.audioMode !== 'timed-surah' || !activeSurahUrlRef.current) return;

      const currentVerse = activeVerseRef.current;
      if (!currentVerse) return;
      const timingsMap = timingsCacheRef.current.get(reciter.id);
      const timing = timingsMap?.get(currentVerse);
      if (!timing) return;

      const currentMs = audio.currentTime * 1000;
      if (currentMs < timing.end_time - 50) return;

      const mode = repeatModeRef.current;
      const loop = loopCountRef.current;
      const startSec = Math.max(0, timing.start_time / 1000);

      if (mode === 'once') {
        audio.pause();
        setIsPlaying(false);
        setCurrentLoop(1);
        loopCountRef.current = 1;
        return;
      }

      if (mode === 'repeat-2') {
        if (loop < 2) {
          const nextLoop = loop + 1;
          loopCountRef.current = nextLoop;
          setCurrentLoop(nextLoop);
          audio.currentTime = startSec;
        } else {
          audio.pause();
          setIsPlaying(false);
          setCurrentLoop(1);
          loopCountRef.current = 1;
        }
        return;
      }

      if (mode === 'repeat-3') {
        if (loop < 3) {
          const nextLoop = loop + 1;
          loopCountRef.current = nextLoop;
          setCurrentLoop(nextLoop);
          audio.currentTime = startSec;
        } else {
          audio.pause();
          setIsPlaying(false);
          setCurrentLoop(1);
          loopCountRef.current = 1;
        }
        return;
      }

      if (mode === 'repeat-infinite') {
        const nextLoop = loop + 1;
        loopCountRef.current = nextLoop;
        setCurrentLoop(nextLoop);
        audio.currentTime = startSec;
        return;
      }

      if (mode === 'continuous') {
        if (currentVerse < 286) {
          const nextVerse = currentVerse + 1;
          activeVerseRef.current = nextVerse;
          loopCountRef.current = 1;
          setPlayingVerse(nextVerse);
          setCurrentLoop(1);
          onVerseChangeRef.current?.(nextVerse);
        } else {
          audio.pause();
          setIsPlaying(false);
          setCurrentLoop(1);
          loopCountRef.current = 1;
        }
      }
    };

    const handlePlaying = () => {
      if (isUnlockingRef.current) return;
      setIsPlaying(true);
      setIsLoading(false);
      setAudioError(null);
    };

    const handleWaiting = () => {
      if (isUnlockingRef.current) return;
      setIsLoading(true);
    };

    const handlePause = () => {
      if (isUnlockingRef.current) return;
      if (!audio.paused || audio.ended) return;
      setIsPlaying(false);
    };

    const handleError = () => {
      if (isUnlockingRef.current) return;
      const reciter = getReciter(reciterIdRef.current);
      const currentVerse = activeVerseRef.current;
      if (
        reciter.audioMode === 'timed-surah' &&
        activeSurahUrlRef.current &&
        currentVerse
      ) {
        const fallbackUrl = reciter.buildAudioUrl(currentVerse);
        if (fallbackUrl && audio.src !== fallbackUrl) {
          activeSurahUrlRef.current = null;
          pendingSeekSecRef.current = null;
          audio.src = fallbackUrl;
          void audio.play().catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
            setAudioError(
              'تعذّر تشغيل التلاوة. حمّل صوت الشيخ بدون إنترنت أو تحقق من الشبكة.'
            );
          });
          return;
        }
      }
      setIsPlaying(false);
      setIsLoading(false);
      setAudioError('تعذّر تشغيل التلاوة. حمّل صوت الشيخ بدون إنترنت أو تحقق من الشبكة.');
    };

    const replayCurrentImmediately = (nextLoop: number, currentVerse: number) => {
      loopCountRef.current = nextLoop;
      setCurrentLoop(nextLoop);
      audio.currentTime = 0;
      const p = audio.play();
      if (p) {
        p.catch(() => {
          startVerse(currentVerse, nextLoop);
        });
      }
    };

    const handleEnded = () => {
      if (isUnlockingRef.current) return;
      const currentVerse = activeVerseRef.current;
      const reciter = getReciter(reciterIdRef.current);
      const playingPerVerseFallback =
        reciter.audioMode === 'timed-surah' && !activeSurahUrlRef.current;

      if (reciter.audioMode !== 'verse' && !playingPerVerseFallback) {
        setIsPlaying(false);
        setCurrentLoop(1);
        loopCountRef.current = 1;
        return;
      }

      if (!currentVerse) {
        setIsPlaying(false);
        return;
      }

      const mode = repeatModeRef.current;
      const loop = loopCountRef.current;

      if (mode === 'once') {
        setIsPlaying(false);
        setCurrentLoop(1);
        loopCountRef.current = 1;
        return;
      }

      if (mode === 'repeat-2') {
        if (loop < 2) {
          replayCurrentImmediately(loop + 1, currentVerse);
        } else {
          setIsPlaying(false);
          setCurrentLoop(1);
          loopCountRef.current = 1;
        }
        return;
      }

      if (mode === 'repeat-3') {
        if (loop < 3) {
          replayCurrentImmediately(loop + 1, currentVerse);
        } else {
          setIsPlaying(false);
          setCurrentLoop(1);
          loopCountRef.current = 1;
        }
        return;
      }

      if (mode === 'repeat-infinite') {
        replayCurrentImmediately(loop + 1, currentVerse);
        return;
      }

      if (mode === 'continuous') {
        if (currentVerse < 286) {
          const nextVerse = currentVerse + 1;
          onVerseChangeRef.current?.(nextVerse);
          startVerse(nextVerse, 1);
        } else {
          setIsPlaying(false);
          setCurrentLoop(1);
          loopCountRef.current = 1;
        }
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      revokeActiveObjectUrl();
      clearPreloadedMap();
    };
  }, [clearPreloadedMap, getReciter, revokeActiveObjectUrl, startVerse]);

  // Poll current time & duration while YouTube player is active
  useEffect(() => {
    const reciter = getReciter(reciterId);
    if (reciter.audioMode !== 'youtube' || !isPlaying) {
      if (ytPollIntervalRef.current !== null) {
        window.clearInterval(ytPollIntervalRef.current);
        ytPollIntervalRef.current = null;
      }
      return;
    }

    ytPollIntervalRef.current = window.setInterval(() => {
      const player = ytPlayerRef.current;
      if (!player) return;
      try {
        const cur = player.getCurrentTime?.() ?? 0;
        const dur = player.getDuration?.() ?? 0;
        if (Number.isFinite(cur)) setAudioCurrentTime(cur);
        if (Number.isFinite(dur) && dur > 0) setAudioDuration(dur);
      } catch {
        // Ignore polling errors cleanly
      }
    }, 400);

    return () => {
      if (ytPollIntervalRef.current !== null) {
        window.clearInterval(ytPollIntervalRef.current);
        ytPollIntervalRef.current = null;
      }
    };
  }, [getReciter, isPlaying, reciterId]);

  // Cleanup YouTube player on hook unmount
  useEffect(() => {
    return () => {
      clearYtTimers();
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
        ytPlayerRef.current = null;
      }
    };
  }, [clearYtTimers]);

  // If user switches reciter while a verse is active, pause stale engine & switch smoothly
  const prevReciterRef = useRef<ReciterId>(reciterId);
  useEffect(() => {
    if (prevReciterRef.current !== reciterId) {
      prevReciterRef.current = reciterId;
      clearPreloadedMap();
      clearYtTimers();
      activeSurahUrlRef.current = null;
      loadedReciterIdRef.current = null;
      setYtNeedsDirectTap(false);
      setAudioError(null);
      setAudioCurrentTime(0);
      setAudioDuration(0);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore pause errors
        }
      }
      if (isPlaying && activeVerseRef.current !== null) {
        startVerse(activeVerseRef.current, 1);
      }
    }
  }, [reciterId, isPlaying, startVerse, clearPreloadedMap, clearYtTimers]);

  const seekAudio = useCallback(
    (seconds: number) => {
      const reciter = getReciter(reciterIdRef.current);
      if (reciter.audioMode === 'youtube' && ytPlayerRef.current) {
        const dur = ytPlayerRef.current.getDuration?.() ?? audioDuration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const clamped = Math.max(0, Math.min(dur, seconds));
        try {
          ytPlayerRef.current.seekTo(clamped, true);
          setAudioCurrentTime(clamped);
        } catch {
          // Ignore seek errors
        }
        return;
      }

      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      const clamped = Math.max(0, Math.min(audio.duration, seconds));
      audio.currentTime = clamped;
      setAudioCurrentTime(clamped);
    },
    [audioDuration, getReciter]
  );

  const togglePlayVerse = useCallback(
    (verseNumber: number) => {
      const audio = audioRef.current;
      const reciter = getReciter(reciterIdRef.current);

      if (reciter.audioMode === 'youtube' && reciter.youtubeVideoId) {
        const player = ytPlayerRef.current;
        if (player && ytActiveVideoIdRef.current === reciter.youtubeVideoId) {
          if (isPlaying) {
            try {
              player.pauseVideo();
            } catch {
              // Ignore pause errors
            }
            setIsPlaying(false);
            return;
          }
          setIsLoading(true);
          try {
            player.playVideo();
            armYtAutoplayWatchdog();
          } catch {
            startVerse(verseNumber, 1);
          }
          return;
        }
        startVerse(verseNumber, 1);
        return;
      }

      if (reciter.audioMode === 'surah' && activeSurahUrlRef.current === reciter.surahAudioUrl && audio && audio.src) {
        if (isPlaying) {
          audio.pause();
          return;
        }
        if (audio.ended || (audio.duration && audio.currentTime >= audio.duration)) {
          audio.currentTime = 0;
        }
        setIsLoading(true);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => startVerse(verseNumber, 1));
        return;
      }

      if (
        loadedReciterIdRef.current === reciter.id &&
        activeVerseRef.current === verseNumber &&
        audio &&
        audio.src
      ) {
        if (isPlaying) {
          audio.pause();
          return;
        }
        if (reciter.audioMode === 'verse' && (audio.ended || (audio.duration && audio.currentTime >= audio.duration))) {
          startVerse(verseNumber, 1);
          return;
        }
        setIsLoading(true);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => startVerse(verseNumber, 1));
        return;
      }
      startVerse(verseNumber, 1);
    },
    [armYtAutoplayWatchdog, getReciter, isPlaying, startVerse]
  );

  return {
    playingVerse,
    isPlaying,
    isLoading,
    currentLoop,
    audioError,
    audioCurrentTime,
    audioDuration,
    ytNeedsDirectTap,
    seekAudio,
    startVerse,
    togglePlayVerse,
    stopAudio,
  };
}
