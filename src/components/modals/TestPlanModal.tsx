import React, { useState } from 'react';
import { TestGroupSpec, Problem, Config } from '../../core/types';
import { TestPlanManager } from '../../core/testPlan';
import { X, Plus, Trash2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: TestGroupSpec[];
  onChangeGroups: (groups: TestGroupSpec[]) => void;
  problem: Problem;
  config: Config;
}

export const TestPlanModal: React.FC<TestPlanModalProps> = ({
  isOpen,
  onClose,
  groups,
  onChangeGroups,
  problem,
  config,
}) => {
  const [localGroups, setLocalGroups] = useState<TestGroupSpec[]>(groups);

  if (!isOpen) return null;

  const totalScore = localGroups.reduce((acc, g) => acc + (g.score || 0), 0);
  const totalTests = localGroups.reduce((acc, g) => acc + g.testCount, 0);
  const validationError = TestPlanManager.validatePlan(localGroups);

  const handleAddGroup = () => {
    const next: TestGroupSpec = {
      name: `Nhóm ${localGroups.length + 1}`,
      testCount: 5,
      score: 20,
      coverageTags: ['small'],
      cfg: config.clone(),
    };
    setLocalGroups([...localGroups, next]);
  };

  const handleAdversarialPresets = () => {
    const existing = localGroups.map((g) => g.name);
    const presets = TestPlanManager.generateAdversarialPresets(problem, config, existing);
    setLocalGroups([...localGroups, ...presets]);
  };

  const handleSave = () => {
    onChangeGroups(localGroups);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>🧩 Kế hoạch phân nhóm test (Subtasks)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Tổng số test: <span className="font-mono text-blue-400">{totalTests}</span> · Tổng điểm: <span className={`font-mono font-bold ${totalScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{totalScore}/100</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddGroup}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhóm</span>
            </button>
            <button
              onClick={handleAdversarialPresets}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo nhanh Adversarial Presets</span>
            </button>
          </div>

          {validationError && (
            <span className="text-[11px] text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {validationError}
            </span>
          )}
        </div>

        {/* Group list */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {localGroups.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              Chưa có nhóm nào. Nhấn "Thêm nhóm" hoặc "Tạo nhanh Adversarial Presets" để bắt đầu chia subtask.
            </div>
          ) : (
            localGroups.map((group, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => {
                      const next = [...localGroups];
                      next[idx] = { ...group, name: e.target.value };
                      setLocalGroups(next);
                    }}
                    className="font-semibold text-slate-100 bg-transparent border-b border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 flex-1"
                    placeholder="Tên nhóm (vd: Subtask 1)"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Số test:</span>
                      <input
                        type="number"
                        min={1}
                        value={group.testCount}
                        onChange={(e) => {
                          const next = [...localGroups];
                          next[idx] = { ...group, testCount: parseInt(e.target.value, 10) || 1 };
                          setLocalGroups(next);
                        }}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 font-mono text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Điểm:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={group.score || 0}
                        onChange={(e) => {
                          const next = [...localGroups];
                          next[idx] = { ...group, score: parseInt(e.target.value, 10) || 0 };
                          setLocalGroups(next);
                        }}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 font-mono text-center text-blue-400"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const next = localGroups.filter((_, i) => i !== idx);
                        setLocalGroups(next);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 transition"
                      title="Xóa nhóm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Nhãn độ phủ:</span>
                  {['small', 'boundary', 'stress', 'adversarial'].map((tag) => {
                    const active = group.coverageTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const next = [...localGroups];
                          const tags = active
                            ? group.coverageTags.filter((t) => t !== tag)
                            : [...group.coverageTags, tag];
                          next[idx] = { ...group, coverageTags: tags };
                          setLocalGroups(next);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono transition ${
                          active ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
          >
            Lưu kế hoạch
          </button>
        </div>
      </div>
    </div>
  );
};
