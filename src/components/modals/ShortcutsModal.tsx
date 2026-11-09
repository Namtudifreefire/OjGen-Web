import React from 'react';
import { X, Keyboard, Save, Play, FileText, Layers, Package, Sparkles, RotateCcw, ListFilter } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      title: lang === 'en' ? 'Core Task Shortcuts (Global)' : 'Phím tắt tác vụ chính (Global)',
      items: [
        {
          keys: [`${modKey}`, 'S'],
          description: lang === 'en' ? 'Save current project to .ojproject.json' : 'Lưu toàn bộ dự án hiện tại ra tệp .ojproject.json',
          icon: <Save className="w-4 h-4 text-slate-300" />,
          highlight: true,
        },
        {
          keys: [`${modKey}`, 'G'],
          description: lang === 'en' ? 'Generate testcases automatically' : 'Bắt đầu sinh bộ test (tự động kích hoạt quá trình tạo)',
          icon: <Play className="w-4 h-4 text-slate-300" />,
          highlight: true,
        },
        {
          keys: [`${modKey}`, 'L'],
          description: lang === 'en' ? 'Quick switch to Log tab' : 'Chuyển nhanh sang tab Nhật ký (xem log thực thi & kết quả)',
          icon: <FileText className="w-4 h-4 text-slate-300" />,
          highlight: true,
        },
      ],
    },
    {
      title: lang === 'en' ? 'File & Problem Management' : 'Tệp & Quản lý bài tập',
      items: [
        {
          keys: [`${modKey}`, 'O'],
          description: lang === 'en' ? 'Open OjGen project file (.ojproject.json)' : 'Mở tệp dự án OjGen (.ojproject.json)',
          icon: <Layers className="w-4 h-4 text-slate-400" />,
        },
        {
          keys: [`${modKey}`, 'P'],
          description: lang === 'en' ? 'Open Test Plan / Subtasks configuration' : 'Mở kế hoạch phân nhóm test / Subtasks',
          icon: <Layers className="w-4 h-4 text-slate-400" />,
        },
        {
          keys: [`${modKey}`, 'B'],
          description: lang === 'en' ? 'Open Package dialog (ZIP / Kattis)' : 'Mở hộp thoại đóng gói bài tập (ZIP / Kattis)',
          icon: <Package className="w-4 h-4 text-slate-400" />,
        },
        {
          keys: [`${modKey}`, 'M'],
          description: lang === 'en' ? 'Open Solution Matrix benchmarking dialog' : 'Mở ma trận kiểm thử nhiều lời giải (Solution Matrix)',
          icon: <Sparkles className="w-4 h-4 text-slate-400" />,
        },
      ],
    },
    {
      title: lang === 'en' ? 'Tab Navigation & Dialogs' : 'Điều hướng tab & Hộp thoại',
      items: [
        {
          keys: [`${modKey}`, 'I'],
          description: lang === 'en' ? 'Quick switch to Test Inventory tab' : 'Chuyển nhanh sang tab Kiểm kê bài test (Inventory)',
          icon: <ListFilter className="w-4 h-4 text-slate-400" />,
        },
        {
          keys: [`${modKey}`, 'D'],
          description: lang === 'en' ? 'Quick switch to Differential & Shrinker tab' : 'Chuyển nhanh sang tab Đối chiếu & Thu nhỏ test (Differential)',
          icon: <RotateCcw className="w-4 h-4 text-slate-400" />,
        },
        {
          keys: [`${modKey}`, '/'],
          altKeys: ['?'],
          description: lang === 'en' ? 'Open / Close this shortcuts reference table' : 'Mở / Đóng bảng danh sách phím tắt này',
          icon: <Keyboard className="w-4 h-4 text-slate-400" />,
        },
        {
          keys: ['Esc'],
          description: lang === 'en' ? 'Close current modal or cancel task' : 'Đóng hộp thoại đang mở hoặc hủy tác vụ',
          icon: <X className="w-4 h-4 text-slate-400" />,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {lang === 'en' ? 'OjGen Keyboard Shortcuts' : 'Phím tắt bàn phím OjGen'}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Global Shortcuts
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Quick actions from anywhere within the app' : 'Thao tác nhanh chóng từ mọi vị trí trong ứng dụng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={lang === 'en' ? 'Close (Esc)' : 'Đóng (Esc)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                      item.highlight
                        ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-xs text-slate-200">{item.description}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-1 text-xs font-mono font-semibold rounded-md bg-slate-800 text-slate-100 border border-slate-600 shadow-sm min-w-[24px] text-center">
                            {k}
                          </kbd>
                          {kIdx < item.keys.length - 1 && (
                            <span className="text-slate-500 text-xs font-mono">+</span>
                          )}
                        </React.Fragment>
                      ))}
                      {item.altKeys && (
                        <>
                          <span className="text-slate-500 text-xs font-mono">/</span>
                          {item.altKeys.map((ak, akIdx) => (
                            <kbd
                              key={akIdx}
                              className="px-2 py-1 text-xs font-mono font-semibold rounded-md bg-slate-800 text-slate-100 border border-slate-600 shadow-sm min-w-[24px] text-center"
                            >
                              {ak}
                            </kbd>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>{lang === 'en' ? 'Tip: You can press' : 'Mẹo: Bạn có thể nhấn'}</span>
            <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-800 text-slate-200 border border-slate-700 rounded">
              ?
            </kbd>
            <span>{lang === 'en' ? 'anytime to show this cheat sheet.' : 'bất kỳ lúc nào để bật bảng này.'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
