import React from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Moon,
  Sun,
} from 'lucide-react';
import {PAGE_THEMES, SURAH_TITLE, toArabicIndic} from '../data/baqarah';
import {ThemeMode, VerseBookmark} from '../hooks/useReadingPreferences';
import {AppLogo} from './ui/AppLogo';
import {GlassButton} from './ui/GlassButton';

interface TopControlBarProps {
  currentPage: number;
  theme: ThemeMode;
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
  const pagePalette = (PAGE_THEMES[currentPage] ?? PAGE_THEMES[1])[theme];
  const bookmarkPalette = bookmarkedVerse
    ? (PAGE_THEMES[bookmarkedVerse.page] ?? PAGE_THEMES[1])[theme]
    : null;

  const progressPct = Math.round((currentPage / 9) * 100);

  return (
    <header
      aria-label="شريط التنقل العلوي"
      className="fixed top-[max(0.25rem,env(safe-area-inset-top))] sm:top-[max(0.45rem,env(safe-area-inset-top))] inset-x-2.5 sm:inset-x-5 z-40 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-[1200px] mx-auto rounded-[22px] sm:rounded-[24px] ios-glass-bar overflow-hidden">
        <div className="h-[44px] sm:h-[52px] px-2.5 sm:px-5 flex items-center justify-between gap-2">
          {/* Zone 1 (RTL Start): Title & Quick Bookmark */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
            <div className="flex items-center gap-2 select-none min-w-0">
              <AppLogo size="sm" />
              <span
                className="font-editorial text-[13.5px] sm:text-[15px] font-bold tracking-tight whitespace-nowrap"
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
                className="inline-flex items-center gap-1 min-h-[34px] sm:h-8 px-2.5 rounded-full text-[11px] sm:text-xs font-editorial font-bold active:scale-95 transition-transform cursor-pointer tabular-nums whitespace-nowrap shrink-0"
              >
                <Bookmark
                  className="w-3 h-3 shrink-0"
                  style={{color: bookmarkPalette.selectionAccent}}
                  fill="currentColor"
                />
                <span className="hidden sm:inline">
                  وقفت عند {toArabicIndic(bookmarkedVerse.verse)}
                </span>
                <span className="sm:hidden">
                  {toArabicIndic(bookmarkedVerse.verse)}
                </span>
              </button>
            )}
          </div>

          {/* Zone 2 (Center): Mobile Page Switcher / Desktop 9-Color Scrubber */}
          <div className="flex items-center justify-center min-w-0">
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label={`الصفحة ${toArabicIndic(currentPage)} من ${toArabicIndic(9)} — فتح فهرس الصفحات`}
              style={{color: pagePalette.barText}}
              className="md:hidden ios-liquid-pill h-9 px-3 rounded-full inline-flex items-center gap-1.5 text-[11.5px] font-editorial font-bold tabular-nums active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
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

            {/* Desktop / iPad (md+): 9-Color Page Scrubber */}
            <div className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                title="الصفحة السابقة"
                aria-label="الصفحة السابقة"
                style={{color: pagePalette.barMutedText}}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>

              <div
                className="ios-liquid-pill flex items-center gap-0.5 px-2 h-9 rounded-full"
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
                      className="h-8 px-1 flex items-center justify-center cursor-pointer group"
                    >
                      <span
                        style={{backgroundColor: dotColor}}
                        className={`h-2.5 rounded-full transition-[width,opacity,transform] duration-200 ease-out ${
                          isActive
                            ? 'w-6 opacity-100'
                            : 'w-2.5 opacity-45 group-hover:opacity-90 group-hover:scale-110'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span
                className="font-editorial text-xs font-bold w-10 text-center tabular-nums select-none whitespace-nowrap"
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
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
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
                className="h-9 px-3 rounded-full text-xs font-editorial font-bold hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                دعاء الختمة
              </button>
            </div>
          </div>

          {/* Zone 3 (RTL End): Theme Toggle, Apple Books 'أع' Appearance, Desktop Install */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isInstalled && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={onInstallClick}
                accentBg={pagePalette.accentPrimary}
                accentColor={pagePalette.accentOnFill}
                className="hidden lg:inline-flex"
              >
                <Download className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span>تثبيت</span>
              </GlassButton>
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
              className="ios-liquid-pill w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
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
              title="إعدادات الخط والتجويد والصفحات"
              aria-label="إعدادات الخط والتجويد والصفحات"
              style={{
                backgroundColor: pagePalette.accentPrimary,
                color: pagePalette.accentOnFill,
              }}
              className="h-9 px-3 sm:px-3.5 rounded-full inline-flex items-center justify-center font-editorial text-xs sm:text-[13px] font-bold active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
            >
              أع
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
    </header>
  );
};
