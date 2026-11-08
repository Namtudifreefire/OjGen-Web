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
    <footer className={`border-t px-4 py-1.5 text-xs flex items-center justify-between select-none transition-colors ${
      theme === 'dark'
        ? 'border-slate-800 bg-slate-900/95 text-slate-400'
        : 'border-slate-200 bg-white text-slate-500 shadow-sm'
    }`}>
      <div className="flex items-center gap-3">
        <span className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'}`} />
          <span>{status}</span>
        </span>
        <span className={`hidden md:inline ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
        <span className={`hidden md:inline font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          Khuôn: <span className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{problemTitle}</span>
        </span>
      </div>

      <div className={`flex items-center gap-3 text-[11px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        <span>Seed: {seed || 'Ngẫu nhiên'}</span>
        <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}>·</span>
        <span>Test: {testCount}</span>
        <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}>·</span>
        <span>{theme === 'dark' ? 'Chủ đề: Tối' : 'Chủ đề: Sáng'}</span>
      </div>
    </footer>
  );
};
