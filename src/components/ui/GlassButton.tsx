import React from 'react';
import {Loader2} from 'lucide-react';

export type GlassButtonVariant = 'primary' | 'secondary' | 'ghost' | 'pill';
export type GlassButtonSize = 'sm' | 'md' | 'icon';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  loading?: boolean;
  accentBg?: string;
  accentColor?: string;
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'pill',
  size = 'md',
  loading = false,
  accentBg,
  accentColor,
  className = '',
  style,
  disabled,
  type = 'button',
  children,
  ...props
}) => {
  const sizeClass =
    size === 'icon'
      ? 'w-11 h-11 sm:w-9 sm:h-9 rounded-full p-0'
      : size === 'sm'
        ? 'min-h-[36px] px-3 py-1.5 rounded-full text-xs'
        : 'min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-[13px]';

  const variantClass =
    variant === 'primary'
      ? 'shadow-sm hover:opacity-92'
      : variant === 'secondary'
        ? 'ios-liquid-tile hover:opacity-90'
        : variant === 'ghost'
          ? 'hover:bg-black/[0.05] dark:hover:bg-white/10'
          : 'ios-liquid-pill hover:opacity-90';

  const resolvedStyle: React.CSSProperties = {
    ...(variant === 'primary'
      ? {
          backgroundColor: accentBg ?? 'var(--color-brand-primary)',
          color: accentColor ?? 'var(--color-brand-on-fill)',
        }
      : {
          color: accentColor ?? 'var(--color-text-primary)',
        }),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      style={resolvedStyle}
      className={`inline-flex items-center justify-center gap-1.5 font-editorial font-bold whitespace-nowrap shrink-0 transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-35 disabled:pointer-events-none cursor-pointer ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : children}
    </button>
  );
};
