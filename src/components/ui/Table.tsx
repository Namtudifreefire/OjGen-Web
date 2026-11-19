import React from 'react';
import { useTranslation } from '../../i18n';

/**
 * Unified Table Component - Consistent table styling
 */

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T, index: number) => void;
  selectedKeys?: Set<string>;
  onSelectionChange?: (selectedKeys: Set<string>) => void;
  selectable?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectedKeys = new Set(),
  onSelectionChange,
  selectable = false,
  striped = true,
  hoverable = true,
  bordered = true,
  compact = false,
  emptyMessage,
  loading = false,
  loadingRows = 5,
  className = '',
  style,
}: TableProps<T>) {
  const { t, language } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? t('common.noData');
  const handleRowClick = (row: T, index: number) => {
    if (selectable && onSelectionChange) {
      const key = keyExtractor(row);
      const newSelected = new Set(selectedKeys);
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      onSelectionChange(newSelected);
    }
    onRowClick?.(row, index);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedKeys.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(keyExtractor)));
    }
  };

  const isAllSelected = data.length > 0 && selectedKeys.size === data.length;

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-sans)',
    ...style,
  };

  const cellPadding = compact ? 'var(--spacing-2) var(--spacing-3)' : 'var(--spacing-3) var(--spacing-3)';
  const cellFontSize = compact ? 'var(--text-xs)' : 'var(--text-sm)';

  if (loading) {
    return (
      <div style={{ overflowX: 'auto', ...style }} className={className}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-overlay)' }}>
              {selectable && (
                <th
                  style={{
                    padding: cellPadding,
                    textAlign: 'center',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--surface-text-secondary)',
                    borderBottom: '1px solid var(--surface-border)',
                    fontSize: cellFontSize,
                    width: '40px',
                  }}
                />
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: cellPadding,
                    textAlign: col.align || 'left',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--surface-text-secondary)',
                    borderBottom: '1px solid var(--surface-border)',
                    fontSize: cellFontSize,
                    width: col.width,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 && striped ? 'var(--surface-overlay)' : 'transparent' }}>
                {selectable && <td style={{ padding: cellPadding, borderBottom: '1px solid var(--surface-border)' }} />}
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: cellPadding, borderBottom: '1px solid var(--surface-border)' }}>
                    <div style={{ height: '12px', backgroundColor: 'var(--surface-border)', borderRadius: 'var(--radius-sm)', width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ overflowX: 'auto', ...style }} className={className}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-overlay)' }}>
              {selectable && (
                <th
                  style={{
                    padding: cellPadding,
                    textAlign: 'center',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--surface-text-secondary)',
                    borderBottom: '1px solid var(--surface-border)',
                    fontSize: cellFontSize,
                    width: '40px',
                  }}
                />
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: cellPadding,
                    textAlign: col.align || 'left',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--surface-text-secondary)',
                    borderBottom: '1px solid var(--surface-border)',
                    fontSize: cellFontSize,
                    width: col.width,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: 'var(--spacing-8)',
                  textAlign: 'center',
                  color: 'var(--surface-text-muted)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {resolvedEmptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', ...style }} className={className}>
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: 'var(--surface-overlay)' }}>
            {selectable && (
              <th
                style={{
                  padding: cellPadding,
                  textAlign: 'center',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--surface-text-secondary)',
                  borderBottom: '1px solid var(--surface-border)',
                  fontSize: cellFontSize,
                  width: '40px',
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--color-primary-600)',
                    cursor: 'pointer',
                  }}
                  aria-label={t('buttons.selectAll')}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: cellPadding,
                  textAlign: col.align || 'left',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--surface-text-secondary)',
                  borderBottom: '1px solid var(--surface-border)',
                  fontSize: cellFontSize,
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const key = keyExtractor(row);
            const isSelected = selectedKeys.has(key);
            return (
              <tr
                key={key}
                onClick={() => handleRowClick(row, rowIndex)}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--surface-focus)'
                    : rowIndex % 2 === 0 && striped
                    ? 'var(--surface-overlay)'
                    : 'transparent',
                  cursor: onRowClick || selectable ? 'pointer' : 'default',
                  transition: 'background-color var(--transition-fast)',
                  ...(hoverable && {
                    // Hover handled via CSS
                  }),
                }}
                onMouseEnter={(e) => {
                  if (hoverable && !isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hoverable && !isSelected) {
                    e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 && striped ? 'var(--surface-overlay)' : 'transparent';
                  }
                }}
              >
                {selectable && (
                  <td
                    style={{
                      padding: cellPadding,
                      textAlign: 'center',
                      borderBottom: bordered ? '1px solid var(--surface-border)' : 'none',
                      fontSize: cellFontSize,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRowClick(row, rowIndex)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: 'var(--color-primary-600)',
                        cursor: 'pointer',
                      }}
                      aria-label={language === 'en' ? `Select row ${rowIndex + 1}` : `Chọn dòng ${rowIndex + 1}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: cellPadding,
                      textAlign: col.align || 'left',
                      borderBottom: bordered ? '1px solid var(--surface-border)' : 'none',
                      fontSize: cellFontSize,
                      color: 'var(--surface-text-primary)',
                      verticalAlign: 'middle',
                    }}
                    className={col.className}
                  >
                    {col.render ? col.render(row, rowIndex) : String((row as any)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Simple table for displaying key-value pairs
 */
export interface KeyValueTableProps {
  data: Record<string, string | number | boolean | undefined | null>;
  className?: string;
  style?: React.CSSProperties;
  labelWidth?: string;
  valueRender?: (value: string | number | boolean | undefined | null, key: string) => React.ReactNode;
}

export const KeyValueTable: React.FC<KeyValueTableProps> = ({
  data,
  className = '',
  style,
  labelWidth = '200px',
  valueRender,
}) => {
  const { t } = useTranslation();
  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== '');

  if (entries.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-4)', color: 'var(--surface-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
        {t('common.noData')}
      </div>
    );
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      className={className}
    >
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td
              style={{
                padding: 'var(--spacing-2) var(--spacing-3)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--surface-text-secondary)',
                borderBottom: '1px solid var(--surface-border)',
                width: labelWidth,
                whiteSpace: 'nowrap',
                fontSize: 'var(--text-sm)',
              }}
            >
              {key}
            </td>
            <td
              style={{
                padding: 'var(--spacing-2) var(--spacing-3)',
                color: 'var(--surface-text-primary)',
                borderBottom: '1px solid var(--surface-border)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {valueRender ? valueRender(value, key) : String(value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};