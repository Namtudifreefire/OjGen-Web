import React, { useState } from 'react';
import { ProblemStatement, Problem, Config } from '../core/types';
import { FileText, CheckCircle2, AlertTriangle, Play, Copy, Plus, Trash2 } from 'lucide-react';

interface StatementTabProps {
  statement: ProblemStatement;
  onChangeStatement: (s: ProblemStatement) => void;
  problem: Problem;
  config: Config;
}

export const StatementTab: React.FC<StatementTabProps> = ({
  statement,
  onChangeStatement,
  problem,
  config,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'edit' | 'preview'>('edit');
  const [consistencyIssues, setConsistencyIssues] = useState<string[]>([]);

  // Check consistency between statement constraints & generator configuration
  const runConsistencyCheck = () => {
    const issues: string[] = [];
    const text = (statement.description + ' ' + statement.constraints).toLowerCase();

    // Check N
    if (problem.params.some((p) => p.key === 'maxN')) {
      const maxN = config.get('maxN');
      if (text.includes('10^6') || text.includes('1000000')) {
        if (maxN < 1000000n) {
          issues.push(`Đề bài nêu N ≤ 10^6 nhưng cấu hình generator maxN chỉ là ${maxN}.`);
        }
      }
      if (text.includes('10^5') || text.includes('100000')) {
        if (maxN < 100000n) {
          issues.push(`Đề bài nêu N ≤ 10^5 nhưng cấu hình generator maxN chỉ là ${maxN}.`);
        }
      }
    }

    // Check sample tests
    if (statement.samples.length === 0) {
      issues.push('Đề bài chưa có ví dụ (sample test case).');
    } else {
      for (let i = 0; i < statement.samples.length; i++) {
        const s = statement.samples[i];
        if (!s.input.trim()) {
          issues.push(`Ví dụ ${i + 1} có input rỗng.`);
        } else {
          const valErr = problem.validateInput(s.input.endsWith('\n') ? s.input : s.input + '\n', config);
          if (valErr) {
            issues.push(`Ví dụ ${i + 1}: Input không thỏa mãn khuôn: ${valErr}`);
          }
        }
      }
    }

    setConsistencyIssues(issues);
  };

  // Add sample test
  const addSample = () => {
    onChangeStatement({
      ...statement,
      samples: [
        ...statement.samples,
        { input: '', output: '', explanation: '' },
      ],
    });
  };

  // Run solver on sample input
  const autoSolveSample = (index: number) => {
    const s = statement.samples[index];
    if (!s.input.trim()) return;
    try {
      const inp = s.input.endsWith('\n') ? s.input : s.input + '\n';
      const out = problem.solve(inp, config);
      const nextSamples = [...statement.samples];
      nextSamples[index] = { ...s, output: out.trim() };
      onChangeStatement({ ...statement, samples: nextSamples });
    } catch (e: any) {
      alert(`Lỗi chạy lời giải: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>✍ Soạn thảo đề bài (Problem Statement)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Hỗ trợ định dạng đề thi chuẩn VNOI, QBOJ, Codeforces, Kattis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runConsistencyCheck}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kiểm tra nhất quán với cấu hình</span>
          </button>

          <div className="flex p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('edit')}
              className={`px-3 py-1 rounded font-medium transition ${
                activeSubTab === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`px-3 py-1 rounded font-medium transition ${
                activeSubTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Xem trước đề
            </button>
          </div>
        </div>
      </div>

      {/* Consistency Issues Banner */}
      {consistencyIssues.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Phát hiện {consistencyIssues.length} điểm chưa nhất quán:</span>
          </div>
          <ul className="list-disc list-inside pl-1 space-y-0.5 text-slate-300">
            {consistencyIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {activeSubTab === 'edit' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Metadata */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tên bài toán</label>
              <input
                type="text"
                value={statement.name}
                onChange={(e) => onChangeStatement({ ...statement, name: e.target.value })}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mã bài (Code)</label>
              <input
                type="text"
                value={statement.code}
                onChange={(e) => onChangeStatement({ ...statement, code: e.target.value.toUpperCase() })}
                className="w-full text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Giới hạn thời gian (ms)</label>
              <input
                type="number"
                value={statement.timeLimitMs}
                onChange={(e) => onChangeStatement({ ...statement, timeLimitMs: parseInt(e.target.value, 10) || 1000 })}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Giới hạn bộ nhớ (MB)</label>
              <input
                type="number"
                value={statement.memoryLimitMb}
                onChange={(e) => onChangeStatement({ ...statement, memoryLimitMb: parseInt(e.target.value, 10) || 256 })}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description & Constraints */}
          <div className="md:col-span-8 flex flex-col gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <label className="block text-xs font-semibold text-slate-200 mb-1">Mô tả đề bài (Description)</label>
              <textarea
                rows={6}
                value={statement.description}
                onChange={(e) => onChangeStatement({ ...statement, description: e.target.value })}
                placeholder="Nhập nội dung đề bài..."
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <label className="block text-xs font-semibold text-slate-200 mb-1">Dữ liệu vào (Input Format)</label>
                <textarea
                  rows={4}
                  value={statement.inputFormat}
                  onChange={(e) => onChangeStatement({ ...statement, inputFormat: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <label className="block text-xs font-semibold text-slate-200 mb-1">Dữ liệu ra (Output Format)</label>
                <textarea
                  rows={4}
                  value={statement.outputFormat}
                  onChange={(e) => onChangeStatement({ ...statement, outputFormat: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <label className="block text-xs font-semibold text-slate-200 mb-1">Ràng buộc (Constraints)</label>
              <textarea
                rows={3}
                value={statement.constraints}
                onChange={(e) => onChangeStatement({ ...statement, constraints: e.target.value })}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Sample Tests */}
          <div className="md:col-span-4 bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-semibold text-slate-200">Ví dụ (Sample Tests)</span>
              <button
                onClick={addSample}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
              >
                <Plus className="w-3 h-3" /> Thêm ví dụ
              </button>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
              {statement.samples.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-300">Ví dụ {idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => autoSolveSample(idx)}
                        className="p-1 text-slate-400 hover:text-emerald-400 transition"
                        title="Tự động tính output bằng lời giải chuẩn"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        onClick={() => {
                          const nextSamples = statement.samples.filter((_, i) => i !== idx);
                          onChangeStatement({ ...statement, samples: nextSamples });
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 transition"
                        title="Xóa ví dụ"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Input:</span>
                      <textarea
                        rows={2}
                        value={s.input}
                        onChange={(e) => {
                          const next = [...statement.samples];
                          next[idx] = { ...s, input: e.target.value };
                          onChangeStatement({ ...statement, samples: next });
                        }}
                        className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Output:</span>
                      <textarea
                        rows={2}
                        value={s.output}
                        onChange={(e) => {
                          const next = [...statement.samples];
                          next[idx] = { ...s, output: e.target.value };
                          onChangeStatement({ ...statement, samples: next });
                        }}
                        className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded p-1.5 text-blue-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Preview View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-4xl mx-auto shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <span>{statement.name || 'Tên bài toán'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
                {statement.code || 'CODE'}
              </span>
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
              <span>Thời gian: {statement.timeLimitMs} ms</span>
              <span>•</span>
              <span>Bộ nhớ: {statement.memoryLimitMb} MB</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Đề bài</h3>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {statement.description || 'Chưa có mô tả.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Dữ liệu vào</h3>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {statement.inputFormat || 'Chưa có định dạng input.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Dữ liệu ra</h3>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {statement.outputFormat || 'Chưa có định dạng output.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Ràng buộc</h3>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
              {statement.constraints || 'Chưa có ràng buộc.'}
            </p>
          </div>

          {statement.samples.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">Ví dụ</h3>
              <div className="space-y-4">
                {statement.samples.map((s, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden">
                    <div className="bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-800">
                      Ví dụ {idx + 1}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-800 bg-slate-950/70 p-3 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Standard Input:</span>
                        <pre className="text-emerald-400 whitespace-pre-wrap">{s.input}</pre>
                      </div>
                      <div className="pl-3">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Standard Output:</span>
                        <pre className="text-blue-400 whitespace-pre-wrap">{s.output}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
