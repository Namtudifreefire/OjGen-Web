import React, { useState } from 'react';
import { Problem, Config, ProblemStatement, GeneratedTestCase } from '../../core/types';
import { ProblemPackageExporter } from '../../core/packageExporter';
import { X, Package, Download } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  config: Config;
  statement: ProblemStatement;
  seed: string;
  tests: GeneratedTestCase[];
  onAddLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  problem,
  config,
  statement,
  seed,
  tests,
  onAddLog,
}) => {
  const { lang, t } = useLanguage();
  const [format, setFormat] = useState<'OjGen' | 'Kattis'>('OjGen');
  const [packageName, setPackageName] = useState<string>(statement.code || problem.id);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await ProblemPackageExporter.createZip({
        format,
        packageName,
        problem,
        config,
        seed,
        statement,
        tests,
      });

      const fileName = `${packageName || 'problem'}_${format.toLowerCase()}_package.zip`;
      ProblemPackageExporter.downloadBlob(blob, fileName);
      onAddLog(
        lang === 'en'
          ? `Successfully packaged ${tests.length} tests in ${format} format to ${fileName}!`
          : `Đã đóng gói thành công ${tests.length} test theo chuẩn ${format} vào ${fileName}!`,
        'success'
      );
      setIsExporting(false);
      onClose();
    } catch (err: any) {
      setExportError(lang === 'en' ? `Packaging error: ${err.message}` : `Lỗi đóng gói: ${err.message}`);
      onAddLog(lang === 'en' ? `Packaging error: ${err.message}` : `Lỗi đóng gói: ${err.message}`, 'error');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span>{t('modals.package.title')}</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">{t('modals.package.packageName')}</label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">{t('modals.package.formatLabel')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('OjGen')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  format === 'OjGen'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-slate-100">OjGen Standard</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t('modals.package.ojgenDesc')}</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('Kattis')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  format === 'Kattis'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-slate-100">Kattis / ICPC</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t('modals.package.kattisDesc')}</div>
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{t('modals.package.testCount')}</span>
              <span className="font-mono text-slate-200">{tests.length} tests</span>
            </div>
            <div className="flex justify-between">
              <span>{t('modals.package.statementAttached')}</span>
              <span className="text-emerald-400 font-medium">{t('modals.package.yes')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('modals.package.checksumPreserved')}</span>
              <span className="text-emerald-400 font-medium">SHA-256</span>
            </div>
          </div>

          {exportError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {exportError}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? t('modals.package.exporting') : t('modals.package.downloadBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
