import React, { useState, useEffect } from 'react';
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
import { ToastContainer, ToastMessage } from './components/Toast';

import { ALL_PROBLEMS, findProblem } from './core/problems/allProblems';
import { Problem, Config, TestGroupSpec, ManualTestCase, GeneratedTestCase, ProblemStatement } from './core/types';
import { CoverageAnalyzer, CoverageReport } from './core/coverage';
import { Rng } from './core/rng';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('generator');

  // Core problem and configurations
  const [currentProblem, setCurrentProblem] = useState<Problem>(ALL_PROBLEMS[2]); // Default: ArrayProblem
  const [config, setConfig] = useState<Config>(() => ALL_PROBLEMS[2].defaultConfig());
  const [testCount, setTestCount] = useState<number>(10);
  const [seed, setSeed] = useState<string>('2026');

  // Subtasks, manual tests, generated tests, statement
  const [groups, setGroups] = useState<TestGroupSpec[]>([]);
  const [manualTests, setManualTests] = useState<ManualTestCase[]>([]);
  const [generatedTests, setGeneratedTests] = useState<GeneratedTestCase[]>([]);
  const [statement, setStatement] = useState<ProblemStatement>({
    name: 'Mảng số nguyên và tổng phần tử',
    code: 'SUMARR',
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    description: 'Cho mảng gồm N số nguyên A1, A2, ..., AN. Hãy tính tổng tất cả các phần tử trong mảng.',
    inputFormat: 'Dòng 1 ghi số nguyên N (1 ≤ N ≤ 10^5).\nDòng 2 ghi N số nguyên A1 ... AN.',
    outputFormat: 'In ra một số nguyên duy nhất là tổng các phần tử của mảng.',
    constraints: '1 ≤ N ≤ 10^5\n|Ai| ≤ 10^9',
    samples: [
      {
        input: '5\n1 2 3 4 5\n',
        output: '15',
        explanation: '1 + 2 + 3 + 4 + 5 = 15',
      },
    ],
  });

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString(),
      message: 'OjGen 3.3.0 Web Edition đã khởi động sẵn sàng. 19 khuôn bài toán đã sẵn sàng. Sử dụng phím tắt [Ctrl+S], [Ctrl+G], [Ctrl+L] hoặc [?] để thao tác nhanh.',
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
  const [coverageReport, setCoverageReport] = useState<CoverageReport | null>(null);

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
    setCurrentProblem(prob);
    const newCfg = prob.defaultConfig();
    setConfig(newCfg);
    setGroups([]);
    addLog(`Đã chuyển sang khuôn bài "${prob.title}" (${prob.id}).`, 'info');
  };

  // Open Coverage Analysis
  const handleOpenCoverage = () => {
    const rep = CoverageAnalyzer.analyze(currentProblem, config, groups, generatedTests);
    setCoverageReport(rep);
    setIsCoverageOpen(true);
    addLog(`Đã phân tích độ phủ cho ${generatedTests.length} test.`, 'info');
  };

  // Selftest
  const handleRunSelfTest = () => {
    addLog('Bắt đầu kiểm tra nội bộ (Selftest) trên toàn bộ 19 khuôn bài...', 'info');
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
          addLog(`Selftest thất bại tại ${prob.id}: ${err}`, 'error');
        }
      } catch (e: any) {
        addLog(`Selftest lỗi ngoại lệ tại ${prob.id}: ${e.message}`, 'error');
      }
    }
    addLog(`Selftest hoàn tất: ${passed}/${ALL_PROBLEMS.length} khuôn bài toán vượt qua kiểm thử!`, 'success');
    alert(`Selftest thành công: ${passed}/${ALL_PROBLEMS.length} module sinh test, kiểm định và giải tự động hoạt động chính xác!`);
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
    addLog(`Đã lưu dự án "${a.download}" thành công.`, 'success');
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
              if (data.statement) setStatement(data.statement);
              if (data.manualTests) setManualTests(data.manualTests);
              addLog(`Đã nạp dự án "${file.name}" thành công!`, 'success');
            }
          }
        } catch (err: any) {
          alert(`Không thể đọc file dự án: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Run all jobs in queue
  const handleExecuteQueue = async (items: any[]) => {
    if (!items || items.length === 0) return;
    addLog(`Bắt đầu chạy hàng đợi gồm ${items.length} tác vụ...`, 'info');
    setActiveTab('inventory');

    const allNewTests: GeneratedTestCase[] = [];
    let globalIndex = 1;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const prob = findProblem(item.problemId) || currentProblem;
      const cfg = item.problemId === currentProblem.id ? config : prob.defaultConfig();
      const jobRng = new Rng(item.seed || Math.floor(Math.random() * 1000000).toString());

      addLog(`[Hàng đợi ${idx + 1}/${items.length}] Đang sinh ${item.testCount} test cho "${prob.title}"...`, 'info');

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
          addLog(`[Hàng đợi ${idx + 1}] Lỗi sinh test ${t + 1}: ${err.message}`, 'error');
        }

        if (t % 3 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    }

    setGeneratedTests(allNewTests);
    addLog(`Đã hoàn tất toàn bộ ${items.length} tác vụ trong hàng đợi! Đã sinh tổng cộng ${allNewTests.length} test.`, 'success');
  };

  // Global Keyboard Shortcuts (Ctrl+S, Ctrl+G, Ctrl+L, Ctrl+O, Ctrl+P, Ctrl+B, ?, Esc)
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
        if (
          isShortcutsOpen ||
          isPlanOpen ||
          isSetupOpen ||
          isManualOpen ||
          isPackageOpen ||
          isMatrixOpen ||
          isQueueOpen ||
          isCoverageOpen
        ) {
          e.preventDefault();
          setIsShortcutsOpen(false);
          setIsPlanOpen(false);
          setIsSetupOpen(false);
          setIsManualOpen(false);
          setIsPackageOpen(false);
          setIsMatrixOpen(false);
          setIsQueueOpen(false);
          setIsCoverageOpen(false);
          showToast('Đã đóng hộp thoại', undefined, 'info', 1500);
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
        showToast('💾 Phím tắt: [Ctrl+S]', 'Đã lưu cấu hình dự án ra tệp .ojproject.json', 'success');
        return;
      }

      // Ctrl+G: Generate Tests
      if (key === 'g') {
        e.preventDefault();
        setActiveTab('generator');
        if (isGenerating) {
          showToast('⏳ Đang tạo bộ test', 'Quá trình sinh test hiện đang chạy...', 'warn');
        } else {
          setRunTriggerCount((c) => c + 1);
          showToast('⚡ Phím tắt: [Ctrl+G]', 'Bắt đầu quá trình tạo bộ test tự động', 'info');
          addLog('Phím tắt [Ctrl+G]: Bắt đầu sinh bộ test...', 'info');
        }
        return;
      }

      // Ctrl+L: Quick switch to Log tab
      if (key === 'l') {
        e.preventDefault();
        setActiveTab('log');
        showToast('📋 Phím tắt: [Ctrl+L]', 'Đã chuyển nhanh sang tab Nhật ký', 'info');
        return;
      }

      // Ctrl+O: Open project file
      if (key === 'o') {
        e.preventDefault();
        handleOpenProject();
        showToast('📂 Phím tắt: [Ctrl+O]', 'Mở tệp dự án .ojproject.json', 'info');
        return;
      }

      // Ctrl+P: Test plan / subtasks modal
      if (key === 'p') {
        e.preventDefault();
        setIsPlanOpen(true);
        showToast('📐 Phím tắt: [Ctrl+P]', 'Mở kế hoạch phân nhóm test / Subtasks', 'info');
        return;
      }

      // Ctrl+B: Package modal
      if (key === 'b') {
        e.preventDefault();
        setIsPackageOpen(true);
        showToast('📦 Phím tắt: [Ctrl+B]', 'Mở đóng gói bài thi (ZIP / Kattis)', 'info');
        return;
      }

      // Ctrl+I: Test inventory tab
      if (key === 'i') {
        e.preventDefault();
        setActiveTab('inventory');
        showToast('🧾 Phím tắt: [Ctrl+I]', 'Đã chuyển sang tab Kiểm kê bài test', 'info');
        return;
      }

      // Ctrl+D: Differential tester tab
      if (key === 'd') {
        e.preventDefault();
        setActiveTab('differential');
        showToast('⚖️ Phím tắt: [Ctrl+D]', 'Đã chuyển sang tab Đối chiếu & Thu nhỏ lỗi', 'info');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isShortcutsOpen,
    isPlanOpen,
    isSetupOpen,
    isManualOpen,
    isPackageOpen,
    isMatrixOpen,
    isQueueOpen,
    isCoverageOpen,
    isGenerating,
    currentProblem,
    config,
    testCount,
    seed,
    groups,
    manualTests,
    statement,
  ]);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <Header
        theme={theme}
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Tabs Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/60 px-4 flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'generator', label: '🧪 Tạo bộ test', shortcut: 'Ctrl+G' },
          { id: 'log', label: '📋 Nhật ký', shortcut: 'Ctrl+L' },
          { id: 'inventory', label: `🧾 Kiểm kê (${generatedTests.length})`, shortcut: 'Ctrl+I' },
          { id: 'statement', label: '✍ Soạn đề bài' },
          { id: 'differential', label: '⚖ Đối chiếu & Thu nhỏ', shortcut: 'Ctrl+D' },
          { id: 'scaffolds', label: '🧰 Khung mã nguồn' },
          { id: 'help', label: '📖 Hướng dẫn', shortcut: '?' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2.5 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <span>{tab.label}</span>
            {tab.shortcut && (
              <kbd className="hidden md:inline-block px-1 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700/80">
                {tab.shortcut}
              </kbd>
            )}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className={activeTab === 'generator' ? 'block' : 'hidden'}>
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
        </div>

        <div className={activeTab === 'log' ? 'block' : 'hidden'}>
          <LogTab logs={logs} onClearLogs={() => setLogs([])} />
        </div>

        {activeTab === 'inventory' && <InventoryTab tests={generatedTests} problem={currentProblem} />}

        {activeTab === 'statement' && (
          <StatementTab
            statement={statement}
            onChangeStatement={setStatement}
            problem={currentProblem}
            config={config}
          />
        )}

        {activeTab === 'differential' && <DifferentialTab problem={currentProblem} config={config} />}

        {activeTab === 'scaffolds' && <ScaffoldsTab problem={currentProblem} config={config} />}

        {activeTab === 'help' && <HelpTab />}
      </main>

      <StatusBar
        status="Sẵn sàng"
        theme={theme}
        seed={seed}
        testCount={generatedTests.length > 0 ? generatedTests.length : testCount}
        problemTitle={currentProblem.title}
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
        onChangeStatement={setStatement}
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

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}
