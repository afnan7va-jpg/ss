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

export const APP_LOGO_URL = '/assets/aistudio/___________________________________9c7fd961.png';
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
  // 1: Bubblegum Pink Monochromatic Wavy Shades (#FFA9DD ↔ #F54C91)
  1: {
    page: 1,
    light: {
      accentPrimary: '#FFA9DD',
      accentSecondary: '#F54C91',
      accentOnFill: '#3B0822',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(245, 76, 145, 0.08) 0%, rgba(255, 169, 221, 0.10) 48%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(255, 169, 221, 0.16) 0%, rgba(245, 76, 145, 0.05) 50%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(245, 76, 145, 0.07) 0%, rgba(255, 169, 221, 0.09) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(255, 169, 221, 0.15) 0%, rgba(245, 76, 145, 0.05) 54%, transparent 78%), linear-gradient(165deg, #FFF3F9 0%, #FFFFFF 26%, #FFEEF7 52%, #FFFFFF 78%, #FFF2F8 100%)',
      cardSurface: '#FFF5FA',
      cardBorder: 'rgba(245, 76, 145, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 169, 221, 0.48) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(245, 76, 145, 0.24) 0%, transparent 74%)',
      ambientGlow: 'rgba(245, 76, 145, 0.36)',
      pageNumberColor: '#94114A',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 228, 244, 0.72)',
      medallionStroke: '#F54C91',
      medallionText: '#850E41',
      medallionAltFill: 'rgba(255, 242, 249, 0.75)',
      medallionAltStroke: '#FFA9DD',
      medallionAltText: '#9E1450',
      selectionBg: 'rgba(255, 169, 221, 0.42)',
      bookmarkBg: 'rgba(255, 169, 221, 0.28)',
      selectionUnderline: 'rgba(245, 76, 145, 0.60)',
      selectionAccent: '#F54C91',
      selectionText: '#850E41',
      selectionGlow: 'rgba(245, 76, 145, 0.38)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
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
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(245, 76, 145, 0.34) 0%, rgba(255, 169, 221, 0.14) 50%, transparent 78%), radial-gradient(135% 42% at 8% 36%, rgba(255, 169, 221, 0.22) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(245, 76, 145, 0.26) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(255, 169, 221, 0.24) 0%, transparent 78%), linear-gradient(165deg, #210B18 0%, #0D070B 34%, #2E0F21 64%, #090608 100%)',
      cardSurface: '#140B10',
      cardBorder: 'rgba(255, 169, 221, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 169, 221, 0.26) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(245, 76, 145, 0.22) 0%, transparent 74%)',
      ambientGlow: 'rgba(255, 169, 221, 0.28)',
      pageNumberColor: '#FFA9DD',
      verseColors: ['#F5F5F7'],
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
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#FFA9DD',
      ornamentSecondary: '#FF86CC',
      ornamentAccent: '#F54C91',
      duaHeadingColor: '#FFA9DD',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#FFA9DD',
    },
  },

  // 2: Pacific Punch Cyan Monochromatic Wavy Shades (#00BCD6 ↔ #7CD5D9)
  2: {
    page: 2,
    light: {
      accentPrimary: '#00BCD6',
      accentSecondary: '#7CD5D9',
      accentOnFill: '#032329',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(0, 188, 214, 0.09) 0%, rgba(124, 213, 217, 0.08) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(124, 213, 217, 0.16) 0%, rgba(0, 188, 214, 0.05) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(0, 188, 214, 0.08) 0%, rgba(124, 213, 217, 0.08) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(124, 213, 217, 0.15) 0%, rgba(0, 188, 214, 0.05) 54%, transparent 78%), linear-gradient(165deg, #F0FCFE 0%, #FFFFFF 26%, #EAFAFC 52%, #FFFFFF 78%, #EFFCFE 100%)',
      cardSurface: '#F3FEFF',
      cardBorder: 'rgba(0, 188, 214, 0.26)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(0, 188, 214, 0.36) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(124, 213, 217, 0.32) 0%, transparent 74%)',
      ambientGlow: 'rgba(0, 188, 214, 0.34)',
      pageNumberColor: '#005669',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(214, 248, 253, 0.74)',
      medallionStroke: '#00BCD6',
      medallionText: '#004B59',
      medallionAltFill: 'rgba(235, 252, 254, 0.78)',
      medallionAltStroke: '#008BA3',
      medallionAltText: '#005669',
      selectionBg: 'rgba(0, 188, 214, 0.26)',
      bookmarkBg: 'rgba(0, 188, 214, 0.16)',
      selectionUnderline: 'rgba(0, 139, 163, 0.58)',
      selectionAccent: '#008BA3',
      selectionText: '#004B59',
      selectionGlow: 'rgba(0, 188, 214, 0.36)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#00BCD6',
      ornamentSecondary: '#7CD5D9',
      ornamentAccent: '#008BA3',
      duaHeadingColor: '#004B59',
      duaTextColor: '#141416',
      duaDividerColor: '#00BCD6',
    },
    dark: {
      accentPrimary: '#36D8ED',
      accentSecondary: '#00BCD6',
      accentOnFill: '#031D22',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(0, 188, 214, 0.32) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(0, 139, 163, 0.26) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(124, 213, 217, 0.20) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(0, 188, 214, 0.26) 0%, transparent 78%), linear-gradient(165deg, #071F24 0%, #060C0E 34%, #0C2D34 64%, #05090A 100%)',
      cardSurface: '#091518',
      cardBorder: 'rgba(0, 188, 214, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(0, 188, 214, 0.24) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(54, 216, 237, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(0, 188, 214, 0.28)',
      pageNumberColor: '#4EE3F7',
      verseColors: ['#F5F5F7'],
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
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#36D8ED',
      ornamentSecondary: '#00BCD6',
      ornamentAccent: '#7CD5D9',
      duaHeadingColor: '#4EE3F7',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#00BCD6',
    },
  },

  // 3: Sunny Yellow / Lemon Rind Monochromatic Wavy Shades (#FFE26F ↔ #F7DC00)
  3: {
    page: 3,
    light: {
      accentPrimary: '#FFE26F',
      accentSecondary: '#F7DC00',
      accentOnFill: '#292000',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(247, 220, 0, 0.09) 0%, rgba(255, 226, 111, 0.09) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(255, 226, 111, 0.16) 0%, rgba(247, 220, 0, 0.05) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(247, 220, 0, 0.08) 0%, rgba(255, 226, 111, 0.09) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(255, 226, 111, 0.15) 0%, rgba(247, 220, 0, 0.05) 54%, transparent 78%), linear-gradient(165deg, #FFFBEB 0%, #FFFFFF 26%, #FFF8E0 52%, #FFFFFF 78%, #FFFBE9 100%)',
      cardSurface: '#FFFDF2',
      cardBorder: 'rgba(214, 178, 0, 0.26)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 226, 111, 0.48) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(247, 220, 0, 0.28) 0%, transparent 74%)',
      ambientGlow: 'rgba(247, 220, 0, 0.36)',
      pageNumberColor: '#735600',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 245, 198, 0.76)',
      medallionStroke: '#D9B600',
      medallionText: '#664D00',
      medallionAltFill: 'rgba(255, 250, 225, 0.78)',
      medallionAltStroke: '#F7DC00',
      medallionAltText: '#735600',
      selectionBg: 'rgba(255, 226, 111, 0.48)',
      bookmarkBg: 'rgba(247, 220, 0, 0.28)',
      selectionUnderline: 'rgba(176, 134, 0, 0.58)',
      selectionAccent: '#A67E00',
      selectionText: '#664D00',
      selectionGlow: 'rgba(247, 220, 0, 0.38)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#FFE26F',
      ornamentSecondary: '#F7DC00',
      ornamentAccent: '#C99F00',
      duaHeadingColor: '#664D00',
      duaTextColor: '#141416',
      duaDividerColor: '#D9B600',
    },
    dark: {
      accentPrimary: '#FFE26F',
      accentSecondary: '#F7DC00',
      accentOnFill: '#1C1602',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(255, 226, 111, 0.26) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(247, 220, 0, 0.20) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(255, 226, 111, 0.18) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(247, 220, 0, 0.22) 0%, transparent 78%), linear-gradient(165deg, #1F1906 0%, #0D0B06 34%, #2B2308 64%, #0A0905 100%)',
      cardSurface: '#141107',
      cardBorder: 'rgba(255, 226, 111, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 226, 111, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(247, 220, 0, 0.16) 0%, transparent 74%)',
      ambientGlow: 'rgba(255, 226, 111, 0.26)',
      pageNumberColor: '#FFE26F',
      verseColors: ['#F5F5F7'],
      medallionFill: 'rgba(38, 32, 9, 0.74)',
      medallionStroke: '#FFE26F',
      medallionText: '#FFF3B0',
      medallionAltFill: 'rgba(29, 25, 7, 0.74)',
      medallionAltStroke: '#F7DC00',
      medallionAltText: '#FFE885',
      selectionBg: 'rgba(255, 226, 111, 0.26)',
      bookmarkBg: 'rgba(247, 220, 0, 0.18)',
      selectionUnderline: 'rgba(255, 226, 111, 0.60)',
      selectionAccent: '#FFE26F',
      selectionText: '#FFF1A6',
      selectionGlow: 'rgba(255, 226, 111, 0.44)',
      barSurface: 'rgba(24, 22, 16, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#FFE26F',
      ornamentSecondary: '#F7DC00',
      ornamentAccent: '#FFE26F',
      duaHeadingColor: '#FFE26F',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#F7DC00',
    },
  },

  // 4: Periwinkle Blue Monochromatic Wavy Shades (#99ADFF ↔ #5B77F0)
  4: {
    page: 4,
    light: {
      accentPrimary: '#99ADFF',
      accentSecondary: '#5B77F0',
      accentOnFill: '#0E1740',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(91, 119, 240, 0.08) 0%, rgba(153, 173, 255, 0.09) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(153, 173, 255, 0.15) 0%, rgba(91, 119, 240, 0.05) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(91, 119, 240, 0.07) 0%, rgba(153, 173, 255, 0.09) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(153, 173, 255, 0.15) 0%, rgba(91, 119, 240, 0.05) 54%, transparent 78%), linear-gradient(165deg, #F3F5FF 0%, #FFFFFF 26%, #EDF1FF 52%, #FFFFFF 78%, #F2F5FF 100%)',
      cardSurface: '#F5F7FF',
      cardBorder: 'rgba(153, 173, 255, 0.30)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(153, 173, 255, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(91, 119, 240, 0.26) 0%, transparent 74%)',
      ambientGlow: 'rgba(153, 173, 255, 0.36)',
      pageNumberColor: '#1E3194',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(224, 232, 255, 0.74)',
      medallionStroke: '#5B77F0',
      medallionText: '#1D2E8A',
      medallionAltFill: 'rgba(238, 242, 255, 0.78)',
      medallionAltStroke: '#99ADFF',
      medallionAltText: '#253AA8',
      selectionBg: 'rgba(153, 173, 255, 0.34)',
      bookmarkBg: 'rgba(153, 173, 255, 0.20)',
      selectionUnderline: 'rgba(73, 99, 224, 0.56)',
      selectionAccent: '#4963E0',
      selectionText: '#1D2E8A',
      selectionGlow: 'rgba(91, 119, 240, 0.36)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#99ADFF',
      ornamentSecondary: '#738CFF',
      ornamentAccent: '#4963E0',
      duaHeadingColor: '#1D2E8A',
      duaTextColor: '#141416',
      duaDividerColor: '#5B77F0',
    },
    dark: {
      accentPrimary: '#99ADFF',
      accentSecondary: '#6F89FA',
      accentOnFill: '#0A1130',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(153, 173, 255, 0.30) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(91, 119, 240, 0.26) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(153, 173, 255, 0.20) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(91, 119, 240, 0.26) 0%, transparent 78%), linear-gradient(165deg, #0E132B 0%, #080A12 34%, #182047 64%, #07080F 100%)',
      cardSurface: '#0D101E',
      cardBorder: 'rgba(153, 173, 255, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(153, 173, 255, 0.24) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(91, 119, 240, 0.20) 0%, transparent 74%)',
      ambientGlow: 'rgba(153, 173, 255, 0.28)',
      pageNumberColor: '#A8BAFF',
      verseColors: ['#F5F5F7'],
      medallionFill: 'rgba(21, 28, 59, 0.74)',
      medallionStroke: '#99ADFF',
      medallionText: '#D6E0FF',
      medallionAltFill: 'rgba(16, 21, 46, 0.74)',
      medallionAltStroke: '#6F89FA',
      medallionAltText: '#C2D0FF',
      selectionBg: 'rgba(153, 173, 255, 0.26)',
      bookmarkBg: 'rgba(153, 173, 255, 0.18)',
      selectionUnderline: 'rgba(153, 173, 255, 0.60)',
      selectionAccent: '#99ADFF',
      selectionText: '#D6E0FF',
      selectionGlow: 'rgba(153, 173, 255, 0.44)',
      barSurface: 'rgba(20, 22, 30, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#99ADFF',
      ornamentSecondary: '#6F89FA',
      ornamentAccent: '#99ADFF',
      duaHeadingColor: '#A8BAFF',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#99ADFF',
    },
  },

  // 5: Lime Green / Key Lime Monochromatic Wavy Shades (#DCF151 ↔ #C4E02F)
  5: {
    page: 5,
    light: {
      accentPrimary: '#DCF151',
      accentSecondary: '#C4E02F',
      accentOnFill: '#1D2900',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(196, 224, 47, 0.09) 0%, rgba(220, 241, 81, 0.08) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(220, 241, 81, 0.15) 0%, rgba(196, 224, 47, 0.05) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(196, 224, 47, 0.08) 0%, rgba(220, 241, 81, 0.08) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(220, 241, 81, 0.14) 0%, rgba(196, 224, 47, 0.05) 54%, transparent 78%), linear-gradient(165deg, #F7FDE9 0%, #FFFFFF 26%, #F3FCE1 52%, #FFFFFF 78%, #F6FDE7 100%)',
      cardSurface: '#F8FEF0',
      cardBorder: 'rgba(155, 189, 10, 0.26)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(220, 241, 81, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(196, 224, 47, 0.28) 0%, transparent 74%)',
      ambientGlow: 'rgba(196, 224, 47, 0.34)',
      pageNumberColor: '#365200',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(235, 250, 195, 0.76)',
      medallionStroke: '#96B500',
      medallionText: '#334D00',
      medallionAltFill: 'rgba(245, 253, 222, 0.78)',
      medallionAltStroke: '#C4E02F',
      medallionAltText: '#406000',
      selectionBg: 'rgba(220, 241, 81, 0.44)',
      bookmarkBg: 'rgba(196, 224, 47, 0.26)',
      selectionUnderline: 'rgba(92, 133, 0, 0.54)',
      selectionAccent: '#5B8200',
      selectionText: '#334D00',
      selectionGlow: 'rgba(196, 224, 47, 0.38)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#DCF151',
      ornamentSecondary: '#C4E02F',
      ornamentAccent: '#6B9400',
      duaHeadingColor: '#334D00',
      duaTextColor: '#141416',
      duaDividerColor: '#96B500',
    },
    dark: {
      accentPrimary: '#DCF151',
      accentSecondary: '#C4E02F',
      accentOnFill: '#141B03',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(220, 241, 81, 0.24) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(196, 224, 47, 0.20) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(220, 241, 81, 0.18) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(196, 224, 47, 0.22) 0%, transparent 78%), linear-gradient(165deg, #172007 0%, #0A0D06 34%, #222E0A 64%, #080A05 100%)',
      cardSurface: '#0F1408',
      cardBorder: 'rgba(220, 241, 81, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(220, 241, 81, 0.20) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(196, 224, 47, 0.16) 0%, transparent 74%)',
      ambientGlow: 'rgba(220, 241, 81, 0.26)',
      pageNumberColor: '#DCF151',
      verseColors: ['#F5F5F7'],
      medallionFill: 'rgba(28, 38, 10, 0.74)',
      medallionStroke: '#DCF151',
      medallionText: '#EFFBA8',
      medallionAltFill: 'rgba(21, 29, 8, 0.74)',
      medallionAltStroke: '#C4E02F',
      medallionAltText: '#E2F59A',
      selectionBg: 'rgba(220, 241, 81, 0.24)',
      bookmarkBg: 'rgba(196, 224, 47, 0.18)',
      selectionUnderline: 'rgba(220, 241, 81, 0.58)',
      selectionAccent: '#DCF151',
      selectionText: '#EFFBA8',
      selectionGlow: 'rgba(220, 241, 81, 0.42)',
      barSurface: 'rgba(22, 25, 18, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#DCF151',
      ornamentSecondary: '#C4E02F',
      ornamentAccent: '#DCF151',
      duaHeadingColor: '#DCF151',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#C4E02F',
    },
  },

  // 6: Orange Dream / Bright Orange Monochromatic Wavy Shades (#FFA547 ↔ #FEB700)
  6: {
    page: 6,
    light: {
      accentPrimary: '#FFA547',
      accentSecondary: '#FEB700',
      accentOnFill: '#2B1400',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(255, 165, 71, 0.09) 0%, rgba(254, 183, 0, 0.07) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(254, 183, 0, 0.08) 0%, rgba(255, 165, 71, 0.08) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(255, 146, 51, 0.08) 0%, rgba(255, 207, 153, 0.08) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(255, 165, 71, 0.12) 0%, rgba(254, 183, 0, 0.05) 54%, transparent 78%), linear-gradient(165deg, #FFF6EB 0%, #FFFFFF 26%, #FFF2E3 52%, #FFFFFF 78%, #FFF5E9 100%)',
      cardSurface: '#FFF8F0',
      cardBorder: 'rgba(255, 165, 71, 0.28)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 165, 71, 0.42) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(254, 183, 0, 0.26) 0%, transparent 74%)',
      ambientGlow: 'rgba(255, 165, 71, 0.34)',
      pageNumberColor: '#8C3C00',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 232, 206, 0.76)',
      medallionStroke: '#EA7E00',
      medallionText: '#7A3300',
      medallionAltFill: 'rgba(255, 243, 228, 0.78)',
      medallionAltStroke: '#FFA547',
      medallionAltText: '#8C3C00',
      selectionBg: 'rgba(255, 165, 71, 0.32)',
      bookmarkBg: 'rgba(254, 183, 0, 0.22)',
      selectionUnderline: 'rgba(212, 102, 0, 0.56)',
      selectionAccent: '#C95E00',
      selectionText: '#7A3300',
      selectionGlow: 'rgba(255, 165, 71, 0.38)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#FFA547',
      ornamentSecondary: '#FEB700',
      ornamentAccent: '#D46600',
      duaHeadingColor: '#7A3300',
      duaTextColor: '#141416',
      duaDividerColor: '#EA7E00',
    },
    dark: {
      accentPrimary: '#FFA547',
      accentSecondary: '#FEB700',
      accentOnFill: '#211102',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(255, 165, 71, 0.28) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(254, 183, 0, 0.20) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(255, 165, 71, 0.20) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(254, 183, 0, 0.22) 0%, transparent 78%), linear-gradient(165deg, #241406 0%, #0D0906 34%, #331D08 64%, #090705 100%)',
      cardSurface: '#150F09',
      cardBorder: 'rgba(255, 165, 71, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(255, 165, 71, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(254, 183, 0, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(255, 165, 71, 0.26)',
      pageNumberColor: '#FFB361',
      verseColors: ['#F5F5F7'],
      medallionFill: 'rgba(41, 24, 8, 0.74)',
      medallionStroke: '#FFA547',
      medallionText: '#FFDDB8',
      medallionAltFill: 'rgba(30, 19, 6, 0.74)',
      medallionAltStroke: '#FEB700',
      medallionAltText: '#FFE499',
      selectionBg: 'rgba(255, 165, 71, 0.26)',
      bookmarkBg: 'rgba(254, 183, 0, 0.18)',
      selectionUnderline: 'rgba(255, 165, 71, 0.58)',
      selectionAccent: '#FFA547',
      selectionText: '#FFDDB8',
      selectionGlow: 'rgba(255, 165, 71, 0.44)',
      barSurface: 'rgba(26, 22, 18, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#FFA547',
      ornamentSecondary: '#FEB700',
      ornamentAccent: '#FFA547',
      duaHeadingColor: '#FFB361',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#FFA547',
    },
  },

  // 7: Grape Refresh Violet Monochromatic Wavy Shades (#B696E3 ↔ #875CD6)
  7: {
    page: 7,
    light: {
      accentPrimary: '#B696E3',
      accentSecondary: '#875CD6',
      accentOnFill: '#1B0E36',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(135, 92, 214, 0.08) 0%, rgba(182, 150, 227, 0.09) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(182, 150, 227, 0.15) 0%, rgba(135, 92, 214, 0.05) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(135, 92, 214, 0.07) 0%, rgba(182, 150, 227, 0.09) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(182, 150, 227, 0.14) 0%, rgba(135, 92, 214, 0.05) 54%, transparent 78%), linear-gradient(165deg, #F7F2FF 0%, #FFFFFF 26%, #F2EBFE 52%, #FFFFFF 78%, #F6F0FF 100%)',
      cardSurface: '#F8F4FF',
      cardBorder: 'rgba(182, 150, 227, 0.30)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(182, 150, 227, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(135, 92, 214, 0.26) 0%, transparent 74%)',
      ambientGlow: 'rgba(182, 150, 227, 0.36)',
      pageNumberColor: '#4E2899',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(235, 222, 255, 0.74)',
      medallionStroke: '#875CD6',
      medallionText: '#44208A',
      medallionAltFill: 'rgba(244, 237, 255, 0.78)',
      medallionAltStroke: '#B696E3',
      medallionAltText: '#4E2899',
      selectionBg: 'rgba(182, 150, 227, 0.34)',
      bookmarkBg: 'rgba(182, 150, 227, 0.20)',
      selectionUnderline: 'rgba(116, 72, 196, 0.56)',
      selectionAccent: '#7448C4',
      selectionText: '#44208A',
      selectionGlow: 'rgba(135, 92, 214, 0.36)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#B696E3',
      ornamentSecondary: '#9D75DC',
      ornamentAccent: '#7448C4',
      duaHeadingColor: '#44208A',
      duaTextColor: '#141416',
      duaDividerColor: '#875CD6',
    },
    dark: {
      accentPrimary: '#C5A8EE',
      accentSecondary: '#9D75DC',
      accentOnFill: '#170C2B',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(182, 150, 227, 0.30) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(135, 92, 214, 0.26) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(182, 150, 227, 0.20) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(135, 92, 214, 0.26) 0%, transparent 78%), linear-gradient(165deg, #191129 0%, #0A080E 34%, #261842 64%, #08060C 100%)',
      cardSurface: '#120D1C',
      cardBorder: 'rgba(182, 150, 227, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(182, 150, 227, 0.24) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(135, 92, 214, 0.20) 0%, transparent 74%)',
      ambientGlow: 'rgba(182, 150, 227, 0.28)',
      pageNumberColor: '#D2BCFA',
      verseColors: ['#F5F5F7'],
      medallionFill: 'rgba(30, 21, 51, 0.74)',
      medallionStroke: '#C5A8EE',
      medallionText: '#E6D9FC',
      medallionAltFill: 'rgba(22, 15, 38, 0.74)',
      medallionAltStroke: '#9D75DC',
      medallionAltText: '#D9C4FA',
      selectionBg: 'rgba(182, 150, 227, 0.26)',
      bookmarkBg: 'rgba(182, 150, 227, 0.18)',
      selectionUnderline: 'rgba(197, 168, 238, 0.60)',
      selectionAccent: '#C5A8EE',
      selectionText: '#E6D9FC',
      selectionGlow: 'rgba(182, 150, 227, 0.44)',
      barSurface: 'rgba(22, 19, 28, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#C5A8EE',
      ornamentSecondary: '#9D75DC',
      ornamentAccent: '#B696E3',
      duaHeadingColor: '#D2BCFA',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#B696E3',
    },
  },

  // 8: Coral Blossom & Blush Rose Monochromatic Wavy Shades (#F8B0BE ↔ #F15942)
  8: {
    page: 8,
    light: {
      accentPrimary: '#F8B0BE',
      accentSecondary: '#F15942',
      accentOnFill: '#3B0B08',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(241, 89, 66, 0.08) 0%, rgba(248, 176, 190, 0.12) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(248, 176, 190, 0.18) 0%, rgba(239, 143, 131, 0.06) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(239, 143, 131, 0.09) 0%, rgba(255, 206, 207, 0.12) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(248, 176, 190, 0.16) 0%, rgba(241, 89, 66, 0.05) 54%, transparent 78%), linear-gradient(165deg, #FFE9EC 0%, #FFFFFF 26%, #FCF0E5 52%, #FFFFFF 78%, #FFE9EC 100%)',
      cardSurface: '#FFF6F5',
      cardBorder: 'rgba(241, 89, 66, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(248, 176, 190, 0.44) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(239, 143, 131, 0.28) 0%, transparent 74%)',
      ambientGlow: 'rgba(241, 89, 66, 0.30)',
      pageNumberColor: '#911F13',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(255, 233, 236, 0.84)',
      medallionStroke: '#F15942',
      medallionText: '#7D170D',
      medallionAltFill: 'rgba(252, 240, 229, 0.86)',
      medallionAltStroke: '#EF8F83',
      medallionAltText: '#8A2116',
      selectionBg: 'rgba(248, 176, 190, 0.40)',
      bookmarkBg: 'rgba(239, 143, 131, 0.24)',
      selectionUnderline: 'rgba(209, 58, 36, 0.56)',
      selectionAccent: '#C93622',
      selectionText: '#7D170D',
      selectionGlow: 'rgba(241, 89, 66, 0.32)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#F8B0BE',
      ornamentSecondary: '#EF8F83',
      ornamentAccent: '#F15942',
      duaHeadingColor: '#7D170D',
      duaTextColor: '#141416',
      duaDividerColor: '#F15942',
    },
    dark: {
      accentPrimary: '#F8B0BE',
      accentSecondary: '#EF8F83',
      accentOnFill: '#29080B',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(241, 89, 66, 0.28) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(248, 176, 190, 0.22) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(239, 143, 131, 0.22) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(248, 176, 190, 0.22) 0%, transparent 78%), linear-gradient(165deg, #240B0E 0%, #0D0708 34%, #331215 64%, #090506 100%)',
      cardSurface: '#14090B',
      cardBorder: 'rgba(248, 176, 190, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(248, 176, 190, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(239, 143, 131, 0.18) 0%, transparent 74%)',
      ambientGlow: 'rgba(248, 176, 190, 0.26)',
      pageNumberColor: '#FFCECF',
      verseColors: ['#F5F5F7'],
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
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#F8B0BE',
      ornamentSecondary: '#EF8F83',
      ornamentAccent: '#F8B0BE',
      duaHeadingColor: '#FFCECF',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#EF8F83',
    },
  },

  // 9: Botanical Emerald Jade & Mint Mist Monochromatic Wavy Shades (#00AE7D ↔ #CFE7CD)
  9: {
    page: 9,
    light: {
      accentPrimary: '#00AE7D',
      accentSecondary: '#CFE7CD',
      accentOnFill: '#032117',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(0, 174, 125, 0.08) 0%, rgba(207, 231, 205, 0.18) 50%, transparent 78%), radial-gradient(135% 42% at 8% 34%, rgba(207, 231, 205, 0.24) 0%, rgba(0, 174, 125, 0.05) 52%, transparent 78%), radial-gradient(130% 42% at 92% 65%, rgba(0, 174, 125, 0.07) 0%, rgba(207, 231, 205, 0.16) 52%, transparent 78%), radial-gradient(135% 46% at 12% 93%, rgba(207, 231, 205, 0.22) 0%, rgba(0, 174, 125, 0.05) 54%, transparent 78%), linear-gradient(165deg, #EEF8EE 0%, #FFFFFF 26%, #E8F7F2 52%, #FFFFFF 78%, #EFF9F3 100%)',
      cardSurface: '#F2FBF6',
      cardBorder: 'rgba(0, 174, 125, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(0, 174, 125, 0.30) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(207, 231, 205, 0.36) 0%, transparent 74%)',
      ambientGlow: 'rgba(0, 174, 125, 0.30)',
      pageNumberColor: '#00573E',
      verseColors: ['#0C0D12'],
      medallionFill: 'rgba(207, 231, 205, 0.78)',
      medallionStroke: '#00AE7D',
      medallionText: '#033D2C',
      medallionAltFill: 'rgba(232, 247, 238, 0.84)',
      medallionAltStroke: '#00AE7D',
      medallionAltText: '#00573E',
      selectionBg: 'rgba(0, 174, 125, 0.22)',
      bookmarkBg: 'rgba(207, 231, 205, 0.45)',
      selectionUnderline: 'rgba(0, 122, 87, 0.56)',
      selectionAccent: '#007A57',
      selectionText: '#033D2C',
      selectionGlow: 'rgba(0, 174, 125, 0.32)',
      barSurface: 'rgba(255, 255, 255, 0.32)',
      barSolidSurface: '#FFFFFF',
      barBorder: 'rgba(255, 255, 255, 0.65)',
      barText: '#141416',
      barMutedText: 'rgba(28, 28, 30, 0.68)',
      barControlBg: 'rgba(255, 255, 255, 0.36)',
      ornamentPrimary: '#00AE7D',
      ornamentSecondary: '#CFE7CD',
      ornamentAccent: '#007A57',
      duaHeadingColor: '#033D2C',
      duaTextColor: '#0C1F17',
      duaDividerColor: '#00AE7D',
    },
    dark: {
      accentPrimary: '#00AE7D',
      accentSecondary: '#CFE7CD',
      accentOnFill: '#021E15',
      pageBackground:
        'radial-gradient(132% 40% at 90% 7%, rgba(0, 174, 125, 0.28) 0%, transparent 76%), radial-gradient(135% 42% at 8% 36%, rgba(0, 174, 125, 0.22) 0%, transparent 76%), radial-gradient(130% 42% at 92% 68%, rgba(207, 231, 205, 0.14) 0%, transparent 76%), radial-gradient(135% 46% at 12% 94%, rgba(0, 174, 125, 0.22) 0%, transparent 78%), linear-gradient(165deg, #042118 0%, #050C09 34%, #072E22 64%, #040907 100%)',
      cardSurface: '#071510',
      cardBorder: 'rgba(0, 174, 125, 0.24)',
      cardTopWash:
        'radial-gradient(85% 110% at 85% 0%, rgba(0, 174, 125, 0.22) 0%, transparent 74%), radial-gradient(85% 110% at 15% 100%, rgba(207, 231, 205, 0.14) 0%, transparent 74%)',
      ambientGlow: 'rgba(0, 174, 125, 0.26)',
      pageNumberColor: '#CFE7CD',
      verseColors: ['#F5F5F7'],
      medallionFill: 'rgba(8, 38, 28, 0.74)',
      medallionStroke: '#00AE7D',
      medallionText: '#CFE7CD',
      medallionAltFill: 'rgba(6, 29, 21, 0.74)',
      medallionAltStroke: '#CFE7CD',
      medallionAltText: '#CFE7CD',
      selectionBg: 'rgba(0, 174, 125, 0.24)',
      bookmarkBg: 'rgba(207, 231, 205, 0.14)',
      selectionUnderline: 'rgba(0, 174, 125, 0.58)',
      selectionAccent: '#00AE7D',
      selectionText: '#CFE7CD',
      selectionGlow: 'rgba(0, 174, 125, 0.40)',
      barSurface: 'rgba(16, 26, 22, 0.42)',
      barSolidSurface: '#1C1C1E',
      barBorder: 'rgba(255, 255, 255, 0.18)',
      barText: '#F5F5F7',
      barMutedText: 'rgba(235, 235, 245, 0.70)',
      barControlBg: 'rgba(255, 255, 255, 0.12)',
      ornamentPrimary: '#00AE7D',
      ornamentSecondary: '#CFE7CD',
      ornamentAccent: '#00AE7D',
      duaHeadingColor: '#CFE7CD',
      duaTextColor: '#F5F5F7',
      duaDividerColor: '#00AE7D',
    },
  },
};

