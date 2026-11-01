import React, { useState } from 'react';
import { ManualTestCase, Problem, Config } from '../../core/types';
import { X, Plus, Trash2, CheckCircle2, Play, AlertCircle } from 'lucide-react';

interface ManualTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualTests: ManualTestCase[];
  onChangeManualTests: (tests: ManualTestCase[]) => void;
  problem: Problem;
  config: Config;
}

export const ManualTestsModal: React.FC<ManualTestsModalProps> = ({
  isOpen,
  onClose,
  manualTests,
  onChangeManualTests,
  problem,
  config,
}) => {
  const [localTests, setLocalTests] = useState<ManualTestCase[]>(manualTests);

  if (!isOpen) return null;

  const handleAdd = () => {
    const next: ManualTestCase = {
      id: Math.random().toString(36).slice(2, 9),
      name: `Manual Test ${localTests.length + 1}`,
      input: '',
      output: '',
      isSample: false,
    };
    setLocalTests([...localTests, next]);
  };

  const validateTest = (idx: number) => {
    const t = localTests[idx];
    const inp = t.input.endsWith('\n') ? t.input : t.input + '\n';
    const err = problem.validateInput(inp, config);
    const next = [...localTests];
    if (err) {
      next[idx] = { ...t, isValid: false, validationError: err };
    } else {
      const out = problem.solve(inp, config);
      next[idx] = { ...t, isValid: true, validationError: undefined, output: out.trim() };
    }
    setLocalTests(next);
  };

  const handleSave = () => {
    onChangeManualTests(localTests);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>📥 Test nhập tay / Test mẫu (Sample tests)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Nhập các ca kiểm thử đặc thù và tự động sinh output chuẩn
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm test tay</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">Tổng: {localTests.length}</span>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {localTests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              Chưa có test nhập tay nào. Nhấn "Thêm test tay" để dán test đề bài.
            </div>
          ) : (
            localTests.map((t, idx) => (
              <div key={t.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => {
                      const next = [...localTests];
                      next[idx] = { ...t, name: e.target.value };
                      setLocalTests(next);
                    }}
                    className="font-semibold text-slate-200 bg-transparent border-b border-slate-700 px-1 py-0.5"
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={t.isSample}
                        onChange={(e) => {
                          const next = [...localTests];
                          next[idx] = { ...t, isSample: e.target.checked };
                          setLocalTests(next);
                        }}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600 w-3.5 h-3.5"
                      />
                      <span>Đánh dấu Sample</span>
                    </label>
                    <button
                      onClick={() => validateTest(idx)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium flex items-center gap-1"
                      title="Xác thực theo khuôn & sinh đáp án chuẩn"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Xác thực &amp; Giải</span>
                    </button>
                    <button
                      onClick={() => {
                        const next = localTests.filter((_, i) => i !== idx);
                        setLocalTests(next);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Input:</span>
                    <textarea
                      rows={3}
                      value={t.input}
                      onChange={(e) => {
                        const next = [...localTests];
                        next[idx] = { ...t, input: e.target.value, isValid: undefined };
                        setLocalTests(next);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                      placeholder="Dán nội dung input..."
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Output chuẩn:</span>
                    <textarea
                      rows={3}
                      value={t.output || ''}
                      onChange={(e) => {
                        const next = [...localTests];
                        next[idx] = { ...t, output: e.target.value };
                        setLocalTests(next);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-blue-400"
                      placeholder="Output sinh tự động..."
                    />
                  </div>
                </div>

                {t.validationError && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{t.validationError}</span>
                  </div>
                )}
                {t.isValid && (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Input hợp lệ theo khuôn bài toán!</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">
            Hủy
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium">
            Lưu test tay
          </button>
        </div>
      </div>
    </div>
  );
};
