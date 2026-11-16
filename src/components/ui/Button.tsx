import React from 'react';

/**
 * Unified Button Component - Single source of truth for all button styles
 * Uses design tokens for consistency
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: 'var(--spacing-1) var(--spacing-2-5)',
    fontSize: 'var(--text-xs)',
    minHeight: '32px',
  },
  md: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    fontSize: 'var(--text-sm)',
    minHeight: '36px',
  },
  lg: {
    padding: 'var(--spacing-3) var(--spacing-5)',
    fontSize: 'var(--text-base)',
    minHeight: '44px',
  },
};

interface VariantStyleSet {
  base: React.CSSProperties;
  hover: React.CSSProperties;
  active: React.CSSProperties;
}

const variantStyles: Record<ButtonVariant, VariantStyleSet> = {
  primary: {
    base: {
      backgroundColor: 'var(--color-primary-600)',
      color: 'var(--surface-text-on-primary)',
    },
    hover: {
      backgroundColor: 'var(--color-primary-700)',
    },
    active: {
      backgroundColor: 'var(--color-primary-800)',
    },
  },
  secondary: {
    base: {
      backgroundColor: 'var(--surface-overlay)',
      color: 'var(--surface-text-primary)',
      border: '1px solid var(--surface-border)',
    },
    hover: {
      backgroundColor: 'var(--surface-hover)',
      borderColor: 'var(--surface-border-strong)',
    },
    active: {
      backgroundColor: 'var(--surface-active)',
    },
  },
  ghost: {
    base: {
      backgroundColor: 'transparent',
      color: 'var(--surface-text-secondary)',
    },
    hover: {
      backgroundColor: 'var(--surface-hover)',
      color: 'var(--surface-text-primary)',
    },
    active: {
      backgroundColor: 'var(--surface-active)',
    },
  },
  danger: {
    base: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-error-on)',
    },
    hover: {
      backgroundColor: 'var(--color-error-dark)',
    },
    active: {
      backgroundColor: 'var(--color-error-dark)',
    },
  },
  outline: {
    base: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary-600)',
      border: '1px solid var(--color-primary-600)',
    },
    hover: {
      backgroundColor: 'var(--color-primary-50)',
      color: 'var(--color-primary-700)',
    },
    active: {
      backgroundColor: 'var(--color-primary-100)',
    },
  },
  warning: {
    base: {
      backgroundColor: 'var(--color-warning)',
      color: 'var(--color-warning-on)',
    },
    hover: {
      backgroundColor: 'var(--color-warning-dark)',
    },
    active: {
      backgroundColor: 'var(--color-warning-dark)',
    },
  },
};

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none',
};

const baseButtonStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-2)',
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--font-semibold)',
  borderRadius: 'var(--radius-default)',
  transition: 'all var(--transition-fast)',
  border: 'none',
  outline: 'none',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variantKey = variant as keyof typeof variantStyles;
    const variantSet = variantStyles[variantKey] || variantStyles.primary;
    const baseVariant = variantSet.base;
    const hoverVariant = variantSet.hover;
    const activeVariant = variantSet.active;

    const combinedStyle: React.CSSProperties = {
      ...baseButtonStyles,
      ...sizeStyles[size],
      ...baseVariant,
      ...style,
      width: fullWidth ? '100%' : 'auto',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        return;
      }
    };

    // Use ref to store original styles for hover/active states
    const styleRef = React.useRef<React.CSSProperties>(combinedStyle);

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={className}
        style={combinedStyle}
        onMouseEnter={(e) => {
          if (!isDisabled && Object.keys(hoverVariant).length > 0) {
            const target = e.currentTarget as HTMLElement;
            Object.assign(target.style, hoverVariant);
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            const target = e.currentTarget as HTMLElement;
            Object.assign(target.style, styleRef.current);
          }
        }}
        onMouseDown={(e) => {
          if (!isDisabled && Object.keys(activeVariant).length > 0) {
            const target = e.currentTarget as HTMLElement;
            Object.assign(target.style, activeVariant);
          }
        }}
        onMouseUp={(e) => {
          if (!isDisabled) {
            const target = e.currentTarget as HTMLElement;
            Object.assign(target.style, styleRef.current);
          }
        }}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="1"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        ) : (
          <>
            {leftIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{leftIcon}</span>}
            {children}
            {rightIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Convenience button components with predefined variants
 */
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);
SecondaryButton.displayName = 'SecondaryButton';

export const GhostButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />
);
GhostButton.displayName = 'GhostButton';

export const DangerButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="danger" {...props} />
);
DangerButton.displayName = 'DangerButton';

export const OutlineButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
OutlineButton.displayName = 'OutlineButton';

export const WarningButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="warning" {...props} />
);
WarningButton.displayName = 'WarningButton';