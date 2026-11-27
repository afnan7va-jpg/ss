import React from 'react';
import {AlertCircle, CheckCircle2, Info} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastMessage {
  id: number;
  text: string;
  tone?: ToastTone;
}

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({toast}) => {
  return (
    <div
      aria-live="polite"
      className="fixed top-[calc(72px+env(safe-area-inset-top))] inset-x-4 z-50 pointer-events-none flex justify-center"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{opacity: 0, y: -10, scale: 0.96}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -8, scale: 0.96}}
            transition={{duration: 0.2, ease: [0.16, 1, 0.3, 1]}}
            role="status"
            className="pointer-events-auto ios-sheet-surface rounded-full px-4 py-2 inline-flex items-center gap-2 text-xs font-editorial font-bold max-w-[92vw]"
            style={{color: 'var(--color-text-primary)'}}
          >
            {toast.tone === 'success' ? (
              <CheckCircle2
                className="w-4 h-4 shrink-0"
                style={{color: 'var(--color-success)'}}
              />
            ) : toast.tone === 'error' ? (
              <AlertCircle
                className="w-4 h-4 shrink-0"
                style={{color: 'var(--color-danger)'}}
              />
            ) : (
              <Info
                className="w-4 h-4 shrink-0"
                style={{color: 'var(--color-brand-accent)'}}
              />
            )}
            <span className="truncate">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
