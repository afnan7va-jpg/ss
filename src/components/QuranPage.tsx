import React, {useMemo} from 'react';
import {
  BaqarahPageData,
  BISMILLAH_TEXT,
  DUA_TEXT,
  DUA_TITLE,
  PAGE_THEMES,
  SURAH_UTHMANI_TITLE,
  toArabicIndic,
} from '../data/baqarah';
import {ThemeMode} from '../hooks/useReadingPreferences';
import {analyzeVerseTajweed, TAJWEED_COLORS} from '../utils/tajweed';
import {AyahRosette, DuaFloralDivider} from './FloralOrnaments';

interface QuranPageProps {
  pageData: BaqarahPageData;
  theme: ThemeMode;
  tajweedEnabled: boolean;
  activeVerse: number | null;
  isInspectorOpen?: boolean;
  playingVerse: number | null;
  bookmarkedVerseNumber: number | null;
  onSelectVerse: (verseNumber: number) => void;
  sectionRef: (el: HTMLElement | null) => void;
}

function withAlpha(color: string, alpha: number): string {
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }
  const hex = color.trim().replace('#', '');
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

export const QuranPage: React.FC<QuranPageProps> = React.memo(
  ({
    pageData,
    theme,
    tajweedEnabled,
    activeVerse,
    isInspectorOpen = false,
    playingVerse,
    bookmarkedVerseNumber,
    onSelectVerse,
    sectionRef,
  }) => {
    const palette = PAGE_THEMES[pageData.page][theme];
    const tajweedColors = TAJWEED_COLORS[theme];
    const isFirstPage = pageData.page === 1;
    const isFinalPage = pageData.page === 9;

    const firstVerse = pageData.verses[0]?.number ?? 1;
    const lastVerse = pageData.verses[pageData.verses.length - 1]?.number ?? 1;

    const renderedVerses = useMemo(() => {
      return pageData.verses.map((verse, idx) => {
        const baseColor = palette.verseColors[idx % palette.verseColors.length];
        return {
          verse,
          idx,
          baseColor,
          segments: analyzeVerseTajweed(verse.text),
        };
      });
    }, [pageData.verses, palette.verseColors]);

    return (
      <section
        ref={sectionRef}
        data-page={pageData.page}
        aria-label={`الصفحة ${toArabicIndic(pageData.page)} من سورة البقرة`}
        style={{
          background: palette.pageBackground,
        }}
        className="ios-page-fullbleed relative overflow-hidden flex flex-col justify-start transition-colors duration-300"
      >
        {/* Full-bleed uploaded gradient artwork + smart light/dark tonal adaptation */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center transition-[filter] duration-300"
          style={{
            backgroundImage: `url("${palette.bgImage}")`,
            filter: palette.bgImageFilter,
            transform: 'scale(1.03)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-colors duration-300"
          style={{background: palette.bgOverlay}}
        />

        {/* Full-bleed dual-color top separator hairline between pages */}
        {!isFirstPage && (
          <div
            className="relative z-10 h-[2px] w-full opacity-80"
            style={{
              background: `linear-gradient(to left, ${palette.accentPrimary}, ${palette.accentSecondary})`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Full-screen edge-to-edge editorial inner container */}
        <div
          className={`relative z-10 w-full px-3 sm:px-5 lg:px-7 pb-12 sm:pb-16 ${
            isFirstPage
              ? 'pt-[calc(4.15rem+env(safe-area-inset-top))] sm:pt-[calc(4.85rem+env(safe-area-inset-top))]'
              : 'pt-6 sm:pt-8'
          }`}
        >
          {/* Minimalist Apple Books Chapter Header */}
          <header
            className="pb-3 mb-7 flex items-center justify-between gap-3 border-b select-none"
            style={{borderColor: 'var(--apple-divider)'}}
          >
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-editorial">
              <span
                className="font-bold tabular-nums"
                style={{color: palette.pageNumberColor}}
              >
                الصفحة {toArabicIndic(pageData.page)}
              </span>
              <span style={{color: palette.barMutedText}} aria-hidden="true">
                ·
              </span>
              <span className="tabular-nums" style={{color: palette.barMutedText}}>
                الآيات {toArabicIndic(firstVerse)} – {toArabicIndic(lastVerse)}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
                {Array.from({length: 9}, (_, dotIdx) => {
                  const pNum = dotIdx + 1;
                  const active = pNum === pageData.page;
                  return (
                    <span
                      key={pNum}
                      className="rounded-full transition-all"
                      style={
                        active
                          ? {
                              width: '14px',
                              height: '5px',
                              background: `linear-gradient(to left, ${palette.accentPrimary}, ${palette.accentSecondary})`,
                            }
                          : {
                              width: '5px',
                              height: '5px',
                              backgroundColor:
                                theme === 'dark'
                                  ? 'rgba(255,255,255,0.24)'
                                  : 'rgba(60,60,67,0.20)',
                            }
                      }
                    />
                  );
                })}
              </div>
              <span
                className="font-editorial text-[11px] sm:text-xs font-bold tabular-nums"
                style={{color: palette.pageNumberColor}}
              >
                {toArabicIndic(pageData.page)} / {toArabicIndic(9)}
              </span>
            </div>
          </header>

          {/* Page 1 Quranic Calligraphy Header: Surah Al-Baqarah & Bismillah */}
          {isFirstPage && (
            <div className="text-center mt-1 mb-8 sm:mb-10 select-none">
              <div
                dir="rtl"
                className="font-uthmani font-normal [text-wrap:balance]"
                style={{
                  color: palette.pageNumberColor,
                  fontSize: 'calc(clamp(28px, 3.2vw, 40px) * var(--font-scale, 1))',
                  lineHeight: 1.5,
                }}
              >
                {SURAH_UTHMANI_TITLE}
              </div>
              <div
                dir="rtl"
                className="font-uthmani font-normal mt-2"
                style={{
                  color: palette.verseColors[0],
                  fontSize: 'calc(clamp(23px, 2.55vw, 33px) * var(--font-scale, 1))',
                  lineHeight: 1.75,
                }}
              >
                {BISMILLAH_TEXT}
              </div>
            </div>
          )}

          {/* Mushaf Verses Body — Full Tajweed */}
          <p
            dir="rtl"
            className="font-uthmani text-justify m-0"
            style={{
              fontSize: 'calc(clamp(22px, 2.35vw, 30px) * var(--font-scale, 1))',
              lineHeight: 2.24,
              textAlignLast: isFinalPage ? 'center' : 'right',
              wordSpacing: '0.02em',
            }}
          >
            {renderedVerses.map(({verse, idx, baseColor, segments}) => {
              const isSelected = activeVerse === verse.number;
              const isPlaying = playingVerse === verse.number;
              const isBookmarked = bookmarkedVerseNumber === verse.number;

              const isSilkActive = isPlaying || isSelected;
              const isHighlighted = isSilkActive || isBookmarked;

              const hlBg = isSilkActive
                ? theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'rgba(255, 255, 255, 0.46)'
                : theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(255, 255, 255, 0.30)';
              const hlBorder = isSilkActive
                ? theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.36)'
                  : 'rgba(255, 255, 255, 0.80)'
                : theme === 'dark'
                  ? withAlpha(palette.accentPrimary, 0.28)
                  : withAlpha(palette.accentSecondary, 0.26);
              const hlShadow = isSilkActive
                ? theme === 'dark'
                  ? 'rgba(0, 0, 0, 0.42)'
                  : 'rgba(0, 0, 0, 0.08)'
                : theme === 'dark'
                  ? 'rgba(0, 0, 0, 0.24)'
                  : 'rgba(0, 0, 0, 0.04)';

              return (
                <React.Fragment key={verse.number}>
                  <span
                    role="button"
                    tabIndex={0}
                    data-verse={verse.number}
                    onClick={() => onSelectVerse(verse.number)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectVerse(verse.number);
                      }
                    }}
                    title={
                      isSelected && !isInspectorOpen
                        ? `الآية ${toArabicIndic(verse.number)} — اضغط لإظهار شريط التلاوة والتفسير`
                        : `الآية ${toArabicIndic(verse.number)} — اضغط للاستماع والتفسير`
                    }
                    className={`verse-interactive cursor-pointer ${
                      isHighlighted ? 'verse-pill-highlight' : ''
                    }`}
                    style={
                      isHighlighted
                        ? ({
                            '--verse-hl-bg': hlBg,
                            '--verse-hl-border': hlBorder,
                            '--verse-hl-shadow': hlShadow,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {tajweedEnabled ? (
                      segments.map((seg, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            color:
                              seg.rule === 'base'
                                ? baseColor
                                : tajweedColors[seg.rule],
                          }}
                        >
                          {seg.text}
                        </span>
                      ))
                    ) : (
                      <span style={{color: baseColor}}>{verse.text}</span>
                    )}
                    <AyahRosette
                      verseNumber={verse.number}
                      palette={palette}
                      theme={theme}
                      alternate={idx % 2 === 1}
                      isPlaying={isSilkActive}
                      isBookmarked={isBookmarked}
                    />
                  </span>{' '}
                </React.Fragment>
              );
            })}
          </p>

          {/* Page 9 Concluding Dua — Serene Apple Editorial Mushaf Closing */}
          {isFinalPage && (
            <div
              id="dua-khatmah"
              className="relative mt-14 sm:mt-16 pt-6 pb-6 text-center w-full max-w-[1040px] mx-auto"
            >
              <DuaFloralDivider palette={palette} />
              <p
                className="font-editorial text-xs font-medium tracking-wide mt-4 mb-1.5"
                style={{color: palette.barMutedText}}
              >
                خاتمة سورة البقرة
              </p>
              <h2
                className="font-ruqaa font-bold tracking-wide mt-0 mb-5 [text-wrap:balance]"
                style={{
                  color: palette.duaHeadingColor,
                  fontSize: 'calc(clamp(28px, 3vw, 38px) * var(--font-scale, 1))',
                  lineHeight: 1.45,
                }}
              >
                {DUA_TITLE}
              </h2>
              <p
                className="font-amiri font-normal w-full max-w-[920px] mx-auto m-0"
                style={{
                  color: palette.duaTextColor,
                  fontSize: 'calc(clamp(20px, 2.15vw, 26px) * var(--font-scale, 1))',
                  lineHeight: 2.18,
                }}
              >
                {DUA_TEXT}
              </p>
              <DuaFloralDivider palette={palette} />
            </div>
          )}
        </div>
      </section>
    );
  }
);

QuranPage.displayName = 'QuranPage';
