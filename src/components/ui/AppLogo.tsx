import React, {useState} from 'react';
import {BookOpen} from 'lucide-react';
import {APP_LOGO_URL} from '../../data/baqarah';

interface AppLogoProps {
  size?: 'sm' | 'lg';
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'sm',
  alt = 'شعار تطبيق سورة البقرة',
}) => {
  const [hasError, setHasError] = useState(false);

  const boxClass =
    size === 'lg'
      ? 'w-16 h-16 sm:w-18 sm:h-18 rounded-[18px] sm:rounded-[20px] p-1.5 shadow-md ring-1 ring-black/[0.06]'
      : 'w-8 h-8 rounded-[10px] p-[2px] border border-black/[0.06] shadow-xs';

  const imgClass =
    size === 'lg'
      ? 'w-full h-full object-contain rounded-[14px]'
      : 'w-full h-full object-contain rounded-[8px]';

  return (
    <div
      className={`bg-white/95 flex items-center justify-center shrink-0 overflow-hidden ${boxClass}`}
    >
      {hasError ? (
        <div
          className="w-full h-full flex items-center justify-center rounded-[inherit]"
          style={{
            background:
              'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
            color: 'var(--color-brand-on-fill)',
          }}
        >
          <BookOpen className={size === 'lg' ? 'w-7 h-7' : 'w-3.5 h-3.5'} />
        </div>
      ) : (
        <img
          src={APP_LOGO_URL}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={imgClass}
        />
      )}
    </div>
  );
};
