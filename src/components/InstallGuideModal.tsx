import React from 'react';
import {ExternalLink, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {AppLogo} from './ui/AppLogo';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const appUrl = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.14}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/28 backdrop-blur-sm p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
          onClick={onClose}
        >
          <motion.div
            initial={{opacity: 0, scale: 0.97, y: 8}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.97, y: 8}}
            transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
            className="ios-sheet-surface relative w-full max-w-md max-h-[88vh] overflow-y-auto apple-inner-scroll rounded-[28px] p-5 sm:p-7 text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="ios-liquid-pill absolute top-4 end-4 sm:top-5 sm:end-5 w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-neutral-700 dark:text-neutral-200 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2.1} />
            </button>

            <div
              className="flex flex-col items-center text-center pb-5 border-b"
              style={{borderColor: 'var(--apple-divider)'}}
            >
              <div className="mb-3.5">
                <AppLogo size="lg" alt="شعار تطبيق Surah Al-Baqarah" />
              </div>
              <h2
                id="install-guide-title"
                className="font-editorial text-lg sm:text-xl font-bold mb-1 [text-wrap:balance]"
              >
                تثبيت «<bdi dir="ltr">Surah Al-Baqarah</bdi>»
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-[30ch]">
                أضف التطبيق إلى الشاشة الرئيسية أو شريط{' '}
                <bdi dir="ltr">Dock</bdi> للقراءة الهادئة بدون إنترنت
              </p>
            </div>

            {isInIframe && (
              <div
                className="py-4 border-b text-center"
                style={{borderColor: 'var(--apple-divider)'}}
              >
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-3 leading-relaxed">
                  للتثبيت المباشر، افتح التطبيق أولًا في نافذة متصفح مستقلة خارج إطار المعاينة:
                </p>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'var(--color-brand-primary)',
                    color: 'var(--color-brand-on-fill)',
                  }}
                  className="inline-flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-editorial font-bold hover:opacity-92 active:scale-[0.99] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح التطبيق في نافذة مستقلة للتثبيت</span>
                </a>
              </div>
            )}

            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.10] text-sm leading-relaxed text-start">
              <div className="py-3.5">
                <p className="font-bold mb-1.5 text-neutral-900 dark:text-neutral-100">
                  على <bdi dir="ltr">iPhone</bdi> و <bdi dir="ltr">iPad</bdi> (متصفح{' '}
                  <bdi dir="ltr">Safari</bdi>)
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                  <li>
                    اضغط على أيقونة «مشاركة» (<bdi dir="ltr">Share</bdi>) أسفل أو أعلى متصفح{' '}
                    <bdi dir="ltr">Safari</bdi>.
                  </li>
                  <li>
                    اختر «إضافة إلى الصفحة الرئيسية» (<bdi dir="ltr">Add to Home Screen</bdi>).
                  </li>
                  <li>
                    اضغط «إضافة» (<bdi dir="ltr">Add</bdi>) ليظهر التطبيق على شاشتك الرئيسية.
                  </li>
                </ol>
              </div>

              <div className="py-3.5">
                <p className="font-bold mb-1.5 text-neutral-900 dark:text-neutral-100">
                  على <bdi dir="ltr">Mac</bdi> (متصفح <bdi dir="ltr">Safari</bdi>)
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                  <li>
                    افتح قائمة «ملف» (<bdi dir="ltr">File</bdi>) في شريط{' '}
                    <bdi dir="ltr">macOS</bdi> العلوي.
                  </li>
                  <li>
                    اختر «إضافة إلى شريط <bdi dir="ltr">Dock</bdi>» (
                    <bdi dir="ltr">Add to Dock</bdi>).
                  </li>
                  <li>
                    اضغط «إضافة» (<bdi dir="ltr">Add</bdi>) ليظهر التطبيق في شريط{' '}
                    <bdi dir="ltr">Dock</bdi>.
                  </li>
                </ol>
              </div>

              <div className="pt-3.5">
                <p className="font-bold mb-1 text-neutral-900 dark:text-neutral-100">
                  في متصفح <bdi dir="ltr">Chrome</bdi> أو <bdi dir="ltr">Edge</bdi>
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  اضغط على زر «تثبيت» داخل التطبيق أو أيقونة التثبيت في شريط العنوان أعلى المتصفح.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
