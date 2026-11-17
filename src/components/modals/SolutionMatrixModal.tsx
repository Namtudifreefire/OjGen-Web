import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import { GeneratedTestCase, Problem, Config } from '../../core/types';
import { normalizeOutput, runJavaScript } from '../../core/solutionRunner';

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

  return <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div role="dialog" aria-modal="true" aria-label={text('Ma trận lời giải', 'Solution matrix')} className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-auto p-5 text-slate-100">
      <h2>{text('Ma trận lời giải JavaScript', 'JavaScript solution matrix')}</h2>
      <p>{text('Mỗi hàm solve(input) trả về output; mỗi lần chạy có giới hạn 1,5 giây.', 'Each solve(input) returns output; each run has a 1.5 second limit.')}</p>
      {codes.map((code, index) => <label key={index} style={{ display: 'block', marginTop: 12 }}>
        {text(`Lời giải ${index + 1}`, `Solution ${index + 1}`)}
        <textarea value={code} disabled={running} rows={5} onChange={e => { setCodes(previous => previous.map((item, i) => i === index ? e.target.value : item)); setRows([]); }}
          style={{ display: 'block', width: '100%', padding: 8, background: 'var(--surface-sunken)', color: 'var(--surface-text-primary)', border: '1px solid var(--surface-border)', fontFamily: 'monospace' }} />
      </label>)}
      <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
        <button type="button" disabled={running || tests.length === 0} onClick={run}>{running ? text(`Đang chạy ${progress}/${tests.length}...`, `Running ${progress}/${tests.length}...`) : text('Chạy ma trận', 'Run matrix')}</button>
        {running && <button type="button" onClick={() => controllerRef.current?.abort()}>{text('Dừng', 'Stop')}</button>}
        <button type="button" disabled={running} onClick={onClose}>{text('Đóng', 'Close')}</button>
      </div>
      {tests.length === 0 && <p>{text('Hãy tạo hoặc nhập test trước.', 'Generate or import tests first.')}</p>}
      {error && <p role="alert">{error}</p>}
      {rows.length > 0 && <table><thead><tr><th>Test</th><th>{text('Lời giải 1', 'Solution 1')}</th><th>{text('Lời giải 2', 'Solution 2')}</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}><td>{row.name}</td>{row.verdicts.map((verdict, i) => <td key={i} style={{ padding: 8 }}>{verdict}</td>)}</tr>)}</tbody></table>}
    </div>
  </div>;
};
