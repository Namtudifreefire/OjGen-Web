import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useTranslation } from '../../i18n';

/**
 * Toast Notification System
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const typeConfig = {
  success: {
    bg: 'var(--color-success-light)',
    border: 'var(--color-success)',
    iconColor: 'var(--color-success)',
    icon: CheckCircle2,
  },
  error: {
    bg: 'var(--color-error-light)',
    border: 'var(--color-error)',
    iconColor: 'var(--color-error)',
    icon: AlertCircle,
  },
  warning: {
    bg: 'var(--color-warning-light)',
    border: 'var(--color-warning)',
    iconColor: 'var(--color-warning)',
    icon: AlertCircle,
  },
  info: {
    bg: 'var(--color-info-light)',
    border: 'var(--color-info)',
    iconColor: 'var(--color-info)',
    icon: Info,
  },
};

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { t } = useTranslation();
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration ?? 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const toastStyle: React.CSSProperties = {
    backgroundColor: config.bg,
    border: `1px solid ${config.border}`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '300px',
    maxWidth: '420px',
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    animation: 'slideIn 300ms ease',
  };

  return (
    <div style={toastStyle} role="alert" aria-live="polite">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: `${config.iconColor}20`,
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        <Icon className="w-4 h-4" style={{ color: config.iconColor }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--surface-text-primary)',
          lineHeight: '1.4',
        }}>
          {toast.title}
        </p>
        {toast.description && (
          <p style={{
            margin: 'var(--spacing-1) 0 0 0',
            fontSize: 'var(--text-xs)',
            color: 'var(--surface-text-secondary)',
            lineHeight: '1.4',
          }}>
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => { toast.action?.onClick(); onClose(toast.id); }}
            style={{
              marginTop: 'var(--spacing-2)',
              padding: 'var(--spacing-1) var(--spacing-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: config.iconColor,
              backgroundColor: 'transparent',
              border: `1px solid ${config.iconColor}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = config.iconColor;
              e.currentTarget.style.color = 'var(--surface-text-on-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = config.iconColor;
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--surface-text-muted)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          e.currentTarget.style.color = 'var(--surface-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--surface-text-muted)';
        }}
        aria-label={t('buttons.close')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
}) => {
  const positionStyles = {
    'top-right': { top: 'var(--spacing-4)', right: 'var(--spacing-4)', left: 'auto', bottom: 'auto' },
    'top-left': { top: 'var(--spacing-4)', left: 'var(--spacing-4)', right: 'auto', bottom: 'auto' },
    'bottom-right': { bottom: 'var(--spacing-4)', right: 'var(--spacing-4)', top: 'auto', left: 'auto' },
    'bottom-left': { bottom: 'var(--spacing-4)', left: 'var(--spacing-4)', top: 'auto', right: 'auto' },
    'top-center': { top: 'var(--spacing-4)', left: '50%', transform: 'translateX(-50%)', right: 'auto', bottom: 'auto' },
    'bottom-center': { bottom: 'var(--spacing-4)', left: '50%', transform: 'translateX(-50%)', top: 'auto', right: 'auto' },
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 'var(--z-toast)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    pointerEvents: 'none',
    maxWidth: 'calc(100vw - 32px)',
    ...positionStyles[position],
  };

  return (
    <div style={containerStyle} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

/**
 * Hook for using toasts in components
 */
import { createContext, useContext, useCallback } from 'react';

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev.slice(-4), newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};