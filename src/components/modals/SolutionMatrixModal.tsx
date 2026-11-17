import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import { GeneratedTestCase, Problem, Config } from '../../core/types';
import { normalizeOutput, runJavaScript } from '../../core/solutionRunner';
import { Button } from '../ui/Button';
import { CardHeader } from '../ui/Card';
import { GitCompareArrows, Play, Square, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tests: GeneratedTestCase[];
  problem: Problem;
  config: Config;
}

export const SolutionMatrixModal: React.FC<Props> = ({ isOpen, onClose, tests }) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const [codes, setCodes] = useState(['function solve(input) {\n  return "0\\n";\n}', 'function solve(input) {\n  return "0\\n";\n}']);
  const [rows, setRows] = useState<Array<{ name: string; verdicts: string[] }>>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    setRows([]);
    setRunning(false);
    setError(null);
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, [tests, isOpen]);
  if (!isOpen) return null;

  const run = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setRunning(true);
    setRows([]);
    setProgress(0);
    setError(null);
    const next: Array<{ name: string; verdicts: string[] }> = [];
    try {
      for (const test of tests) {
        const verdicts: string[] = [];
        for (const code of codes) {
          const result = await runJavaScript(code, test.input, 1500, controller.signal);
          verdicts.push(result.status === 'timeout' ? 'TLE' : result.status === 'error' ? 'RE' : normalizeOutput(result.output) === normalizeOutput(test.output) ? 'AC' : 'WA');
        }
        next.push({ name: test.fileName, verdicts });
        setProgress(next.length);
      }
      setRows(next);
    } catch (error) {
      if (!controller.signal.aborted) setError(String(error));
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setRunning(false);
      }
    }
  };

  return <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal)' }}>
    <div role="dialog" aria-modal="true" aria-label={text('Ma trận lời giải', 'Solution matrix')} style={{ background: 'var(--surface-raised)', color: 'var(--surface-text-primary)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 900, maxHeight: '85vh', overflow: 'auto', padding: 'var(--spacing-5)' }}>
      <CardHeader icon={<GitCompareArrows size={19} style={{ color: 'var(--color-primary-500)' }} />} title={text('Ma trận lời giải JavaScript', 'JavaScript solution matrix')} subtitle={text('Mỗi hàm solve(input) trả về output; mỗi lần chạy có giới hạn 1,5 giây.', 'Each solve(input) returns output; each run has a 1.5 second limit.')} action={<Button variant="ghost" size="sm" disabled={running} onClick={onClose} aria-label={text('Đóng', 'Close')}><X size={18} /></Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--spacing-4)' }}>
      {codes.map((code, index) => <label key={index} style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>
        {text(`Lời giải ${index + 1}`, `Solution ${index + 1}`)}
        <textarea value={code} disabled={running} rows={6} onChange={e => { setCodes(previous => previous.map((item, i) => i === index ? e.target.value : item)); setRows([]); }}
          style={{ display: 'block', width: '100%', marginTop: 'var(--spacing-2)', padding: 'var(--spacing-3)', background: 'var(--surface-sunken)', color: 'var(--surface-text-primary)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.6, resize: 'vertical' }} />
      </label>)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)', margin: 'var(--spacing-4) 0' }}>
        <Button variant="primary" leftIcon={<Play size={16} />} disabled={running || tests.length === 0} onClick={run}>{running ? text(`Đang chạy ${progress}/${tests.length}...`, `Running ${progress}/${tests.length}...`) : text('Chạy ma trận', 'Run matrix')}</Button>
        {running && <Button variant="secondary" leftIcon={<Square size={15} />} onClick={() => controllerRef.current?.abort()}>{text('Dừng', 'Stop')}</Button>}
        <Button variant="secondary" disabled={running} onClick={onClose}>{text('Đóng', 'Close')}</Button>
      </div>
      {tests.length === 0 && <p style={{ color: 'var(--surface-text-muted)', fontSize: 'var(--text-sm)' }}>{text('Hãy tạo hoặc nhập test trước.', 'Generate or import tests first.')}</p>}
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
      {rows.length > 0 && <div style={{ overflowX: 'auto', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)' }}><table style={{ width: '100%', textAlign: 'left', fontSize: 'var(--text-sm)' }}><thead><tr style={{ background: 'var(--surface-sunken)' }}><th style={{ padding: 10 }}>Test</th><th style={{ padding: 10 }}>{text('Lời giải 1', 'Solution 1')}</th><th style={{ padding: 10 }}>{text('Lời giải 2', 'Solution 2')}</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index} style={{ borderTop: '1px solid var(--surface-border)' }}><td style={{ padding: 10 }}>{row.name}</td>{row.verdicts.map((verdict, i) => <td key={i} style={{ padding: 10, color: verdict === 'AC' ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700 }}>{verdict}</td>)}</tr>)}</tbody></table></div>}
    </div>
  </div>;
};
