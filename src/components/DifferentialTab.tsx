import React, { useState } from 'react';
import { Problem, Config } from '../core/types';
import { DifferentialTester, DifferentialResult } from '../core/differential';
import { RotateCcw, Play, AlertCircle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface DifferentialTabProps {
  problem: Problem;
  config: Config;
}

export const DifferentialTab: React.FC<DifferentialTabProps> = ({ problem, config }) => {
  const [testCount, setTestCount] = useState<number>(50);
  const [minimize, setMinimize] = useState<boolean>(true);
  const [candidateType, setCandidateType] = useState<string>('buggy_sum');
  const [customCode, setCustomCode] = useState<string>(
    `// Nhận chuỗi input (string), trả về output (string)\nfunction solve(input) {\n  const lines = input.trim().split('\\n');\n  // Thử nghiệm lời giải ứng viên\n  return "0\\n";\n}`
  );
  const [result, setResult] = useState<DifferentialResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runTest = () => {
    setIsRunning(true);
    setResult(null);

    setTimeout(() => {
      let candidateFn: (input: string) => string;

      if (candidateType === 'buggy_sum') {
        // Off-by-one or subtle error
        candidateFn = (input: string) => {
          const lines = input.trim().split('\n');
          if (lines.length >= 2) {
            const nums = lines[1].trim().split(/\s+/).map(BigInt);
            let sum = 0n;
            // Bug: skip first element if length > 3
            const start = nums.length > 3 ? 1 : 0;
            for (let i = start; i < nums.length; i++) sum += nums[i];
            return `${sum}\n`;
          }
          return '0\n';
        };
      } else if (candidateType === 'overflow') {
        // 32-bit overflow bug simulation
        candidateFn = (input: string) => {
          const lines = input.trim().split('\n');
          if (lines.length >= 2) {
            const nums = lines[1].trim().split(/\s+/).map(Number);
            let sum = 0;
            for (const n of nums) sum = (sum + n) | 0; // 32-bit integer overflow
            return `${sum}\n`;
          }
          return '0\n';
        };
      } else {
        // Custom user JS function
        try {
          // eslint-disable-next-line no-new-func
          const userFn = new Function('input', `${customCode}\nreturn solve(input);`);
          candidateFn = (input: string) => String(userFn(input));
        } catch (err: any) {
          alert(`Lỗi cú pháp mã nguồn ứng viên: ${err.message}`);
          setIsRunning(false);
          return;
        }
      }

      const res = DifferentialTester.run(problem, config, testCount, candidateFn, minimize);
      setResult(res);
      setIsRunning(false);
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-blue-400" />
            <span>⚖ Kiểm thử đối chiếu &amp; Thu nhỏ phản ví dụ (Shrinker)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Chạy đối chiếu lời giải chuẩn với lời giải cần thử trên các test ngẫu nhiên, tự động rút gọn input gây lỗi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Cấu hình kiểm thử
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Số lượng test kiểm thử
            </label>
            <input
              type="number"
              min={10}
              max={500}
              value={testCount}
              onChange={(e) => setTestCount(parseInt(e.target.value, 10) || 50)}
              className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lời giải ứng viên cần thử
            </label>
            <select
              value={candidateType}
              onChange={(e) => setCandidateType(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 mb-2"
            >
              <option value="buggy_sum">Mẫu thử 1: Thuật toán có lỗi bỏ sót phần tử (Off-by-one)</option>
              <option value="overflow">Mẫu thử 2: Lỗi tràn số 32-bit (32-bit int overflow)</option>
              <option value="custom">Tự viết mã giải JavaScript...</option>
            </select>

            {candidateType === 'custom' && (
              <textarea
                rows={8}
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-400 leading-relaxed"
              />
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2 border-t border-slate-800">
            <input
              type="checkbox"
              checked={minimize}
              onChange={(e) => setMinimize(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
            />
            <span>Tự động thu nhỏ phản ví dụ (Shrinker kích thước/giá trị)</span>
          </label>

          <button
            onClick={runTest}
            disabled={isRunning}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? 'Đang kiểm thử đối chiếu...' : 'Bắt đầu kiểm thử đối chiếu'}</span>
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[520px]">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800 mb-3 flex items-center justify-between">
            <span>Kết quả đối chiếu</span>
            {result && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${result.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {result.ok ? 'TẤT CẢ KHỚP (OK)' : `PHÁT HIỆN ${result.mismatches} PHẢN VÍ DỤ`}
              </span>
            )}
          </h3>

          <div className="flex-1 overflow-auto space-y-3">
            {!result ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Nhấn "Bắt đầu kiểm thử đối chiếu" để chạy so sánh hai lời giải trên {testCount} test ngẫu nhiên.
              </div>
            ) : result.ok ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-200">Không tìm thấy phản ví dụ nào!</h4>
                <p className="text-xs text-slate-400">
                  Cả {result.tested} test ngẫu nhiên đều cho kết quả trùng khớp hoàn toàn giữa lời giải chuẩn và lời giải ứng viên.
                </p>
              </div>
            ) : (
              result.failures.map((f, idx) => (
                <div key={idx} className="border border-red-500/30 bg-slate-950 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-red-400">
                    <span>Phản ví dụ #{f.testIndex}: {f.reason}</span>
                    {f.minimizationTrials > 0 && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Thu nhỏ sau {f.minimizationTrials} bước
                      </span>
                    )}
                  </div>

                  {/* Minimized input vs Original */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Input ban đầu:</span>
                      <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 max-h-24 overflow-auto whitespace-pre-wrap">
                        {f.input}
                      </pre>
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block">Input tối giản (Shrunk):</span>
                      <pre className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 max-h-24 overflow-auto whitespace-pre-wrap">
                        {f.minimizedInput}
                      </pre>
                    </div>
                  </div>

                  {/* Outputs compare */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-emerald-400 block font-semibold">Lời giải chuẩn (Expected):</span>
                      <pre className="p-1.5 rounded bg-emerald-500/10 text-emerald-300">{f.referenceOutput}</pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-red-400 block font-semibold">Ứng viên (Got):</span>
                      <pre className="p-1.5 rounded bg-red-500/10 text-red-300">{f.candidateOutput}</pre>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
