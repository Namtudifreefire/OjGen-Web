import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { GeneratedTestCase, Problem, Config } from '../../core/types';
import { X, Plus, Upload, CheckCircle2, AlertCircle, FileText, FolderOpen, Trash2, RefreshCw } from 'lucide-react';

interface ImportTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tests: GeneratedTestCase[]) => void;
  problem: Problem;
  config: Config;
}

export const ImportTestsModal: React.FC<ImportTestsModalProps> = ({
  isOpen,
  onClose,
  onImport,
  problem,
  config,
}) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const [files, setFiles] = useState<File[]>([]);
  const [zipStructure, setZipStructure] = useState<string[]>([]);
  const [parsedTests, setParsedTests] = useState<GeneratedTestCase[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'zip' | 'folder'>('zip');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const switchMode = (nextMode: 'zip' | 'folder') => {
    setMode(nextMode);
    setFiles([]);
    setParsedTests([]);
    setZipStructure([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setError(null);
    setParsedTests([]);
    setZipStructure([]);
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const tests: GeneratedTestCase[] = [];

      if (mode === 'zip') {
        // Process ZIP file
        const zipFile = files[0];
        if (!zipFile.name.endsWith('.zip')) {
          setError(text('Vui lòng chọn file ZIP.', 'Please choose a ZIP file.'));
          return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(zipFile);
        const entries: string[] = [];

        // Find .inp/.in and .out/.ans pairs
        const inpFiles = new Map<string, string>();
        const outFiles = new Map<string, string>();

        for (const [path, entry] of Object.entries(zip.files)) {
          if (entry.dir) continue;
          entries.push(path);
          const lower = path.toLowerCase();
          if (lower.endsWith('.inp') || lower.endsWith('.in')) {
            const content = await entry.async('string');
            inpFiles.set(path, content);
          } else if (lower.endsWith('.out') || lower.endsWith('.ans')) {
            const content = await entry.async('string');
            outFiles.set(path, content);
          }
        }

        setZipStructure(entries);

        // Match pairs by base name
        for (const [inpPath, inpContent] of inpFiles) {
          const baseName = inpPath.replace(/\.(inp|in)$/i, '');
          let outContent: string | undefined;

          // Try to find matching output
          for (const [oPath, oContent] of outFiles) {
            const oBase = oPath.replace(/\.(out|ans)$/i, '');
            if (oBase === baseName || oPath === inpPath.replace(/\.(inp|in)$/i, '.out')) {
              outContent = oContent;
              break;
            }
          }

          // Validate input
          const valErr = problem.validateInput(inpContent.endsWith('\n') ? inpContent : inpContent + '\n', config);
          if (valErr) {
            console.warn(`Skipping ${inpPath}: ${valErr}`);
            continue;
          }

          const out = outContent ?? problem.solve(inpContent.endsWith('\n') ? inpContent : inpContent + '\n', config);

          tests.push({
            index: tests.length + 1,
            fileName: baseName.split('/').pop() || `test${tests.length + 1}`,
            groupName: 'Imported',
            input: inpContent,
            output: out.trim(),
            seed: 'imported',
            bytes: inpContent.length,
            tags: ['imported'],
            sha256: await hashString(inpContent),
          });
        }
      } else {
        // Process folder (multiple files)
        const inpFiles = new Map<string, string>();
        const outFiles = new Map<string, string>();

        for (const file of files) {
          const content = await file.text();
          const lower = file.name.toLowerCase();
          if (lower.endsWith('.inp') || lower.endsWith('.in')) {
            inpFiles.set(file.name, content);
          } else if (lower.endsWith('.out') || lower.endsWith('.ans')) {
            outFiles.set(file.name, content);
          }
        }

        for (const [inpName, inpContent] of inpFiles) {
          const baseName = inpName.replace(/\.(inp|in)$/i, '');
          let outContent: string | undefined;

          for (const [oName, oContent] of outFiles) {
            const oBase = oName.replace(/\.(out|ans)$/i, '');
            if (oBase === baseName) {
              outContent = oContent;
              break;
            }
          }

          const valErr = problem.validateInput(inpContent.endsWith('\n') ? inpContent : inpContent + '\n', config);
          if (valErr) {
            console.warn(`Skipping ${inpName}: ${valErr}`);
            continue;
          }

          const out = outContent ?? problem.solve(inpContent.endsWith('\n') ? inpContent : inpContent + '\n', config);

          tests.push({
            index: tests.length + 1,
            fileName: baseName,
            groupName: 'Imported',
            input: inpContent,
            output: out.trim(),
            seed: 'imported',
            bytes: inpContent.length,
            tags: ['imported'],
            sha256: await hashString(inpContent),
          });
        }
      }

      setParsedTests(tests);
    } catch (err: any) {
      setError(text(`Lỗi xử lý file: ${err.message}`, `Could not process file: ${err.message}`));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (parsedTests.length > 0) {
      onImport(parsedTests);
      onClose();
    }
  };

  const hashString = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span>{text("Nhập test từ thư mục / ZIP", "Import tests from folder / ZIP")}</span>
            </h3>
            <p className="text-xs text-slate-400">{text("Hỗ trợ cặp file .inp/.in + .out/.ans; tự sinh output nếu thiếu", "Supports .inp/.in and .out/.ans pairs; missing outputs are generated")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={text('Đóng', 'Close')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">{text("Chế độ:", "Mode:")}</span>
            <button
              onClick={() => switchMode('zip')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${mode === 'zip' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {text('Tệp ZIP', 'ZIP file')}
            </button>
            <button
              onClick={() => switchMode('folder')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${mode === 'folder' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >{text("Chọn nhiều file", "Select multiple files")}
            </button>
          </div>

          {/* File Input */}
          <div>
            <span id="import-tests-file-label" className="block text-xs font-medium text-slate-300 mb-2">
              {mode === 'zip' ? text("Chọn file ZIP chứa test", "Select a ZIP containing tests") : text("Chọn các file .inp/.in và .out/.ans", "Select .inp/.in and .out/.ans files")}
            </span>
            <div className="flex items-center gap-3 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2">
              <input
                ref={fileInputRef}
                id="import-tests-file-input"
                type="file"
                multiple={mode === 'folder'}
                accept={mode === 'zip' ? '.zip' : '.inp,.in,.out,.ans'}
                onChange={handleFileSelect}
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              />
              <button
                type="button"
                aria-describedby="import-tests-file-label"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                {text('Chọn tệp', mode === 'folder' ? 'Choose files' : 'Choose file')}
              </button>
              <span className="text-xs text-slate-300 truncate">
                {files.length === 0
                  ? text('Không tệp nào được chọn', mode === 'folder' ? 'No files chosen' : 'No file chosen')
                  : mode === 'zip'
                  ? files[0].name
                  : `${files.length} ${text('file được chọn', files.length === 1 ? 'file selected' : 'files selected')}`}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={processFiles}
              disabled={files.length === 0 || isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isProcessing ? text("Đang xử lý...", "Processing...") : text("Quét và phân tích", "Scan and analyze")}</span>
            </button>
            {parsedTests.length > 0 && (
              <span className="text-xs text-emerald-400 font-mono">{text("Tìm thấy", "Found")} {parsedTests.length} {text("cặp test hợp lệ", "valid test pairs")}
              </span>
            )}
          </div>

          {/* ZIP Structure Preview */}
          {zipStructure.length > 0 && (
            <div className="max-h-40 overflow-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
              <p className="text-[11px] text-slate-400 mb-1 font-semibold">{text("Cấu trúc ZIP:", "ZIP contents:")}</p>
              <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap">
                {zipStructure.join('\n')}
              </pre>
            </div>
          )}

          {/* Parsed Tests Preview */}
          {parsedTests.length > 0 && (
            <div className="max-h-60 overflow-auto space-y-2">
              <p className="text-xs font-semibold text-slate-300">{text("Danh sách test sẽ nhập (", "Tests to import (")}{parsedTests.length}):</p>
              {parsedTests.slice(0, 20).map((t, idx) => (
                <div key={t.index} className="p-2 bg-slate-950 border border-slate-800 rounded text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-200">{t.fileName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">{t.bytes} B</span>
                    {t.sha256 && <span className="text-[9px] text-slate-500 font-mono">{t.sha256.slice(0, 16)}...</span>}
                  </div>
                  <span className="text-[10px] text-emerald-400">{text("✓ Sẵn sàng", "✓ Ready")}</span>
                </div>
              ))}
              {parsedTests.length > 20 && (
                <p className="text-[11px] text-slate-500 text-center py-2">{text("... và", "... and")} {parsedTests.length - 20} {text("test khác", "more tests")}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button onClick={onClose} className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">{text("Hủy", "Cancel")}
          </button>
          <button
            onClick={handleImport}
            disabled={parsedTests.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{text("Nhập", "Import")} {parsedTests.length} {text("test", parsedTests.length === 1 ? "test" : "tests")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
