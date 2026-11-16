import React from 'react';
import { useTranslation } from '../i18n';
import { Trash2, Copy, Download, Terminal } from 'lucide-react';
import { Card, CardHeader, CardDivider, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

interface LogTabProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

const levelConfig = {
  info: { variant: 'info' as const, color: 'var(--surface-text-primary)' },
  warn: { variant: 'warning' as const, color: 'var(--color-warning)' },
  error: { variant: 'error' as const, color: 'var(--color-error)' },
  success: { variant: 'success' as const, color: 'var(--color-success)' },
};

export const LogTab: React.FC<LogTabProps> = ({ logs, onClearLogs }) => {
  const { t, language } = useTranslation();
  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    alert(language === 'en' ? 'Log copied.' : 'Đã sao chép toàn bộ nhật ký!');
  };

  const handleDownload = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ojgen_log_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto', flex: 1, minHeight: 'calc(100vh - 200px)' }}>
      <Card>
        <CardHeader
          title={t('log.title')}
          subtitle={`${logs.length} ${language === 'en' ? 'lines' : 'dòng'}`}
          icon={<Terminal className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />}
          action={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={onClearLogs}>
                {t('log.clear')}
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />} onClick={handleCopy}>
                {t('buttons.copy')}
              </Button>
              <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleDownload}>
                {language === 'en' ? 'Download' : 'Lưu ra file'}
              </Button>
            </div>
          }
        />

        <CardDivider />

        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-default)',
            padding: 'var(--spacing-4)',
            overflow: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            lineHeight: '1.6',
            minHeight: '300px',
            maxHeight: '60vh',
          }}
        >
          {logs.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--surface-text-muted)', fontStyle: 'italic' }}>
              {t('log.empty')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
              {logs.map((log) => {
                const config = levelConfig[log.level];
                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-1) var(--spacing-2)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'background-color var(--transition-fast)',
                      color: config.color,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span style={{ color: 'var(--surface-text-muted)', whiteSpace: 'nowrap', flexShrink: 0, fontSize: '10px' }}>
                      {log.timestamp}
                    </span>
                    <Badge variant={config.variant} size="sm">
                      {log.level.toUpperCase()}
                    </Badge>
                    <span style={{ flex: 1, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{log.id === 'init' ? (language === 'en' ? 'OjGen 3.3.0 Web Edition is ready with 19 templates. Use [Ctrl+S], [Ctrl+G], [Ctrl+L] or [?] for shortcuts.' : 'OjGen 3.3.0 Web Edition đã khởi động sẵn sàng. 19 khuôn bài toán đã sẵn sàng. Sử dụng phím tắt [Ctrl+S], [Ctrl+G], [Ctrl+L] hoặc [?] để thao tác nhanh.') : log.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
