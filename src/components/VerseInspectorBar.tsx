import React, {useState} from 'react';
import {
  AlertCircle,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloudDownload,
  Copy,
  Loader2,
  Pause,
  Play,
  Repeat,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {
  BAQARAH_PAGES,
  getPageForVerse,
  PAGE_THEMES,
  RECITERS,
  ReciterId,
  RepeatMode,
  TAFSIR_BY_VERSE,
  toArabicIndic,
} from '../data/baqarah';
import {
  CachedCountMap,
  DownloadProgress,
  getReciterOfflineTotal,
  TOTAL_VERSES,
} from '../hooks/useOfflineAudio';
import {ThemeMode} from '../hooks/useReadingPreferences';
import {SegmentedControl} from './ui/SegmentedControl';
import {Slider} from './ui/Slider';

interface VerseInspectorBarProps {
  verseNumber: number | null;
  isExpanded: boolean;
  theme: ThemeMode;
  reciterId: ReciterId;
  repeatMode: RepeatMode;
  isPlaying: boolean;
  isLoading: boolean;
  currentLoop: number;
  audioError: string | null;
  audioCurrentTime: number;
  audioDuration: number;
  ytNeedsDirectTap?: boolean;
  isBookmarked: boolean;
  offlineSupported: boolean;
  cachedCounts: CachedCountMap;
  downloadProgress: DownloadProgress | null;
  downloadError: string | null;
  onSelectReciter: (id: ReciterId) => void;
  onSelectRepeatMode: (mode: RepeatMode) => void;
  onTogglePlay: () => void;
  onSeekAudio: (seconds: number) => void;
  onPrevVerse: () => void;
  onNextVerse: () => void;
  onToggleBookmark: () => void;
  onCopyVerse?: (verseNumber: number) => void;
  onDownloadReciter: (id: ReciterId) => void;
  onCancelDownload: () => void;
  onRemoveReciterCache: (id: ReciterId) => void;
  onExpand: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

const REPEAT_OPTIONS: Array<{id: RepeatMode; label: string; title: string}> = [
  {id: 'once', label: 'مرة', title: 'استماع مرة واحدة'},
  {id: 'repeat-2', label: '٢×', title: 'تكرار الآية مرتين'},
  {id: 'repeat-3', label: '٣×', title: 'تكرار الآية ثلاث مرات'},
  {id: 'repeat-infinite', label: 'تكرار', title: 'تكرار مستمر لنفس الآية'},
  {id: 'continuous', label: 'متابعة', title: 'متابعة التلاوة للآية التالية تلقائيًا'},
];

function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '٠:٠٠';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad2 = (n: number) => toArabicIndic(n).padStart(2, '٠');
  if (hrs > 0) {
    return `${toArabicIndic(hrs)}:${pad2(mins)}:${pad2(secs)}`;
  }
  return `${toArabicIndic(mins)}:${pad2(secs)}`;
}

function getVerseText(verseNumber: number): string {
  for (const page of BAQARAH_PAGES) {
    const found = page.verses.find((v) => v.number === verseNumber);
    if (found) return found.text;
  }
  return '';
}

export const VerseInspectorBar: React.FC<VerseInspectorBarProps> = ({
  verseNumber,
  isExpanded,
  theme,
  reciterId,
  repeatMode,
  isPlaying,
  isLoading,
  currentLoop,
  audioError,
  audioCurrentTime,
  audioDuration,
  ytNeedsDirectTap = false,
  isBookmarked,
  offlineSupported,
  cachedCounts,
  downloadProgress,
  downloadError,
  onSelectReciter,
  onSelectRepeatMode,
  onTogglePlay,
  onSeekAudio,
  onPrevVerse,
  onNextVerse,
  onToggleBookmark,
  onCopyVerse,
  onDownloadReciter,
  onCancelDownload,
  onRemoveReciterCache,
  onExpand,
  onMinimize,
  onClose,
}) => {
  const [copiedJustNow, setCopiedJustNow] = useState(false);

  if (verseNumber === null) {
    return null;
  }

  const pagePalette = PAGE_THEMES[getPageForVerse(verseNumber)][theme];
  const activeReciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
  const isYoutubeReciter = activeReciter.audioMode === 'youtube';
  const isSurahMode = activeReciter.audioMode === 'surah' || isYoutubeReciter;

  const handleCopy = async () => {
    const verseText = getVerseText(verseNumber);
    const tafsirText = TAFSIR_BY_VERSE[String(verseNumber)] ?? '';
    const payload = `﴿${verseText}﴾ [البقرة: ${toArabicIndic(verseNumber)}]\n\nالتفسير الميسّر:\n${tafsirText}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setCopiedJustNow(true);
        window.setTimeout(() => setCopiedJustNow(false), 1800);
        onCopyVerse?.(verseNumber);
      }
    } catch {
      // Ignore clipboard permission errors cleanly
    }
  };

  const tafsir = TAFSIR_BY_VERSE[String(verseNumber)] ?? '';
  const repeatMax =
    repeatMode === 'repeat-2' ? 2 : repeatMode === 'repeat-3' ? 3 : null;
  const activeCachedCount = cachedCounts[reciterId] ?? 0;
  const reciterTotal = getReciterOfflineTotal(reciterId);
  const isReciterOfflineReady =
    !isYoutubeReciter && reciterTotal > 0 && activeCachedCount >= reciterTotal;
  const isDownloadingThisReciter = downloadProgress?.reciterId === reciterId;
  const isDownloadingAny = downloadProgress !== null;

  const downloadPct =
    downloadProgress && downloadProgress.total > 0
      ? Math.round((downloadProgress.completed / downloadProgress.total) * 100)
      : 0;

  return (
    <AnimatePresence initial={false}>
      {!isExpanded ? (
        <motion.div
          key="mini-player"
          initial={{opacity: 0, y: 14, scale: 0.97}}
          animate={{opacity: 1, y: 0, scale: 1}}
          exit={{opacity: 0, y: 10, scale: 0.97}}
          transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
          className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-3 sm:inset-x-6 z-40 pointer-events-none flex justify-center"
        >
          <div
            role="region"
            aria-label={`مشغل الآية ${toArabicIndic(verseNumber)}`}
            style={{color: pagePalette.barText}}
            className="pointer-events-auto ios-sheet-surface relative overflow-hidden w-full max-w-[460px] h-14 px-2.5 rounded-full flex items-center justify-between gap-2"
          >
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الآية'}
              style={{
                backgroundColor: pagePalette.accentPrimary,
                color: pagePalette.accentOnFill,
              }}
              className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4 -ms-0.5" fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={onExpand}
              className="relative z-10 flex-1 min-w-0 h-full flex items-center justify-between gap-2 px-1 text-start cursor-pointer"
            >
              <div className="min-w-0">
                <div className="font-editorial text-[13px] font-bold truncate tabular-nums">
                  الآية {toArabicIndic(verseNumber)}
                </div>
                <div
                  className="font-editorial text-[11px] truncate"
                  style={{color: pagePalette.barMutedText}}
                >
                  {activeReciter.shortName} · اضغط لعرض التفسير
                </div>
              </div>
              <ChevronUp
                className="w-4 h-4 shrink-0"
                style={{color: pagePalette.barMutedText}}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق المشغل"
              style={{color: pagePalette.barText}}
              className="relative z-10 ios-liquid-pill w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="expanded-inspector"
          initial={{opacity: 0, y: 18, scale: 0.98}}
          animate={{opacity: 1, y: 0, scale: 1}}
          exit={{opacity: 0, y: 14, scale: 0.98}}
          transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
          className="fixed bottom-0 sm:bottom-5 inset-x-0 sm:inset-x-5 z-40 pointer-events-none flex justify-center"
        >
          <section
            aria-label={`التلاوة والتفسير للآية ${toArabicIndic(verseNumber)}`}
            style={{color: pagePalette.barText}}
            className="pointer-events-auto ios-sheet-surface relative w-full max-w-[820px] max-h-[80vh] sm:max-h-[76vh] flex flex-col rounded-t-[28px] sm:rounded-[28px] pb-[env(safe-area-inset-bottom)] overflow-hidden"
          >
            {/* iOS Sheet Grabber Handle */}
            <button
              type="button"
              onClick={onMinimize}
              aria-label="تصغير إلى المشغل المصغر"
              className="relative z-10 pt-2.5 pb-1 flex justify-center shrink-0 cursor-pointer"
            >
              <span
                className="w-10 h-1 rounded-full opacity-25"
                style={{backgroundColor: pagePalette.barText}}
              />
            </button>

            {/* Transport Header Row */}
            <div
              className="relative z-10 flex items-center justify-between gap-2 px-4 py-2 sm:px-6 sm:py-2.5 border-b shrink-0"
              style={{borderColor: 'var(--apple-divider)'}}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <button
                  type="button"
                  onClick={onPrevVerse}
                  disabled={verseNumber <= 1}
                  title="الآية السابقة"
                  aria-label="الآية السابقة"
                  style={{color: pagePalette.barText}}
                  className="ios-liquid-pill w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={onTogglePlay}
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                  style={{
                    backgroundColor: pagePalette.accentPrimary,
                    color: pagePalette.accentOnFill,
                  }}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4.5 h-4.5" fill="currentColor" />
                  ) : (
                    <Play className="w-4.5 h-4.5 -ms-0.5" fill="currentColor" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNextVerse}
                  disabled={verseNumber >= 286}
                  title="الآية التالية"
                  aria-label="الآية التالية"
                  style={{color: pagePalette.barText}}
                  className="ios-liquid-pill w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                </button>

                <div className="flex items-center gap-1.5 px-1.5 select-none min-w-0">
                  <Volume2
                    className="w-3.5 h-3.5 shrink-0 hidden sm:block"
                    style={{color: pagePalette.selectionAccent}}
                  />
                  <span className="font-editorial text-[14px] sm:text-[15px] font-bold tabular-nums whitespace-nowrap">
                    الآية {toArabicIndic(verseNumber)}
                  </span>
                  {!isSurahMode && isPlaying && repeatMax && (
                    <span
                      className="text-[11px] font-editorial font-bold tabular-nums whitespace-nowrap"
                      style={{color: pagePalette.selectionText}}
                    >
                      ({toArabicIndic(currentLoop)}/{toArabicIndic(repeatMax)})
                    </span>
                  )}
                  {!isSurahMode && isPlaying && repeatMode === 'repeat-infinite' && (
                    <span
                      className="text-[11px] font-editorial font-bold tabular-nums whitespace-nowrap"
                      style={{color: pagePalette.selectionText}}
                    >
                      · {toArabicIndic(currentLoop)}×
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onToggleBookmark}
                  title={
                    isBookmarked
                      ? 'محفوظة كموضع توقف — اضغط لإلغاء الحفظ'
                      : 'حفظ هذه الآية كموضع للرجوع والمتابعة'
                  }
                  aria-pressed={isBookmarked}
                  style={
                    isBookmarked
                      ? {
                          backgroundColor: pagePalette.selectionBg,
                          color: pagePalette.selectionText,
                        }
                      : {color: pagePalette.barText}
                  }
                  className="ios-liquid-pill h-11 sm:h-10 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-editorial font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Bookmark
                    className="w-3.5 h-3.5 shrink-0"
                    fill={isBookmarked ? 'currentColor' : 'none'}
                    strokeWidth={1.9}
                  />
                  <span className="hidden sm:inline">
                    {isBookmarked ? 'موضع الوقوف' : 'حفظ الوقوف'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onMinimize}
                  title="تصغير إلى المشغل المصغر"
                  aria-label="تصغير الشريط"
                  style={{color: pagePalette.barText}}
                  className="ios-liquid-pill w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  title="إغلاق وإيقاف التلاوة"
                  aria-label="إغلاق وإيقاف التلاوة"
                  style={{color: pagePalette.barMutedText}}
                  className="ios-liquid-pill w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Row 1: Reciter Picker — Responsive Grid */}
            <div
              className="relative z-10 px-4 py-2.5 sm:px-6 border-b shrink-0"
              style={{borderColor: 'var(--apple-divider)'}}
            >
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-[18px]"
                style={{backgroundColor: 'var(--apple-track-bg)'}}
                role="radiogroup"
                aria-label="اختيار القارئ"
              >
                {RECITERS.map((reciter) => {
                  const active = reciter.id === reciterId;
                  const reciterTotalItem = getReciterOfflineTotal(reciter.id);
                  const reciterCached =
                    reciter.audioMode !== 'youtube' &&
                    reciterTotalItem > 0 &&
                    (cachedCounts[reciter.id] ?? 0) >= reciterTotalItem;
                  return (
                    <button
                      key={reciter.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onSelectReciter(reciter.id)}
                      title={`${reciter.name} (${reciter.qualityLabel})${
                        reciterCached ? ' — متاح بدون إنترنت' : ''
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: reciter.chipColor,
                              color: reciter.chipOnFill,
                            }
                          : {
                              backgroundColor:
                                theme === 'dark'
                                  ? 'rgba(255, 255, 255, 0.06)'
                                  : 'rgba(255, 255, 255, 0.72)',
                              color: pagePalette.barText,
                            }
                      }
                      className={`inline-flex items-center justify-center gap-1.5 min-h-[38px] px-2.5 rounded-[12px] text-[12px] font-editorial font-bold transition-all cursor-pointer whitespace-nowrap active:scale-[0.97] ${
                        active
                          ? 'shadow-sm'
                          : 'border border-black/[0.05] dark:border-white/[0.08] hover:opacity-90'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: active
                            ? reciter.chipOnFill
                            : reciter.chipColor,
                        }}
                      />
                      <span className="truncate">{reciter.shortName}</span>
                      {reciterCached && (
                        <CheckCircle2
                          className="w-3 h-3 shrink-0"
                          style={{
                            color: active
                              ? reciter.chipOnFill
                              : 'var(--color-success)',
                          }}
                          strokeWidth={2.2}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Repeat Modes OR Audio Scrubber */}
            <div
              className="relative z-10 px-4 py-2 sm:px-6 border-b shrink-0"
              style={{borderColor: 'var(--apple-divider)'}}
            >
              {isSurahMode ? (
                <div className="w-full flex items-center gap-3">
                  <span
                    className="font-editorial text-[11px] font-bold whitespace-nowrap"
                    style={{color: pagePalette.selectionText}}
                  >
                    {activeReciter.qualityLabel}
                  </span>

                  <Slider
                    value={audioCurrentTime}
                    min={0}
                    max={audioDuration > 0 ? audioDuration : 100}
                    step={1}
                    disabled={audioDuration <= 0}
                    onChange={onSeekAudio}
                    ariaLabel="موضع التلاوة في السورة"
                    accentPrimary={pagePalette.accentPrimary}
                    accentSecondary={pagePalette.accentSecondary}
                    thumbSize="sm"
                  />

                  <span
                    className="font-editorial text-[11px] font-bold tabular-nums whitespace-nowrap"
                    style={{color: pagePalette.barMutedText}}
                  >
                    {formatPlaybackTime(audioCurrentTime)} /{' '}
                    {formatPlaybackTime(audioDuration)}
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-editorial font-medium whitespace-nowrap shrink-0"
                      style={{color: pagePalette.barMutedText}}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>التكرار</span>
                    </div>

                    <SegmentedControl<RepeatMode>
                      ariaLabel="نمط التكرار والاستماع"
                      value={repeatMode}
                      onChange={onSelectRepeatMode}
                      activeTextColor={pagePalette.barText}
                      inactiveTextColor={pagePalette.barMutedText}
                      className="w-full sm:w-auto sm:min-w-[300px]"
                      options={REPEAT_OPTIONS}
                    />
                  </div>

                  <span
                    className="hidden md:inline font-editorial text-[11px] font-medium whitespace-nowrap"
                    style={{color: pagePalette.barMutedText}}
                  >
                    <bdi>{activeReciter.qualityLabel}</bdi>
                  </span>
                </div>
              )}
            </div>

            {/* Utility Row: Tafsir Attribution, Copy Verse & Offline Audio Cache */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 shrink-0 text-xs font-editorial">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 select-none">
                  <span
                    className="font-bold"
                    style={{color: pagePalette.selectionText}}
                  >
                    التفسير الميسّر
                  </span>
                  <span style={{color: pagePalette.barMutedText}} aria-hidden="true">
                    ·
                  </span>
                  <span
                    className="text-[11px]"
                    style={{color: pagePalette.barMutedText}}
                  >
                    مجمع الملك فهد
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  title="نسخ الآية والتفسير"
                  aria-label="نسخ الآية والتفسير"
                  style={{color: pagePalette.barMutedText}}
                  className="inline-flex items-center gap-1 min-h-[30px] px-2 rounded-lg text-[11px] font-bold hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedJustNow ? (
                    <>
                      <Check
                        className="w-3 h-3"
                        style={{color: 'var(--color-success)'}}
                      />
                      <span style={{color: 'var(--color-success)'}}>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>

              {isYoutubeReciter ? (
                <span
                  className="text-[11px] font-medium whitespace-nowrap"
                  style={{color: pagePalette.barMutedText}}
                >
                  بث صوتي مباشر
                </span>
              ) : offlineSupported ? (
                <div className="flex items-center gap-2">
                  {isDownloadingThisReciter && downloadProgress ? (
                    <div className="flex items-center gap-2">
                      <Loader2
                        className="w-3.5 h-3.5 animate-spin shrink-0"
                        style={{color: pagePalette.selectionAccent}}
                      />
                      <span
                        className="font-bold text-[11px] tabular-nums whitespace-nowrap"
                        style={{color: pagePalette.barText}}
                      >
                        {downloadProgress.total > 1
                          ? `${toArabicIndic(downloadPct)}٪`
                          : 'جاري الحفظ...'}
                      </span>
                      {downloadProgress.total > 1 && (
                        <div
                          className="w-20 h-1.5 rounded-full overflow-hidden shrink-0"
                          style={{backgroundColor: 'var(--apple-track-bg)'}}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-200"
                            style={{
                              width: `${downloadPct}%`,
                              backgroundColor: pagePalette.accentPrimary,
                            }}
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={onCancelDownload}
                        style={{
                          backgroundColor: 'var(--apple-track-bg)',
                          color: pagePalette.barText,
                        }}
                        className="min-h-[32px] px-2.5 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap"
                      >
                        إيقاف
                      </button>
                    </div>
                  ) : isReciterOfflineReady ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold whitespace-nowrap"
                        style={{color: 'var(--color-success)'}}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>محفوظ بدون إنترنت</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveReciterCache(reciterId)}
                        title="حذف الصوتيات المحفوظة لهذا القارئ"
                        style={{color: pagePalette.barMutedText}}
                        className="inline-flex items-center gap-1 min-h-[32px] px-2 rounded-lg text-[11px] font-bold hover:bg-black/[0.05] dark:hover:bg-white/10 cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3 shrink-0" />
                        <span>حذف</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isDownloadingAny}
                      onClick={() => onDownloadReciter(reciterId)}
                      className="ios-liquid-pill inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 disabled:opacity-45 cursor-pointer whitespace-nowrap"
                      style={{
                        color: pagePalette.selectionText,
                      }}
                    >
                      <CloudDownload
                        className="w-3.5 h-3.5 shrink-0"
                        strokeWidth={1.9}
                      />
                      <span>
                        {activeCachedCount > 0 && reciterTotal > 1
                          ? `استكمال (${toArabicIndic(activeCachedCount)}/${toArabicIndic(TOTAL_VERSES)})`
                          : `تحميل ${activeReciter.shortName} أوفلاين`}
                      </span>
                    </button>
                  )}

                  {downloadError && (
                    <span
                      role="alert"
                      className="inline-flex items-center gap-1 text-[11px] font-editorial font-bold"
                      style={{color: 'var(--color-danger)'}}
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{downloadError}</span>
                    </span>
                  )}
                </div>
              ) : null}
            </div>

            {/* Safari iOS direct tap prompt when autoplay is blocked on YouTube stream */}
            {isYoutubeReciter && ytNeedsDirectTap && (
              <p
                className="relative z-10 text-xs font-editorial font-bold px-4 sm:px-6 pb-1 m-0"
                style={{color: pagePalette.selectionText}}
              >
                اضغط على زر التشغيل في نافذة التلاوة أعلى الشاشة لبدء الصوت على جهازك.
              </p>
            )}

            {/* Audio Error Notice */}
            {audioError && (
              <div
                role="alert"
                className="relative z-10 mx-4 sm:mx-6 mb-2 px-3 py-2 rounded-[12px] flex items-center gap-2 text-xs font-editorial font-bold"
                style={{
                  backgroundColor: 'var(--color-danger-tint)',
                  color: 'var(--color-danger)',
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}

            {/* Tafsir Body */}
            <div className="relative z-10 px-4 pb-4 pt-1 sm:px-6 sm:pb-5 min-h-0 flex-1 flex flex-col">
              <div className="ios-liquid-tile rounded-[18px] px-4 py-3 sm:px-5 sm:py-3.5 overflow-y-auto apple-inner-scroll min-h-[84px] max-h-40 sm:max-h-44">
                {tafsir ? (
                  <p
                    className="font-editorial text-[14.5px] sm:text-[15.5px] leading-[1.85] sm:leading-[1.9] m-0 text-start"
                    style={{color: pagePalette.barText}}
                  >
                    {tafsir}
                  </p>
                ) : (
                  <p
                    className="font-editorial text-xs m-0 text-center py-4"
                    style={{color: pagePalette.barMutedText}}
                  >
                    لا يتوفر تفسير مسجّل لهذه الآية حاليًا.
                  </p>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
