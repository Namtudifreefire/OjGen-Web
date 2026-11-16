import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from '../../i18n';

/**
 * Unified Modal Component - Consistent modal styling and behavior
 */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles = {
  sm: 'max-w-md',      // 28rem = 448px
  md: 'max-w-2xl',     // 42rem = 672px
  lg: 'max-w-4xl',     // 56rem = 896px
  xl: 'max-w-6xl',     // 72rem = 1152px
  full: 'max-w-[95vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  style,
}) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      // Focus trap - focus first focusable element
      setTimeout(() => {
        const focusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 0);
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !closeOnEscape) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--modal-backdrop)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-4)',
    zIndex: 'var(--z-modal-backdrop)',
    animation: 'fadeIn 150ms ease',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--modal-bg)',
    border: '1px solid var(--modal-border)',
    borderRadius: 'var(--modal-radius)',
    boxShadow: 'var(--modal-shadow)',
    maxWidth: 'var(--modal-max-width)',
    maxHeight: 'var(--modal-max-height)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 200ms ease',
    ...style,
  };

  return (
    <div
      style={overlayStyle}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        style={modalStyle}
        className={`${sizeStyles[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: 'var(--spacing-4) var(--spacing-6)',
            borderBottom: '1px solid var(--surface-border)',
            backgroundColor: 'var(--surface-overlay)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 id="modal-title" style={{
              margin: 0,
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--surface-text-primary)',
              lineHeight: '1.4',
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{
                margin: 'var(--spacing-1) 0 0 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--surface-text-secondary)',
                lineHeight: '1.4',
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-default)',
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
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: 'var(--spacing-6)',
            overflow: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-4) var(--spacing-6)',
              borderTop: '1px solid var(--surface-border)',
              backgroundColor: 'var(--surface-overlay)',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Confirmation dialog modal
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary',
  loading = false,
}) => {
  const variantMap = {
    danger: { btnVariant: 'danger' as const, iconColor: 'var(--color-error)' },
    primary: { btnVariant: 'primary' as const, iconColor: 'var(--color-primary-600)' },
    warning: { btnVariant: 'warning' as const, iconColor: 'var(--color-warning)' },
  };

  const { btnVariant, iconColor } = variantMap[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={btnVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: `${iconColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g>
              {variant === 'danger' && (
                <g>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </g>
              )}
              {variant === 'warning' && (
                <g>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </g>
              )}
              {variant === 'primary' && (
                <g>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </g>
              )}
            </g>
          </svg>
        </div>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--surface-text-secondary)',
          lineHeight: '1.5',
          flex: 1,
        }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

/**
 * Simple alert modal
 */
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
}) => {
  const variantConfig = {
    success: { bg: 'var(--color-success-light)', color: 'var(--color-success-dark)', icon: 'var(--color-success)' },
    error: { bg: 'var(--color-error-light)', color: 'var(--color-error-dark)', icon: 'var(--color-error)' },
    warning: { bg: 'var(--color-warning-light)', color: 'var(--color-warning-dark)', icon: 'var(--color-warning)' },
    info: { bg: 'var(--color-info-light)', color: 'var(--color-info-dark)', icon: 'var(--color-info)' },
  }[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Button variant="primary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: `${variantConfig.icon}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={variantConfig.icon}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Success */}
            <g>
              {variant === 'success' && (
                <g>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M9 11l3 3L22 4" />
                </g>
              )}
              {variant === 'error' && (
                <g>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </g>
              )}
              {variant === 'warning' && (
                <g>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </g>
              )}
              {variant === 'info' && (
                <g>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </g>
              )}
            </g>
          </svg>
        </div>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--surface-text-secondary)',
          lineHeight: '1.5',
          flex: 1,
        }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};
