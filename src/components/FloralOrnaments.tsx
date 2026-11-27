import React from 'react';
import {ThemePalette, toArabicIndic} from '../data/baqarah';

interface AyahRosetteProps {
  verseNumber: number;
  palette: ThemePalette;
  theme?: 'light' | 'dark';
  alternate?: boolean;
  isPlaying?: boolean;
  isBookmarked?: boolean;
}

const ROSETTE_PATH_8 = (() => {
  const cx = 22;
  const cy = 22;
  const petals = 8;
  const rValley = 16.2;
  const rControl = 23.2;
  const offset = -Math.PI / 2 - Math.PI / petals;
  const parts: string[] = [];

  for (let i = 0; i < petals; i++) {
    const a1 = (i * 2 * Math.PI) / petals + offset;
    const aMid = ((i + 0.5) * 2 * Math.PI) / petals + offset;
    const a2 = ((i + 1) * 2 * Math.PI) / petals + offset;

    const x1 = cx + rValley * Math.cos(a1);
    const y1 = cy + rValley * Math.sin(a1);
    const xm = cx + rControl * Math.cos(aMid);
    const ym = cy + rControl * Math.sin(aMid);
    const x2 = cx + rValley * Math.cos(a2);
    const y2 = cy + rValley * Math.sin(a2);

    if (i === 0) {
      parts.push(`M ${x1.toFixed(2)} ${y1.toFixed(2)}`);
    }
    parts.push(`Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  parts.push('Z');
  return parts.join(' ');
})();

const CARTOUCHE_PATH_10 = (() => {
  const cx = 28;
  const cy = 22;
  const petals = 10;
  const rxValley = 22.8;
  const ryValley = 16.0;
  const rxControl = 29.8;
  const ryControl = 23.0;
  const offset = -Math.PI / 2 - Math.PI / petals;
  const parts: string[] = [];

  for (let i = 0; i < petals; i++) {
    const a1 = (i * 2 * Math.PI) / petals + offset;
    const aMid = ((i + 0.5) * 2 * Math.PI) / petals + offset;
    const a2 = ((i + 1) * 2 * Math.PI) / petals + offset;

    const x1 = cx + rxValley * Math.cos(a1);
    const y1 = cy + ryValley * Math.sin(a1);
    const xm = cx + rxControl * Math.cos(aMid);
    const ym = cy + ryControl * Math.sin(aMid);
    const x2 = cx + rxValley * Math.cos(a2);
    const y2 = cy + ryValley * Math.sin(a2);

    if (i === 0) {
      parts.push(`M ${x1.toFixed(2)} ${y1.toFixed(2)}`);
    }
    parts.push(`Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  parts.push('Z');
  return parts.join(' ');
})();

export const AyahRosette: React.FC<AyahRosetteProps> = React.memo(
  ({verseNumber, palette, alternate = false, isPlaying = false, isBookmarked = false}) => {
    const label = toArabicIndic(verseNumber);
    const isThreeDigits = label.length >= 3;
    const isTwoDigits = label.length === 2;

    const boxWidth = isThreeDigits ? '2.04em' : isTwoDigits ? '1.68em' : '1.56em';
    const boxHeight = '1.56em';
    const textEm = isThreeDigits ? '0.62em' : isTwoDigits ? '0.69em' : '0.76em';

    const isHighlighted = isBookmarked || isPlaying;
    const pathData = isThreeDigits ? CARTOUCHE_PATH_10 : ROSETTE_PATH_8;

    const baseFill = alternate ? palette.medallionAltFill : palette.medallionFill;
    const baseStroke = alternate ? palette.medallionAltStroke : palette.medallionStroke;
    const baseText = alternate ? palette.medallionAltText : palette.medallionText;

    const fillColor = isHighlighted ? palette.accentPrimary : baseFill;
    const strokeColor = isHighlighted ? palette.selectionAccent : baseStroke;
    const numberColor = isHighlighted ? palette.accentOnFill : baseText;

    return (
      <span
        className="ayah-rosette inline-flex items-center justify-center select-none relative"
        style={{
          width: boxWidth,
          height: boxHeight,
          marginInlineStart: '0.16em',
          marginInlineEnd: '0.12em',
          verticalAlign: 'middle',
        }}
        aria-label={`آية ${label}`}
      >
        <svg
          viewBox={isThreeDigits ? '0 0 56 44' : '0 0 44 44'}
          className="w-full h-full block overflow-visible"
          fill="none"
          aria-hidden="true"
        >
          <path
            d={pathData}
            fill={fillColor}
            fillOpacity={isHighlighted ? 0.92 : 1}
            stroke={strokeColor}
            strokeWidth={isHighlighted ? '1.65' : '1.45'}
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center leading-none"
          style={{
            fontFamily:
              '"ThmanyahSans", -apple-system, BlinkMacSystemFont, "SF Pro Arabic", "Geeza Pro", sans-serif',
            fontWeight: 700,
            color: numberColor,
            fontSize: textEm,
            letterSpacing: isThreeDigits ? '-0.02em' : '0',
          }}
        >
          {label}
        </span>
      </span>
    );
  }
);

AyahRosette.displayName = 'AyahRosette';

interface DuaDividerProps {
  palette: ThemePalette;
}

export const DuaFloralDivider: React.FC<DuaDividerProps> = ({palette}) => (
  <div className="flex items-center justify-center gap-4 my-5 select-none" aria-hidden="true">
    <div
      className="h-[1px] w-20 sm:w-32 opacity-40"
      style={{
        background: `linear-gradient(to left, ${palette.accentPrimary}, transparent)`,
      }}
    />
    <svg
      width="20"
      height="20"
      viewBox="0 0 28 28"
      fill="none"
      className="shrink-0 opacity-85"
    >
      <rect
        x="7.5"
        y="7.5"
        width="13"
        height="13"
        rx="2"
        stroke={palette.accentPrimary}
        strokeWidth="1.35"
      />
      <rect
        x="7.5"
        y="7.5"
        width="13"
        height="13"
        rx="2"
        transform="rotate(45 14 14)"
        stroke={palette.accentSecondary}
        strokeWidth="1.35"
      />
      <circle cx="14" cy="14" r="1.9" fill={palette.selectionAccent} />
    </svg>
    <div
      className="h-[1px] w-20 sm:w-32 opacity-40"
      style={{
        background: `linear-gradient(to right, ${palette.accentSecondary}, transparent)`,
      }}
    />
  </div>
);
