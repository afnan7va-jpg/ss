import React, {useState} from 'react';
import {X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {PAGE_THEMES} from '../data/baqarah';
import {ThemeMode} from '../hooks/useReadingPreferences';
import {
  TAJWEED_COLORS,
  TAJWEED_LEGEND,
  TajweedCategory,
} from '../utils/tajweed';

interface TajweedLegendBarProps {
  visible: boolean;
  currentPage: number;
  theme: ThemeMode;
}

export const TajweedLegendBar: React.FC<TajweedLegendBarProps> = ({
  visible,
  currentPage,
  theme,
}) => {
  const [selectedRule, setSelectedRule] = useState<
    Exclude<TajweedCategory, 'base'> | null
  >(null);

  if (!visible) return null;

  const palette = (PAGE_THEMES[currentPage] ?? PAGE_THEMES[1])[theme];
  const tajweedColors = TAJWEED_COLORS[theme];
  const activeItem = selectedRule
    ? TAJWEED_LEGEND.find((item) => item.rule === selectedRule) ?? null
    : null;

  return (
    <div
      aria-label="دليل ألوان أحكام التجويد"
      className="fixed top-[calc(51px+env(safe-area-inset-top))] sm:top-[calc(62px+env(safe-area-inset-top))] inset-x-2.5 sm:inset-x-5 z-30 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-[1200px] mx-auto rounded-[16px] sm:rounded-[18px] ios-glass-bar overflow-hidden">
        <div className="h-[32px] sm:h-[38px] px-2.5 sm:px-5 flex items-center md:justify-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
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
                style={{color: palette.barText}}
                className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] sm:text-[11.5px] font-editorial font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                  isSelected
                    ? 'ios-liquid-pill font-bold'
                    : 'hover:bg-black/[0.04] dark:hover:bg-white/10'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-line readable rule explanation sheetlet */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{opacity: 0, y: -6, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -6, scale: 0.98}}
            transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
            className="max-w-[680px] mx-auto px-2 pt-2 flex justify-center"
          >
            <div
              role="status"
              style={{
                color: palette.barText,
              }}
              className="pointer-events-auto ios-sheet-surface rounded-[18px] px-4 py-2.5 flex items-start sm:items-center gap-2.5 text-xs font-editorial max-w-full"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 sm:mt-0"
                style={{backgroundColor: tajweedColors[activeItem.rule]}}
              />
              <div className="flex-1 min-w-0 leading-relaxed text-start">
                <span className="font-bold me-1.5 whitespace-nowrap">
                  {activeItem.label}:
                </span>
                <span style={{color: palette.barMutedText}}>
                  {activeItem.description}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                aria-label="إغلاق الشرح"
                style={{color: palette.barMutedText}}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/10 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
