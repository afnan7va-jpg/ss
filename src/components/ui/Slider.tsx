import React from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  ariaLabel: string;
  accentPrimary: string;
  accentSecondary: string;
  thumbSize?: 'sm' | 'md';
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  disabled = false,
  onChange,
  ariaLabel,
  accentPrimary,
  accentSecondary,
  thumbSize = 'md',
}) => {
  const span = max - min;
  const pct =
    span > 0 ? Math.max(0, Math.min(100, ((value - min) / span) * 100)) : 0;

  const thumbPx = thumbSize === 'sm' ? 16 : 20;

  return (
    <div className="relative flex-1 h-9 flex items-center select-none">
      <div
        className="w-full h-1.5 rounded-full overflow-hidden relative"
        style={{backgroundColor: 'var(--apple-track-bg)'}}
      >
        <div
          className="absolute inset-y-0 start-0 rounded-full transition-[width] duration-75"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to left, ${accentPrimary}, ${accentSecondary})`,
          }}
        />
      </div>
      {!disabled && (
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.24),0_0_0_0.5px_rgba(0,0,0,0.08)]"
          style={{
            width: `${thumbPx}px`,
            height: `${thumbPx}px`,
            insetInlineStart: `calc(${pct}% - ${(pct / 100) * thumbPx}px)`,
          }}
        />
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 disabled:cursor-default"
      />
    </div>
  );
};
