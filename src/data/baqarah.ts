import rawData from './baqarahRaw.json';
import tafsirRaw from './baqarahTafsir.json';

export interface Verse {
  number: number;
  text: string;
}

export interface BaqarahPageData {
  page: number;
  verses: Verse[];
}

export type ReciterId =
  | 'badr'
  | 'maher'
  | 'qarafi'
  | 'dibirov'
  | 'khader'
  | 'sudais'
  | 'ajamy'
  | 'akhdar';

export type ReciterAudioMode = 'verse' | 'timed-surah' | 'surah' | 'youtube';

export interface ReciterInfo {
  id: ReciterId;
  name: string;
  shortName: string;
  qualityLabel: string;
  chipColor: string;
  chipOnFill: string;
  audioMode: ReciterAudioMode;
  buildAudioUrl: (verseNumber: number) => string;
  surahAudioUrl?: string;
  ayatTimingUrl?: string;
  youtubeVideoId?: string;
}

export type RepeatMode =
  | 'once'
  | 'repeat-2'
  | 'repeat-3'
  | 'repeat-infinite'
  | 'continuous';

export interface ThemePalette {
  accentPrimary: string;
  accentSecondary: string;
  accentOnFill: string;
  bgImage: string;
  bgImageFilter: string;
  bgOverlay: string;
  pageBackground: string;
  cardSurface: string;
  cardBorder: string;
  cardTopWash: string;
  ambientGlow: string;
  pageNumberColor: string;
  verseColors: string[];
  medallionFill: string;
  medallionStroke: string;
  medallionText: string;
  medallionAltFill: string;
  medallionAltStroke: string;
  medallionAltText: string;
  selectionBg: string;
  bookmarkBg: string;
  selectionUnderline: string;
  selectionAccent: string;
  selectionText: string;
  selectionGlow: string;
  barSurface: string;
  barSolidSurface: string;
  barBorder: string;
  barText: string;
  barMutedText: string;
  barControlBg: string;
  ornamentPrimary: string;
  ornamentSecondary: string;
  ornamentAccent: string;
  duaHeadingColor: string;
  duaTextColor: string;
  duaDividerColor: string;
}

export interface PageTheme {
  page: number;
  light: ThemePalette;
  dark: ThemePalette;
}

export const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

export function toArabicIndic(value: number): string {
  return String(value)
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0) - 48;
      return code >= 0 && code <= 9 ? ARABIC_DIGITS[code] : ch;
    })
    .join('');
}

export function parseArabicOrLatinNumber(raw: string): number | null {
  const normalized = raw
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  if (!/^\d+$/.test(normalized)) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export const APP_LOGO_URL = '/assets/aistudio/Watercolor_Pink_Plumeria_Blossom_ae6cee42.png';
export const SURAH_TITLE: string = rawData.surahTitle;
export const SURAH_UTHMANI_TITLE = 'سُورَةُ ٱلۡبَقَرَةِ';
export const BISMILLAH_TEXT = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
export const BAQARAH_PAGES: BaqarahPageData[] = rawData.pages as BaqarahPageData[];
export const DUA_TITLE: string = rawData.duaTitle;
export const DUA_TEXT: string = rawData.duaText;
export const TAFSIR_BY_VERSE: Record<string, string> = tafsirRaw as Record<string, string>;

export function getPageForVerse(verseNumber: number): number {
  for (const page of BAQARAH_PAGES) {
    if (page.verses.some((v) => v.number === verseNumber)) {
      return page.page;
    }
  }
  return 1;
}

function padVerse(num: number): string {
  return `002${String(num).padStart(3, '0')}`;
}

export const RECITERS: ReciterInfo[] = [
  {
    id: 'maher',
    name: 'ماهر المعيقلي',
    shortName: 'ماهر المعيقلي',
    qualityLabel: '١٢٨ kbps · بالآية',
    chipColor: '#F54C91',
    chipOnFill: '#240210',
    audioMode: 'verse',
    buildAudioUrl: (verse) =>
      `https://everyayah.com/data/MaherAlMuaiqly128kbps/${padVerse(verse)}.mp3`,
  },
  {
    id: 'badr',
    name: 'بدر التركي',
    shortName: 'بدر التركي',
    qualityLabel: 'صوت نقي · السورة كاملة',
    chipColor: '#7CD5D9',
    chipOnFill: '#08292C',
    audioMode: 'surah',
    surahAudioUrl: 'https://cdn.mp3quran.net/audio/badr-turki/r1/002.mp3',
    buildAudioUrl: () => 'https://cdn.mp3quran.net/audio/badr-turki/r1/002.mp3',
  },
  {
    id: 'qarafi',
    name: 'عبد الله القرافي',
    shortName: 'عبد الله قرافي',
    qualityLabel: 'صوت نقي · السورة كاملة',
    chipColor: '#99ADFF',
    chipOnFill: '#0E1740',
    audioMode: 'surah',
    surahAudioUrl: 'https://cdn.mp3quran.net/audio/abdullah-qarafi/r1/002.mp3',
    buildAudioUrl: () => 'https://cdn.mp3quran.net/audio/abdullah-qarafi/r1/002.mp3',
  },
  {
    id: 'dibirov',
    name: 'محمد ديبيروف',
    shortName: 'محمد ديبيروف',
    qualityLabel: 'جودة فائقة · السورة كاملة',
    chipColor: '#C4E02F',
    chipOnFill: '#1A2400',
    audioMode: 'surah',
    surahAudioUrl: 'https://cdn.mp3quran.net/audio/muhammad-dibirov/r1/002.mp3',
    buildAudioUrl: () => 'https://cdn.mp3quran.net/audio/muhammad-dibirov/r1/002.mp3',
  },
  {
    id: 'khader',
    name: 'أحمد خضر',
    shortName: 'أحمد خضر',
    qualityLabel: 'سورة البقرة · صوت خاشع',
    chipColor: '#FFA547',
    chipOnFill: '#241000',
    audioMode: 'youtube',
    youtubeVideoId: 'JEfm_GwZqsE',
    buildAudioUrl: () => '',
  },
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    shortName: 'السديس',
    qualityLabel: 'جودة عالية · بالآية',
    chipColor: '#B696E3',
    chipOnFill: '#170B2E',
    audioMode: 'timed-surah',
    surahAudioUrl: 'https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/002.mp3',
    ayatTimingUrl: 'https://www.mp3quran.net/api/v3/ayat_timing?surah=2&read=54',
    buildAudioUrl: (verse) =>
      `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${padVerse(verse)}.mp3`,
  },
  {
    id: 'ajamy',
    name: 'أحمد بن علي العجمي',
    shortName: 'أحمد العجمي',
    qualityLabel: '١٢٨ kbps · بالآية',
    chipColor: '#FFA9DD',
    chipOnFill: '#33061D',
    audioMode: 'verse',
    buildAudioUrl: (verse) =>
      `https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net/${padVerse(verse)}.mp3`,
  },
  {
    id: 'akhdar',
    name: 'إبراهيم الأخضر',
    shortName: 'إبراهيم الأخضر',
    qualityLabel: 'صوت نقي · بالآية',
    chipColor: '#FEB700',
    chipOnFill: '#241B00',
    audioMode: 'timed-surah',
    surahAudioUrl: 'https://cdn.mp3quran.net/audio/ibrahim-akhdar/r1/002.mp3',
    ayatTimingUrl: 'https://www.mp3quran.net/api/v3/ayat_timing?surah=2&read=1',
    buildAudioUrl: (verse) =>
      `https://everyayah.com/data/Ibrahim_Akhdar_32kbps/${padVerse(verse)}.mp3`,
  },
];

export const PAGE_THEMES: Record<number, PageTheme> = {
  // 1: Dreamy Pastel Rose & Lavender Glow (Warm welcoming floral opening)
  1: {
    page: 1,
    light: {
      accentPrimary: '#FFA9DD',
      accentSecondary: '#F54C91',
      accentOnFill: '#3B0822',
      bgImage: '/assets/aistudio/Dreamy_Pastel_Rose_and_Lavender_Glow_7bb9dbdd.png',
      bgImageFilter: 'brightness(1.08) saturate(0.86)',
      bgOverlay:
        'linear-gradient(180deg, rgba(255, 250, 253, 0.40) 0%, rgba(255, 248, 252, 0.48) 50%, rgba(255, 250, 254, 0.44) 100%)',
      pageBackground: '#FFF4FA',
      cardSurface: '#FFF5FA',
      cardBorder: 'rgba(245, 76, 145, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 169, 221, 0.48) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(245, 76, 145, 0.24) 0%, transparent 74%)',
      ambientGlow: 'rgba(245, 76, 145, 0.36)',
      pageNumberColor: '#8A0F44',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 232, 246, 0.72)',
      medallionStroke: '#F54C91',
      medallionText: '#850E41',
      medallionAltFill: 'rgba(255, 245, 251, 0.78)',
      medallionAltStroke: '#FFA9DD',
      medallionAltText: '#9E1450',
      selectionBg: 'rgba(255, 169, 221, 0.44)',
      bookmarkBg: 'rgba(255, 169, 221, 0.28)',
      selectionUnderline: 'rgba(245, 76, 145, 0.60)',
      selectionAccent: '#F54C91',
      selectionText: '#850E41',
      selectionGlow: 'rgba(245, 76, 145, 0.38)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#FFA9DD',
      ornamentSecondary: '#FF86CC',
      ornamentAccent: '#F54C91',
      duaHeadingColor: '#850E41',
      duaTextColor: '#141416',
      duaDividerColor: '#F54C91',
    },
    dark: {
      accentPrimary: '#FFA9DD',
      accentSecondary: '#F54C91',
      accentOnFill: '#1A0812',
      bgImage: '/assets/aistudio/Dreamy_Pastel_Rose_and_Lavender_Glow_7bb9dbdd.png',
      bgImageFilter: 'brightness(0.42) saturate(1.24) contrast(1.08)',
      bgOverlay:
        'linear-gradient(180deg, rgba(16, 8, 22, 0.50) 0%, rgba(12, 6, 18, 0.56) 100%)',
      pageBackground: '#130916',
      cardSurface: '#140B10',
      cardBorder: 'rgba(255, 169, 221, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 169, 221, 0.26) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(245, 76, 145, 0.22) 0%, transparent 74%)',
      ambientGlow: 'rgba(255, 169, 221, 0.28)',
      pageNumberColor: '#FFA9DD',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(46, 17, 33, 0.72)',
      medallionStroke: '#FFA9DD',
      medallionText: '#FFD6EE',
      medallionAltFill: 'rgba(34, 12, 24, 0.72)',
      medallionAltStroke: '#F54C91',
      medallionAltText: '#FFC2E4',
      selectionBg: 'rgba(255, 169, 221, 0.26)',
      bookmarkBg: 'rgba(245, 76, 145, 0.18)',
      selectionUnderline: 'rgba(255, 169, 221, 0.60)',
      selectionAccent: '#FFA9DD',
      selectionText: '#FFC9E9',
      selectionGlow: 'rgba(255, 169, 221, 0.44)',
      barSurface: 'rgba(24, 18, 22, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#FFA9DD',
      ornamentSecondary: '#FF86CC',
      ornamentAccent: '#F54C91',
      duaHeadingColor: '#FFA9DD',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#FFA9DD',
    },
  },

  // 2: Soft Blue-Cyan Backdrop (Surrounded by Rose-Lavender before and Warm Peach after)
  2: {
    page: 2,
    light: {
      accentPrimary: '#00BCD6',
      accentSecondary: '#7CD5D9',
      accentOnFill: '#032329',
      bgImage: '/assets/aistudio/Soft_Blue-Cyan_Gradient_Backdrop_7163ace4.png',
      bgImageFilter: 'brightness(1.24) saturate(0.76) contrast(0.90)',
      bgOverlay:
        'linear-gradient(180deg, rgba(242, 251, 255, 0.62) 0%, rgba(245, 253, 255, 0.56) 50%, rgba(240, 251, 255, 0.60) 100%)',
      pageBackground: '#ECF9FC',
      cardSurface: '#F3FEFF',
      cardBorder: 'rgba(0, 188, 214, 0.26)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(0, 188, 214, 0.36) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(124, 213, 217, 0.32) 0%, transparent 74%)',
      ambientGlow: 'rgba(0, 188, 214, 0.34)',
      pageNumberColor: '#004D5E',
      verseColors: ['#0B0D12'],
      medallionFill: 'rgba(214, 248, 253, 0.76)',
      medallionStroke: '#00BCD6',
      medallionText: '#004452',
      medallionAltFill: 'rgba(235, 252, 254, 0.80)',
      medallionAltStroke: '#008BA3',
      medallionAltText: '#004D5E',
      selectionBg: 'rgba(0, 188, 214, 0.28)',
      bookmarkBg: 'rgba(0, 188, 214, 0.16)',
      selectionUnderline: 'rgba(0, 139, 163, 0.58)',
      selectionAccent: '#008BA3',
      selectionText: '#004452',
      selectionGlow: 'rgba(0, 188, 214, 0.36)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#00BCD6',
      ornamentSecondary: '#7CD5D9',
      ornamentAccent: '#008BA3',
      duaHeadingColor: '#004452',
      duaTextColor: '#141416',
      duaDividerColor: '#00BCD6',
    },
    dark: {
      accentPrimary: '#36D8ED',
      accentSecondary: '#00BCD6',
      accentOnFill: '#031D22',
      bgImage: '/assets/aistudio/Soft_Blue-Cyan_Gradient_Backdrop_7163ace4.png',
      bgImageFilter: 'brightness(0.50) saturate(1.16) contrast(1.06)',
      bgOverlay:
        'linear-gradient(180deg, rgba(4, 12, 24, 0.46) 0%, rgba(5, 16, 28, 0.54) 100%)',
      pageBackground: '#061522',
      cardSurface: '#091518',
      cardBorder: 'rgba(0, 188, 214, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(0, 188, 214, 0.24) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(54, 216, 237, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(0, 188, 214, 0.28)',
      pageNumberColor: '#7CD5D9',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(10, 38, 44, 0.74)',
      medallionStroke: '#36D8ED',
      medallionText: '#B8F5FD',
      medallionAltFill: 'rgba(7, 29, 34, 0.74)',
      medallionAltStroke: '#00BCD6',
      medallionAltText: '#9EEEF9',
      selectionBg: 'rgba(0, 188, 214, 0.26)',
      bookmarkBg: 'rgba(0, 188, 214, 0.18)',
      selectionUnderline: 'rgba(54, 216, 237, 0.60)',
      selectionAccent: '#36D8ED',
      selectionText: '#B8F5FD',
      selectionGlow: 'rgba(0, 188, 214, 0.44)',
      barSurface: 'rgba(18, 24, 26, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#36D8ED',
      ornamentSecondary: '#00BCD6',
      ornamentAccent: '#7CD5D9',
      duaHeadingColor: '#7CD5D9',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#00BCD6',
    },
  },

  // 3: Warm Peach to Cream (Sunny apricot-peach warmth, breaking away from cool tones)
  3: {
    page: 3,
    light: {
      accentPrimary: '#FFA547',
      accentSecondary: '#FFE26F',
      accentOnFill: '#2B1400',
      bgImage: '/assets/aistudio/Warm_Peach_to_Cream_Gradient_d70f64d8.png',
      bgImageFilter: 'brightness(1.08) saturate(0.84)',
      bgOverlay:
        'linear-gradient(180deg, rgba(255, 250, 244, 0.42) 0%, rgba(255, 252, 246, 0.48) 100%)',
      pageBackground: '#FFF6EB',
      cardSurface: '#FFFDF2',
      cardBorder: 'rgba(255, 165, 71, 0.26)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 226, 111, 0.48) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(255, 165, 71, 0.28) 0%, transparent 74%)',
      ambientGlow: 'rgba(255, 165, 71, 0.34)',
      pageNumberColor: '#873900',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 241, 214, 0.76)',
      medallionStroke: '#EA7E00',
      medallionText: '#753100',
      medallionAltFill: 'rgba(255, 248, 229, 0.80)',
      medallionAltStroke: '#FFA547',
      medallionAltText: '#873900',
      selectionBg: 'rgba(255, 165, 71, 0.32)',
      bookmarkBg: 'rgba(255, 226, 111, 0.34)',
      selectionUnderline: 'rgba(199, 93, 0, 0.58)',
      selectionAccent: '#C45B00',
      selectionText: '#753100',
      selectionGlow: 'rgba(255, 165, 71, 0.38)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#FFA547',
      ornamentSecondary: '#FFE26F',
      ornamentAccent: '#D46600',
      duaHeadingColor: '#753100',
      duaTextColor: '#141416',
      duaDividerColor: '#EA7E00',
    },
    dark: {
      accentPrimary: '#FFA547',
      accentSecondary: '#FFE26F',
      accentOnFill: '#211102',
      bgImage: '/assets/aistudio/Warm_Peach_to_Cream_Gradient_d70f64d8.png',
      bgImageFilter: 'brightness(0.38) saturate(1.26) contrast(1.08)',
      bgOverlay:
        'linear-gradient(180deg, rgba(24, 11, 6, 0.52) 0%, rgba(18, 10, 5, 0.58) 100%)',
      pageBackground: '#1C0E06',
      cardSurface: '#150F09',
      cardBorder: 'rgba(255, 165, 71, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 165, 71, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(255, 226, 111, 0.16) 0%, transparent 74%)',
      ambientGlow: 'rgba(255, 165, 71, 0.26)',
      pageNumberColor: '#FFE26F',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(41, 24, 8, 0.74)',
      medallionStroke: '#FFA547',
      medallionText: '#FFE499',
      medallionAltFill: 'rgba(30, 19, 6, 0.74)',
      medallionAltStroke: '#FFE26F',
      medallionAltText: '#FFDDB8',
      selectionBg: 'rgba(255, 165, 71, 0.26)',
      bookmarkBg: 'rgba(255, 226, 111, 0.18)',
      selectionUnderline: 'rgba(255, 165, 71, 0.60)',
      selectionAccent: '#FFA547',
      selectionText: '#FFE499',
      selectionGlow: 'rgba(255, 165, 71, 0.44)',
      barSurface: 'rgba(26, 20, 16, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#FFA547',
      ornamentSecondary: '#FFE26F',
      ornamentAccent: '#FFA547',
      duaHeadingColor: '#FFE26F',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#FFA547',
    },
  },

  // 4: Soft Spring Green (Fresh botanical lime-emerald contrast after warm peach)
  4: {
    page: 4,
    light: {
      accentPrimary: '#C4E02F',
      accentSecondary: '#00AE7D',
      accentOnFill: '#112600',
      bgImage: '/assets/aistudio/Soft_Spring_Green_Gradient_23f92f74.png',
      bgImageFilter: 'brightness(1.14) saturate(0.72) contrast(0.94)',
      bgOverlay:
        'linear-gradient(180deg, rgba(246, 253, 240, 0.52) 0%, rgba(248, 254, 244, 0.56) 100%)',
      pageBackground: '#F2FCE8',
      cardSurface: '#F8FEF0',
      cardBorder: 'rgba(155, 189, 10, 0.26)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(196, 224, 47, 0.42) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(0, 174, 125, 0.24) 0%, transparent 74%)',
      ambientGlow: 'rgba(196, 224, 47, 0.34)',
      pageNumberColor: '#244A00',
      verseColors: ['#0B0D12'],
      medallionFill: 'rgba(229, 248, 198, 0.76)',
      medallionStroke: '#008A63',
      medallionText: '#1F4200',
      medallionAltFill: 'rgba(243, 253, 224, 0.80)',
      medallionAltStroke: '#C4E02F',
      medallionAltText: '#2A5400',
      selectionBg: 'rgba(196, 224, 47, 0.38)',
      bookmarkBg: 'rgba(0, 174, 125, 0.18)',
      selectionUnderline: 'rgba(0, 122, 87, 0.56)',
      selectionAccent: '#007A57',
      selectionText: '#1F4200',
      selectionGlow: 'rgba(196, 224, 47, 0.36)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#C4E02F',
      ornamentSecondary: '#00AE7D',
      ornamentAccent: '#007A57',
      duaHeadingColor: '#1F4200',
      duaTextColor: '#141416',
      duaDividerColor: '#008A63',
    },
    dark: {
      accentPrimary: '#C4E02F',
      accentSecondary: '#00AE7D',
      accentOnFill: '#0D1F02',
      bgImage: '/assets/aistudio/Soft_Spring_Green_Gradient_23f92f74.png',
      bgImageFilter: 'brightness(0.36) saturate(1.16) contrast(1.06)',
      bgOverlay:
        'linear-gradient(180deg, rgba(7, 18, 6, 0.52) 0%, rgba(5, 14, 5, 0.58) 100%)',
      pageBackground: '#091507',
      cardSurface: '#0F1408',
      cardBorder: 'rgba(196, 224, 47, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(196, 224, 47, 0.20) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(0, 174, 125, 0.16) 0%, transparent 74%)',
      ambientGlow: 'rgba(196, 224, 47, 0.26)',
      pageNumberColor: '#DCF151',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(22, 38, 12, 0.74)',
      medallionStroke: '#C4E02F',
      medallionText: '#EFFBA8',
      medallionAltFill: 'rgba(14, 30, 14, 0.74)',
      medallionAltStroke: '#00AE7D',
      medallionAltText: '#CFE7CD',
      selectionBg: 'rgba(196, 224, 47, 0.24)',
      bookmarkBg: 'rgba(0, 174, 125, 0.18)',
      selectionUnderline: 'rgba(220, 241, 81, 0.58)',
      selectionAccent: '#DCF151',
      selectionText: '#EFFBA8',
      selectionGlow: 'rgba(196, 224, 47, 0.40)',
      barSurface: 'rgba(18, 24, 18, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#C4E02F',
      ornamentSecondary: '#00AE7D',
      ornamentAccent: '#DCF151',
      duaHeadingColor: '#DCF151',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#C4E02F',
    },
  },

  // 5: Dreamy Blush Pink (Delicate rose-blush contrast after green)
  5: {
    page: 5,
    light: {
      accentPrimary: '#F8B0BE',
      accentSecondary: '#F54C91',
      accentOnFill: '#3B081C',
      bgImage: '/assets/aistudio/Dreamy_Blush_Pink_Gradient_7332c4ca.png',
      bgImageFilter: 'brightness(1.08) saturate(0.84)',
      bgOverlay:
        'linear-gradient(180deg, rgba(255, 246, 250, 0.44) 0%, rgba(255, 250, 252, 0.50) 100%)',
      pageBackground: '#FFF2F7',
      cardSurface: '#FFF6FA',
      cardBorder: 'rgba(245, 76, 145, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(248, 176, 190, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(245, 76, 145, 0.24) 0%, transparent 74%)',
      ambientGlow: 'rgba(245, 76, 145, 0.32)',
      pageNumberColor: '#8C1141',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 230, 239, 0.78)',
      medallionStroke: '#F54C91',
      medallionText: '#7A0E38',
      medallionAltFill: 'rgba(255, 243, 247, 0.82)',
      medallionAltStroke: '#F8B0BE',
      medallionAltText: '#8C1141',
      selectionBg: 'rgba(248, 176, 190, 0.42)',
      bookmarkBg: 'rgba(245, 76, 145, 0.20)',
      selectionUnderline: 'rgba(219, 44, 117, 0.56)',
      selectionAccent: '#C92469',
      selectionText: '#7A0E38',
      selectionGlow: 'rgba(245, 76, 145, 0.34)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#F8B0BE',
      ornamentSecondary: '#FFA9DD',
      ornamentAccent: '#F54C91',
      duaHeadingColor: '#7A0E38',
      duaTextColor: '#141416',
      duaDividerColor: '#F54C91',
    },
    dark: {
      accentPrimary: '#F8B0BE',
      accentSecondary: '#F54C91',
      accentOnFill: '#290714',
      bgImage: '/assets/aistudio/Dreamy_Blush_Pink_Gradient_7332c4ca.png',
      bgImageFilter: 'brightness(0.40) saturate(1.22) contrast(1.08)',
      bgOverlay:
        'linear-gradient(180deg, rgba(24, 7, 15, 0.52) 0%, rgba(18, 5, 12, 0.58) 100%)',
      pageBackground: '#18070F',
      cardSurface: '#14090D',
      cardBorder: 'rgba(248, 176, 190, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(248, 176, 190, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(245, 76, 145, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(248, 176, 190, 0.26)',
      pageNumberColor: '#FFCECF',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(46, 14, 28, 0.74)',
      medallionStroke: '#F8B0BE',
      medallionText: '#FFE9EC',
      medallionAltFill: 'rgba(34, 10, 20, 0.74)',
      medallionAltStroke: '#F54C91',
      medallionAltText: '#FFCECF',
      selectionBg: 'rgba(248, 176, 190, 0.26)',
      bookmarkBg: 'rgba(245, 76, 145, 0.18)',
      selectionUnderline: 'rgba(248, 176, 190, 0.58)',
      selectionAccent: '#F8B0BE',
      selectionText: '#FFCECF',
      selectionGlow: 'rgba(245, 76, 145, 0.40)',
      barSurface: 'rgba(24, 18, 20, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#F8B0BE',
      ornamentSecondary: '#FFA9DD',
      ornamentAccent: '#F54C91',
      duaHeadingColor: '#FFCECF',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#F8B0BE',
    },
  },

  // 6: Dreamy Lavender Periwinkle (Cool airy periwinkle surrounded by Blush Pink and Crimson Rose)
  6: {
    page: 6,
    light: {
      accentPrimary: '#99ADFF',
      accentSecondary: '#B696E3',
      accentOnFill: '#0E1740',
      bgImage: '/assets/aistudio/Dreamy_Lavender_Periwinkle_Gradient_d0f736e8.png',
      bgImageFilter: 'brightness(1.12) saturate(0.80) contrast(0.94)',
      bgOverlay:
        'linear-gradient(180deg, rgba(246, 248, 255, 0.50) 0%, rgba(248, 250, 255, 0.52) 100%)',
      pageBackground: '#F3F5FF',
      cardSurface: '#F5F7FF',
      cardBorder: 'rgba(153, 173, 255, 0.30)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(153, 173, 255, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(182, 150, 227, 0.26) 0%, transparent 74%)',
      ambientGlow: 'rgba(153, 173, 255, 0.36)',
      pageNumberColor: '#1E3194',
      verseColors: ['#0B0D12'],
      medallionFill: 'rgba(224, 232, 255, 0.76)',
      medallionStroke: '#5B77F0',
      medallionText: '#1D2E8A',
      medallionAltFill: 'rgba(238, 242, 255, 0.80)',
      medallionAltStroke: '#99ADFF',
      medallionAltText: '#253AA8',
      selectionBg: 'rgba(153, 173, 255, 0.34)',
      bookmarkBg: 'rgba(153, 173, 255, 0.20)',
      selectionUnderline: 'rgba(73, 99, 224, 0.56)',
      selectionAccent: '#4963E0',
      selectionText: '#1D2E8A',
      selectionGlow: 'rgba(91, 119, 240, 0.36)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#99ADFF',
      ornamentSecondary: '#B696E3',
      ornamentAccent: '#4963E0',
      duaHeadingColor: '#1D2E8A',
      duaTextColor: '#141416',
      duaDividerColor: '#5B77F0',
    },
    dark: {
      accentPrimary: '#99ADFF',
      accentSecondary: '#B696E3',
      accentOnFill: '#0A1130',
      bgImage: '/assets/aistudio/Dreamy_Lavender_Periwinkle_Gradient_d0f736e8.png',
      bgImageFilter: 'brightness(0.42) saturate(1.24) contrast(1.08)',
      bgOverlay:
        'linear-gradient(180deg, rgba(10, 12, 28, 0.54) 0%, rgba(8, 10, 24, 0.60) 100%)',
      pageBackground: '#0D1024',
      cardSurface: '#0D101E',
      cardBorder: 'rgba(153, 173, 255, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(153, 173, 255, 0.24) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(182, 150, 227, 0.20) 0%, transparent 74%)',
      ambientGlow: 'rgba(153, 173, 255, 0.28)',
      pageNumberColor: '#A8BAFF',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(21, 28, 59, 0.74)',
      medallionStroke: '#99ADFF',
      medallionText: '#D6E0FF',
      medallionAltFill: 'rgba(16, 21, 46, 0.74)',
      medallionAltStroke: '#B696E3',
      medallionAltText: '#C2D0FF',
      selectionBg: 'rgba(153, 173, 255, 0.26)',
      bookmarkBg: 'rgba(153, 173, 255, 0.18)',
      selectionUnderline: 'rgba(153, 173, 255, 0.60)',
      selectionAccent: '#99ADFF',
      selectionText: '#D6E0FF',
      selectionGlow: 'rgba(153, 173, 255, 0.44)',
      barSurface: 'rgba(20, 22, 30, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#99ADFF',
      ornamentSecondary: '#B696E3',
      ornamentAccent: '#99ADFF',
      duaHeadingColor: '#A8BAFF',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#99ADFF',
    },
  },

  // 7: Dreamy Crimson Rose (Rich ruby-coral warmth after cool periwinkle)
  7: {
    page: 7,
    light: {
      accentPrimary: '#F8B0BE',
      accentSecondary: '#F15942',
      accentOnFill: '#3B0B08',
      bgImage: '/assets/aistudio/Dreamy_Crimson_Rose_Gradient_5067f08b.png',
      bgImageFilter: 'brightness(1.30) saturate(0.66) contrast(0.88)',
      bgOverlay:
        'linear-gradient(180deg, rgba(255, 243, 245, 0.66) 0%, rgba(255, 247, 248, 0.62) 100%)',
      pageBackground: '#FFF0F2',
      cardSurface: '#FFF6F5',
      cardBorder: 'rgba(241, 89, 66, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(248, 176, 190, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(241, 89, 66, 0.24) 0%, transparent 74%)',
      ambientGlow: 'rgba(241, 89, 66, 0.30)',
      pageNumberColor: '#87160B',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 233, 236, 0.84)',
      medallionStroke: '#F15942',
      medallionText: '#7D170D',
      medallionAltFill: 'rgba(252, 240, 229, 0.86)',
      medallionAltStroke: '#EF8F83',
      medallionAltText: '#8A2116',
      selectionBg: 'rgba(248, 176, 190, 0.42)',
      bookmarkBg: 'rgba(239, 143, 131, 0.24)',
      selectionUnderline: 'rgba(209, 58, 36, 0.56)',
      selectionAccent: '#C93622',
      selectionText: '#7D170D',
      selectionGlow: 'rgba(241, 89, 66, 0.32)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#F8B0BE',
      ornamentSecondary: '#EF8F83',
      ornamentAccent: '#F15942',
      duaHeadingColor: '#7D170D',
      duaTextColor: '#141416',
      duaDividerColor: '#F15942',
    },
    dark: {
      accentPrimary: '#F8B0BE',
      accentSecondary: '#F15942',
      accentOnFill: '#29080B',
      bgImage: '/assets/aistudio/Dreamy_Crimson_Rose_Gradient_5067f08b.png',
      bgImageFilter: 'brightness(0.54) saturate(1.08) contrast(1.05)',
      bgOverlay:
        'linear-gradient(180deg, rgba(22, 4, 8, 0.48) 0%, rgba(16, 3, 6, 0.56) 100%)',
      pageBackground: '#1D060A',
      cardSurface: '#14090B',
      cardBorder: 'rgba(248, 176, 190, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(248, 176, 190, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(241, 89, 66, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(248, 176, 190, 0.26)',
      pageNumberColor: '#FFCECF',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(46, 16, 20, 0.74)',
      medallionStroke: '#F8B0BE',
      medallionText: '#FFE9EC',
      medallionAltFill: 'rgba(34, 12, 15, 0.74)',
      medallionAltStroke: '#EF8F83',
      medallionAltText: '#FFCECF',
      selectionBg: 'rgba(248, 176, 190, 0.24)',
      bookmarkBg: 'rgba(239, 143, 131, 0.18)',
      selectionUnderline: 'rgba(248, 176, 190, 0.58)',
      selectionAccent: '#F8B0BE',
      selectionText: '#FFCECF',
      selectionGlow: 'rgba(241, 89, 66, 0.40)',
      barSurface: 'rgba(24, 18, 19, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#F8B0BE',
      ornamentSecondary: '#EF8F83',
      ornamentAccent: '#F8B0BE',
      duaHeadingColor: '#FFCECF',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#EF8F83',
    },
  },

  // 8: Dreamy Aqua to Deep Blue (Far from Page 2, majestic luminous azure for Ayat al-Kursi)
  8: {
    page: 8,
    light: {
      accentPrimary: '#7CD5D9',
      accentSecondary: '#00BCD6',
      accentOnFill: '#032329',
      bgImage: '/assets/aistudio/Dreamy_Aqua_to_Deep_Blue_Gradient_eb27b8c8.png',
      bgImageFilter: 'brightness(1.28) saturate(0.72) contrast(0.90)',
      bgOverlay:
        'linear-gradient(180deg, rgba(240, 252, 255, 0.65) 0%, rgba(244, 252, 255, 0.60) 100%)',
      pageBackground: '#EBF9FC',
      cardSurface: '#F3FEFF',
      cardBorder: 'rgba(0, 188, 214, 0.26)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(124, 213, 217, 0.40) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(0, 188, 214, 0.26) 0%, transparent 74%)',
      ambientGlow: 'rgba(0, 188, 214, 0.34)',
      pageNumberColor: '#004A6E',
      verseColors: ['#0B0D12'],
      medallionFill: 'rgba(218, 246, 253, 0.80)',
      medallionStroke: '#008BA3',
      medallionText: '#004452',
      medallionAltFill: 'rgba(235, 252, 254, 0.84)',
      medallionAltStroke: '#7CD5D9',
      medallionAltText: '#004A6E',
      selectionBg: 'rgba(124, 213, 217, 0.36)',
      bookmarkBg: 'rgba(0, 188, 214, 0.18)',
      selectionUnderline: 'rgba(0, 128, 168, 0.56)',
      selectionAccent: '#007C9E',
      selectionText: '#004452',
      selectionGlow: 'rgba(0, 188, 214, 0.34)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#7CD5D9',
      ornamentSecondary: '#00BCD6',
      ornamentAccent: '#008BA3',
      duaHeadingColor: '#004452',
      duaTextColor: '#141416',
      duaDividerColor: '#00BCD6',
    },
    dark: {
      accentPrimary: '#7CD5D9',
      accentSecondary: '#00BCD6',
      accentOnFill: '#021E24',
      bgImage: '/assets/aistudio/Dreamy_Aqua_to_Deep_Blue_Gradient_eb27b8c8.png',
      bgImageFilter: 'brightness(0.52) saturate(1.16) contrast(1.06)',
      bgOverlay:
        'linear-gradient(180deg, rgba(3, 12, 26, 0.48) 0%, rgba(4, 16, 32, 0.54) 100%)',
      pageBackground: '#041226',
      cardSurface: '#071422',
      cardBorder: 'rgba(124, 213, 217, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(124, 213, 217, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(0, 188, 214, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(124, 213, 217, 0.26)',
      pageNumberColor: '#96E3EF',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(10, 34, 52, 0.74)',
      medallionStroke: '#7CD5D9',
      medallionText: '#E0F7FB',
      medallionAltFill: 'rgba(8, 25, 42, 0.74)',
      medallionAltStroke: '#00BCD6',
      medallionAltText: '#96E3EF',
      selectionBg: 'rgba(124, 213, 217, 0.24)',
      bookmarkBg: 'rgba(0, 188, 214, 0.18)',
      selectionUnderline: 'rgba(124, 213, 217, 0.58)',
      selectionAccent: '#7CD5D9',
      selectionText: '#E0F7FB',
      selectionGlow: 'rgba(0, 188, 214, 0.40)',
      barSurface: 'rgba(16, 24, 32, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#7CD5D9',
      ornamentSecondary: '#00BCD6',
      ornamentAccent: '#96E3EF',
      duaHeadingColor: '#96E3EF',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#7CD5D9',
    },
  },

  // 9: Dreamy Lavender Violet (Serene amethyst twilight closing + Khatmah Dua)
  9: {
    page: 9,
    light: {
      accentPrimary: '#B696E3',
      accentSecondary: '#FFA9DD',
      accentOnFill: '#1B0E36',
      bgImage: '/assets/aistudio/Dreamy_Lavender_Violet_Gradient_ef05b53a.png',
      bgImageFilter: 'brightness(1.36) saturate(0.74) contrast(0.88)',
      bgOverlay:
        'linear-gradient(180deg, rgba(249, 245, 255, 0.66) 0%, rgba(251, 248, 255, 0.64) 100%)',
      pageBackground: '#F6F0FF',
      cardSurface: '#F8F4FF',
      cardBorder: 'rgba(182, 150, 227, 0.30)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(182, 150, 227, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(255, 169, 221, 0.24) 0%, transparent 74%)',
      ambientGlow: 'rgba(182, 150, 227, 0.36)',
      pageNumberColor: '#4E2899',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(235, 222, 255, 0.78)',
      medallionStroke: '#875CD6',
      medallionText: '#44208A',
      medallionAltFill: 'rgba(244, 237, 255, 0.82)',
      medallionAltStroke: '#B696E3',
      medallionAltText: '#4E2899',
      selectionBg: 'rgba(182, 150, 227, 0.36)',
      bookmarkBg: 'rgba(182, 150, 227, 0.22)',
      selectionUnderline: 'rgba(116, 72, 196, 0.56)',
      selectionAccent: '#7448C4',
      selectionText: '#44208A',
      selectionGlow: 'rgba(135, 92, 214, 0.36)',
      barSurface: 'rgba(255, 255, 255, 0.26)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.78)',
      barText: '#141416',
      barMutedText: 'rgba(20, 20, 24, 0.72)',
      barControlBg: 'rgba(255, 255, 255, 0.34)',
      ornamentPrimary: '#B696E3',
      ornamentSecondary: '#FFA9DD',
      ornamentAccent: '#7448C4',
      duaHeadingColor: '#44208A',
      duaTextColor: '#141416',
      duaDividerColor: '#875CD6',
    },
    dark: {
      accentPrimary: '#B696E3',
      accentSecondary: '#FFA9DD',
      accentOnFill: '#170C2B',
      bgImage: '/assets/aistudio/Dreamy_Lavender_Violet_Gradient_ef05b53a.png',
      bgImageFilter: 'brightness(0.60) saturate(1.12) contrast(1.04)',
      bgOverlay:
        'linear-gradient(180deg, rgba(14, 8, 24, 0.44) 0%, rgba(10, 6, 18, 0.52) 100%)',
      pageBackground: '#150C24',
      cardSurface: '#120D1C',
      cardBorder: 'rgba(182, 150, 227, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(182, 150, 227, 0.24) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(255, 169, 221, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(182, 150, 227, 0.28)',
      pageNumberColor: '#D2BCFA',
      verseColors: ['#F8F8FA'],
      medallionFill: 'rgba(30, 21, 51, 0.74)',
      medallionStroke: '#B696E3',
      medallionText: '#E6D9FC',
      medallionAltFill: 'rgba(22, 15, 38, 0.74)',
      medallionAltStroke: '#FFA9DD',
      medallionAltText: '#D9C4FA',
      selectionBg: 'rgba(182, 150, 227, 0.26)',
      bookmarkBg: 'rgba(182, 150, 227, 0.18)',
      selectionUnderline: 'rgba(197, 168, 238, 0.60)',
      selectionAccent: '#C5A8EE',
      selectionText: '#E6D9FC',
      selectionGlow: 'rgba(182, 150, 227, 0.44)',
      barSurface: 'rgba(22, 19, 28, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.34)',
      barText: '#F8F8FA',
      barMutedText: 'rgba(235, 235, 245, 0.74)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#B696E3',
      ornamentSecondary: '#FFA9DD',
      ornamentAccent: '#B696E3',
      duaHeadingColor: '#D2BCFA',
      duaTextColor: '#F8F8FA',
      duaDividerColor: '#B696E3',
    },
  },
};

