import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Package,
  Wrench,
  Sun,
  Moon,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  Sparkles,
  Keyboard,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onOpenSetup: () => void;
  onOpenPlan: () => void;
  onOpenPackage: () => void;
  onOpenMatrix: () => void;
  onOpenQueue: () => void;
  onRunSelfTest: () => void;
  onOpenShortcuts: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onSaveProject,
  onOpenProject,
  onOpenSetup,
  onOpenPlan,
  onOpenPackage,
  onOpenMatrix,
  onOpenQueue,
  onRunSelfTest,
  onOpenShortcuts,
  activeTab,
  setActiveTab,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setActiveMenu(null);

  useEffect(() => {
    if (!activeMenu) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeMenu]);

  return (
    <header className={`border-b sticky top-0 z-40 select-none transition-colors ${
      theme === 'dark'
        ? 'border-slate-800 bg-slate-900/95 text-slate-200'
        : 'border-slate-200 bg-white/95 text-slate-800 shadow-sm'
    }`}>
      {/* Top Application Bar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-xs tracking-wider border ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-slate-100'
              : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            OJ
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm tracking-wide ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>OjGen Web</span>
            <span className="text-[11px] font-mono text-slate-400">v3.3.0</span>
            <span className={`hidden md:inline text-xs ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>/</span>
            <span className="text-xs text-slate-400 hidden md:block">
              {t('header.tagline')}
            </span>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLang}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={lang === 'vi' ? 'Switch to English (EN)' : 'Chuyển sang Tiếng Việt (VI)'}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono font-semibold text-[11px] uppercase">
              {lang === 'vi' ? 'VI' : 'EN'}
            </span>
          </button>

          <button
            onClick={onOpenSetup}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={t('header.problemSetup')}
          >
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('header.problemSetup')}</span>
          </button>

          <button
            onClick={onOpenPackage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition"
            title={`${t('header.package')} [Ctrl+B]`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t('header.package')}</span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={`${t('header.shortcuts')} (Ctrl+/ / ?)`}
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t('header.shortcuts')}</span>
          </button>

          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-md border transition ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-slate-700/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
            title={t('header.themeToggle')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Menu Bar (Tệp / File, Công cụ / Tools, Trợ giúp / Help) */}
      <div
        ref={menuBarRef}
        className={`flex items-center gap-1 px-3 py-1 text-xs relative ${
          theme === 'dark' ? 'text-slate-300 bg-slate-900/60' : 'text-slate-600 bg-slate-50'
        }`}
      >
        {/* Tệp / File Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={`px-2.5 py-1 rounded transition ${
              activeMenu === 'file'
                ? theme === 'dark' ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-200 text-slate-900 font-semibold'
                : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200/70'
            }`}
          >
            {t('header.fileMenu')}
          </button>
          {activeMenu === 'file' && (
            <div
              className={`absolute left-0 top-full mt-1 w-60 rounded-md border shadow-xl py-1 z-50 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <button
                onClick={() => { onSaveProject(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> {t('header.saveProject')}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>
              <button
                onClick={() => { onOpenProject(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> {t('header.openProject')}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
              </button>
              <div className={`h-px my-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <button
                onClick={() => { setActiveTab('statement'); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> {t('header.editStatement')}
              </button>
              <button
                onClick={() => { onOpenPackage(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5" /> {t('header.packageProblem')}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+B</span>
              </button>
            </div>
          )}
        </div>

        {/* Công cụ / Tools Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
            className={`px-2.5 py-1 rounded transition ${
              activeMenu === 'tools'
                ? theme === 'dark' ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-200 text-slate-900 font-semibold'
                : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200/70'
            }`}
          >
            {t('header.toolsMenu')}
          </button>
          {activeMenu === 'tools' && (
            <div
              className={`absolute left-0 top-full mt-1 w-64 rounded-md border shadow-xl py-1 z-50 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <button
                onClick={() => { onOpenPlan(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> {t('header.testPlan')}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
              </button>
              <button
                onClick={() => { setActiveTab('differential'); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> {t('header.differential')}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+D</span>
              </button>
              <button
                onClick={() => { onOpenMatrix(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> {t('header.solutionMatrix')}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+M</span>
              </button>
              <button
                onClick={() => { onOpenQueue(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <Play className="w-3.5 h-3.5" /> {t('header.queueManager')}
              </button>
              <div className={`h-px my-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <button
                onClick={() => { setActiveTab('scaffolds'); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" /> {t('header.scaffolds')}
              </button>
              <button
                onClick={() => { onRunSelfTest(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('header.runSelfTest')}
              </button>
            </div>
          )}
        </div>

        {/* Trợ giúp / Help Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
            className={`px-2.5 py-1 rounded transition ${
              activeMenu === 'help'
                ? theme === 'dark' ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-200 text-slate-900 font-semibold'
                : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200/70'
            }`}
          >
            {t('header.helpMenu')}
          </button>
          {activeMenu === 'help' && (
            <div
              className={`absolute left-0 top-full mt-1 w-56 rounded-md border shadow-xl py-1 z-50 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <button
                onClick={() => { onOpenShortcuts(); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-2"><Keyboard className="w-3.5 h-3.5 text-slate-400" /> {t('header.shortcutsTable')}</span>
                <span className="text-[10px] text-slate-400 font-mono">?</span>
              </button>
              <button
                onClick={() => { setActiveTab('help'); closeMenu(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> {t('header.docs')}
              </button>
              <div className={`h-px my-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <button
                onClick={() => {
                  setActiveTab('help');
                  closeMenu();
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
                  theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-400" /> {t('header.about')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
