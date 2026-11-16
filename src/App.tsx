import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ClipboardList, Code2, FilePenLine, FlaskConical, GitCompareArrows, ListChecks } from 'lucide-react';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { GeneratorTab } from './components/GeneratorTab';
import { LogTab, LogEntry } from './components/LogTab';
import { InventoryTab } from './components/InventoryTab';
import { StatementTab } from './components/StatementTab';
import { DifferentialTab } from './components/DifferentialTab';
import { ScaffoldsTab } from './components/ScaffoldsTab';
import { HelpTab } from './components/HelpTab';

import { TestPlanModal } from './components/modals/TestPlanModal';
import { ProblemSetupModal } from './components/modals/ProblemSetupModal';
import { ManualTestsModal } from './components/modals/ManualTestsModal';
import { PackageModal } from './components/modals/PackageModal';
import { SolutionMatrixModal } from './components/modals/SolutionMatrixModal';
import { QueueModal } from './components/modals/QueueModal';
import { CoverageModal } from './components/modals/CoverageModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { AboutModal } from './components/modals/AboutModal';
import { ImportTestsModal } from './components/modals/ImportTestsModal';
import { CompareTestsModal } from './components/modals/CompareTestsModal';
import { ContractModal } from './components/modals/ContractModal';
import { RunProfileModal } from './components/modals/RunProfileModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { ALL_PROBLEMS, findProblem } from './core/problems/allProblems';
import { Problem, Config, TestGroupSpec, ManualTestCase, GeneratedTestCase, ProblemStatement } from './core/types';
import { CoverageAnalyzer, CoverageReport } from './core/coverage';
import { Rng } from './core/rng';
import { Button } from './components/ui/Button';
import { I18nProvider, useTranslation } from './i18n';
import { problemTitle } from './i18n/problemLabels';

const defaultStatement = (language: 'vi' | 'en'): ProblemStatement => ({
  name: language === 'en' ? 'Integer array sum' : 'Mảng số nguyên và tổng phần tử',
  code: 'SUMARR', timeLimitMs: 1000, memoryLimitMb: 256,
  description: language === 'en' ? 'Given an array of N integers A1, A2, ..., AN, calculate the sum of its elements.' : 'Cho mảng gồm N số nguyên A1, A2, ..., AN. Hãy tính tổng tất cả các phần tử trong mảng.',
  inputFormat: language === 'en' ? 'Line 1 contains N (1 ≤ N ≤ 10).\nLine 2 contains N integers A1 ... AN (1 ≤ Ai ≤ 100).' : 'Dòng 1 ghi số nguyên N (1 ≤ N ≤ 10).\nDòng 2 ghi N số nguyên A1 ... AN (1 ≤ Ai ≤ 100).',
  outputFormat: language === 'en' ? 'Print a single integer: the sum of the array elements.' : 'In ra một số nguyên duy nhất là tổng các phần tử của mảng.',
  constraints: '1 ≤ N ≤ 10\n1 ≤ Ai ≤ 100',
  samples: [{ input: '5\n1 2 3 4 5\n', output: '15', explanation: '1 + 2 + 3 + 4 + 5 = 15' }],
});

function AppContent() {
  const { t, language } = useTranslation();
  const tr = (vi: string, en: string) => language === 'en' ? en : vi;
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [interfaceMode, setInterfaceMode] = useState<'classic' | 'preview'>(() => {
    try { return localStorage.getItem('ojgen-interface-mode') === 'preview' ? 'preview' : 'classic'; }
    catch { return 'classic'; }
  });
  const [activeTab, setActiveTab] = useState<string>('generator');

  const changeInterfaceMode = (mode: 'classic' | 'preview') => {
    setInterfaceMode(mode);
    try { localStorage.setItem('ojgen-interface-mode', mode); } catch { /* Storage may be unavailable. */ }
  };

  // Core problem and configurations
  const [currentProblem, setCurrentProblem] = useState<Problem>(ALL_PROBLEMS[2]); // Default: ArrayProblem
  const [config, setConfig] = useState<Config>(() => ALL_PROBLEMS[2].defaultConfig());
  const [testCount, setTestCount] = useState<number>(10);
  const [seed, setSeed] = useState<string>('2026');

  // Subtasks, manual tests, generated tests, statement
  const [groups, setGroups] = useState<TestGroupSpec[]>([]);
  const [manualTests, setManualTests] = useState<ManualTestCase[]>([]);
  const [generatedTests, setGeneratedTests] = useState<GeneratedTestCase[]>([]);
  const [statement, setStatement] = useState<ProblemStatement>(() => defaultStatement(language));
  const statementIsDefault = useRef(true);
  const updateStatement = (next: ProblemStatement) => {
    statementIsDefault.current = false;
    setStatement(next);
  };
  useEffect(() => {
    if (statementIsDefault.current) setStatement(defaultStatement(language));
  }, [language]);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString(),
      message: tr('OjGen 3.3.0 Web Edition đã khởi động sẵn sàng. 19 khuôn bài toán đã sẵn sàng. Sử dụng phím tắt [Ctrl+S], [Ctrl+G], [Ctrl+L] hoặc [?] để thao tác nhanh.', 'OjGen 3.3.0 Web Edition is ready with 19 templates. Use [Ctrl+S], [Ctrl+G], [Ctrl+L] or [?] for shortcuts.'),
      level: 'info',
    },
  ]);

  // Global triggers and toast notifications
  const [runTriggerCount, setRunTriggerCount] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isPackageOpen, setIsPackageOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isCoverageOpen, setIsCoverageOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isRunProfileOpen, setIsRunProfileOpen] = useState(false);
  const [coverageReport, setCoverageReport] = useState<CoverageReport | null>(null);

  // Contract & Run Profile data
  const [contractData, setContractData] = useState<any>(null);
  const [runProfileData, setRunProfileData] = useState<any>(null);

  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warn' | 'error' = 'info',
    durationMs: number = 2500
  ) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).slice(2, 9),
      title,
      description,
      type,
      durationMs,
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addLog = (message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const entry: LogEntry = {
      id: Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      level,
    };
    setLogs((prev) => [entry, ...prev.slice(0, 499)]);
  };

  const handleSelectProblem = (prob: Problem) => {
    if (prob.id === currentProblem.id) return;

    setCurrentProblem(prob);
    setConfig(prob.defaultConfig());
    setGroups([]);
    setManualTests([]);
    setGeneratedTests([]);
    setCoverageReport(null);
    setIsCoverageOpen(false);
    addLog(tr(`Đã chuyển sang khuôn bài "${prob.title}" (${prob.id}); các nhóm và test của khuôn cũ đã được xóa để tránh sai định dạng.`, `Switched to "${problemTitle(prob, language)}" (${prob.id}); previous groups and tests were cleared to avoid format mismatches.`), 'warn');
    showToast(tr("Đã đổi khuôn bài", "Template changed"), tr("Nhóm test và test cũ đã được xóa vì có thể không tương thích với cấu trúc input mới.", "Previous groups and tests were cleared because they may not match the new input format."), 'warn', 5000);
  };

  // Open Coverage Analysis
  const handleOpenCoverage = () => {
    const rep = CoverageAnalyzer.analyze(currentProblem, config, groups, generatedTests, language);
    setCoverageReport(rep);
    setIsCoverageOpen(true);
    addLog(tr(`Đã phân tích độ phủ cho ${generatedTests.length} test.`, `Analyzed coverage for ${generatedTests.length} tests.`), 'info');
  };

  // Selftest
  const handleRunSelfTest = () => {
    addLog(tr("Bắt đầu kiểm tra nội bộ (Selftest) trên toàn bộ 19 khuôn bài...", "Starting self-test for all 19 templates..."), 'info');
    let passed = 0;
    const rng = new Rng(12345);
    for (const prob of ALL_PROBLEMS) {
      try {
        const cfg = prob.defaultConfig();
        const testInp = prob.generate(rng, cfg);
        const err = prob.validateInput(testInp, cfg);
        const out = prob.solve(testInp, cfg);
        if (!err && out !== undefined) {
          passed++;
        } else {
          addLog(tr(`Selftest thất bại tại ${prob.id}: ${err}`, `Self-test failed for ${prob.id}: ${err}`), 'error');
        }
      } catch (e: any) {
        addLog(tr(`Selftest lỗi ngoại lệ tại ${prob.id}: ${e.message}`, `Self-test exception in ${prob.id}: ${e.message}`), 'error');
      }
    }
    addLog(tr(`Selftest hoàn tất: ${passed}/${ALL_PROBLEMS.length} khuôn bài toán vượt qua kiểm thử!`, `Self-test finished: ${passed}/${ALL_PROBLEMS.length} templates passed.`), 'success');
    alert(tr(`Selftest hoàn tất: ${passed}/${ALL_PROBLEMS.length} khuôn vượt qua.`, `Self-test finished: ${passed}/${ALL_PROBLEMS.length} templates passed.`));
  };

  // Save Project as JSON
  const handleSaveProject = () => {
    const project = {
      version: 1,
      savedAt: new Date().toISOString(),
      problemId: currentProblem.id,
      problemTitle: currentProblem.title,
      testCount,
      seed,
      config: config.toJSON(),
      groups: groups.map((g) => ({ ...g, cfg: g.cfg?.toJSON() })),
      manualTests,
      statement,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${statement.code || currentProblem.id}.ojproject.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(tr(`Đã lưu dự án "${a.download}" thành công.`, `Saved project "${a.download}".`), 'success');
  };

  // Open Project JSON file
  const handleOpenProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.ojproject';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result as string);
          if (data.problemId) {
            const prob = findProblem(data.problemId);
            if (prob) {
              setCurrentProblem(prob);
              if (data.config) setConfig(Config.fromJSON(data.config));
              if (data.testCount) setTestCount(data.testCount);
              if (data.seed) setSeed(data.seed);
              if (data.statement) updateStatement(data.statement);
              if (data.manualTests) setManualTests(data.manualTests);
              addLog(tr(`Đã nạp dự án "${file.name}" thành công!`, `Loaded project "${file.name}".`), 'success');
            }
          }
        } catch (err: any) {
          alert(tr(`Không thể đọc file dự án: ${err.message}`, `Could not read project file: ${err.message}`));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Run all jobs in queue
  const handleExecuteQueue = async (items: any[]) => {
    if (!items || items.length === 0) return;
    addLog(tr(`Bắt đầu chạy hàng đợi gồm ${items.length} tác vụ...`, `Starting queue with ${items.length} jobs...`), 'info');
    setActiveTab('inventory');

    const allNewTests: GeneratedTestCase[] = [];
    let globalIndex = 1;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const prob = findProblem(item.problemId) || currentProblem;
      const cfg = item.problemId === currentProblem.id ? config : prob.defaultConfig();
      const jobRng = new Rng(item.seed || Math.floor(Math.random() * 1000000).toString());

      addLog(tr(`[Hàng đợi ${idx + 1}/${items.length}] Đang sinh ${item.testCount} test cho "${prob.title}"...`, `[Queue ${idx + 1}/${items.length}] Generating ${item.testCount} tests for "${problemTitle(prob, language)}"...`), 'info');

      for (let t = 0; t < item.testCount; t++) {
        try {
          const inp = prob.generate(jobRng, cfg);
          const out = prob.solve(inp, cfg);
          allNewTests.push({
            index: globalIndex,
            fileName: `test${String(globalIndex).padStart(2, '0')}`,
            groupName: `Job #${idx + 1} (${prob.id})`,
            input: inp,
            output: out,
            seed: item.seed,
            bytes: inp.length,
            tags: ['queue', prob.id],
          });
          globalIndex++;
        } catch (err: any) {
          addLog(tr(`[Hàng đợi ${idx + 1}] Lỗi sinh test ${t + 1}: ${err.message}`, `[Queue ${idx + 1}] Test ${t + 1} failed: ${err.message}`), 'error');
        }

        if (t % 3 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    }

    setGeneratedTests(allNewTests);
    addLog(tr(`Đã hoàn tất toàn bộ ${items.length} tác vụ trong hàng đợi! Đã sinh tổng cộng ${allNewTests.length} test.`, `Finished ${items.length} jobs and generated ${allNewTests.length} tests.`), 'success');
  };

  // Handle Import Tests
  const handleImportTests = (importedTests: GeneratedTestCase[]) => {
    const mergedTests = [...generatedTests, ...importedTests.map((t, i) => ({
      ...t,
      index: generatedTests.length + i + 1,
      fileName: `test${String(generatedTests.length + i + 1).padStart(2, '0')}`,
    }))];
    setGeneratedTests(mergedTests);
    addLog(tr(`Đã nhập ${importedTests.length} test từ file/thư mục. Tổng cộng: ${mergedTests.length} test.`, `Imported ${importedTests.length} tests; ${mergedTests.length} tests total.`), 'success');
    showToast(tr("Nhập test thành công", "Tests imported"), tr(`Đã thêm ${importedTests.length} test vào bộ test hiện tại`, `Added ${importedTests.length} tests to the current set.`), 'success');
  };

  // Open Compare Tests Modal
  const handleOpenCompare = () => {
    if (generatedTests.length === 0) {
      showToast(tr("Chưa có test", "No tests"), tr("Hãy tạo hoặc nhập test trước khi so sánh", "Generate or import tests before comparing"), 'warn');
      return;
    }
    setIsCompareOpen(true);
  };

  // Handle Contract Save
  const handleSaveContract = (contract: any) => {
    setContractData(contract);
    addLog(tr("Đã lưu hợp đồng Validator/Checker (.ojcontract.json)", "Validator/checker contract saved (.ojcontract.json)"), 'success');
    showToast(tr("Lưu hợp đồng thành công", "Contract saved"), tr("Có thể dùng cho audit, CLI và đóng gói", "Available for audit, CLI and packaging"), 'success');
  };

  // Handle Run Profile Save
  const handleSaveRunProfile = (profile: any) => {
    setRunProfileData({ ...profile, problemId: currentProblem.id });
    addLog(tr("Đã lưu hồ sơ chạy thử (.ojrun.json)", "Run profile saved (.ojrun.json)"), 'success');
    showToast(tr("Lưu hồ sơ chạy thành công", "Run profile saved"), tr("Cấu hình build/run/test đa ngôn ngữ đã sẵn sàng", "Multi-language build/run/test configuration is ready"), 'success');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isMod = isMac ? e.metaKey : e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Escape: Close any open modal
      if (e.key === 'Escape') {
        const anyModalOpen =
          isShortcutsOpen || isAboutOpen || isPlanOpen || isSetupOpen || isManualOpen ||
          isPackageOpen || isMatrixOpen || isQueueOpen || isCoverageOpen ||
          isImportOpen || isCompareOpen || isContractOpen || isRunProfileOpen;

        if (anyModalOpen) {
          e.preventDefault();
          setIsShortcutsOpen(false);
          setIsAboutOpen(false);
          setIsPlanOpen(false);
          setIsSetupOpen(false);
          setIsManualOpen(false);
          setIsPackageOpen(false);
          setIsMatrixOpen(false);
          setIsQueueOpen(false);
          setIsCoverageOpen(false);
          setIsImportOpen(false);
          setIsCompareOpen(false);
          setIsContractOpen(false);
          setIsRunProfileOpen(false);
          showToast(tr("Đã đóng hộp thoại", "Dialog closed"), undefined, 'info', 1500);
          return;
        }
      }

      // Help/Shortcuts: '?' key when not typing in form field, or Ctrl+/
      if ((e.key === '?' && !isTyping) || (isMod && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // All remaining shortcuts require Ctrl or Cmd modifier
      if (!isMod) return;

      const key = e.key.toLowerCase();

      // Ctrl+S: Save Project
      if (key === 's') {
        e.preventDefault();
        handleSaveProject();
        showToast(tr('💾 Phím tắt: [Ctrl+S]', '💾 Shortcut: [Ctrl+S]'), tr("Đã lưu cấu hình dự án ra tệp .ojproject.json", "Project configuration saved to .ojproject.json"), 'success');
        return;
      }

      // Ctrl+G: Generate Tests
      if (key === 'g') {
        e.preventDefault();
        setActiveTab('generator');
        if (isGenerating) {
          showToast(tr("⏳ Đang tạo bộ test", "⏳ Generating tests"), tr("Quá trình sinh test hiện đang chạy...", "Test generation is already running..."), 'warn');
        } else {
          setRunTriggerCount((c) => c + 1);
          showToast(tr('⚡ Phím tắt: [Ctrl+G]', '⚡ Shortcut: [Ctrl+G]'), tr("Bắt đầu quá trình tạo bộ test tự động", "Starting test generation"), 'info');
          addLog(tr("Phím tắt [Ctrl+G]: Bắt đầu sinh bộ test...", "Shortcut [Ctrl+G]: starting test generation..."), 'info');
        }
        return;
      }

      // Ctrl+L: Quick switch to Log tab
      if (key === 'l') {
        e.preventDefault();
        setActiveTab('log');
        showToast(tr('📋 Phím tắt: [Ctrl+L]', '📋 Shortcut: [Ctrl+L]'), tr("Đã chuyển nhanh sang tab Nhật ký", "Switched to the log tab"), 'info');
        return;
      }

      // Ctrl+O: Open project file
      if (key === 'o') {
        e.preventDefault();
        handleOpenProject();
        showToast(tr('📂 Phím tắt: [Ctrl+O]', '📂 Shortcut: [Ctrl+O]'), tr("Mở tệp dự án .ojproject.json", "Open a .ojproject.json file"), 'info');
        return;
      }

      // Ctrl+P: Test plan / subtasks modal
      if (key === 'p') {
        e.preventDefault();
        setIsPlanOpen(true);
        showToast(tr('📐 Phím tắt: [Ctrl+P]', '📐 Shortcut: [Ctrl+P]'), tr("Mở kế hoạch phân nhóm test / Subtasks", "Open the test group plan"), 'info');
        return;
      }

      // Ctrl+B: Package modal
      if (key === 'b') {
        e.preventDefault();
        setIsPackageOpen(true);
        showToast(tr('📦 Phím tắt: [Ctrl+B]', '📦 Shortcut: [Ctrl+B]'), tr("Mở đóng gói bài thi (ZIP / Kattis)", "Open problem packaging (ZIP / Kattis)"), 'info');
        return;
      }

      // Ctrl+I: Test inventory tab
      if (key === 'i' && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('inventory');
        showToast(tr('🧾 Phím tắt: [Ctrl+I]', '🧾 Shortcut: [Ctrl+I]'), tr("Đã chuyển sang tab Kiểm kê bài test", "Switched to the test inventory"), 'info');
        return;
      }

      // Ctrl+D: Differential tester tab
      if (key === 'd') {
        e.preventDefault();
        setActiveTab('differential');
        showToast(tr('⚖️ Phím tắt: [Ctrl+D]', '⚖️ Shortcut: [Ctrl+D]'), tr("Đã chuyển sang tab Đối chiếu & Thu nhỏ lỗi", "Switched to differential testing"), 'info');
        return;
      }

      // Ctrl+Shift+I: Import tests
      if (key === 'i' && e.shiftKey) {
        e.preventDefault();
        setIsImportOpen(true);
        showToast(tr('📥 Phím tắt: [Ctrl+Shift+I]', '📥 Shortcut: [Ctrl+Shift+I]'), tr("Mở nhập test từ ZIP/thư mục", "Open test import from ZIP/folder"), 'info');
        return;
      }

      // Ctrl+Shift+C: Compare tests
      if (key === 'c' && e.shiftKey) {
        e.preventDefault();
        handleOpenCompare();
        showToast(tr('🔄 Phím tắt: [Ctrl+Shift+C]', '🔄 Shortcut: [Ctrl+Shift+C]'), tr("Mở so sánh hai bộ test", "Open test set comparison"), 'info');
        return;
      }

      // Ctrl+Shift+T: Contract modal
      if (key === 't' && e.shiftKey) {
        e.preventDefault();
        setIsContractOpen(true);
        showToast(tr('📋 Phím tắt: [Ctrl+Shift+T]', '📋 Shortcut: [Ctrl+Shift+T]'), tr("Mở hợp đồng Validator/Checker", "Open validator/checker contract"), 'info');
        return;
      }

      // Ctrl+Shift+R: Run profile modal
      if (key === 'r' && e.shiftKey) {
        e.preventDefault();
        setIsRunProfileOpen(true);
        showToast(tr('⚙️ Phím tắt: [Ctrl+Shift+R]', '⚙️ Shortcut: [Ctrl+Shift+R]'), tr("Mở hồ sơ chạy thử (.ojrun.json)", "Open run profile (.ojrun.json)"), 'info');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    language,
    isShortcutsOpen,
    isAboutOpen,
    isPlanOpen,
    isSetupOpen,
    isManualOpen,
    isPackageOpen,
    isMatrixOpen,
    isQueueOpen,
    isCoverageOpen,
    isImportOpen,
    isCompareOpen,
    isContractOpen,
    isRunProfileOpen,
    isGenerating,
  ]);

  const tabs = [
    { id: 'generator', label: t('tabs.generator'), icon: FlaskConical, shortcut: 'Ctrl+G', description: t('tabs.generatorDesc') },
    { id: 'log', label: t('tabs.log'), icon: ClipboardList, shortcut: 'Ctrl+L', description: t('tabs.logDesc') },
    { id: 'inventory', label: `${t('tabs.inventory')} (${generatedTests.length})`, icon: ListChecks, shortcut: 'Ctrl+I', description: t('tabs.inventoryDesc') },
    { id: 'statement', label: t('tabs.statement'), icon: FilePenLine, description: t('tabs.statementDesc') },
    { id: 'differential', label: t('tabs.differential'), icon: GitCompareArrows, shortcut: 'Ctrl+D', description: t('tabs.differentialDesc') },
    { id: 'scaffolds', label: t('tabs.scaffolds'), icon: Code2, description: t('tabs.scaffoldsDesc') },
    { id: 'help', label: t('tabs.help'), icon: BookOpen, shortcut: '?', description: t('tabs.helpDesc') },
  ];

  return (
    <div
      data-theme={theme}
      data-interface={interfaceMode}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface-base)',
        color: 'var(--surface-text-primary)',
        transition: 'background-color var(--transition-default), color var(--transition-default)',
      }}
    >
      <Header
        theme={theme}
        interfaceMode={interfaceMode}
        onChangeInterfaceMode={changeInterfaceMode}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onSaveProject={handleSaveProject}
        onOpenProject={handleOpenProject}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenPlan={() => setIsPlanOpen(true)}
        onOpenPackage={() => setIsPackageOpen(true)}
        onOpenMatrix={() => setIsMatrixOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onRunSelfTest={handleRunSelfTest}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenCompare={handleOpenCompare}
        onOpenContract={() => setIsContractOpen(true)}
        onOpenRunProfile={() => setIsRunProfileOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Tabs Navigation */}
      <nav
        className="main-tabs"
        style={{
          borderBottom: '1px solid var(--surface-border)',
          backgroundColor: 'var(--surface-raised)',
          padding: '0 var(--spacing-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-1)',
          overflowX: 'auto',
          overflowY: 'hidden',
          flexShrink: 0,
          fontSize: 'var(--text-sm)',
        }}
        role="tablist"
        aria-label="Main navigation"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            title={tab.description}
            style={{
              display: 'inline-flex',
              flexShrink: 0,
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              padding: 'var(--spacing-2) var(--spacing-3)',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === tab.id ? 'var(--font-semibold)' : 'var(--font-medium)',
              color: activeTab === tab.id ? 'var(--tab-selected-text)' : 'var(--surface-text-secondary)',
              backgroundColor: activeTab === tab.id ? 'var(--tab-selected-bg)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--tab-selected-border)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-default) var(--radius-default) 0 0',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--surface-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--surface-text-secondary)';
              }
            }}
          >
            <tab.icon size={18} strokeWidth={1.8} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>{tab.label}</span>
            {tab.shortcut && (
              <kbd style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1px var(--spacing-1-5)',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--surface-text-muted)',
                backgroundColor: 'var(--surface-sunken)',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-sm)',
              }}>
                {tab.shortcut}
              </kbd>
            )}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'generator' && (
          <GeneratorTab
            currentProblem={currentProblem}
            onSelectProblem={handleSelectProblem}
            config={config}
            onChangeConfig={setConfig}
            testCount={testCount}
            onChangeTestCount={setTestCount}
            seed={seed}
            onChangeSeed={setSeed}
            groups={groups}
            manualTests={manualTests}
            onOpenSetup={() => setIsSetupOpen(true)}
            onOpenPlan={() => setIsPlanOpen(true)}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenDiff={() => setActiveTab('differential')}
            onOpenCoverage={handleOpenCoverage}
            onNavigateToTab={setActiveTab}
            onAddLog={addLog}
            generatedTests={generatedTests}
            setGeneratedTests={setGeneratedTests}
            runTriggerCount={runTriggerCount}
            onRunningChange={setIsGenerating}
          />
        )}

        {activeTab === 'log' && (
          <LogTab logs={logs} onClearLogs={() => setLogs([])} />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab tests={generatedTests} problem={currentProblem} />
        )}

        {activeTab === 'statement' && (
          <StatementTab
            statement={statement}
            onChangeStatement={updateStatement}
            problem={currentProblem}
          />
        )}

        {activeTab === 'differential' && (
          <DifferentialTab
            currentProblem={currentProblem}
            config={config}
            generatedTests={generatedTests}
            onAddLog={addLog}
          />
        )}

        {activeTab === 'scaffolds' && (
          <ScaffoldsTab
            currentProblem={currentProblem}
            onAddLog={addLog}
          />
        )}

        {activeTab === 'help' && <HelpTab />}
      </main>

      <StatusBar
        status={isGenerating ? t('statusBar.generating') : generatedTests.length > 0 ? t('statusBar.generated', { count: generatedTests.length }) : t('statusBar.ready')}
        theme={theme}
        seed={seed}
        testCount={testCount}
        problemTitle={problemTitle(currentProblem, language)}
        generatedCount={generatedTests.length}
        isGenerating={isGenerating}
      />

      {/* Modals */}
      <TestPlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        groups={groups}
        onChangeGroups={setGroups}
        problem={currentProblem}
        config={config}
      />

      <ProblemSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        problem={currentProblem}
        statement={statement}
        onChangeStatement={updateStatement}
      />

      <ManualTestsModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        manualTests={manualTests}
        onChangeManualTests={setManualTests}
        problem={currentProblem}
        config={config}
      />

      <PackageModal
        isOpen={isPackageOpen}
        onClose={() => setIsPackageOpen(false)}
        problem={currentProblem}
        config={config}
        statement={statement}
        seed={seed}
        tests={generatedTests}
        onAddLog={addLog}
      />

      <SolutionMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        tests={generatedTests}
        problem={currentProblem}
        config={config}
      />

      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentProblem={currentProblem}
        currentConfig={config}
        currentTestCount={testCount}
        currentSeed={seed}
        onExecuteQueue={handleExecuteQueue}
      />

      <CoverageModal
        isOpen={isCoverageOpen}
        onClose={() => setIsCoverageOpen(false)}
        report={coverageReport}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <ImportTestsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportTests}
        problem={currentProblem}
        config={config}
      />

      <CompareTestsModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        testsA={generatedTests}
        testsB={generatedTests}
        labelA={tr('Bộ test hiện tại', 'Current tests')}
        labelB={tr('Bộ test tham chiếu', 'Reference tests')}
      />

      <ContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        onSave={handleSaveContract}
        initialContract={contractData}
      />

      <RunProfileModal
        isOpen={isRunProfileOpen}
        onClose={() => setIsRunProfileOpen(false)}
        onSave={handleSaveRunProfile}
        initialProfile={runProfileData}
        currentProblemId={currentProblem.id}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
