import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, CheckCircle2, WrapText, Code2 } from 'lucide-react';
import { GeneratedTestCase } from '../../core/types';
import { useTranslation } from '../../i18n';
import {
  DEFAULT_MAX_PREVIEW_CHARS,
  DEFAULT_MAX_PREVIEW_LINES,
  formatBytes,
  highlightContent,
  HighlightMode,
  HighlightResult,
} from '../../utils/syntaxHighlight';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface TestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: GeneratedTestCase | null;
  testPosition: number;
  totalTests: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

type CopyTarget = 'input' | 'output' | 'both' | null;

function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

interface HighlightPaneProps {
  paneId: 'input' | 'output';
  label: string;
  content: string;
  highlighted: HighlightResult;
  wrapLines: boolean;
  isCopied: boolean;
  onCopy: () => void;
  onShowFull: () => void;
  showingFull: boolean;
  copyAriaLabel: string;
  copiedLabel: string;
  copyLabel: string;
  emptyLabel: string;
  linesUnit: string;
  truncatedMessage: string;
  showFullLabel: string;
  modeLabels: Record<string, string>;
}

const HighlightPane: React.FC<HighlightPaneProps> = ({
  paneId,
  label,
  content,
  highlighted,
  wrapLines,
  isCopied,
  onCopy,
  onShowFull,
  showingFull,
  copyAriaLabel,
  copiedLabel,
  copyLabel,
  emptyLabel,
  linesUnit,
  truncatedMessage,
  showFullLabel,
  modeLabels,
}) => {
  const bytes = useMemo(() => utf8ByteLength(content), [content]);
  const lineDigits = Math.max(2, String(highlighted.shownLines).length);

  return (
    <section
      className="preview-pane"
      aria-label={label}
      data-testid={`preview-pane-${paneId}`}
    >
      <div className="preview-pane-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: paneId === 'input' ? 'var(--preview-input-accent)' : 'var(--preview-output-accent)',
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--surface-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {modeLabels[highlighted.mode] ?? highlighted.mode.toUpperCase()} · {highlighted.totalLines} {linesUnit} · {formatBytes(bytes)}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          aria-label={copyAriaLabel}
          leftIcon={
            isCopied ? (
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )
          }
          style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--text-xs)', flexShrink: 0 }}
        >
          {isCopied ? copiedLabel : copyLabel}
        </Button>
      </div>

      <div className="preview-pane-body" tabIndex={0} role="region" aria-label={label}>
        {content.length === 0 ? (
          <div
            style={{
              padding: 'var(--spacing-6)',
              textAlign: 'center',
              color: 'var(--surface-text-muted)',
              fontStyle: 'italic',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {emptyLabel}
          </div>
        ) : (
          highlighted.lines.map((line) => (
            <div
              key={line.lineNumber}
              className={`preview-code-line ${wrapLines ? 'preview-code-line--wrap' : ''}`}
              style={{ gridTemplateColumns: `${lineDigits + 0.5}ch minmax(0, 1fr)` }}
            >
              <span className="preview-line-number" aria-hidden="true">
                {line.lineNumber}
              </span>
              <span className={`preview-line-code ${wrapLines ? 'preview-line-code--wrap' : ''}`}>
                {line.tokens.length === 0
                  ? '\u200B'
                  : line.tokens.map((token, idx) => (
                      <span key={idx} className={`syn-${token.type}`}>
                        {token.value}
                      </span>
                    ))}
              </span>
            </div>
          ))
        )}
      </div>

      {highlighted.truncated && !showingFull && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            borderTop: '1px solid var(--surface-border)',
            backgroundColor: 'var(--surface-overlay)',
            fontSize: 'var(--text-xs)',
            color: 'var(--surface-text-secondary)',
            flexShrink: 0,
          }}
        >
          <span>{truncatedMessage}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowFull}
            style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
          >
            {showFullLabel}
          </Button>
        </div>
      )}
    </section>
  );
};

export const TestPreviewModal: React.FC<TestPreviewModalProps> = ({
  isOpen,
  onClose,
  test,
  testPosition,
  totalTests,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const { t } = useTranslation();
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('auto');
  const [wrapLines, setWrapLines] = useState<boolean>(false);
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget>(null);
  const [showFullInput, setShowFullInput] = useState(false);
  const [showFullOutput, setShowFullOutput] = useState(false);

  // Reset per-test expansion & transient copy badge when switching tests
  useEffect(() => {
    setShowFullInput(false);
    setShowFullOutput(false);
    setCopiedTarget(null);
  }, [test?.index]);

  // Arrow-key prev/next navigation inside modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext]);

  const inputHighlight = useMemo(() => {
    if (!test) {
      return highlightContent('', { mode: highlightMode });
    }
    return highlightContent(test.input, {
      mode: highlightMode,
      maxChars: showFullInput ? 500_000 : DEFAULT_MAX_PREVIEW_CHARS,
      maxLines: showFullInput ? 25_000 : DEFAULT_MAX_PREVIEW_LINES,
    });
  }, [test, highlightMode, showFullInput]);

  const outputHighlight = useMemo(() => {
    if (!test) {
      return highlightContent('', { mode: highlightMode });
    }
    return highlightContent(test.output, {
      mode: highlightMode,
      maxChars: showFullOutput ? 500_000 : DEFAULT_MAX_PREVIEW_CHARS,
      maxLines: showFullOutput ? 25_000 : DEFAULT_MAX_PREVIEW_LINES,
    });
  }, [test, highlightMode, showFullOutput]);

  if (!test) return null;

  const triggerCopy = async (target: Exclude<CopyTarget, null>, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedTarget(target);
      window.setTimeout(() => {
        setCopiedTarget((curr) => (curr === target ? null : curr));
      }, 1600);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const metadataParts = [
    test.groupName,
    formatBytes(test.bytes),
    `Seed ${test.seed || '—'}`,
    ...(test.tags.length > 0 ? [test.tags.join(', ')] : []),
  ];

  const modeLabels: Record<string, string> = {
    code: t('inventory.modeCode'),
    json: t('inventory.modeJson'),
    data: t('inventory.modeData'),
    plain: t('inventory.modePlain'),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('inventory.previewTitle')} — ${test.fileName}`}
      subtitle={metadataParts.join(' · ')}
      size="xl"
      style={{
        maxWidth: 'min(1200px, 95vw)',
        height: 'min(780px, 88vh)',
      }}
      footer={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 'var(--spacing-3)',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)' }}>
            {t('inventory.shortcutHint')}
          </span>
          <Button variant="secondary" onClick={onClose}>
            {t('buttons.close')}
          </Button>
        </div>
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
          height: '100%',
          minHeight: 0,
        }}
      >
        {/* Preview Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-2)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label={t('inventory.prevTest')}
            >
              {t('buttons.previous')}
            </Button>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--surface-text-secondary)',
                padding: '0 var(--spacing-1)',
                whiteSpace: 'nowrap',
              }}
            >
              {testPosition} / {totalTests}
            </span>
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              onClick={onNext}
              disabled={!hasNext}
              aria-label={t('inventory.nextTest')}
            >
              {t('buttons.next')}
            </Button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-1)',
                fontSize: 'var(--text-xs)',
                color: 'var(--surface-text-secondary)',
              }}
            >
              <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('inventory.highlightMode')}:</span>
              <select
                value={highlightMode}
                onChange={(e) => setHighlightMode(e.target.value as HighlightMode)}
                aria-label={t('inventory.highlightMode')}
                style={{
                  padding: 'var(--spacing-1) var(--spacing-2)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--surface-text-primary)',
                  backgroundColor: 'var(--surface-sunken)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-default)',
                  cursor: 'pointer',
                }}
              >
                <option value="auto">{t('inventory.modeAuto')}</option>
                <option value="code">{t('inventory.modeCode')}</option>
                <option value="json">{t('inventory.modeJson')}</option>
                <option value="data">{t('inventory.modeData')}</option>
                <option value="plain">{t('inventory.modePlain')}</option>
              </select>
            </label>

            <Button
              variant={wrapLines ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<WrapText className="w-3.5 h-3.5" />}
              onClick={() => setWrapLines((v) => !v)}
              aria-pressed={wrapLines}
            >
              {t('inventory.wrapLines')}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                copiedTarget === 'both' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )
              }
              onClick={() => triggerCopy('both', `${test.input}\n---\n${test.output}`)}
            >
              {copiedTarget === 'both' ? t('inventory.copied') : t('inventory.copyBoth')}
            </Button>
          </div>
        </div>

        {/* Side-by-Side Input & Output Split View */}
        <div className="test-preview-split">
          <HighlightPane
            paneId="input"
            label="Input"
            content={test.input}
            highlighted={inputHighlight}
            wrapLines={wrapLines}
            isCopied={copiedTarget === 'input'}
            onCopy={() => triggerCopy('input', test.input)}
            onShowFull={() => setShowFullInput(true)}
            showingFull={showFullInput}
            copyAriaLabel={t('inventory.copyInput')}
            copiedLabel={t('inventory.copied')}
            copyLabel={t('buttons.copy')}
            emptyLabel={t('inventory.emptyContent')}
            linesUnit={t('inventory.linesUnit')}
            truncatedMessage={t('inventory.truncatedNotice', {
              shown: inputHighlight.shownLines,
              total: inputHighlight.totalLines,
            })}
            showFullLabel={t('inventory.showFull')}
            modeLabels={modeLabels}
          />

          <HighlightPane
            paneId="output"
            label="Output"
            content={test.output}
            highlighted={outputHighlight}
            wrapLines={wrapLines}
            isCopied={copiedTarget === 'output'}
            onCopy={() => triggerCopy('output', test.output)}
            onShowFull={() => setShowFullOutput(true)}
            showingFull={showFullOutput}
            copyAriaLabel={t('inventory.copyOutput')}
            copiedLabel={t('inventory.copied')}
            copyLabel={t('buttons.copy')}
            emptyLabel={t('inventory.emptyContent')}
            linesUnit={t('inventory.linesUnit')}
            truncatedMessage={t('inventory.truncatedNotice', {
              shown: outputHighlight.shownLines,
              total: outputHighlight.totalLines,
            })}
            showFullLabel={t('inventory.showFull')}
            modeLabels={modeLabels}
          />
        </div>
      </div>
    </Modal>
  );
};
