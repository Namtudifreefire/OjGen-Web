import React, { useState } from 'react';
import { Problem, Config } from '../../core/types';
import { X, Play, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';

interface QueueItem {
  id: string;
  problemId: string;
  problemTitle: string;
  testCount: number;
  seed: string;
  status: 'pending' | 'running' | 'completed';
}

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProblem: Problem;
  currentConfig: Config;
  currentTestCount: number;
  currentSeed: string;
  onExecuteQueue: (items: QueueItem[]) => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  currentProblem,
  currentConfig,
  currentTestCount,
  currentSeed,
  onExecuteQueue,
}) => {
  const [items, setItems] = useState<QueueItem[]>([
    {
      id: '1',
      problemId: currentProblem.id,
      problemTitle: currentProblem.title,
      testCount: currentTestCount,
      seed: currentSeed || '2026',
      status: 'pending',
    },
  ]);

  if (!isOpen) return null;

  const handleAddCurrent = () => {
    const next: QueueItem = {
      id: Math.random().toString(36).slice(2, 8),
      problemId: currentProblem.id,
      problemTitle: currentProblem.title,
      testCount: currentTestCount,
      seed: currentSeed || Math.floor(Math.random() * 100000).toString(),
      status: 'pending',
    };
    setItems([...items, next]);
  };

  const handleRunAll = () => {
    onExecuteQueue(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Hàng đợi sinh test (Job Queue)</span>
            </h3>
            <p className="text-xs text-slate-400">Tự động sinh liên tiếp nhiều bài hoặc nhiều bộ seed</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={handleAddCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm cấu hình hiện tại</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">{items.length} tác vụ</span>
        </div>

        <div className="p-4 flex-1 overflow-auto space-y-2 max-h-[300px]">
          {items.map((item, idx) => (
            <div key={item.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">
                  #{idx + 1}. {item.problemTitle}
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Test: {item.testCount} · Seed: {item.seed}
                </div>
              </div>
              <button
                onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                className="p-1 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button onClick={onClose} className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">
            Hủy
          </button>
          <button
            onClick={handleRunAll}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Chạy toàn bộ hàng đợi ({items.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
