import React from 'react';
import { Trash2, Copy, Download } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

interface LogTabProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogTab: React.FC<LogTabProps> = ({ logs, onClearLogs }) => {
  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Đã sao chép toàn bộ nhật ký!');
  };

  const handleDownload = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ojgen_log_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-100">📋 Nhật ký hoạt động</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Ctrl+L
          </kbd>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {logs.length} dòng
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa nhật ký</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Lưu ra file…</span>
          </button>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto font-mono text-xs leading-relaxed">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic">
            Chưa có nhật ký nào được ghi nhận.
          </div>
        ) : (
          logs.map((log) => {
            let color = 'text-slate-300';
            if (log.level === 'warn') color = 'text-amber-400';
            if (log.level === 'error') color = 'text-red-400 font-semibold';
            if (log.level === 'success') color = 'text-emerald-400 font-semibold';

            return (
              <div key={log.id} className="py-0.5 flex items-start gap-3 hover:bg-slate-900/50 px-1 rounded">
                <span className="text-slate-500 select-none text-[11px]">{log.timestamp}</span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                  log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                  log.level === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                  log.level === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {log.level}
                </span>
                <span className={color}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
