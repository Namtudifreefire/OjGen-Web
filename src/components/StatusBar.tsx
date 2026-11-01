import React from 'react';

interface StatusBarProps {
  status: string;
  theme: string;
  seed: string;
  testCount: number;
  problemTitle: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  theme,
  seed,
  testCount,
  problemTitle,
}) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-200">{status}</span>
        </span>
        <span className="hidden md:inline text-slate-600">|</span>
        <span className="hidden md:inline font-mono text-slate-300">
          Khuôn: <span className="text-blue-400">{problemTitle}</span>
        </span>
      </div>

      <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
        <span>Seed: {seed || 'Ngẫu nhiên'}</span>
        <span className="text-slate-600">|</span>
        <span>Test: {testCount}</span>
        <span className="text-slate-600">|</span>
        <span>Chủ đề: {theme === 'dark' ? 'Tối' : 'Sáng'}</span>
      </div>
    </footer>
  );
};
