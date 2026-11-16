import React from 'react';
import { useTranslation } from '../i18n';
import { Badge } from './ui/Badge';

interface StatusBarProps {
  status: string;
  theme: string;
  seed: string;
  testCount: number;
  problemTitle: string;
  generatedCount?: number;
  isGenerating?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  theme,
  seed,
  testCount,
  problemTitle,
  generatedCount = 0,
  isGenerating = false,
}) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    if (isGenerating) return { variant: 'info' as const, label: t('statusBar.generating'), dot: true };
    if (status.includes(t('toast.success')) || status.includes(t('common.success'))) return { variant: 'success' as const, label: status, dot: true };
    if (status.includes(t('toast.error')) || status.includes(t('common.error'))) return { variant: 'error' as const, label: status, dot: true };
    if (status.includes(t('toast.warning')) || status.includes(t('common.warning'))) return { variant: 'warning' as const, label: status, dot: true };
    return { variant: 'default' as const, label: status, dot: true };
  };

  const statusConfig = getStatusConfig();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--surface-border)',
        backgroundColor: 'var(--surface-raised)',
        padding: 'var(--spacing-1-5) var(--spacing-4)',
        fontSize: 'var(--text-xs)',
        color: 'var(--surface-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--spacing-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
        <Badge variant={statusConfig.variant} size="sm" dot={statusConfig.dot}>
          {statusConfig.label}
        </Badge>

        <span style={{ color: 'var(--surface-border)', height: '16px' }} aria-hidden="true">|</span>

        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1-5)' }}>
          <span style={{ color: 'var(--surface-text-muted)' }}>{t('statusBar.problem')}</span>
          <span style={{ color: 'var(--color-primary-400)', fontWeight: 'var(--font-medium)' }}>{problemTitle}</span>
        </span>

        {generatedCount > 0 && (
          <>
            <span style={{ color: 'var(--surface-border)', height: '16px' }} aria-hidden="true">|</span>
            <Badge variant="success" size="sm" dot>
              {t('statusBar.generated', { count: generatedCount })}
            </Badge>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1-5)' }}>
          <span style={{ color: 'var(--surface-text-muted)' }}>{t('statusBar.seed')}</span>
          <span style={{ color: 'var(--surface-text-primary)' }}>{seed || t('common.random')}</span>
        </span>

        <span style={{ color: 'var(--surface-border)' }} aria-hidden="true">|</span>

        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1-5)' }}>
          <span style={{ color: 'var(--surface-text-muted)' }}>{t('statusBar.tests')}</span>
          <span style={{ color: 'var(--surface-text-primary)' }}>{testCount}</span>
        </span>

        <span style={{ color: 'var(--surface-border)' }} aria-hidden="true">|</span>

        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1-5)' }}>
          <span style={{ color: 'var(--surface-text-muted)' }}>{t('common.theme')}</span>
          <Badge variant="default" size="sm">{theme === 'dark' ? t('common.dark') : t('common.light')}</Badge>
        </span>
      </div>
    </footer>
  );
};