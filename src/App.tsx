import {CSSProperties, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {MotionConfig} from 'motion/react';
import {InstallGuideModal} from './components/InstallGuideModal';
import {QuranPage} from './components/QuranPage';
import {ReaderSettingsSheet} from './components/ReaderSettingsSheet';
import {TopControlBar} from './components/TopControlBar';
import {Toast, ToastMessage, ToastTone} from './components/ui/Toast';
import {VerseInspectorBar} from './components/VerseInspectorBar';
import {
  BAQARAH_PAGES,
  getPageForVerse,
  PAGE_THEMES,
  toArabicIndic,
} from './data/baqarah';
import {useOfflineAudio} from './hooks/useOfflineAudio';
import {usePWAInstall} from './hooks/usePWAInstall';
import {useQuranAudio} from './hooks/useQuranAudio';
import {useReadingPreferences} from './hooks/useReadingPreferences';

export default function App() {
  const {
    currentPage,
    theme,
    fontScale,
    tajweedEnabled,
    reciterId,
    repeatMode,
    bookmarkedVerse,
    setCurrentPage,
    toggleTheme,
    toggleTajweed,
    setFontScale,
    resetFont,
    setReciterId,
    setRepeatMode,
    setBookmarkedVerse,
  } = useReadingPreferences();

  const {isInstalled, isInstallGuideOpen, promptInstall, closeInstallGuide} =
    usePWAInstall();

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, tone: ToastTone = 'info') => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({id: Date.now(), text, tone});
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const {
    isSupported: offlineSupported,
    cachedCounts,
    downloadProgress,
    downloadError,
    downloadReciter,
    cancelDownload,
    removeReciterCache,
  } = useOfflineAudio();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef<number>(currentPage);
  const hasRestoredInitialPageRef = useRef<boolean>(false);
  const programmaticScrollUntilRef = useRef<number>(0);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const activePalette = (PAGE_THEMES[currentPage] ?? PAGE_THEMES[1])[theme];
  const rootThemeStyle = useMemo(
    () =>
      ({
        '--color-brand-primary': activePalette.accentPrimary,
        '--color-brand-secondary': activePalette.accentSecondary,
        '--color-brand-accent': activePalette.selectionAccent,
        '--color-brand-on-fill': activePalette.accentOnFill,
      }) as CSSProperties,
    [activePalette]
  );

  const scrollToPage = useCallback(
    (targetPage: number, behavior: ScrollBehavior = 'smooth') => {
      const clamped = Math.max(1, Math.min(9, targetPage));
      const container = scrollContainerRef.current;
      const el = sectionRefs.current[clamped - 1];

      currentPageRef.current = clamped;
      setCurrentPage(clamped);

      if (!container || !el) return;

      const isCompactViewport = window.innerWidth < 640;
      const headerOffset = isCompactViewport ? 56 : 66;
      const topOffset = clamped === 1 ? 0 : Math.max(0, el.offsetTop - headerOffset);
      programmaticScrollUntilRef.current =
        behavior === 'smooth' ? performance.now() + 650 : 0;

      container.scrollTo({
        top: topOffset,
        behavior,
      });
    },
    [setCurrentPage]
  );

  const focusVerseOnScreen = useCallback(
    (verseNumber: number, behavior: ScrollBehavior = 'smooth') => {
      const pageForVerse = getPageForVerse(verseNumber);
      currentPageRef.current = pageForVerse;
      setCurrentPage(pageForVerse);

      const verseEl = document.querySelector<HTMLElement>(
        `[data-verse="${verseNumber}"]`
      );
      if (verseEl) {
        programmaticScrollUntilRef.current =
          behavior === 'smooth' ? performance.now() + 650 : 0;
        verseEl.scrollIntoView({behavior, block: 'center'});
      }
    },
    [setCurrentPage]
  );

  const handleAudioAdvance = useCallback(
    (nextVerse: number) => {
      setSelectedVerse(nextVerse);
      setBookmarkedVerse(nextVerse);
      focusVerseOnScreen(nextVerse, 'smooth');
    },
    [focusVerseOnScreen, setBookmarkedVerse]
  );

  const {
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
  } = useQuranAudio({
    reciterId,
    repeatMode,
    ytContainerRef,
    onVerseChange: handleAudioAdvance,
  });

  const activeInspectorVerse = playingVerse ?? selectedVerse;

  const handleSelectVerse = useCallback(
    (verseNumber: number) => {
      if (!isInspectorExpanded && activeInspectorVerse === verseNumber) {
        setIsInspectorExpanded(true);
        return;
      }
      setSelectedVerse(verseNumber);
      setIsInspectorExpanded(true);
      setBookmarkedVerse(verseNumber);
      startVerse(verseNumber, 1);
    },
    [activeInspectorVerse, isInspectorExpanded, setBookmarkedVerse, startVerse]
  );

  const handleJumpToVerse = useCallback(
    (verseNumber: number) => {
      const clamped = Math.max(1, Math.min(286, verseNumber));
      setSelectedVerse(clamped);
      setIsInspectorExpanded(true);
      setBookmarkedVerse(clamped);
      focusVerseOnScreen(clamped, 'smooth');
      showToast(`تم الانتقال إلى الآية ${toArabicIndic(clamped)}`, 'info');
    },
    [focusVerseOnScreen, setBookmarkedVerse, showToast]
  );

  const handleResumeBookmark = useCallback(() => {
    if (!bookmarkedVerse) return;
    setSelectedVerse(bookmarkedVerse.verse);
    setIsInspectorExpanded(true);
    focusVerseOnScreen(bookmarkedVerse.verse, 'smooth');
  }, [bookmarkedVerse, focusVerseOnScreen]);

  const handleToggleBookmark = useCallback(() => {
    if (activeInspectorVerse === null) return;
    if (bookmarkedVerse?.verse === activeInspectorVerse) {
      setBookmarkedVerse(null);
      showToast('تم إلغاء علامة الوقوف', 'info');
    } else {
      setBookmarkedVerse(activeInspectorVerse);
      showToast(
        `تم حفظ الوقوف عند الآية ${toArabicIndic(activeInspectorVerse)}`,
        'success'
      );
    }
  }, [activeInspectorVerse, bookmarkedVerse, setBookmarkedVerse, showToast]);

  const handleResetFont = useCallback(() => {
    resetFont();
    showToast('تمت إعادة حجم الخط إلى ١٠٠٪', 'info');
  }, [resetFont, showToast]);

  const handleMinimizeInspector = useCallback(() => {
    setIsInspectorExpanded(false);
  }, []);

  const handleExpandInspector = useCallback(() => {
    setIsInspectorExpanded(true);
  }, []);

  const handleCloseInspector = useCallback(() => {
    stopAudio();
    setSelectedVerse(null);
    setIsInspectorExpanded(true);
  }, [stopAudio]);

  const scrollToDua = useCallback(() => {
    currentPageRef.current = 9;
    setCurrentPage(9);
    const duaEl = document.getElementById('dua-khatmah');
    if (duaEl) {
      programmaticScrollUntilRef.current = performance.now() + 650;
      duaEl.scrollIntoView({behavior: 'smooth', block: 'center'});
    } else {
      scrollToPage(9, 'smooth');
    }
  }, [scrollToPage, setCurrentPage]);

  // Restore last saved reading page cleanly on initial mount
  useEffect(() => {
    if (hasRestoredInitialPageRef.current) return;
    hasRestoredInitialPageRef.current = true;
    const initialPage = bookmarkedVerse?.page ?? currentPage;
    if (initialPage > 1) {
      window.requestAnimationFrame(() => {
        scrollToPage(initialPage, 'auto');
      });
    }
  }, [bookmarkedVerse, currentPage, scrollToPage]);

  // Lightweight passive scroll-spy
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const updateActivePage = () => {
      rafId = null;
      if (performance.now() < programmaticScrollUntilRef.current) return;

      const probeY = container.scrollTop + container.clientHeight * 0.35;
      let matchedPage = 1;

      for (let i = 0; i < sectionRefs.current.length; i++) {
        const el = sectionRefs.current[i];
        if (!el) continue;
        if (el.offsetTop <= probeY) {
          matchedPage = i + 1;
        } else {
          break;
        }
      }

      if (matchedPage !== currentPageRef.current) {
        currentPageRef.current = matchedPage;
        setCurrentPage(matchedPage);
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateActivePage);
    };

    container.addEventListener('scroll', handleScroll, {passive: true});
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [setCurrentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInstallGuideOpen) {
        if (event.key === 'Escape') closeInstallGuide();
        return;
      }

      if (isSettingsOpen) {
        if (event.key === 'Escape') setIsSettingsOpen(false);
        return;
      }

      if (event.key === 'Escape' && selectedVerse !== null) {
        if (isInspectorExpanded) {
          handleMinimizeInspector();
        } else {
          handleCloseInspector();
        }
        return;
      }

      if (event.key === 'PageDown') {
        event.preventDefault();
        scrollToPage(currentPageRef.current + 1);
      } else if (event.key === 'PageUp') {
        event.preventDefault();
        scrollToPage(currentPageRef.current - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        scrollToPage(1);
      } else if (event.key === 'End') {
        event.preventDefault();
        scrollToPage(9);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    closeInstallGuide,
    handleCloseInspector,
    handleMinimizeInspector,
    isInspectorExpanded,
    isInstallGuideOpen,
    isSettingsOpen,
    scrollToPage,
    selectedVerse,
  ]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={rootThemeStyle}
        className="relative w-full h-full overflow-hidden select-text bg-[#F2F2F7] dark:bg-black transition-colors duration-300"
      >
        <TopControlBar
          currentPage={currentPage}
          theme={theme}
          tajweedEnabled={tajweedEnabled}
          bookmarkedVerse={bookmarkedVerse}
          isInstalled={isInstalled}
          onSelectPage={(page) => scrollToPage(page)}
          onPrevPage={() => scrollToPage(currentPage - 1)}
          onNextPage={() => scrollToPage(currentPage + 1)}
          onGoToDua={scrollToDua}
          onResumeBookmark={handleResumeBookmark}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onInstallClick={promptInstall}
        />

        <Toast toast={toast} />

        {/* Single native silky-smooth iOS full-bleed scroll stream */}
        <main
          ref={scrollContainerRef}
          className="ios-scroll-container"
          style={{'--font-scale': fontScale} as CSSProperties}
        >
          <div
            className={`w-full ${
              activeInspectorVerse !== null
                ? isInspectorExpanded
                  ? 'pb-80 sm:pb-72'
                  : 'pb-28'
                : 'pb-[env(safe-area-inset-bottom)]'
            }`}
          >
            {BAQARAH_PAGES.map((pageData, index) => {
              const firstV = pageData.verses[0]?.number ?? 1;
              const lastV = pageData.verses[pageData.verses.length - 1]?.number ?? 286;

              const pageActiveVerse =
                activeInspectorVerse !== null &&
                activeInspectorVerse >= firstV &&
                activeInspectorVerse <= lastV
                  ? activeInspectorVerse
                  : null;

              const pagePlayingVerse =
                isPlaying &&
                playingVerse !== null &&
                playingVerse >= firstV &&
                playingVerse <= lastV
                  ? playingVerse
                  : null;

              const pageBookmarkedVerse =
                bookmarkedVerse &&
                bookmarkedVerse.verse >= firstV &&
                bookmarkedVerse.verse <= lastV
                  ? bookmarkedVerse.verse
                  : null;

              return (
                <QuranPage
                  key={pageData.page}
                  pageData={pageData}
                  theme={theme}
                  tajweedEnabled={tajweedEnabled}
                  activeVerse={pageActiveVerse}
                  isInspectorOpen={pageActiveVerse !== null && isInspectorExpanded}
                  playingVerse={pagePlayingVerse}
                  bookmarkedVerseNumber={pageBookmarkedVerse}
                  onSelectVerse={handleSelectVerse}
                  sectionRef={(el) => {
                    sectionRefs.current[index] = el;
                  }}
                />
              );
            })}
          </div>
        </main>

        <ReaderSettingsSheet
          isOpen={isSettingsOpen}
          currentPage={currentPage}
          theme={theme}
          fontScale={fontScale}
          tajweedEnabled={tajweedEnabled}
          bookmarkedVerse={bookmarkedVerse}
          isInstalled={isInstalled}
          onClose={() => setIsSettingsOpen(false)}
          onSelectPage={(page) => scrollToPage(page)}
          onJumpToVerse={handleJumpToVerse}
          onGoToDua={scrollToDua}
          onResumeBookmark={handleResumeBookmark}
          onChangeFontScale={setFontScale}
          onResetFont={handleResetFont}
          onToggleTajweed={toggleTajweed}
          onSetTheme={(mode) => {
            if (mode !== theme) toggleTheme();
          }}
          onInstallClick={promptInstall}
        />

        <VerseInspectorBar
          verseNumber={activeInspectorVerse}
          isExpanded={isInspectorExpanded}
          theme={theme}
          reciterId={reciterId}
          repeatMode={repeatMode}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentLoop={currentLoop}
          audioError={audioError}
          audioCurrentTime={audioCurrentTime}
          audioDuration={audioDuration}
          ytNeedsDirectTap={ytNeedsDirectTap}
          isBookmarked={
            activeInspectorVerse !== null &&
            bookmarkedVerse?.verse === activeInspectorVerse
          }
          offlineSupported={offlineSupported}
          cachedCounts={cachedCounts}
          downloadProgress={downloadProgress}
          downloadError={downloadError}
          onSelectReciter={setReciterId}
          onSelectRepeatMode={setRepeatMode}
          onTogglePlay={() => {
            if (activeInspectorVerse !== null) {
              togglePlayVerse(activeInspectorVerse);
            }
          }}
          onSeekAudio={seekAudio}
          onPrevVerse={() => {
            if (activeInspectorVerse && activeInspectorVerse > 1) {
              const prev = activeInspectorVerse - 1;
              handleSelectVerse(prev);
              focusVerseOnScreen(prev);
            }
          }}
          onNextVerse={() => {
            if (activeInspectorVerse && activeInspectorVerse < 286) {
              const next = activeInspectorVerse + 1;
              handleSelectVerse(next);
              focusVerseOnScreen(next);
            }
          }}
          onToggleBookmark={handleToggleBookmark}
          onCopyVerse={(vNum) =>
            showToast(`تم نسخ الآية ${toArabicIndic(vNum)} والتفسير`, 'success')
          }
          onDownloadReciter={downloadReciter}
          onCancelDownload={cancelDownload}
          onRemoveReciterCache={removeReciterCache}
          onExpand={handleExpandInspector}
          onMinimize={handleMinimizeInspector}
          onClose={handleCloseInspector}
        />

        {/* Persistent non-hidden YouTube IFrame container */}
        <div
          aria-hidden={!ytNeedsDirectTap}
          className={
            ytNeedsDirectTap
              ? 'fixed top-[calc(112px+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 w-[264px] h-[148px] rounded-[22px] overflow-hidden ios-sheet-surface p-1.5 pointer-events-auto shadow-2xl'
              : 'fixed bottom-24 left-4 w-[200px] h-[113px] opacity-[0.001] pointer-events-none z-0 overflow-hidden'
          }
        >
          <div
            ref={ytContainerRef}
            className="w-full h-full rounded-[16px] overflow-hidden bg-black"
          />
        </div>

        <InstallGuideModal isOpen={isInstallGuideOpen} onClose={closeInstallGuide} />
      </div>
    </MotionConfig>
  );
}
