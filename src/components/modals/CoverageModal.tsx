import React from 'react';
import { CoverageReport } from '../../core/coverage';
import { X, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface CoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CoverageReport | null;
}

export const CoverageModal: React.FC<CoverageModalProps> = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>🧭 Báo cáo độ phủ &amp; Gợi ý trường hợp biên</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
            {report.summary}
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Đã quan sát được trong cấu hình:
            </h4>
            <ul className="space-y-1.5 pl-2">
              {report.observations.map((obs, idx) => (
                <li key={idx} className="text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Gợi ý bổ sung test:
            </h4>
            <ul className="space-y-1.5 pl-2">
              {report.suggestions.map((sug, idx) => (
                <li key={idx} className="text-amber-200/90 flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
            * Các phép đo dùng định dạng input mà OjGen nhận diện; phân loại trường hợp mang tính heuristic, không thay thế việc rà soát logic đề.
          </p>
        </div>

        <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
