import React from 'react';

/**
 * Unified Badge Component - For status indicators, labels, counts
 */

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  style?: React.CSSProperties;
  dot?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--surface-overlay)',
    color: 'var(--surface-text-secondary)',
    border: '1px solid var(--surface-border)',
  },
  primary: {
    backgroundColor: 'var(--color-primary-100)',
    color: 'var(--color-primary-700)',
    border: 'none',
  },
  success: {
    backgroundColor: 'var(--color-success-light)',
    color: 'var(--color-success-dark)',
    border: 'none',
  },
  warning: {
    backgroundColor: 'var(--color-warning-light)',
    color: 'var(--color-warning-dark)',
    border: 'none',
  },
  error: {
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error-dark)',
    border: 'none',
  },
  info: {
    backgroundColor: 'var(--color-info-light)',
    color: 'var(--color-info-dark)',
    border: 'none',
  },
};

const sizeStyles = {
  sm: {
    padding: 'var(--spacing-0-5) var(--spacing-1-5)',
    fontSize: '10px',
    fontWeight: 'var(--font-semibold)' as const,
    borderRadius: 'var(--radius-full)',
    lineHeight: '1.4',
  },
  md: {
    padding: 'var(--spacing-1) var(--spacing-2)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-semibold)' as const,
    borderRadius: 'var(--radius-full)',
    lineHeight: '1.4',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style,
  dot = false,
  onClick,
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-sans)',
    ...sizeStyles[size],
    ...variantStyles[variant],
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all var(--transition-fast)',
    ...style,
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...baseStyle,
          border: 'none',
          backgroundColor: baseStyle.backgroundColor,
          padding: baseStyle.padding,
        }}
        className={className}
      >
        {dot && (
          <span
            style={{
              width: size === 'sm' ? '6px' : '8px',
              height: size === 'sm' ? '6px' : '8px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }

  return (
    <span style={baseStyle} className={className}>
      {dot && (
        <span
          style={{
            width: size === 'sm' ? '6px' : '8px',
            height: size === 'sm' ? '6px' : '8px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

/**
 * Status badge with predefined variants for common states
 */
export interface StatusBadgeProps {
  status: 'pending' | 'running' | 'success' | 'error' | 'warning' | 'idle';
  size?: BadgeSize;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const config = {
    pending: { variant: 'warning' as BadgeVariant, label: 'Đang chờ', dot: true },
    running: { variant: 'info' as BadgeVariant, label: 'Đang chạy', dot: true },
    success: { variant: 'success' as BadgeVariant, label: 'Thành công', dot: true },
    error: { variant: 'error' as BadgeVariant, label: 'Lỗi', dot: true },
    warning: { variant: 'warning' as BadgeVariant, label: 'Cảnh báo', dot: true },
    idle: { variant: 'default' as BadgeVariant, label: 'Sẵn sàng', dot: false },
  }[status];

  return <Badge variant={config.variant} size={size} dot={config.dot} className={className}>{config.label}</Badge>;
};

/**
 * Count badge for numbers
 */
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const display = max !== undefined && count > max ? `${max}+` : String(count);

  return (
    <Badge variant={variant} size={size} className={className}>
      {display}
    </Badge>
  );
};