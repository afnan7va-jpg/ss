export type TajweedCategory =
  | 'base'
  | 'madd'
  | 'maddArid'
  | 'maddTabii'
  | 'ghunnah'
  | 'ikhfa'
  | 'iqlab'
  | 'qalqalah'
  | 'silent';

export interface TajweedSegment {
  text: string;
  rule: TajweedCategory;
}

const ARABIC_DIACRITICS_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED]/;

const QALQALAH_LETTERS = new Set(['ق', 'ط', 'ب', 'ج', 'د']);
const IDGHAM_GHUNNAH_LETTERS = new Set(['ي', 'ن', 'م', 'و']);
const IDGHAM_NO_GHUNNAH_LETTERS = new Set(['ل', 'ر']);
const SUN_LETTERS = new Set([
  'ت',
  'ث',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ل',
  'ن',
]);
const IKHFA_LETTERS = new Set([
  'ت',
  'ث',
  'ج',
  'د',
  'ذ',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ف',
  'ق',
  'ك',
]);

const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const SHADDA = '\u0651';
const MADDAH = '\u0653';
const DAGGER_ALIF = '\u0670';
const SUKUN_UTHMANI = '\u06E1';
const HIGH_MEEM_IQLAB = '\u06E2';
const LOW_MEEM_IQLAB = '\u06ED';
const SMALL_WAW_SILAH = '\u06E5';
const SMALL_YAA_SILAH = '\u06E6';
const SILENT_ZEROS = ['\u0652', '\u06DF', '\u06E0'];
const TANWEEN_FATH_MARKS = ['\u064B', '\u0657'];
const TANWEEN_MARKS = ['\u064B', '\u064C', '\u064D', '\u0656', '\u0657', '\u065E'];
const VOWEL_MARKS = [FATHA, DAMMA, KASRA, DAGGER_ALIF, ...TANWEEN_MARKS];
const WAQF_MARKS_RE = /[\u06D6-\u06DC]/g;

interface LetterUnit {
  base: string;
  marks: string;
  raw: string;
  rule: TajweedCategory;
}

function splitIntoLetterUnits(word: string): LetterUnit[] {
  const units: LetterUnit[] = [];
  for (const ch of word) {
    if (ARABIC_DIACRITICS_RE.test(ch) && units.length > 0) {
      units[units.length - 1].marks += ch;
      units[units.length - 1].raw += ch;
    } else {
      units.push({base: ch, marks: '', raw: ch, rule: 'base'});
    }
  }
  return units;
}

function hasAny(str: string, chars: string[]): boolean {
  return chars.some((c) => str.includes(c));
}

function isArabicBaseLetter(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (code >= 0x0621 && code <= 0x064a) || ch === 'ٱ';
}

function getFirstPhoneticLetterOfWord(units: LetterUnit[]): LetterUnit | null {
  for (const u of units) {
    if (u.base === '۞' || u.base === 'ٱ') continue;
    if (isArabicBaseLetter(u.base)) return u;
  }
  return null;
}

function isAllahLigatureLam(units: LetterUnit[], index: number): boolean {
  const cur = units[index];
  const next = units[index + 1];
  const afterNext = units[index + 2];
  return (
    cur?.base === 'ل' &&
    next?.base === 'ل' &&
    next.marks.includes(SHADDA) &&
    afterNext?.base === 'ه'
  );
}

const verseCache = new Map<string, TajweedSegment[]>();

export function analyzeVerseTajweed(verseText: string): TajweedSegment[] {
  const cached = verseCache.get(verseText);
  if (cached) return cached;

  const words = verseText.split(' ');
  const wordUnits = words.map(splitIntoLetterUnits);

  for (let wIdx = 0; wIdx < wordUnits.length; wIdx++) {
    const units = wordUnits[wIdx];
    const nextUnits = wIdx + 1 < wordUnits.length ? wordUnits[wIdx + 1] : null;
    const nextWordStartsWithWasl = nextUnits?.[0]?.base === 'ٱ';
    const nextWordFirst = nextUnits ? getFirstPhoneticLetterOfWord(nextUnits) : null;

    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      const prevInWord = i > 0 ? units[i - 1] : null;
      const nextInWord = i + 1 < units.length ? units[i + 1] : null;
      const nextEffective = nextInWord ?? nextWordFirst;
      const isWordEnd = i === units.length - 1;
      const cleanMarks = u.marks.replace(WAQF_MARKS_RE, '');

      // 1. Madd 4-6 harakat (Lazim, Wajib Muttasil, Jaiz Munfasil, Silah Kubra)
      if (u.base === 'آ' || (u.marks.includes(MADDAH) && u.base !== 'أ')) {
        u.rule = 'madd';
        if (prevInWord && prevInWord.base === 'ل' && prevInWord.rule === 'base') {
          prevInWord.rule = 'madd';
        }
        continue;
      }

      // 2. Mad Badal (2 harakat: أٓ in لِأٓدَمَ / ٱلۡأٓخِرَةِ, or ءَا in ءَامَنَّا)
      if (u.base === 'أ' && u.marks.includes(MADDAH)) {
        u.rule = 'maddTabii';
        continue;
      }
      if (u.base === 'ا' && cleanMarks.length === 0 && prevInWord?.base === 'ء' && prevInWord.marks.includes(FATHA)) {
        u.rule = 'maddTabii';
        continue;
      }

      // 3. Explicit silent letters (Alif Fariqah / silent Waw / Ana zero)
      if (hasAny(u.marks, SILENT_ZEROS)) {
        u.rule = 'silent';
        continue;
      }

      // 4. Hamzat Wasl (ٱ) when preceded by another letter or word (silent in connected reading)
      if (u.base === 'ٱ' && (wIdx > 0 || i > 0)) {
        u.rule = 'silent';
        continue;
      }

      // 5. Silent trailing Alif or Alif Maqsura carrier after Fathatan in wasl
      if (
        (u.base === 'ا' || u.base === 'ى') &&
        cleanMarks.length === 0 &&
        prevInWord &&
        hasAny(prevInWord.marks, TANWEEN_FATH_MARKS) &&
        wIdx < wordUnits.length - 1
      ) {
        u.rule = 'silent';
        continue;
      }

      // 6. Iqlab explicitly marked in Uthmani Unicode (High/Low Meem)
      if (u.marks.includes(HIGH_MEEM_IQLAB) || u.marks.includes(LOW_MEEM_IQLAB)) {
        u.rule = 'iqlab';
        continue;
      }

      // 7. Shaddah on Noon or Meem -> Ghunnah (2 harakat)
      if ((u.base === 'ن' || u.base === 'م') && u.marks.includes(SHADDA)) {
        u.rule = 'ghunnah';
        continue;
      }

      // 8. Qalqalah: (ق ط ب ج د) with Uthmani sukun
      if (QALQALAH_LETTERS.has(u.base) && u.marks.includes(SUKUN_UTHMANI)) {
        u.rule = 'qalqalah';
        continue;
      }

      // 9. Noon Sakinah without sukun/vowels
      if (
        u.base === 'ن' &&
        !u.marks.includes(SUKUN_UTHMANI) &&
        !u.marks.includes(SHADDA) &&
        !hasAny(u.marks, VOWEL_MARKS) &&
        nextEffective
      ) {
        if (nextEffective.base === 'ب') {
          u.rule = 'iqlab';
        } else if (isWordEnd && IDGHAM_GHUNNAH_LETTERS.has(nextEffective.base)) {
          u.rule = 'ghunnah';
        } else if (isWordEnd && IDGHAM_NO_GHUNNAH_LETTERS.has(nextEffective.base)) {
          u.rule = 'silent';
        } else if (IKHFA_LETTERS.has(nextEffective.base)) {
          u.rule = 'ikhfa';
        }
        continue;
      }

      // 10. Meem Sakinah without sukun at word end
      if (
        u.base === 'م' &&
        isWordEnd &&
        !u.marks.includes(SUKUN_UTHMANI) &&
        !u.marks.includes(SHADDA) &&
        !hasAny(u.marks, VOWEL_MARKS) &&
        nextWordFirst
      ) {
        if (nextWordFirst.base === 'ب') {
          u.rule = 'ikhfa';
        } else if (nextWordFirst.base === 'م') {
          u.rule = 'ghunnah';
        }
        continue;
      }

      // 11. Tanween before next word's first letter
      if (hasAny(u.marks, TANWEEN_MARKS) && nextWordFirst) {
        if (nextWordFirst.base === 'ب') {
          u.rule = 'iqlab';
        } else if (IDGHAM_GHUNNAH_LETTERS.has(nextWordFirst.base)) {
          u.rule = 'ghunnah';
        } else if (IDGHAM_NO_GHUNNAH_LETTERS.has(nextWordFirst.base)) {
          u.rule = 'silent';
        } else if (IKHFA_LETTERS.has(nextWordFirst.base)) {
          u.rule = 'ikhfa';
        }
        continue;
      }

      // 12. Lam Shamsiyyah (bare ل before Sun letter with Shadda, excluding Allah ligature)
      if (
        u.base === 'ل' &&
        !u.marks.includes(SUKUN_UTHMANI) &&
        !u.marks.includes(SHADDA) &&
        !hasAny(u.marks, VOWEL_MARKS) &&
        nextInWord &&
        SUN_LETTERS.has(nextInWord.base) &&
        nextInWord.marks.includes(SHADDA) &&
        !isAllahLigatureLam(units, i)
      ) {
        u.rule = 'silent';
        continue;
      }

      // 13. Idgham Mutamathilayn / Mutajanisayn / Mutaqaribayn without Ghunnah
      const isBareConsonant =
        !u.marks.includes(SUKUN_UTHMANI) &&
        !u.marks.includes(SHADDA) &&
        !hasAny(u.marks, VOWEL_MARKS) &&
        !hasAny(u.marks, SILENT_ZEROS);
      if (isBareConsonant && nextEffective) {
        if (
          (u.base === 'ت' && ['ت', 'د', 'ط'].includes(nextEffective.base)) ||
          (u.base === 'د' && nextEffective.base === 'ت') ||
          (u.base === 'ب' && nextEffective.base === 'ب') ||
          (u.base === 'ل' && ['ل', 'ر'].includes(nextEffective.base) && !isAllahLigatureLam(units, i)) ||
          (u.base === 'ذ' && nextEffective.base === 'ظ') ||
          (u.base === 'ث' && nextEffective.base === 'ذ')
        ) {
          u.rule = 'silent';
          continue;
        }
      }

      // 14. Natural Madd (2 harakat) & Madd Silah Sughra & Dagger Alif
      const dropsBeforeWasl = isWordEnd && nextWordStartsWithWasl;
      const dropsAfterSilentAlifWasl =
        i === units.length - 2 && nextInWord?.base === 'ا' && hasAny(nextInWord.marks, SILENT_ZEROS) && nextWordStartsWithWasl;

      if (!dropsBeforeWasl && !dropsAfterSilentAlifWasl) {
        // Dagger Alif (ذَٰلِكَ, ٱلصَّلَوٰةَ, عَلَىٰ) or Madd Silah Sughra (بِهِۦ, لَهُۥ)
        if (
          u.marks.includes(DAGGER_ALIF) ||
          u.marks.includes(SMALL_WAW_SILAH) ||
          u.marks.includes(SMALL_YAA_SILAH)
        ) {
          u.rule = 'maddTabii';
          continue;
        }

        // Plain Alif Madd after Fatha (not after Tanween, not bearing hamza/vowels)
        if (
          u.base === 'ا' &&
          cleanMarks.length === 0 &&
          prevInWord &&
          prevInWord.marks.includes(FATHA) &&
          !hasAny(prevInWord.marks, TANWEEN_MARKS)
        ) {
          u.rule = 'maddTabii';
          continue;
        }

        // Plain Waw Madd after Damma
        if (
          u.base === 'و' &&
          cleanMarks.length === 0 &&
          prevInWord &&
          prevInWord.marks.includes(DAMMA)
        ) {
          u.rule = 'maddTabii';
          continue;
        }

        // Plain Yaa Madd after Kasra
        if (
          u.base === 'ي' &&
          cleanMarks.length === 0 &&
          prevInWord &&
          prevInWord.marks.includes(KASRA)
        ) {
          u.rule = 'maddTabii';
          continue;
        }
      }
    }
  }

  // 15. Madd 'Arid lil-Sukun (2-4-6 harakat at verse ending)
  if (wordUnits.length > 0) {
    const lastWord = wordUnits[wordUnits.length - 1];
    const n = lastWord.length;
    if (n >= 3) {
      const pen = lastWord[n - 2];
      const prev = lastWord[n - 3];
      const isMaddYaa = pen.base === 'ي' && !pen.marks && prev.marks.includes(KASRA);
      const isMaddWaw = pen.base === 'و' && !pen.marks && prev.marks.includes(DAMMA);
      const isMaddAlif = pen.base === 'ا' && !pen.marks && prev.marks.includes(FATHA);
      const isDaggerAlif = pen.marks.includes(DAGGER_ALIF) && !pen.marks.includes(MADDAH);
      if (
        (isMaddYaa || isMaddWaw || isMaddAlif || isDaggerAlif) &&
        (pen.rule === 'base' || pen.rule === 'maddTabii')
      ) {
        pen.rule = 'maddArid';
      }
    }
  }

  const segments: TajweedSegment[] = [];

  for (let wIdx = 0; wIdx < wordUnits.length; wIdx++) {
    const units = wordUnits[wIdx];
    for (const u of units) {
      if (segments.length > 0 && segments[segments.length - 1].rule === u.rule) {
        segments[segments.length - 1].text += u.raw;
      } else {
        segments.push({text: u.raw, rule: u.rule});
      }
    }

    if (wIdx < wordUnits.length - 1) {
      if (segments.length > 0) {
        segments[segments.length - 1].text += ' ';
      } else {
        segments.push({text: ' ', rule: 'base'});
      }
    }
  }

  verseCache.set(verseText, segments);
  return segments;
}

export const TAJWEED_COLORS: Record<
  'light' | 'dark',
  Record<Exclude<TajweedCategory, 'base'>, string>
> = {
  light: {
    madd: '#B91C1C',
    maddArid: '#92400E',
    maddTabii: '#0369A1',
    ghunnah: '#166534',
    ikhfa: '#6B21A8',
    iqlab: '#1E3A8A',
    qalqalah: '#C2410C',
    silent: '#0F766E',
  },
  dark: {
    madd: '#F54C91',
    maddArid: '#F7DC00',
    maddTabii: '#00BCD6',
    ghunnah: '#C4E02F',
    ikhfa: '#B696E3',
    iqlab: '#99ADFF',
    qalqalah: '#FFA547',
    silent: '#FFA9DD',
  },
};

export const TAJWEED_LEGEND: Array<{
  rule: Exclude<TajweedCategory, 'base'>;
  shortLabel: string;
  label: string;
  description: string;
}> = [
  {
    rule: 'madd',
    shortLabel: 'مد ٤–٦',
    label: 'المد الواجب والمنفصل واللازم',
    description: 'المدود الفرعية ٤ إلى ٦ حركات (اللازم والمتصل والمنفصل والصلة الكبرى)',
  },
  {
    rule: 'maddArid',
    shortLabel: 'مد عارض',
    label: 'المد العارض للسكون',
    description: 'يمد ٢ أو ٤ أو ٦ حركات عند الوقف على رؤوس الآيات',
  },
  {
    rule: 'maddTabii',
    shortLabel: 'مد طبيعي',
    label: 'المد الطبيعي والبدل والصلة',
    description: 'الألف والواو والياء المدّية والألف الخنجرية ومد الصلة الصغرى حركتين',
  },
  {
    rule: 'ghunnah',
    shortLabel: 'غنة وإدغام',
    label: 'الغُنّة والإدغام بغنة',
    description: 'النون والميم المشددتان وإدغام النون أو التنوين في (ينمو) والميم في الميم',
  },
  {
    rule: 'ikhfa',
    shortLabel: 'إخفاء',
    label: 'الإخفاء الحقيقي والشفوي',
    description: 'إخفاء النون الساكنة والتنوين عند حروف الإخفاء والميم الساكنة عند الباء',
  },
  {
    rule: 'iqlab',
    shortLabel: 'إقلاب',
    label: 'الإقلاب',
    description: 'قلب النون الساكنة أو التنوين ميمًا مُخفاةً عند الباء بغنة حركتين',
  },
  {
    rule: 'qalqalah',
    shortLabel: 'قلقلة',
    label: 'القلقلة',
    description: 'اضطراب المخرج عند النطق بأحد حروف (ق ط ب ج د) الساكنة',
  },
  {
    rule: 'silent',
    shortLabel: 'لا يُلفظ',
    label: 'لا يُلفظ / إدغام بلا غنة',
    description: 'همزة الوصل وصلاً، اللام الشمسية، الحروف الصامتة، وإدغام النون في (ل ر)',
  },
];
