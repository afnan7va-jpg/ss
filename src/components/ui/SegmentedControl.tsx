import React from 'react';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  title?: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  className?: string;
  itemClassName?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  activeTextColor = 'var(--color-text-primary)',
  inactiveTextColor = 'var(--color-text-secondary)',
  className = '',
  itemClassName = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`grid gap-1 p-[3px] rounded-[12px] ${className}`}
      style={{
        backgroundColor: 'var(--apple-track-bg)',
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.title ?? opt.label}
            onClick={() => onChange(opt.id)}
            style={{
              color: active ? activeTextColor : inactiveTextColor,
            }}
            className={`min-h-[36px] px-2 sm:px-3 rounded-[9px] inline-flex items-center justify-center gap-1.5 text-[11.5px] sm:text-xs font-editorial font-bold transition-all duration-150 ease-out cursor-pointer tabular-nums whitespace-nowrap ${
              active ? 'ios-segment-active' : 'hover:opacity-85'
            } ${itemClassName}`}
          >
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
