import React, {useEffect, useRef, useState} from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {PAGE_THEMES, SURAH_TITLE, toArabicIndic} from '../data/baqarah';
import {ThemeMode, VerseBookmark} from '../hooks/useReadingPreferences';
import {
  TAJWEED_COLORS,
  TAJWEED_LEGEND,
  TajweedCategory,
} from '../utils/tajweed';
import {AppLogo} from './ui/AppLogo';
import {GlassButton} from './ui/GlassButton';

interface TopControlBarProps {
  currentPage: number;
  theme: ThemeMode;
  tajweedEnabled: boolean;
  bookmarkedVerse: VerseBookmark | null;
  isInstalled: boolean;
  onSelectPage: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToDua: () => void;
  onResumeBookmark: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onInstallClick: () => void;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  currentPage,
  theme,
  tajweedEnabled,
  bookmarkedVerse,
  isInstalled,
  onSelectPage,
  onPrevPage,
  onNextPage,
  onGoToDua,
  onResumeBookmark,
  onToggleTheme,
  onOpenSettings,
  onInstallClick,
}) => {
  const [selectedRule, setSelectedRule] = useState<
    Exclude<TajweedCategory, 'base'> | null
  >(null);
  const [isTajweedMenuOpen, setIsTajweedMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const pagePalette = (PAGE_THEMES[currentPage] ?? PAGE_THEMES[1])[theme];
  const bookmarkPalette = bookmarkedVerse
    ? (PAGE_THEMES[bookmarkedVerse.page] ?? PAGE_THEMES[1])[theme]
    : null;
  const tajweedColors = TAJWEED_COLORS[theme];

  const activeItem = selectedRule
    ? TAJWEED_LEGEND.find((item) => item.rule === selectedRule) ?? null
    : null;

  const progressPct = Math.round((currentPage / 9) * 100);

  // Close Tajweed popover cleanly when clicking outside or pressing Escape
  useEffect(() => {
    if (!selectedRule && !isTajweedMenuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setSelectedRule(null);
        setIsTajweedMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRule(null);
        setIsTajweedMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isTajweedMenuOpen, selectedRule]);

  useEffect(() => {
    if (!tajweedEnabled) {
      setSelectedRule(null);
      setIsTajweedMenuOpen(false);
    }
  }, [tajweedEnabled]);

  return (
    <header
      ref={headerRef}
      aria-label="شريط التنقل العلوي"
      className="fixed top-[max(0.3rem,env(safe-area-inset-top))] sm:top-[max(0.45rem,env(safe-area-inset-top))] inset-x-2 sm:inset-x-4 z-40 pointer-events-none"
    >
      {/* Single unified Liquid Glass bar */}
      <div className="pointer-events-auto w-full rounded-[22px] sm:rounded-[24px] ios-glass-bar overflow-hidden">
        <div className="h-[46px] sm:h-[52px] px-2 sm:px-3.5 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Zone 1 (RTL Start): App Icon, Surah Title & Compact Bookmark */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 select-none min-w-0">
              <AppLogo size="sm" />
              <span
                className="font-editorial text-[13px] sm:text-[14.5px] font-bold tracking-tight whitespace-nowrap"
                style={{color: pagePalette.barText}}
              >
                {SURAH_TITLE}
              </span>
            </div>

            {bookmarkedVerse && bookmarkPalette && (
              <button
                type="button"
                onClick={onResumeBookmark}
                title={`الانتقال إلى موضع الوقوف: الآية ${toArabicIndic(bookmarkedVerse.verse)}`}
                aria-label={`الانتقال إلى موضع الوقوف الآية ${toArabicIndic(bookmarkedVerse.verse)}`}
                style={{
                  backgroundColor: bookmarkPalette.selectionBg,
                  color: bookmarkPalette.selectionText,
                }}
                className="hidden min-[375px]:inline-flex items-center gap-1 h-7 sm:h-8 px-2 sm:px-2.5 rounded-full text-[11px] sm:text-xs font-editorial font-bold active:scale-95 transition-transform cursor-pointer tabular-nums whitespace-nowrap shrink-0"
              >
                <Bookmark
                  className="w-3 h-3 shrink-0"
                  style={{color: bookmarkPalette.selectionAccent}}
                  fill="currentColor"
                />
                <span>{toArabicIndic(bookmarkedVerse.verse)}</span>
              </button>
            )}
          </div>

          {/* Zone 2 (Center): Unified Page Controls + Integrated Tajweed Legend */}
          <div className="flex items-center justify-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            {/* Mobile (< md): Compact Page Pill */}
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label={`الصفحة ${toArabicIndic(currentPage)} من ${toArabicIndic(9)} — فتح فهرس الصفحات`}
              style={{color: pagePalette.barText}}
              className="md:hidden ios-liquid-pill h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 text-[11.5px] font-editorial font-bold tabular-nums active:scale-95 transition-transform cursor-pointer whitespace-nowrap shrink-0"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${pagePalette.accentPrimary}, ${pagePalette.accentSecondary})`,
                }}
              />
              <span>
                {toArabicIndic(currentPage)} / {toArabicIndic(9)}
              </span>
            </button>

            {/* Tablet & Desktop (md+): 9-Color Scrubber + Dua */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                title="الصفحة السابقة"
                aria-label="الصفحة السابقة"
                style={{color: pagePalette.barMutedText}}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>

              <div
                className="ios-liquid-pill flex items-center gap-0.5 px-1.5 h-8 rounded-full shrink-0"
                role="tablist"
                aria-label="الصفحات التسع"
              >
                {Array.from({length: 9}, (_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  const dotColor = (PAGE_THEMES[pageNum] ?? PAGE_THEMES[1])[theme]
                    .accentPrimary;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`الصفحة ${toArabicIndic(pageNum)}`}
                      title={`الصفحة ${toArabicIndic(pageNum)}`}
                      onClick={() => onSelectPage(pageNum)}
                      className="h-7 px-1 flex items-center justify-center cursor-pointer group"
                    >
                      <span
                        style={{backgroundColor: dotColor}}
                        className={`h-2.5 rounded-full transition-[width,opacity,transform] duration-200 ease-out ${
                          isActive
                            ? 'w-5 opacity-100'
                            : 'w-2 opacity-45 group-hover:opacity-90 group-hover:scale-110'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span
                className="font-editorial text-[11.5px] font-bold w-9 text-center tabular-nums select-none whitespace-nowrap shrink-0"
                style={{color: pagePalette.barMutedText}}
                aria-live="polite"
              >
                {toArabicIndic(currentPage)} / {toArabicIndic(9)}
              </span>

              <button
                type="button"
                onClick={onNextPage}
                disabled={currentPage >= 9}
                title="الصفحة التالية"
                aria-label="الصفحة التالية"
                style={{color: pagePalette.barMutedText}}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={onGoToDua}
                style={
                  currentPage === 9
                    ? {
                        backgroundColor: pagePalette.selectionBg,
                        color: pagePalette.selectionText,
                      }
                    : {color: pagePalette.barMutedText}
                }
                className="hidden lg:inline-flex items-center h-8 px-2.5 rounded-full text-[11.5px] font-editorial font-bold hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                دعاء الختمة
              </button>
            </div>

            {/* Integrated Tajweed Section inside the SAME single bar */}
            {tajweedEnabled && (
              <>
                <span
                  aria-hidden="true"
                  className="hidden md:block h-4 w-px shrink-0 opacity-35"
                  style={{backgroundColor: pagePalette.barMutedText}}
                />

                {/* Wide Desktop (1360px+): All 8 Tajweed color rules inline in the same single row */}
                <div
                  aria-label="دليل ألوان أحكام التجويد"
                  className="hidden min-[1360px]:flex items-center gap-0.5 shrink-0"
                >
                  {TAJWEED_LEGEND.map((item) => {
                    const color = tajweedColors[item.rule];
                    const isSelected = selectedRule === item.rule;
                    return (
                      <button
                        key={item.rule}
                        type="button"
                        onClick={() =>
                          setSelectedRule((prev) =>
                            prev === item.rule ? null : item.rule
                          )
                        }
                        title={item.description}
                        aria-pressed={isSelected}
                        style={{color: pagePalette.barText}}
                        className={`inline-flex items-center gap-1 h-7 px-2 rounded-full text-[11px] font-editorial transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                          isSelected
                            ? 'ios-liquid-pill font-bold'
                            : 'font-medium hover:bg-black/[0.05] dark:hover:bg-white/10'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{backgroundColor: color}}
                        />
                        <span>{item.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Compact & Medium Screens (< 1360px): Single sleek Tajweed pill opening inline popover */}
                <button
                  type="button"
                  onClick={() => setIsTajweedMenuOpen((prev) => !prev)}
                  aria-expanded={isTajweedMenuOpen}
                  aria-label="دليل ألوان أحكام التجويد"
                  title="دليل ألوان أحكام التجويد"
                  style={
                    isTajweedMenuOpen
                      ? {
                          backgroundColor: pagePalette.selectionBg,
                          color: pagePalette.selectionText,
                        }
                      : {color: pagePalette.barText}
                  }
                  className="min-[1360px]:hidden ios-liquid-pill h-8 px-2 sm:px-2.5 rounded-full inline-flex items-center gap-1.5 text-[11px] sm:text-[11.5px] font-editorial font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="grid grid-cols-2 gap-[2px] shrink-0" aria-hidden="true">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{backgroundColor: tajweedColors.madd}}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{backgroundColor: tajweedColors.maddTabii}}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{backgroundColor: tajweedColors.ghunnah}}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{backgroundColor: tajweedColors.qalqalah}}
                    />
                  </span>
                  <span className="hidden sm:inline">التجويد</span>
                </button>
              </>
            )}
          </div>

          {/* Zone 3 (RTL End): Install, Theme Toggle, Settings Icon */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {!isInstalled && (
              <div className="hidden lg:inline-flex shrink-0">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={onInstallClick}
                  accentBg={pagePalette.accentPrimary}
                  accentColor={pagePalette.accentOnFill}
                >
                  <Download className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span>تثبيت</span>
                </GlassButton>
              </div>
            )}

            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
              aria-label={
                theme === 'light'
                  ? 'التبديل إلى الوضع الليلي'
                  : 'التبديل إلى الوضع النهاري'
              }
              style={{color: pagePalette.barText}}
              className="ios-liquid-pill w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" strokeWidth={1.9} />
              ) : (
                <Sun className="w-4 h-4" strokeWidth={1.9} />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="الإعدادات والخط والفهرس"
              aria-label="الإعدادات والخط والفهرس"
              style={{
                backgroundColor: pagePalette.accentPrimary,
                color: pagePalette.accentOnFill,
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer shrink-0 shadow-xs"
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Ultra-thin iOS Chromatic Progress Hairline */}
        <div className="h-[2px] w-full bg-black/[0.04] dark:bg-white/10">
          <div
            className="h-full transition-[width] duration-300 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(to left, ${pagePalette.accentPrimary}, ${pagePalette.accentSecondary})`,
            }}
          />
        </div>
      </div>

      {/* On-demand Tajweed Legend Sheetlet (< 1360px when tapped) */}
      <AnimatePresence>
        {tajweedEnabled && isTajweedMenuOpen && (
          <motion.div
            initial={{opacity: 0, y: -6, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -6, scale: 0.98}}
            transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
            className="min-[1360px]:hidden pt-2 flex justify-center"
          >
            <div
              role="dialog"
              aria-label="دليل ألوان أحكام التجويد"
              style={{color: pagePalette.barText}}
              className="pointer-events-auto ios-sheet-surface rounded-[20px] p-3 max-w-[660px] w-full sm:w-auto"
            >
              <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-black/[0.06] dark:border-white/[0.10]">
                <span className="font-editorial text-xs font-bold">
                  دليل ألوان أحكام التجويد
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsTajweedMenuOpen(false);
                    setSelectedRule(null);
                  }}
                  aria-label="إغلاق دليل التجويد"
                  style={{color: pagePalette.barMutedText}}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {TAJWEED_LEGEND.map((item) => {
                  const color = tajweedColors[item.rule];
                  const isSelected = selectedRule === item.rule;
                  return (
                    <button
                      key={item.rule}
                      type="button"
                      onClick={() =>
                        setSelectedRule((prev) =>
                          prev === item.rule ? null : item.rule
                        )
                      }
                      aria-pressed={isSelected}
                      style={
                        isSelected
                          ? {
                              backgroundColor: pagePalette.selectionBg,
                              color: pagePalette.selectionText,
                            }
                          : {color: pagePalette.barText}
                      }
                      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[11.5px] font-editorial transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                        isSelected
                          ? 'font-bold'
                          : 'ios-liquid-pill font-medium'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{backgroundColor: color}}
                      />
                      <span>{item.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {activeItem && (
                <div
                  role="status"
                  className="mt-2.5 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.10] flex items-start gap-2 text-xs font-editorial leading-relaxed text-start"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                    style={{backgroundColor: tajweedColors[activeItem.rule]}}
                  />
                  <div className="min-w-0">
                    <span className="font-bold me-1.5 whitespace-nowrap">
                      {activeItem.label}:
                    </span>
                    <span style={{color: pagePalette.barMutedText}}>
                      {activeItem.description}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Inline Rule Explanation Popover (1360px+ when a Tajweed chip is clicked) */}
      <AnimatePresence>
        {tajweedEnabled && activeItem && !isTajweedMenuOpen && (
          <motion.div
            initial={{opacity: 0, y: -6, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -6, scale: 0.98}}
            transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
            className="hidden min-[1360px]:flex pt-2 justify-center"
          >
            <div
              role="status"
              style={{color: pagePalette.barText}}
              className="pointer-events-auto ios-sheet-surface rounded-[18px] px-4 py-2.5 flex items-center gap-2.5 text-xs font-editorial max-w-[680px]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{backgroundColor: tajweedColors[activeItem.rule]}}
              />
              <div className="flex-1 min-w-0 leading-relaxed text-start">
                <span className="font-bold me-1.5 whitespace-nowrap">
                  {activeItem.label}:
                </span>
                <span style={{color: pagePalette.barMutedText}}>
                  {activeItem.description}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                aria-label="إغلاق الشرح"
                style={{color: pagePalette.barMutedText}}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
