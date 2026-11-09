import React, { useState } from 'react';
import { ManualTestCase, Problem, Config } from '../../core/types';
import { X, Plus, Trash2, CheckCircle2, Play, AlertCircle, FileText } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ManualTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualTests: ManualTestCase[];
  onChangeManualTests: (tests: ManualTestCase[]) => void;
  problem: Problem;
  config: Config;
}

export const ManualTestsModal: React.FC<ManualTestsModalProps> = ({
  isOpen,
  onClose,
  manualTests,
  onChangeManualTests,
  problem,
  config,
}) => {
  const { lang, t } = useLanguage();
  const [localTests, setLocalTests] = useState<ManualTestCase[]>(manualTests);

  if (!isOpen) return null;

  const handleAdd = () => {
    const next: ManualTestCase = {
      id: Math.random().toString(36).slice(2, 9),
      name: `${lang === 'en' ? 'Manual Test' : 'Test tay'} ${localTests.length + 1}`,
      input: '',
      output: '',
      isSample: false,
    };
    setLocalTests([...localTests, next]);
  };

  const validateTest = (idx: number) => {
    const testCase = localTests[idx];
    const inp = testCase.input.endsWith('\n') ? testCase.input : testCase.input + '\n';
    const err = problem.validateInput(inp, config);
    const next = [...localTests];
    if (err) {
      next[idx] = { ...testCase, isValid: false, validationError: err };
    } else {
      const out = problem.solve(inp, config);
      next[idx] = { ...testCase, isValid: true, validationError: undefined, output: out.trim() };
    }
    setLocalTests(next);
  };

  const handleSave = () => {
    onChangeManualTests(localTests);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{t('modals.manualTests.title')}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {t('modals.manualTests.subtitle')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('modals.manualTests.addBtn')}</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {t('modals.manualTests.total')} {localTests.length}
          </span>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {localTests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              {t('modals.manualTests.empty')}
            </div>
          ) : (
            localTests.map((tItem, idx) => (
              <div key={tItem.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={tItem.name}
                    onChange={(e) => {
                      const next = [...localTests];
                      next[idx] = { ...tItem, name: e.target.value };
                      setLocalTests(next);
                    }}
                    className="font-semibold text-slate-200 bg-transparent border-b border-slate-700 px-1 py-0.5"
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={tItem.isSample}
                        onChange={(e) => {
                          const next = [...localTests];
                          next[idx] = { ...tItem, isSample: e.target.checked };
                          setLocalTests(next);
                        }}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600 w-3.5 h-3.5"
                      />
                      <span>{t('modals.manualTests.isSample')}</span>
                    </label>
                    <button
                      onClick={() => validateTest(idx)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium flex items-center gap-1"
                      title={t('modals.manualTests.solveBtn')}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t('modals.manualTests.solveBtn')}</span>
                    </button>
                    <button
                      onClick={() => {
                        const next = localTests.filter((_, i) => i !== idx);
                        setLocalTests(next);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Input:</span>
                    <textarea
                      rows={3}
                      value={tItem.input}
                      onChange={(e) => {
                        const next = [...localTests];
                        next[idx] = { ...tItem, input: e.target.value, isValid: undefined };
                        setLocalTests(next);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                      placeholder={lang === 'en' ? 'Paste input contents...' : 'Dán nội dung input...'}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">
                      {lang === 'en' ? 'Canonical Output:' : 'Output chuẩn:'}
                    </span>
                    <textarea
                      rows={3}
                      value={tItem.output || ''}
                      onChange={(e) => {
                        const next = [...localTests];
                        next[idx] = { ...tItem, output: e.target.value };
                        setLocalTests(next);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-blue-400"
                      placeholder={lang === 'en' ? 'Auto-solved output...' : 'Output sinh tự động...'}
                    />
                  </div>
                </div>

                {tItem.validationError && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{tItem.validationError}</span>
                  </div>
                )}
                {tItem.isValid && (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('modals.manualTests.validNotice')}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium">
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
