import React, { useState } from 'react';
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
  Download,
  Keyboard,
} from 'lucide-react';

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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const closeMenu = () => setActiveMenu(null);

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 select-none">
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-md shadow-blue-500/30 text-white font-bold text-sm tracking-wider">
            OJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-wide">OjGen</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v3.3.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Trình tạo bộ test &amp; Authoring Suite cho bài lập trình thi đấu
            </p>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSetup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Thiết lập thông tin bài toán"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>Thiết lập bài</span>
          </button>

          <button
            onClick={onOpenPackage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
            title="Đóng gói bài thi (ZIP / Kattis) [Ctrl+B]"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Đóng gói bài</span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Phím tắt bàn phím (Ctrl+/ hoặc ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Phím tắt</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
            title="Đổi chủ đề Sáng / Tối"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Menu Bar (Tệp, Công cụ, Giao diện, Trợ giúp) */}
      <div className="flex items-center gap-1 px-3 py-1 text-xs text-slate-300 bg-slate-900/60 relative">
        {/* Tệp Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={`px-2.5 py-1 rounded hover:bg-slate-800 transition ${activeMenu === 'file' ? 'bg-slate-800 text-white font-semibold' : ''}`}
          >
            Tệp
          </button>
          {activeMenu === 'file' && (
            <div
              className="absolute left-0 top-full mt-1 w-60 rounded-md bg-slate-900 border border-slate-700 shadow-xl py-1 z-50 text-slate-200"
              onMouseLeave={closeMenu}
            >
              <button
                onClick={() => { onSaveProject(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Lưu dự án (.ojproject)</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>
              <button
                onClick={() => { onOpenProject(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Mở dự án…</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
              </button>
              <div className="h-px bg-slate-800 my-1" />
              <button
                onClick={() => { setActiveTab('statement'); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" /> Soạn nội dung đề…
              </button>
              <button
                onClick={() => { onOpenPackage(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Đóng gói bài tập…</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+B</span>
              </button>
            </div>
          )}
        </div>

        {/* Công cụ Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
            className={`px-2.5 py-1 rounded hover:bg-slate-800 transition ${activeMenu === 'tools' ? 'bg-slate-800 text-white font-semibold' : ''}`}
          >
            Công cụ
          </button>
          {activeMenu === 'tools' && (
            <div
              className="absolute left-0 top-full mt-1 w-64 rounded-md bg-slate-900 border border-slate-700 shadow-xl py-1 z-50 text-slate-200"
              onMouseLeave={closeMenu}
            >
              <button
                onClick={() => { onOpenPlan(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Kế hoạch nhóm test / Subtasks…</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
              </button>
              <button
                onClick={() => { setActiveTab('differential'); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Kiểm thử đối chiếu &amp; Thu nhỏ lỗi</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+D</span>
              </button>
              <button
                onClick={() => { onOpenMatrix(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ma trận nhiều lời giải (AC/WA/TLE)</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+M</span>
              </button>
              <button
                onClick={() => { onOpenQueue(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Quản lý hàng đợi sinh test…
              </button>
              <div className="h-px bg-slate-800 my-1" />
              <button
                onClick={() => { setActiveTab('scaffolds'); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Wrench className="w-3.5 h-3.5" /> Tạo khung Validator / Checker…
              </button>
              <button
                onClick={() => { onRunSelfTest(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 text-emerald-400"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Chạy kiểm tra nội bộ (Selftest)
              </button>
            </div>
          )}
        </div>

        {/* Trợ giúp Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
            className={`px-2.5 py-1 rounded hover:bg-slate-800 transition ${activeMenu === 'help' ? 'bg-slate-800 text-white font-semibold' : ''}`}
          >
            Trợ giúp
          </button>
          {activeMenu === 'help' && (
            <div
              className="absolute left-0 top-full mt-1 w-56 rounded-md bg-slate-900 border border-slate-700 shadow-xl py-1 z-50 text-slate-200"
              onMouseLeave={closeMenu}
            >
              <button
                onClick={() => { onOpenShortcuts(); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><Keyboard className="w-3.5 h-3.5 text-cyan-400" /> Bảng phím tắt bàn phím</span>
                <span className="text-[10px] text-slate-400 font-mono">?</span>
              </button>
              <button
                onClick={() => { setActiveTab('help'); closeMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Hướng dẫn sử dụng
              </button>
              <div className="h-px bg-slate-800 my-1" />
              <button
                onClick={() => {
                  alert("OjGen 3.3.0 Web Edition\\nBộ công cụ tạo test và authoring chuyên nghiệp cho Competitive Programming.\\nNgôn ngữ: TypeScript + React.");
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
              >
                Giới thiệu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
