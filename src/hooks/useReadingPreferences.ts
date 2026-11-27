import {useCallback, useEffect, useState} from 'react';
import {getPageForVerse, RECITERS, ReciterId, RepeatMode} from '../data/baqarah';

export type ThemeMode = 'light' | 'dark';

export interface VerseBookmark {
  page: number;
  verse: number;
}

interface ReadingPreferencesState {
  currentPage: number;
  visitedPages: number[];
  theme: ThemeMode;
  fontScale: number;
  tajweedEnabled: boolean;
  reciterId: ReciterId;
  repeatMode: RepeatMode;
  bookmarkedVerse: VerseBookmark | null;
}

const STORAGE_KEY = 'baqarah_floral_reading_state_v3';
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.6;

const DEFAULT_STATE: ReadingPreferencesState = {
  currentPage: 1,
  visitedPages: [1],
  theme: 'light',
  fontScale: 1,
  tajweedEnabled: true,
  reciterId: 'sudais',
  repeatMode: 'once',
  bookmarkedVerse: null,
};

function loadInitialState(): ReadingPreferencesState {
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem('baqarah_floral_reading_state_v2');
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ReadingPreferencesState>;
    const currentPage =
      typeof parsed.currentPage === 'number' && parsed.currentPage >= 1 && parsed.currentPage <= 9
        ? Math.round(parsed.currentPage)
        : 1;
    const visitedSet = new Set<number>(
      Array.isArray(parsed.visitedPages)
        ? parsed.visitedPages.filter((p) => typeof p === 'number' && p >= 1 && p <= 9)
        : [1]
    );
    visitedSet.add(currentPage);
    const theme: ThemeMode = parsed.theme === 'dark' ? 'dark' : 'light';
    const fontScale =
      typeof parsed.fontScale === 'number' &&
      parsed.fontScale >= MIN_SCALE &&
      parsed.fontScale <= MAX_SCALE
        ? Number(parsed.fontScale.toFixed(2))
        : 1;
    const tajweedEnabled =
      typeof parsed.tajweedEnabled === 'boolean' ? parsed.tajweedEnabled : true;
    const reciterId: ReciterId = RECITERS.some((r) => r.id === parsed.reciterId)
      ? (parsed.reciterId as ReciterId)
      : 'maher';
    const repeatMode: RepeatMode =
      parsed.repeatMode === 'repeat-2' ||
      parsed.repeatMode === 'repeat-3' ||
      parsed.repeatMode === 'repeat-infinite' ||
      parsed.repeatMode === 'continuous'
        ? parsed.repeatMode
        : 'once';

    let bookmarkedVerse: VerseBookmark | null = null;
    if (
      parsed.bookmarkedVerse &&
      typeof parsed.bookmarkedVerse.verse === 'number' &&
      parsed.bookmarkedVerse.verse >= 1 &&
      parsed.bookmarkedVerse.verse <= 286
    ) {
      const v = Math.round(parsed.bookmarkedVerse.verse);
      bookmarkedVerse = {
        verse: v,
        page: getPageForVerse(v),
      };
    }

    return {
      currentPage,
      visitedPages: Array.from(visitedSet).sort((a, b) => a - b),
      theme,
      fontScale,
      tajweedEnabled,
      reciterId,
      repeatMode,
      bookmarkedVerse,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useReadingPreferences() {
  const [state, setState] = useState<ReadingPreferencesState>(loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', state.theme === 'dark' ? '#000000' : '#F2F2F7');
    }
  }, [state.theme]);

  const setCurrentPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(9, page));
    setState((prev) => {
      const hasVisited = prev.visitedPages.includes(clamped);
      if (prev.currentPage === clamped && hasVisited) {
        return prev;
      }
      const nextVisited = hasVisited
        ? prev.visitedPages
        : [...prev.visitedPages, clamped].sort((a, b) => a - b);
      return {
        ...prev,
        currentPage: clamped,
        visitedPages: nextVisited,
      };
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const toggleTajweed = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tajweedEnabled: !prev.tajweedEnabled,
    }));
  }, []);

  const setFontScale = useCallback((nextScale: number) => {
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
    setState((prev) => ({
      ...prev,
      fontScale: Number(clamped.toFixed(2)),
    }));
  }, []);

  const resetFont = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fontScale: 1,
    }));
  }, []);

  const setReciterId = useCallback((reciterId: ReciterId) => {
    setState((prev) => ({
      ...prev,
      reciterId,
    }));
  }, []);

  const setRepeatMode = useCallback((repeatMode: RepeatMode) => {
    setState((prev) => ({
      ...prev,
      repeatMode,
    }));
  }, []);

  const setBookmarkedVerse = useCallback((verseNumber: number | null) => {
    setState((prev) => ({
      ...prev,
      bookmarkedVerse:
        verseNumber === null
          ? null
          : {
              verse: verseNumber,
              page: getPageForVerse(verseNumber),
            },
    }));
  }, []);

  return {
    currentPage: state.currentPage,
    visitedPages: state.visitedPages,
    theme: state.theme,
    fontScale: state.fontScale,
    tajweedEnabled: state.tajweedEnabled,
    reciterId: state.reciterId,
    repeatMode: state.repeatMode,
    bookmarkedVerse: state.bookmarkedVerse,
    setCurrentPage,
    toggleTheme,
    toggleTajweed,
    setFontScale,
    resetFont,
    setReciterId,
    setRepeatMode,
    setBookmarkedVerse,
  };
}
