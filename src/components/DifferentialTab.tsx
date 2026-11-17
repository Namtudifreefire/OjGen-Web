import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n';
import { GeneratedTestCase, Problem, Config } from '../core/types';
import { normalizeOutput, runJavaScript } from '../core/solutionRunner';

interface Props {
  currentProblem: Problem;
  config: Config;
  generatedTests: GeneratedTestCase[];
  onAddLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

type Result = { test: GeneratedTestCase; verdict: 'AC' | 'WA' | 'RE' | 'TLE'; output: string };

export const DifferentialTab: React.FC<Props> = ({ currentProblem, config, generatedTests, onAddLog }) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const [code, setCode] = useState('function solve(input) {\n  // Return the output as a string.\n  return "0\\n";\n}');
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [shrinking, setShrinking] = useState(false);
  const [minimized, setMinimized] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [runError, setRunError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setResults([]);
    setMinimized(null);
    setRunError(null);
    setRunning(false);
    setShrinking(false);
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, [generatedTests, currentProblem, config]);

  const run = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setRunning(true);
    setResults([]);
    setMinimized(null);
    setRunError(null);
    setProgress(0);
    const next: Result[] = [];
    try {
      for (const test of generatedTests) {
        const result = await runJavaScript(code, test.input, 1500, controller.signal);
        const verdict = result.status === 'timeout' ? 'TLE' : result.status === 'error' ? 'RE'
          : normalizeOutput(result.output) === normalizeOutput(test.output) ? 'AC' : 'WA';
        next.push({ test, verdict, output: result.status === 'ok' ? result.output : result.error });
        setProgress(next.length);
      }
      setResults(next);
      onAddLog(text(`Đã đối chiếu ${next.length} test bằng JavaScript.`, `Compared ${next.length} tests using JavaScript.`), 'info');
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = text(`Không thể chạy đối chiếu: ${String(error)}`, `Differential testing failed: ${String(error)}`);
        setRunError(message);
        onAddLog(message, 'error');
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setRunning(false);
      }
    }
  };

  const shrink = async (failure: Result) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setShrinking(true);
    setRunError(null);
    try {
      let current = failure.test.input;
      const lines = current.trim().split(/\r?\n/);
      if (lines.length === 2 && /^\d+$/.test(lines[0].trim())) {
        let values = lines[1].trim().split(/\s+/);
        if (Number(lines[0].trim()) === values.length) {
          const fails = async (input: string) => {
            if (currentProblem.validateInput(input, config) !== null) return false;
            const actual = await runJavaScript(code, input, 1500, controller.signal);
            if (actual.status !== 'ok') return failure.verdict === (actual.status === 'timeout' ? 'TLE' : 'RE');
            return failure.verdict === 'WA' && normalizeOutput(actual.output) !== normalizeOutput(currentProblem.solve(input, config));
          };
          let trials = 0;
          while (values.length > 1 && trials++ < 32) {
            const shorter = values.slice(0, Math.floor(values.length / 2));
            const input = `${shorter.length}\n${shorter.join(' ')}\n`;
            if (!await fails(input)) break;
            values = shorter;
            current = input;
          }
        }
      }
      setMinimized(current);
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = text(`Không thể thu nhỏ test: ${String(error)}`, `Could not shrink the test: ${String(error)}`);
        setRunError(message);
        onAddLog(message, 'error');
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setShrinking(false);
      }
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-4)', maxWidth: 1100, width: '100%', margin: '0 auto', color: 'var(--surface-text-primary)' }}>
      <h2>{text('Kiểm thử đối chiếu', 'Differential testing')}</h2>
      <p>{text('Chạy lời giải JavaScript với các test đã tạo; hàm solve(input) phải trả về output. Mỗi test có giới hạn 1,5 giây.', 'Run a JavaScript solution against generated tests; solve(input) must return output. Each test has a 1.5 second limit.')}</p>
      <p>{text('C++/Python/Java cần môi trường thực thi riêng và chưa được hỗ trợ tại đây.', 'C++/Python/Java require an external execution environment and are not supported here.')}</p>
      <label htmlFor="candidate-code">{text('Lời giải JavaScript', 'JavaScript solution')}</label>
      <textarea id="candidate-code" value={code} disabled={running || shrinking} onChange={e => { setCode(e.target.value); setResults([]); setMinimized(null); }} rows={9}
        style={{ display: 'block', width: '100%', padding: 12, margin: '8px 0', background: 'var(--surface-sunken)', color: 'var(--surface-text-primary)', border: '1px solid var(--surface-border)', borderRadius: 8, fontFamily: 'monospace' }} />
      <button type="button" onClick={run} disabled={running || shrinking || generatedTests.length === 0}>
        {running ? text(`Đang chạy ${progress}/${generatedTests.length}...`, `Running ${progress}/${generatedTests.length}...`) : text(`Chạy đối chiếu (${generatedTests.length} test)`, `Run comparison (${generatedTests.length} tests)`)}
      </button>
      {(running || shrinking) && <button type="button" onClick={() => controllerRef.current?.abort()}>{text('Dừng', 'Stop')}</button>}
      {runError && <p role="alert">{runError}</p>}
      {generatedTests.length === 0 && <p>{text('Hãy tạo hoặc nhập test trước.', 'Generate or import tests first.')}</p>}
      {results.length > 0 && <div aria-live="polite">
        <h3>{text('Kết quả', 'Results')}</h3>
        {results.map(result => <div key={result.test.index} style={{ borderBottom: '1px solid var(--surface-border)', padding: '8px 0' }}>
          <strong>{result.test.fileName}: {result.verdict}</strong>
          {result.verdict !== 'AC' && <><pre style={{ whiteSpace: 'pre-wrap' }}>{text('Output:', 'Output:')} {result.output}</pre>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{text('Mong đợi:', 'Expected:')} {result.test.output}</pre>
            <button type="button" disabled={running || shrinking} onClick={() => shrink(result)}>{shrinking ? text('Đang thu nhỏ...', 'Shrinking...') : text('Thu nhỏ test này', 'Shrink this test')}</button></>}
        </div>)}
      </div>}
      {minimized !== null && <section><h3>{text('Input sau khi thử thu nhỏ', 'Input after shrinking')}</h3><pre style={{ whiteSpace: 'pre-wrap' }}>{minimized}</pre><p>{text('Chỉ thử rút ngắn input dạng mảng hai dòng; kết quả có thể chưa tối thiểu.', 'Only two-line array inputs are reduced; the result may not be minimal.')}</p></section>}
    </div>
  );
};
