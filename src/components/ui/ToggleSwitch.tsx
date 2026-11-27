import React from 'react';
import {ThemeMode} from '../../hooks/useReadingPreferences';

interface ToggleSwitchProps {
  checked: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  accentColor: string;
  theme: ThemeMode;
  titleColor?: string;
  subtitleColor?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onToggle,
  title,
  subtitle,
  accentColor,
  theme,
  titleColor = 'var(--color-text-primary)',
  subtitleColor = 'var(--color-text-secondary)',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between gap-3 cursor-pointer active:opacity-85 transition-opacity text-start"
    >
      <div className="min-w-0">
        <div
          className="font-editorial text-[13.5px] font-bold"
          style={{color: titleColor}}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className="font-editorial text-[11.5px] mt-0.5 leading-relaxed"
            style={{color: subtitleColor}}
          >
            {subtitle}
          </div>
        )}
      </div>
      <span
        aria-hidden="true"
        style={{
          backgroundColor: checked
            ? accentColor
            : theme === 'dark'
              ? '#39393D'
              : '#E5E5EA',
        }}
        className="relative inline-flex items-center w-[50px] h-[30px] rounded-full p-[2px] transition-colors duration-200 shrink-0"
      >
        <span
          className={`w-[26px] h-[26px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.22)] transition-transform duration-200 ease-out ${
            checked
              ? 'rtl:-translate-x-[20px] ltr:translate-x-[20px]'
              : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
};
