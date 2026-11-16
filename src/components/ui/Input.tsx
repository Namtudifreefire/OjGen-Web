import React, { forwardRef } from 'react';

/**
 * Unified Input Component - Single source of truth for all form inputs
 * Uses design tokens for consistency
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      style,
      id,
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${React.useId()}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const describedBy = [helperText && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 'var(--spacing-1)',
      width: fullWidth ? '100%' : 'auto',
      ...style,
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: 'var(--spacing-2) var(--spacing-3)',
      paddingLeft: leftIcon ? 'var(--spacing-10)' : 'var(--spacing-3)',
      paddingRight: rightIcon ? 'var(--spacing-10)' : 'var(--spacing-3)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-mono)',
      color: 'var(--surface-text-primary)',
      backgroundColor: disabled ? 'var(--surface-border)' : 'var(--surface-sunken)',
      border: '1px solid',
      borderColor: error ? 'var(--color-error)' : 'var(--surface-border)',
      borderRadius: 'var(--radius-default)',
      outline: 'none',
      transition: 'all var(--transition-fast)',
      minHeight: '36px',
      boxSizing: 'border-box',
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--surface-text-muted)',
      pointerEvents: 'none',
      width: '20px',
      height: '20px',
    };

    return (
      <div style={containerStyle} className={className}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--surface-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
          </label>
        )}

        <div style={wrapperStyle}>
          {leftIcon && <span style={{ ...iconStyle, left: 'var(--spacing-3)' }}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--surface-border-focus)';
              e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--surface-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            {...props}
          />
          {rightIcon && <span style={{ ...iconStyle, right: 'var(--spacing-3)' }}>{rightIcon}</span>}
        </div>

        {error && (
          <p id={errorId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} style={{ fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)', margin: 0 }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea component with same styling
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      rows = 3,
      className = '',
      style,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${React.useId()}`;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;
    const describedBy = [helperText && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 'var(--spacing-1)',
      width: fullWidth ? '100%' : 'auto',
      ...style,
    };

    const textareaStyle: React.CSSProperties = {
      width: '100%',
      padding: 'var(--spacing-2) var(--spacing-3)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-mono)',
      color: 'var(--surface-text-primary)',
      backgroundColor: disabled ? 'var(--surface-border)' : 'var(--surface-sunken)',
      border: '1px solid',
      borderColor: error ? 'var(--color-error)' : 'var(--surface-border)',
      borderRadius: 'var(--radius-default)',
      outline: 'none',
      transition: 'all var(--transition-fast)',
      minHeight: `${rows * 1.5}rem`,
      resize: 'vertical',
      boxSizing: 'border-box',
      lineHeight: '1.5',
    };

    return (
      <div style={containerStyle} className={className}>
        {label && (
          <label
            htmlFor={textareaId}
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--surface-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          rows={rows}
          style={textareaStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--surface-border-focus)';
            e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--surface-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />

        {error && (
          <p id={errorId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} style={{ fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)', margin: 0 }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Select component with same styling
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      placeholder,
      options,
      className = '',
      style,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${React.useId()}`;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
    const describedBy = [helperText && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 'var(--spacing-1)',
      width: fullWidth ? '100%' : 'auto',
      ...style,
    };

    const selectStyle: React.CSSProperties = {
      width: '100%',
      padding: 'var(--spacing-2) var(--spacing-3)',
      paddingRight: 'var(--spacing-10)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--surface-text-primary)',
      backgroundColor: disabled ? 'var(--surface-border)' : 'var(--surface-sunken)',
      border: '1px solid',
      borderColor: error ? 'var(--color-error)' : 'var(--surface-border)',
      borderRadius: 'var(--radius-default)',
      outline: 'none',
      transition: 'all var(--transition-fast)',
      minHeight: '36px',
      boxSizing: 'border-box',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right var(--spacing-3) center',
      backgroundSize: '16px 16px',
    };

    return (
      <div style={containerStyle} className={className}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--surface-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          style={selectStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--surface-border-focus)';
            e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--surface-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && (
          <p id={errorId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} style={{ fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)', margin: 0 }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';