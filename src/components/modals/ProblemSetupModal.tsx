import React, { useState } from 'react';
import { Problem, ProblemStatement } from '../../core/types';
import { X, Wrench } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ProblemSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  statement: ProblemStatement;
  onChangeStatement: (s: ProblemStatement) => void;
}

export const ProblemSetupModal: React.FC<ProblemSetupModalProps> = ({
  isOpen,
  onClose,
  problem,
  statement,
  onChangeStatement,
}) => {
  const { lang, t, translateProblemTitle } = useLanguage();
  const [name, setName] = useState(statement.name || translateProblemTitle(problem.id, problem.title));
  const [code, setCode] = useState(statement.code || problem.id.toUpperCase());
  const [timeLimit, setTimeLimit] = useState(statement.timeLimitMs || 1000);
  const [memoryLimit, setMemoryLimit] = useState(statement.memoryLimitMb || 256);

  if (!isOpen) return null;

  const handleSave = () => {
    onChangeStatement({
      ...statement,
      name,
      code,
      timeLimitMs: timeLimit,
      memoryLimitMb: memoryLimit,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            <span>{t('modals.problemSetup.title')}</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">{t('modals.problemSetup.nameLabel')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">{t('modals.problemSetup.codeLabel')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">{t('modals.problemSetup.timeLimit')}</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value, 10) || 1000)}
                className="w-full font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">{t('modals.problemSetup.memoryLimit')}</label>
              <input
                type="number"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(parseInt(e.target.value, 10) || 256)}
                className="w-full font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
