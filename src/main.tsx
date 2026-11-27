import {Component, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    window.location.reload();
  });

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    try {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          void updateSW(true);
        },
        onRegisterError() {
          // Ignore SW registration issues in restricted WebViews / Private Mode
        },
      });
    } catch {
      // Ignore SW errors gracefully
    }
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<{children: ReactNode}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  private handleReset = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
    } catch {
      // Ignore cleanup errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FFF6F9] text-[#4E1128]"
        >
          <p className="font-editorial text-lg font-bold mb-2">
            حدث تعارض بسيط أثناء عرض الصفحة
          </p>
          <p className="font-editorial text-sm opacity-75 mb-5">
            اضغط على الزر أدناه لإعادة تحميل المصحف بشكل سليم.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-xl font-editorial text-sm font-bold bg-[#D93B62] text-white cursor-pointer"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
