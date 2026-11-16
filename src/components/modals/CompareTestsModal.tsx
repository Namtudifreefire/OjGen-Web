import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { GeneratedTestCase } from '../../core/types';
import { X, CheckCircle2, AlertCircle, Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface CompareTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testsA: GeneratedTestCase[];
  testsB: GeneratedTestCase[];
  labelA: string;
  labelB: string;
}

type DiffType = 'match' | 'mismatch' | 'onlyA' | 'onlyB';

interface ComparisonResult {
  fileName: string;
  indexA: number | null;
  indexB: number | null;
  sha256A: string | null;
  sha256B: string | null;
  type: DiffType;
  inputSame: boolean;
  outputSame: boolean;
}

export const CompareTestsModal: React.FC<CompareTestsModalProps> = ({
  isOpen,
  onClose,
  testsA,
  testsB,
  labelA = 'Bộ test A',
  labelB = 'Bộ test B',
}) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const [comparison, setComparison] = useState<ComparisonResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'match' | 'mismatch' | 'onlyA' | 'onlyB'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const hashString = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const runComparison = async () => {
    setIsRunning(true);
    setComparison([]);

    try {
      // Build maps by filename and SHA256
      const mapA = new Map<string, { test: GeneratedTestCase; sha: string }>();
      const mapB = new Map<string, { test: GeneratedTestCase; sha: string }>();

      for (const t of testsA) {
        const sha = t.sha256 || await hashString(t.input);
        mapA.set(t.fileName, { test: t, sha });
      }
      for (const t of testsB) {
        const sha = t.sha256 || await hashString(t.input);
        mapB.set(t.fileName, { test: t, sha });
      }

      const allNames = new Set([...mapA.keys(), ...mapB.keys()]);
      const results: ComparisonResult[] = [];

      for (const name of allNames) {
        const a = mapA.get(name);
        const b = mapB.get(name);

        if (a && b) {
          const inputSame = a.test.input === b.test.input;
          const outputSame = a.test.output === b.test.output;
          const type: DiffType = inputSame && outputSame ? 'match' : 'mismatch';
          results.push({
            fileName: name,
            indexA: a.test.index,
            indexB: b.test.index,
            sha256A: a.sha,
            sha256B: b.sha,
            type,
            inputSame,
            outputSame,
          });
        } else if (a) {
          results.push({
            fileName: name,
            indexA: a.test.index,
            indexB: null,
            sha256A: a.sha,
            sha256B: null,
            type: 'onlyA',
            inputSame: false,
            outputSame: false,
          });
        } else if (b) {
          results.push({
            fileName: name,
            indexA: null,
            indexB: b.test.index,
            sha256A: null,
            sha256B: b.sha,
            type: 'onlyB',
            inputSame: false,
            outputSame: false,
          });
        }
      }

      // Sort: match first, then mismatch, then onlyA/onlyB
      results.sort((x, y) => {
        const order: Record<DiffType, number> = { match: 0, mismatch: 1, onlyA: 2, onlyB: 3 };
        return order[x.type] - order[y.type];
      });

      setComparison(results);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredComparison = comparison.filter(c => {
    if (filter !== 'all' && c.type !== filter) return false;
    if (searchTerm && !c.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    match: comparison.filter(c => c.type === 'match').length,
    mismatch: comparison.filter(c => c.type === 'mismatch').length,
    onlyA: comparison.filter(c => c.type === 'onlyA').length,
    onlyB: comparison.filter(c => c.type === 'onlyB').length,
  };

  const exportReport = () => {
    const lines = [
      ['File', 'Type', `Index ${labelA}`, `Index ${labelB}`, `SHA256 ${labelA}`, `SHA256 ${labelB}`, 'Input Same', 'Output Same'].join(','),
      ...comparison.map(c => [
        c.fileName,
        c.type,
        c.indexA?.toString() || '',
        c.indexB?.toString() || '',
        c.sha256A || '',
        c.sha256B || '',
        c.inputSame.toString(),
        c.outputSame.toString(),
      ].join(',')),
    ];
    const blob = new Blob(['﻿', lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison_${labelA}_vs_${labelB}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const getTypeBadge = (type: DiffType) => {
    const styles: Record<DiffType, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
      match: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: <CheckCircle2 className="w-3 h-3" /> },
      mismatch: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', icon: <AlertCircle className="w-3 h-3" /> },
      onlyA: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: <ChevronLeft className="w-3 h-3" /> },
      onlyB: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: <ChevronRight className="w-3 h-3" /> },
    };
    const s = styles[type];
    const labels: Record<DiffType, string> = { match: text('Khớp', 'Match'), mismatch: text('Khác nhau', 'Different'), onlyA: `${text('Chỉ', 'Only')} ${labelA}`, onlyB: `${text('Chỉ', 'Only')} ${labelB}` };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
        {s.icon} {labels[type]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>{text("So sánh hai bộ test", "Compare test sets")}</span>
            </h3>
            <p className="text-xs text-slate-400">{text("So sánh theo tên file và SHA-256 input/output", "Compare file names and input/output SHA-256 hashes")}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Source Info */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <p className="text-xs text-slate-400 mb-1">{text("Nguồn A", "Source A")}</p>
              <p className="font-mono text-slate-200">{labelA}</p>
              <p className="text-[11px] text-slate-500">{testsA.length} test</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">{text("Nguồn B", "Source B")}</p>
              <p className="font-mono text-slate-200">{labelB}</p>
              <p className="text-[11px] text-slate-500">{testsB.length} test</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runComparison}
              disabled={isRunning || (testsA.length === 0 && testsB.length === 0)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isRunning ? text("Đang so sánh...", "Comparing...") : text("Chạy so sánh", "Compare")}</span>
            </button>

            {comparison.length > 0 && (
              <>
                <div className="flex items-center gap-1 bg-slate-950 rounded-lg border border-slate-800 p-1">
                  {(['all', 'match', 'mismatch', 'onlyA', 'onlyB'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded text-[10px] font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {f === 'all' ? text("Tất cả", "All") : f === 'match' ? text("Khớp", "Match") : f === 'mismatch' ? text("Khác", "Different") : f === 'onlyA' ? text('Chỉ A', 'Only A') : text('Chỉ B', 'Only B')}
                      <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-800 text-xs">
                        {f === 'all' ? comparison.length : stats[f as keyof typeof stats]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder={text("Tìm theo tên file...", "Search by file name...")}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  onClick={exportReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{text("Xuất CSV", "Export CSV")}</span>
                </button>
              </>
            )}
          </div>

          {/* Results Table */}
          <div className="flex-1 overflow-auto">
            {comparison.length === 0 && !isRunning ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs italic p-8">{text("Nhấn \"Chạy so sánh\" để đối chiếu hai bộ test", "Select “Compare” to compare the two test sets")}
              </div>
            ) : isRunning ? (
              <div className="h-64 flex items-center justify-center text-blue-400 text-xs">{text("Đang so sánh", "Comparing")} {testsA.length + testsB.length} test...
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono sticky top-0 bg-slate-900">
                    <th className="p-2">File</th>
                    <th className="p-2">{text("Trạng thái", "Status")}</th>
                    <th className="p-2">Index A</th>
                    <th className="p-2">Index B</th>
                    <th className="p-2">SHA256 A (input)</th>
                    <th className="p-2">SHA256 B (input)</th>
                    <th className="p-2">Input</th>
                    <th className="p-2">Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredComparison.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2 font-mono font-semibold text-slate-200 max-w-[200px] truncate" title={c.fileName}>{c.fileName}</td>
                      <td className="p-2">{getTypeBadge(c.type)}</td>
                      <td className="p-2 font-mono text-slate-400">{c.indexA?.toString() || '—'}</td>
                      <td className="p-2 font-mono text-slate-400">{c.indexB?.toString() || '—'}</td>
                      <td className="p-2 font-mono text-[9px] text-slate-500 max-w-[120px] truncate">{c.sha256A ? `${c.sha256A.slice(0, 32)}...` : '—'}</td>
                      <td className="p-2 font-mono text-[9px] text-slate-500 max-w-[120px] truncate">{c.sha256B ? `${c.sha256B.slice(0, 32)}...` : '—'}</td>
                      <td className="p-2">
                        {c.type === 'match' || c.type === 'mismatch' ? (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${c.inputSame ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {c.inputSame ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {c.inputSame ? text("Giống", "Same") : text("Khác", "Different")}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-2">
                        {c.type === 'match' || c.type === 'mismatch' ? (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${c.outputSame ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {c.outputSame ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {c.outputSame ? text("Giống", "Same") : text("Khác", "Different")}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Summary */}
          {comparison.length > 0 && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-lg font-bold text-emerald-400">{stats.match}</p>
                <p className="text-[10px] text-slate-400">{text("Khớp hoàn toàn", "Exact matches")}</p>
              </div>
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30">
                <p className="text-lg font-bold text-rose-400">{stats.mismatch}</p>
                <p className="text-[10px] text-slate-400">{text("Khác nhau", "Different")}</p>
              </div>
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                <p className="text-lg font-bold text-blue-400">{stats.onlyA}</p>
                <p className="text-[10px] text-slate-400">{text("Chỉ có ở A", "Only in A")}</p>
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                <p className="text-lg font-bold text-amber-400">{stats.onlyB}</p>
                <p className="text-[10px] text-slate-400">{text("Chỉ có ở B", "Only in B")}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">{text("Đóng", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
