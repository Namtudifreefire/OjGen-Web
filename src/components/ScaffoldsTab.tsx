import React, { useState } from 'react';
import { Problem, Config } from '../core/types';
import { AuthoringScaffolds, ScaffoldTemplate } from '../core/scaffolds';
import { Copy, Download, Code2, Check } from 'lucide-react';

interface ScaffoldsTabProps {
  problem: Problem;
  config: Config;
}

export const ScaffoldsTab: React.FC<ScaffoldsTabProps> = ({ problem, config }) => {
  const templates = AuthoringScaffolds.build(problem, config);
  const [selectedKey, setSelectedKey] = useState<string>(templates[0]?.key || '');
  const [copied, setCopied] = useState<boolean>(false);

  const currentTemplate = templates.find((t) => t.key === selectedKey) || templates[0];

  const handleCopy = () => {
    if (!currentTemplate) return;
    navigator.clipboard.writeText(currentTemplate.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentTemplate) return;
    const blob = new Blob([currentTemplate.source], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentTemplate.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>🧰 Tạo khung Validator &amp; Checker (Scaffold Templates)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Tạo sẵn mã nguồn C++ (Standalone / Testlib) và Python theo đúng khuôn và cấu hình bài hiện tại
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Template List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 px-2 py-1">Chọn khung mã nguồn:</span>
          {templates.map((tpl) => (
            <button
              key={tpl.key}
              onClick={() => setSelectedKey(tpl.key)}
              className={`p-2.5 rounded-lg text-left text-xs transition border ${
                selectedKey === tpl.key
                  ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="font-semibold">{tpl.displayName}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{tpl.fileName}</div>
            </button>
          ))}
        </div>

        {/* Code Editor Preview */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[560px]">
          {currentTemplate && (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {currentTemplate.displayName} ({currentTemplate.fileName})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{currentTemplate.readme}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về file</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto">
                <pre className="text-xs font-mono text-emerald-300 whitespace-pre leading-relaxed">
                  {currentTemplate.source}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
