import React from 'react';

/**
 * Unified Card Component - Consistent card styling across the app
 */

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

const paddingStyles = {
  none: '0',
  sm: 'var(--spacing-3)',
  md: 'var(--spacing-4)',
  lg: 'var(--spacing-6)',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  interactive = false,
  onClick,
  padding = 'md',
  bordered = true,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-raised)',
    borderRadius: 'var(--radius-lg)',
    padding: paddingStyles[padding],
    border: bordered ? '1px solid var(--surface-border)' : 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--transition-default)',
    ...style,
  };

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...cardStyle,
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          border: bordered ? '1px solid var(--surface-border)' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-default)';
          e.currentTarget.style.borderColor = 'var(--surface-border-strong)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--surface-border)';
        }}
        className={className}
      >
        {children}
      </button>
    );
  }

  return <div style={cardStyle} className={className}>{children}</div>;
};

/**
 * Card with header section
 */
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = '',
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 'var(--spacing-4)',
        paddingBottom: 'var(--spacing-3)',
        marginBottom: 'var(--spacing-3)',
        borderBottom: '1px solid var(--surface-border)',
        ...style,
      }}
      className={className}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)' }}>
        {icon && (
          <span style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>{icon}</span>
        )}
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--surface-text-primary)',
            lineHeight: '1.4',
          }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{
              margin: 'var(--spacing-1) 0 0 0',
              fontSize: 'var(--text-xs)',
              color: 'var(--surface-text-muted)',
              lineHeight: '1.4',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div style={{ flexShrink: 0 }}>{action}</div>
      )}
    </div>
  );
};

/**
 * Card section divider
 */
export const CardDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    style={{
      height: '1px',
      backgroundColor: 'var(--surface-border)',
      margin: 'var(--spacing-3) calc(var(--spacing-4) * -1)',
      padding: `0 var(--spacing-4)`,
      ...(className && { className }),
    }}
  />
);

/**
 * Card footer with actions
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 'var(--spacing-2)',
      paddingTop: 'var(--spacing-3)',
      marginTop: 'var(--spacing-3)',
      borderTop: '1px solid var(--surface-border)',
      ...style,
    }}
    className={className}
  >
    {children}
  </div>
);

/**
 * Simple card for list items
 */
export interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  selected?: boolean;
}

export const SimpleCard: React.FC<SimpleCardProps> = ({
  children,
  className = '',
  style,
  onClick,
  selected = false,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: selected ? 'var(--surface-focus)' : 'var(--surface-raised)',
    border: selected
      ? '1px solid var(--surface-border-focus)'
      : '1px solid var(--surface-border)',
    borderRadius: 'var(--radius-default)',
    padding: 'var(--spacing-3)',
    transition: 'all var(--transition-fast)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...cardStyle,
          width: '100%',
          textAlign: 'left',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--surface-border-strong)';
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.backgroundColor = 'var(--surface-raised)';
            e.currentTarget.style.borderColor = 'var(--surface-border)';
          }
        }}
        className={className}
      >
        {children}
      </button>
    );
  }

  return <div style={cardStyle} className={className}>{children}</div>;
};
