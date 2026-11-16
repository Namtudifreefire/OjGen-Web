import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { GeneratedTestCase, Problem, Config } from '../core/types';
import { Rng } from '../core/rng';
import { Play, RotateCcw, AlertCircle, CheckCircle2, Download, Bug, Minimize2, Maximize2, Trash2, Search, Settings, Zap } from 'lucide-react';
import { Card, CardHeader, CardDivider, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { Badge, StatusBadge } from './ui/Badge';
import type { BadgeVariant } from './ui/Badge';
import { Table, Column } from './ui/Table';

interface DifferentialTabProps {
  currentProblem: Problem;
  config: Config;
  generatedTests: GeneratedTestCase[];
  onAddLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

interface SolutionEntry {
  id: string;
  name: string;
  language: 'cpp' | 'python' | 'java' | 'javascript';
  code: string;
  status: 'pending' | 'running' | 'success' | 'error';
  results: TestResult[];
  compileError?: string;
}

interface TestResult {
  testIndex: number;
  fileName: string;
  status: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | 'pending';
  timeMs?: number;
  memoryKb?: number;
  output?: string;
  expectedOutput?: string;
  error?: string;
}

const LANGUAGE_CONFIG = {
  cpp: { label: 'C++17', ext: 'cpp', compile: 'g++ -std=c++17 -O2 -pipe -static -s', run: './a.out' },
  python: { label: 'Python 3', ext: 'py', compile: '', run: 'python3' },
  java: { label: 'Java 17', ext: 'java', compile: 'javac', run: 'java' },
  javascript: { label: 'Node.js', ext: 'js', compile: '', run: 'node' },
};

export const DifferentialTab: React.FC<DifferentialTabProps> = ({
  currentProblem,
  config,
  generatedTests,
  onAddLog,
}) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const [solutions, setSolutions] = useState<SolutionEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);
  const [shrinkMode, setShrinkMode] = useState(false);
  const [shrinkResult, setShrinkResult] = useState<{ original: string; minimized: string; steps: number } | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState<string | null>(null);

  const activeSolution = solutions.find(s => s.id === activeSolutionId);

  const addSolution = (lang: SolutionEntry['language'] = 'cpp') => {
    const templates: Record<string, string> = {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // TODO: Implement solution
    return 0;
}`,
      python: `import sys

def solve():
    data = sys.stdin.read().strip().split()
    if not data:
        return
    # TODO: Implement solution

if __name__ == "__main__":
    solve()`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: Implement solution
    }
}`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    // TODO: Implement solution
}

solve();`,
    };

    const newSolution: SolutionEntry = {
      id: `sol-${Date.now()}`,
      name: `Solution ${solutions.length + 1} (${LANGUAGE_CONFIG[lang].label})`,
      language: lang,
      code: templates[lang],
      status: 'pending',
      results: [],
    };
    setSolutions([...solutions, newSolution]);
    setActiveSolutionId(newSolution.id);
    onAddLog(text(`Đã thêm lời giải ${LANGUAGE_CONFIG[lang].label}`, `Added a ${LANGUAGE_CONFIG[lang].label} solution.`), 'info');
  };

  const updateSolution = (id: string, updates: Partial<SolutionEntry>) => {
    setSolutions(solutions.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSolution = (id: string) => {
    setSolutions(solutions.filter(s => s.id !== id));
    if (activeSolutionId === id) {
      setActiveSolutionId(solutions[0]?.id || null);
    }
  };

  const runAllSolutions = async () => {
    if (solutions.length === 0 || generatedTests.length === 0) return;
    if (isRunning) return;

    setIsRunning(true);
    onAddLog(text("Bắt đầu chạy đối chiếu đa lời giải...", "Starting differential testing..."), 'info');

    for (const sol of solutions) {
      if (sol.status === 'running') continue;

      updateSolution(sol.id, { status: 'running', results: [] });

      // Simulate compilation
      try {
        // In real implementation, this would compile the code
        // For demo, we'll simulate
        await new Promise(r => setTimeout(r, 500));

        // Run tests
        const results: TestResult[] = [];
        for (let i = 0; i < generatedTests.length; i++) {
          const test = generatedTests[i];

          // Simulate execution
          await new Promise(r => setTimeout(r, 10));

          // Simulate result (in real app, would execute code)
          const statuses: TestResult['status'][] = ['AC', 'AC', 'AC', 'WA', 'TLE'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];

          results.push({
            testIndex: test.index,
            fileName: test.fileName,
            status,
            timeMs: Math.floor(Math.random() * 500) + 10,
            memoryKb: Math.floor(Math.random() * 50000) + 1000,
            output: status === 'AC' ? test.output : 'Wrong output',
            expectedOutput: test.output,
            error: status === 'RE' ? 'Runtime error: segmentation fault' : undefined,
          });
        }

        const hasError = results.some(r => r.status !== 'AC');
        updateSolution(sol.id, {
          status: hasError ? 'error' : 'success',
          results
        });

      } catch (err: any) {
        updateSolution(sol.id, {
          status: 'error',
          compileError: err.message,
          results: []
        });
      }
    }

    setIsRunning(false);
    onAddLog(text("Hoàn tất đối chiếu đa lời giải", "Differential testing complete"), 'success');
  };

  const handleShrink = async () => {
    if (!activeSolution) return;

    const failedTests = activeSolution.results.filter(r => r.status !== 'AC');
    if (failedTests.length === 0) {
      alert(text("Không có test thất bại để thu nhỏ", "No failing tests to shrink"));
      return;
    }

    setShrinkMode(true);
    onAddLog(text("Bắt đầu thu nhỏ test thất bại...", "Shrinking failing test..."), 'info');

    // Simulate shrink process
    await new Promise(r => setTimeout(r, 2000));

    const firstFail = failedTests[0];
    setShrinkResult({
      original: generatedTests.find(t => t.index === firstFail.testIndex)?.input || '',
      minimized: '1\n1\n', // Simplified
      steps: 5,
    });

    setShrinkMode(false);
    onAddLog(text("Thu nhỏ hoàn tất", "Shrinking complete"), 'success');
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<TestResult['status'], BadgeVariant> = {
      AC: 'success',
      WA: 'error',
      TLE: 'warning',
      RE: 'error',
      CE: 'error',
      pending: 'default',
    };
    const labels: Record<TestResult['status'], string> = {
      AC: 'AC',
      WA: 'WA',
      TLE: 'TLE',
      RE: 'RE',
      CE: 'CE',
      pending: '...',
    };
    return <Badge variant={variants[status]} size="sm">{labels[status]}</Badge>;
  };

  const columns: Column<TestResult>[] = [
    { key: 'testIndex', header: '#', width: '50px', align: 'center' },
    { key: 'fileName', header: 'Test', width: '120px' },
    { key: 'status', header: text('Kết quả', 'Result'), width: '80px', align: 'center', render: (row) => getStatusBadge(row.status) },
    { key: 'timeMs', header: text('Thời gian (ms)', 'Time (ms)'), width: '90px', align: 'right', render: (row) => row.timeMs ? `${row.timeMs} ms` : '—' },
    { key: 'memoryKb', header: text('Bộ nhớ (KB)', 'Memory (KB)'), width: '100px', align: 'right', render: (row) => row.memoryKb ? `${row.memoryKb} KB` : '—' },
    { key: 'error', header: text('Lỗi', 'Error'), render: (row) => row.error ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>{row.error}</span> : '—' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', maxWidth: '1400px', margin: '0 auto', flex: 1 }}>
      <Card>
        <CardHeader
          title={text("Kiểm thử đối chiếu & Thu nhỏ lỗi", "Differential testing & shrinking")}
          subtitle={`${solutions.length} ${text('lời giải', 'solutions')} · ${generatedTests.length} ${text('test', 'tests')}`}
          icon={<RotateCcw className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />}
          action={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Select
                value="cpp"
                onChange={(e) => addSolution(e.target.value as any)}
                options={Object.entries(LANGUAGE_CONFIG).map(([k, v]) => ({ value: k, label: `+ ${v.label}` }))}
                placeholder={text("Thêm lời giải...", "Add solution...")}
                style={{ width: 'auto' }}
              />
              <Button variant="primary" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />} onClick={runAllSolutions} disabled={isRunning || solutions.length === 0 || generatedTests.length === 0}>
                {isRunning ? text('Đang chạy...', 'Running...') : text('Chạy tất cả', 'Run all')}
              </Button>
            </div>
          }
        />

        <CardDivider />

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--spacing-4)' }}>
          {/* Solutions Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {solutions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--surface-text-muted)', backgroundColor: 'var(--surface-sunken)', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-default)' }}>
                <Bug className="w-12 h-12 mx-auto mb-3" style={{ opacity: 0.3 }} />
                <p>{text("Chưa có lời giải nào", "No solutions yet")}</p>
                <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-1)' }}>{text("Chọn ngôn ngữ để thêm", "Choose a language to add a solution")}</p>
              </div>
            ) : (
              solutions.map((sol) => (
                <Card
                  key={sol.id}
                  style={{
                    backgroundColor: activeSolutionId === sol.id ? 'var(--surface-focus)' : 'var(--surface-overlay)',
                    border: activeSolutionId === sol.id ? '1px solid var(--color-primary-500)' : '1px solid var(--surface-border)',
                  }}
                  onClick={() => { setActiveSolutionId(sol.id); setShowCodeEditor(null); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-2)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                        <StatusBadge status={sol.status} size="sm" />
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sol.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--spacing-1)', marginTop: 'var(--spacing-1)' }}>
                        <Badge variant="default" size="sm">{LANGUAGE_CONFIG[sol.language].label}</Badge>
                        {sol.compileError && <Badge variant="error" size="sm">CE</Badge>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowCodeEditor(sol.id); }} aria-label={text("Chỉnh sửa code", "Edit code")}>
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeSolution(sol.id); }} aria-label={text("Xóa", "Delete")}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--color-error)' }} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {showCodeEditor && (
              <Card>
                <CardHeader
                  title={text("Chỉnh sửa lời giải", "Edit solution")}
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setShowCodeEditor(null)}>{text("Đóng", "Close")}</Button>
                  }
                />
                <CardDivider />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  <Input
                    label={text("Tên lời giải", "Solution name")}
                    value={solutions.find(s => s.id === showCodeEditor)?.name || ''}
                    onChange={(e) => updateSolution(showCodeEditor, { name: e.target.value })}
                    fullWidth
                  />
                  <Select
                    label={text("Ngôn ngữ", "Language")}
                    value={solutions.find(s => s.id === showCodeEditor)?.language || 'cpp'}
                    onChange={(e) => updateSolution(showCodeEditor, { language: e.target.value as any })}
                    options={Object.entries(LANGUAGE_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
                    fullWidth
                  />
                  <Textarea
                    label={text("Mã nguồn", "Source code")}
                    value={solutions.find(s => s.id === showCodeEditor)?.code || ''}
                    onChange={(e) => updateSolution(showCodeEditor, { code: e.target.value })}
                    rows={20}
                    fullWidth
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
                  />
                </div>
              </Card>
            )}

            {activeSolution && (
              <>
                <Card>
                  <CardHeader
                    title={activeSolution.name}
                    subtitle={`${LANGUAGE_CONFIG[activeSolution.language].label} · ${activeSolution.results.length} ${text('kết quả', 'results')}`}
                    action={
                      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                        <Button variant="secondary" size="sm" leftIcon={<Zap className="w-3.5 h-3.5" />} onClick={handleShrink} disabled={shrinkMode || !activeSolution.results.some(r => r.status !== 'AC')}>
                          {shrinkMode ? text('Đang thu nhỏ...', 'Shrinking...') : text('Thu nhỏ lỗi', 'Shrink failure')}
                        </Button>
                      </div>
                    }
                  />

                  <CardDivider />

                  {activeSolution.compileError && (
                    <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-error-light)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-default)', color: 'var(--color-error-dark)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                      <strong>{text("Lỗi biên dịch:", "Compilation error:")}</strong>
                      <pre style={{ margin: 'var(--spacing-2) 0 0 0', whiteSpace: 'pre-wrap' }}>{activeSolution.compileError}</pre>
                    </div>
                  )}

                  <Table
                    columns={columns}
                    data={activeSolution.results}
                    keyExtractor={(row) => String(row.testIndex)}
                    striped
                    hoverable
                    bordered
                    compact
                  />
                </Card>

                {shrinkResult && (
                  <Card>
                    <CardHeader title={text("Kết quả thu nhỏ lỗi", "Shrinking result")} icon={<Minimize2 className="w-4 h-4" />} />
                    <CardDivider />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-2)' }}>{text("Input gốc", "Original input")}</div>
                        <pre style={{ backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', padding: 'var(--spacing-3)', maxHeight: '200px', overflow: 'auto', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--surface-text-primary)' }}>
                          {shrinkResult.original}
                        </pre>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-2)' }}>{text('Input tối thiểu', 'Minimal input')} ({shrinkResult.steps} {text('bước', 'steps')})</div>
                        <pre style={{ backgroundColor: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-default)', padding: 'var(--spacing-3)', maxHeight: '200px', overflow: 'auto', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-success-dark)' }}>
                          {shrinkResult.minimized}
                        </pre>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}

            {!activeSolution && !showCodeEditor && (
              <Card style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                <Bug className="w-16 h-16 mx-auto mb-4" style={{ opacity: 0.2 }} />
                <h3 style={{ margin: '0 0 var(--spacing-2) 0', fontSize: 'var(--text-lg)', color: 'var(--surface-text-primary)' }}>{text("Chưa chọn lời giải", "No solution selected")}</h3>
                <p style={{ margin: 0, color: 'var(--surface-text-muted)' }}>{text("Thêm hoặc chọn một lời giải từ danh sách bên trái", "Add or select a solution from the list")}</p>
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Import Textarea
import { Textarea } from './ui/Input';
