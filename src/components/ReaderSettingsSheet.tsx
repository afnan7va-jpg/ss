import React, {useState} from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Download,
  Moon,
  RotateCcw,
  Sun,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {
  BAQARAH_PAGES,
  PAGE_THEMES,
  parseArabicOrLatinNumber,
  toArabicIndic,
} from '../data/baqarah';
import {ThemeMode, VerseBookmark} from '../hooks/useReadingPreferences';
import {SegmentedControl} from './ui/SegmentedControl';
import {Slider} from './ui/Slider';
import {ToggleSwitch} from './ui/ToggleSwitch';

interface ReaderSettingsSheetProps {
  isOpen: boolean;
  currentPage: number;
  theme: ThemeMode;
  fontScale: number;
  tajweedEnabled: boolean;
  bookmarkedVerse: VerseBookmark | null;
  isInstalled: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
  onJumpToVerse: (verseNumber: number) => void;
  onGoToDua: () => void;
  onResumeBookmark: () => void;
  onChangeFontScale: (scale: number) => void;
  onResetFont: () => void;
  onToggleTajweed: () => void;
  onSetTheme: (mode: ThemeMode) => void;
  onInstallClick: () => void;
}

const MIN_SCALE = 0.7;
const MAX_SCALE = 1.6;

export const ReaderSettingsSheet: React.FC<ReaderSettingsSheetProps> = ({
  isOpen,
  currentPage,
  theme,
  fontScale,
  tajweedEnabled,
  bookmarkedVerse,
  isInstalled,
  onClose,
  onSelectPage,
  onJumpToVerse,
  onGoToDua,
  onResumeBookmark,
  onChangeFontScale,
  onResetFont,
  onToggleTajweed,
  onSetTheme,
  onInstallClick,
}) => {
  const [verseInput, setVerseInput] = useState('');
  const [verseError, setVerseError] = useState<string | null>(null);

  const palette = (PAGE_THEMES[currentPage] ?? PAGE_THEMES[1])[theme];
  const zoomPercent = Math.round(fontScale * 100);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseArabicOrLatinNumber(verseInput);
    if (parsed === null || parsed < 1 || parsed > 286) {
      setVerseError('أدخل رقم آية بين ١ و ٢٨٦');
      return;
    }
    setVerseError(null);
    setVerseInput('');
    onJumpToVerse(parsed);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.14}}
          className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end bg-black/22 backdrop-blur-[4px] sm:p-5 sm:pt-16"
          role="dialog"
          aria-modal="true"
          aria-label="إعدادات القراءة والفهرس"
          onClick={onClose}
        >
          <motion.div
            initial={{opacity: 0, y: 18, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 14, scale: 0.98}}
            transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
            className="ios-sheet-surface relative w-full sm:w-[408px] max-h-[86vh] rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col"
            style={{color: palette.barText}}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile iOS Sheet Grabber */}
            <div
              className="relative z-10 pt-2.5 pb-1 flex justify-center sm:hidden shrink-0"
              aria-hidden="true"
            >
              <span
                className="w-10 h-1 rounded-full opacity-25"
                style={{backgroundColor: palette.barText}}
              />
            </div>

            {/* Sheet Header */}
            <div
              className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b shrink-0"
              style={{borderColor: 'var(--apple-divider)'}}
            >
              <h2 className="font-editorial text-base font-bold m-0">
                المظهر والصفحات
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                style={{color: palette.barText}}
                className="ios-liquid-pill w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={2.1} />
              </button>
            </div>

            {/* Scrollable Apple Inset Grouped Glass List */}
            <div className="relative z-10 overflow-y-auto apple-inner-scroll px-4 py-4 space-y-3.5">
              {/* Section 1: Theme & Font Size */}
              <div className="ios-liquid-tile rounded-[20px] overflow-hidden">
                <div
                  className="p-3.5 border-b"
                  style={{borderColor: 'var(--apple-divider)'}}
                >
                  <SegmentedControl<ThemeMode>
                    ariaLabel="المظهر"
                    value={theme}
                    onChange={onSetTheme}
                    activeTextColor={theme === 'dark' ? '#FFFFFF' : '#141416'}
                    inactiveTextColor={palette.barMutedText}
                    options={[
                      {
                        id: 'light',
                        label: 'نهاري',
                        icon: <Sun className="w-3.5 h-3.5" strokeWidth={2} />,
                      },
                      {
                        id: 'dark',
                        label: 'ليلي',
                        icon: <Moon className="w-3.5 h-3.5" strokeWidth={2} />,
                      },
                    ]}
                  />
                </div>

                {/* Font Size Row */}
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-editorial text-[13px] font-bold">
                      حجم الخط
                    </span>
                    <button
                      type="button"
                      onClick={onResetFont}
                      title="إعادة حجم الخط إلى الافتراضي (١٠٠٪)"
                      style={{color: palette.selectionText}}
                      className="inline-flex items-center gap-1 min-h-[32px] px-2 rounded-lg text-xs font-editorial font-bold tabular-nums cursor-pointer hover:opacity-80"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{toArabicIndic(zoomPercent)}٪</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeFontScale(Math.max(MIN_SCALE, fontScale - 0.08))
                      }
                      aria-label="تصغير الخط"
                      style={{
                        backgroundColor: 'var(--apple-track-bg)',
                        color: palette.barText,
                      }}
                      className="w-11 h-11 rounded-[12px] text-sm font-editorial font-bold active:scale-95 transition-transform cursor-pointer shrink-0"
                    >
                      أ-
                    </button>

                    <Slider
                      value={fontScale}
                      min={MIN_SCALE}
                      max={MAX_SCALE}
                      step={0.02}
                      onChange={onChangeFontScale}
                      ariaLabel="شريط حجم الخط"
                      accentPrimary={palette.accentPrimary}
                      accentSecondary={palette.accentSecondary}
                      thumbSize="md"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onChangeFontScale(Math.min(MAX_SCALE, fontScale + 0.08))
                      }
                      aria-label="تكبير الخط"
                      style={{
                        backgroundColor: 'var(--apple-track-bg)',
                        color: palette.barText,
                      }}
                      className="w-11 h-11 rounded-[12px] text-base font-editorial font-bold active:scale-95 transition-transform cursor-pointer shrink-0"
                    >
                      أ+
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Tajweed Toggle */}
              <div className="ios-liquid-tile rounded-[20px] overflow-hidden">
                <ToggleSwitch
                  checked={tajweedEnabled}
                  onToggle={onToggleTajweed}
                  title="ألوان أحكام التجويد"
                  subtitle="تمييز المدود والغنة والإخفاء والقلقلة"
                  accentColor={palette.accentPrimary}
                  theme={theme}
                  titleColor={palette.barText}
                  subtitleColor={palette.barMutedText}
                />
              </div>

              {/* Section 3: 9-Page Index & Quick Verse Jump */}
              <div className="ios-liquid-tile rounded-[20px] overflow-hidden p-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-editorial text-[13px] font-bold">
                    صفحات السورة
                  </span>
                  <span
                    className="font-editorial text-[11.5px]"
                    style={{color: palette.barMutedText}}
                  >
                    اضغط للانتقال
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {BAQARAH_PAGES.map((p) => {
                    const pTheme = PAGE_THEMES[p.page][theme];
                    const isCurrent = p.page === currentPage;
                    const startV = p.verses[0]?.number ?? 1;
                    const endV = p.verses[p.verses.length - 1]?.number ?? 1;

                    const tileFill =
                      theme === 'dark'
                        ? `rgba(255, 255, 255, ${isCurrent ? '0.12' : '0.05'})`
                        : `rgba(255, 255, 255, ${isCurrent ? '0.88' : '0.56'})`;

                    return (
                      <button
                        key={p.page}
                        type="button"
                        onClick={() => {
                          onSelectPage(p.page);
                          onClose();
                        }}
                        style={{
                          background: tileFill,
                          boxShadow: isCurrent
                            ? `0 0 0 1.5px ${pTheme.accentPrimary}`
                            : undefined,
                        }}
                        className="relative rounded-[14px] p-2.5 text-start border border-black/[0.05] dark:border-white/[0.08] active:scale-[0.96] transition-all cursor-pointer overflow-hidden"
                      >
                        <div
                          className="h-1.5 w-full rounded-full mb-2 opacity-90"
                          style={{
                            background: `linear-gradient(to left, ${pTheme.accentPrimary}, ${pTheme.accentSecondary})`,
                          }}
                        />
                        <div
                          className="font-editorial text-xs font-bold tabular-nums"
                          style={{color: palette.barText}}
                        >
                          صفحة {toArabicIndic(p.page)}
                        </div>
                        <div
                          className="font-editorial text-[10.5px] tabular-nums mt-0.5"
                          style={{color: palette.barMutedText}}
                        >
                          {toArabicIndic(startV)}–{toArabicIndic(endV)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Jump to Specific Verse (1-286) */}
                <form
                  onSubmit={handleJumpSubmit}
                  className="mt-3 pt-3 border-t"
                  style={{borderColor: 'var(--apple-divider)'}}
                >
                  <label
                    htmlFor="verse-jump-input"
                    className="block font-editorial text-[11.5px] font-bold mb-1.5"
                    style={{color: palette.barMutedText}}
                  >
                    الانتقال المباشر إلى آية (١ – ٢٨٦)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="verse-jump-input"
                      type="text"
                      inputMode="numeric"
                      value={verseInput}
                      onChange={(e) => {
                        setVerseInput(e.target.value);
                        if (verseError) setVerseError(null);
                      }}
                      placeholder="مثال: ٢٥٥"
                      className="flex-1 min-w-0 min-h-[44px] px-3 rounded-[12px] text-xs font-editorial font-bold border border-black/[0.07] dark:border-white/[0.10] bg-white/75 dark:bg-white/[0.06] placeholder:opacity-50"
                      style={{color: palette.barText}}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: palette.accentPrimary,
                        color: palette.accentOnFill,
                      }}
                      className="min-h-[44px] px-3.5 rounded-[12px] inline-flex items-center justify-center gap-1 text-xs font-editorial font-bold active:scale-[0.97] transition-transform cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>انتقال</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {verseError && (
                    <p
                      role="alert"
                      className="font-editorial text-[11px] font-bold mt-1.5 m-0"
                      style={{color: 'var(--color-danger)'}}
                    >
                      {verseError}
                    </p>
                  )}
                </form>

                <div
                  className="mt-3 pt-3 border-t flex items-center gap-2"
                  style={{borderColor: 'var(--apple-divider)'}}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onGoToDua();
                      onClose();
                    }}
                    style={{color: palette.barText}}
                    className="ios-liquid-pill flex-1 min-h-[44px] rounded-[12px] px-3 inline-flex items-center justify-center gap-2 text-xs font-editorial font-bold active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>دعاء الختمة</span>
                  </button>

                  {bookmarkedVerse && (
                    <button
                      type="button"
                      onClick={() => {
                        onResumeBookmark();
                        onClose();
                      }}
                      style={{
                        backgroundColor: palette.accentPrimary,
                        color: palette.accentOnFill,
                      }}
                      className="flex-1 min-h-[44px] rounded-[12px] px-3 inline-flex items-center justify-center gap-1.5 text-xs font-editorial font-bold active:scale-[0.98] transition-transform cursor-pointer tabular-nums"
                    >
                      <Bookmark className="w-3.5 h-3.5" fill="currentColor" />
                      <span>آية {toArabicIndic(bookmarkedVerse.verse)}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Section 4: Install PWA Row */}
              {!isInstalled && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInstallClick();
                  }}
                  style={{color: palette.selectionText}}
                  className="ios-liquid-tile w-full min-h-[48px] rounded-[18px] px-4 flex items-center justify-between font-editorial text-[13px] font-bold active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <span>تثبيت التطبيق على الشاشة الرئيسية</span>
                  <Download className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
