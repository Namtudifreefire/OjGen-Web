import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Dice5,
  Eye,
  Download,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Compass,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Square,
} from 'lucide-react';
import { Problem, Config, TestGroupSpec, ManualTestCase, GeneratedTestCase } from '../core/types';
import { Rng } from '../core/rng';
import { ALL_PROBLEMS, findProblem } from '../core/problems/allProblems';
import { ALGORITHM_TOPICS, AlgorithmTopic, getTopicUrl } from '../core/topics';
import { ProblemPackageExporter } from '../core/packageExporter';

interface GeneratorTabProps {
  currentProblem: Problem;
  onSelectProblem: (p: Problem) => void;
  config: Config;
  onChangeConfig: (newCfg: Config) => void;
  testCount: number;
  onChangeTestCount: (n: number) => void;
  seed: string;
  onChangeSeed: (s: string) => void;
  groups: TestGroupSpec[];
  manualTests: ManualTestCase[];
  onOpenSetup: () => void;
  onOpenPlan: () => void;
  onOpenManual: () => void;
  onOpenDiff: () => void;
  onOpenCoverage: () => void;
  onNavigateToTab: (tab: string) => void;
  onAddLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  generatedTests: GeneratedTestCase[];
  setGeneratedTests: React.Dispatch<React.SetStateAction<GeneratedTestCase[]>>;
  runTriggerCount?: number;
  onRunningChange?: (running: boolean) => void;
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({
  currentProblem,
  onSelectProblem,
  config,
  onChangeConfig,
  testCount,
  onChangeTestCount,
  seed,
  onChangeSeed,
  groups,
  manualTests,
  onOpenSetup,
  onOpenPlan,
  onOpenManual,
  onOpenDiff,
  onOpenCoverage,
  onNavigateToTab,
  onAddLog,
  generatedTests,
  setGeneratedTests,
  runTriggerCount = 0,
  onRunningChange,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(currentProblem.mainCategory);
  const [samplePreview, setSamplePreview] = useState<string>('');
  const [isFormatOpen, setIsFormatOpen] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generationSummary, setGenerationSummary] = useState<string | null>(null);
  const [createZip, setCreateZip] = useState<boolean>(true);
  const [outDirName, setOutDirName] = useState<string>('output');

  // Categories list
  const categories = Array.from(new Set(ALL_PROBLEMS.map((p) => p.mainCategory)));
  const problemsInCategory = ALL_PROBLEMS.filter((p) => p.mainCategory === selectedCategory);

  // Sync category when problem changes
  useEffect(() => {
    setSelectedCategory(currentProblem.mainCategory);
  }, [currentProblem]);

  // Generate Sample Preview
  const handlePreview = () => {
    try {
      const err = currentProblem.validateConfig(config);
      if (err) {
        setSamplePreview(`[LỖI CẤU HÌNH]\n${err}`);
        return;
      }
      const testSeed = seed ? BigInt(seed) : 2026n;
      const rng = new Rng(testSeed);
      const sample = currentProblem.generate(rng, config);
      const validation = currentProblem.validateInput(sample, config);
      let text = sample;
      if (validation) {
        text += `\n[CẢNH BÁO XÁC THỰC]: ${validation}`;
      } else {
        const out = currentProblem.solve(sample, config);
        text += `\n--- [ĐÁP ÁN CHUẨN SINH RA (.out)] ---\n${out}`;
      }
      setSamplePreview(text);
      onAddLog(`Đã sinh thử input mẫu thành công cho ${currentProblem.title}`, 'info');
    } catch (e: any) {
      setSamplePreview(`[LỖI]: ${e.message}`);
      onAddLog(`Lỗi sinh input mẫu: ${e.message}`, 'error');
    }
  };

  const cancelRef = React.useRef(false);
  const isMountedRef = React.useRef(false);

  // Sync running state to parent
  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  // Global shortcut trigger listener (Ctrl+G)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (runTriggerCount > 0 && !isRunning) {
      handleRun();
    }
  }, [runTriggerCount]);

  // Run full generation
  const handleRun = async () => {
    const configError = currentProblem.validateConfig(config);
    if (configError) {
      alert(`Cấu hình không hợp lệ: ${configError}`);
      return;
    }

    cancelRef.current = false;
    setIsRunning(true);
    setProgress(0);
    setGenerationSummary(null);
    onAddLog(`Bắt đầu tạo ${testCount} bộ test cho khuôn "${currentProblem.title}"...`, 'info');

    const actualSeed = seed ? seed : Math.floor(Math.random() * 1000000000).toString();
    const tests: GeneratedTestCase[] = [];
    const baseRng = new Rng(actualSeed);

    try {
      // If groups exist, divide among groups
      const totalToGen = groups.length > 0 ? groups.reduce((acc, g) => acc + g.testCount, 0) : testCount;
      let testIdx = 1;

      // Add manual / sample tests first
      for (const mt of manualTests) {
        if (cancelRef.current) break;
        const out = mt.output || currentProblem.solve(mt.input, config);
        tests.push({
          index: testIdx++,
          fileName: `test${String(testIdx - 1).padStart(2, '0')}`,
          groupName: mt.isSample ? 'Sample' : 'Manual',
          input: mt.input,
          output: out,
          seed: 'manual',
          bytes: mt.input.length,
          tags: mt.isSample ? ['sample', 'manual'] : ['manual'],
        });
      }

      // Generate group tests or default tests
      if (groups.length > 0) {
        for (const group of groups) {
          if (cancelRef.current) break;
          const gCfg = group.cfg || config;
          const gSeed = group.seed ? BigInt(group.seed) : baseRng.next();
          const gRng = new Rng(gSeed);
          for (let i = 0; i < group.testCount; i++) {
            if (cancelRef.current) break;
            const inp = currentProblem.generate(gRng, gCfg);
            const out = currentProblem.solve(inp, gCfg);
            tests.push({
              index: testIdx++,
              fileName: `test${String(testIdx - 1).padStart(2, '0')}`,
              groupName: group.name,
              input: inp,
              output: out,
              seed: gSeed.toString(),
              bytes: inp.length,
              tags: [...group.coverageTags],
            });
            setProgress(Math.floor((tests.length / (totalToGen + manualTests.length)) * 100));
            if (i % 2 === 0) {
              await new Promise((r) => setTimeout(r, 0));
            }
          }
        }
      } else {
        for (let i = 0; i < testCount; i++) {
          if (cancelRef.current) break;
          const tSeed = baseRng.next();
          const tRng = new Rng(tSeed);
          const inp = currentProblem.generate(tRng, config);
          const out = currentProblem.solve(inp, config);
          tests.push({
            index: testIdx++,
            fileName: `test${String(testIdx - 1).padStart(2, '0')}`,
            groupName: 'Default',
            input: inp,
            output: out,
            seed: tSeed.toString(),
            bytes: inp.length,
            tags: ['generated'],
          });
          setProgress(Math.floor((tests.length / (testCount + manualTests.length)) * 100));
          if (i % 2 === 0) {
            await new Promise((r) => setTimeout(r, 0));
          }
        }
      }

      if (cancelRef.current) {
        onAddLog(`Đã dừng tạo test. Đã sinh ${tests.length} test trước khi hủy.`, 'warn');
        if (tests.length > 0) setGeneratedTests(tests);
        return;
      }

      setGeneratedTests(tests);
      setProgress(100);
      const summaryMsg = `Đã tạo thành công ${tests.length} test (gồm ${manualTests.length} test tay/mẫu) với Seed: ${actualSeed}`;
      setGenerationSummary(summaryMsg);
      onAddLog(summaryMsg, 'success');

      // Auto trigger ZIP download if checked
      if (createZip && tests.length > 0) {
        try {
          const blob = await ProblemPackageExporter.createZip({
            format: 'OjGen',
            packageName: currentProblem.id,
            problem: currentProblem,
            config,
            seed: actualSeed,
            tests,
          });
          ProblemPackageExporter.downloadBlob(blob, `${currentProblem.id}_tests.zip`);
          onAddLog(`Đã tải xuống file ${currentProblem.id}_tests.zip thành công!`, 'success');
        } catch (err: any) {
          onAddLog(`Lỗi tạo file ZIP: ${err.message}`, 'error');
        }
      }
    } catch (err: any) {
      onAddLog(`Lỗi tạo bộ test: ${err.message}`, 'error');
      alert(`Lỗi tạo bộ test: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    onAddLog('Đã nhấn hủy tạo bộ test...', 'warn');
  };

  const validationError = currentProblem.validateConfig(config);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 max-w-7xl mx-auto">
      {/* ================= LEFT COLUMN: PROBLEM SELECTION & PARAMS ================= */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Card 1: Chọn bài toán */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              1. Chọn bài toán &amp; Chủ đề
            </h2>
            <span className="text-[11px] text-slate-400">19 cấu trúc input</span>
          </div>

          {/* Algorithm Topic selector */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Chủ đề thuật toán (VNOI, CF, QBOJ, LQDOJ, LTOJ, DMOJ)</span>
              {selectedTopic && (
                <button
                  onClick={() => setSelectedTopic('')}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Xóa lọc
                </button>
              )}
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                const topicName = e.target.value;
                setSelectedTopic(topicName);
                const found = ALGORITHM_TOPICS.find((t) => t.name === topicName);
                if (found) {
                  const targetProb = findProblem(found.recommendedProblemId);
                  if (targetProb) {
                    onSelectProblem(targetProb);
                    onAddLog(`Gợi ý khuôn "${targetProb.title}" từ chủ đề "${found.name}" (${found.source})`, 'info');
                  }
                }
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">-- Chọn chủ đề gợi ý (tùy chọn) --</option>
              {ALGORITHM_TOPICS.map((t, idx) => (
                <option key={idx} value={t.name}>
                  {t.name} ({t.source} · {t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Main Category */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dạng chính</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  const firstInCat = ALL_PROBLEMS.find((p) => p.mainCategory === e.target.value);
                  if (firstInCat) onSelectProblem(firstInCat);
                }}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem Type Dropdown */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Khuôn input</label>
              <select
                value={currentProblem.id}
                onChange={(e) => {
                  const prob = findProblem(e.target.value);
                  if (prob) onSelectProblem(prob);
                }}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 font-medium text-blue-400 focus:outline-none focus:border-blue-500 transition"
              >
                {problemsInCategory.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={onOpenPlan}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <span>🧩 Nhóm ({groups.length})</span>
            </button>
            <button
              onClick={onOpenManual}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <span>📥 Test tay ({manualTests.length})</span>
            </button>
            <button
              onClick={onOpenDiff}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <span>⚖ Đối chiếu</span>
            </button>
          </div>

          {/* Collapsible Format Description */}
          <div className="mt-3 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70">
            <button
              onClick={() => setIsFormatOpen(!isFormatOpen)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-300 flex items-center justify-between hover:bg-slate-900/60 transition"
            >
              <span>Định dạng input chính thức</span>
              {isFormatOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {isFormatOpen && (
              <div className="p-3 border-t border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-slate-950 leading-relaxed">
                {currentProblem.formatDescription}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Tham số sinh test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              2. Tham số sinh test ({currentProblem.title})
            </h2>
          </div>

          {/* Dynamic parameter controls */}
          <div className="space-y-3">
            {currentProblem.params.map((param) => {
              // Check visibility
              if (param.visibleWhen && !param.visibleWhen(config)) return null;

              if (param.type === 'bool') {
                const checked = config.getBool(param.key);
                return (
                  <label key={param.key} className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = config.clone();
                        next.set(param.key, e.target.checked ? 1n : 0n);
                        onChangeConfig(next);
                      }}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                    <span>{param.label}</span>
                  </label>
                );
              }

              if (param.options && param.options.length > 0) {
                const val = config.get(param.key).toString();
                return (
                  <div key={param.key}>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{param.label}</label>
                    <select
                      value={val}
                      onChange={(e) => {
                        const next = config.clone();
                        next.set(param.key, BigInt(e.target.value));
                        onChangeConfig(next);
                      }}
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition"
                    >
                      {param.options.map((opt) => (
                        <option key={opt.value.toString()} value={opt.value.toString()}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (param.type === 'text') {
                const textVal = config.getText(param.key, param.defText || '');
                return (
                  <div key={param.key}>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{param.label}</label>
                    {param.multiline ? (
                      <textarea
                        rows={3}
                        value={textVal}
                        onChange={(e) => {
                          const next = config.clone();
                          next.setText(param.key, e.target.value);
                          onChangeConfig(next);
                        }}
                        className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition"
                      />
                    ) : (
                      <input
                        type="text"
                        value={textVal}
                        onChange={(e) => {
                          const next = config.clone();
                          next.setText(param.key, e.target.value);
                          onChangeConfig(next);
                        }}
                        className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition"
                      />
                    )}
                    {param.help && <p className="text-[11px] text-slate-400 mt-1">{param.help}</p>}
                  </div>
                );
              }

              // Standard integer input
              const currentVal = config.get(param.key).toString();
              return (
                <div key={param.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">{param.label}</label>
                    <span className="text-[10px] text-slate-500">
                      [{param.lo.toString()} .. {param.hi.toString()}]
                    </span>
                  </div>
                  <input
                    type="number"
                    value={currentVal}
                    onChange={(e) => {
                      try {
                        const next = config.clone();
                        next.set(param.key, BigInt(e.target.value || '0'));
                        onChangeConfig(next);
                      } catch {
                        // ignore malformed
                      }
                    }}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                  {param.help && <p className="text-[11px] text-slate-400 mt-0.5">{param.help}</p>}
                </div>
              );
            })}
          </div>

          {validationError && (
            <div className="mt-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT COLUMN: TEST RUN & LIVE PREVIEW ================= */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Card 3: Thiết lập tạo test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              3. Thiết lập tạo test
            </h2>
            <span className="text-xs text-slate-400">Sinh input &amp; chạy lời giải chuẩn</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Số lượng test sinh tự động</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={testCount}
                onChange={(e) => onChangeTestCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seed ngẫu nhiên (tái lập test)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Để trống = ngẫu nhiên"
                  value={seed}
                  onChange={(e) => onChangeSeed(e.target.value)}
                  className="flex-1 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={() => onChangeSeed(Math.floor(Math.random() * 1000000000).toString())}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
                  title="Tạo seed ngẫu nhiên"
                >
                  <Dice5 className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createZip}
                onChange={(e) => setCreateZip(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span>Tự động nén và tải ZIP sau khi tạo</span>
            </label>

            <span className="text-[11px] text-slate-400 font-mono">
              Lời giải: <span className="text-emerald-400">Chuẩn built-in ({currentProblem.id})</span>
            </span>
          </div>
        </div>

        {/* Card 4: Kiểm tra input mẫu */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                4. Kiểm tra input mẫu
              </h2>
              <p className="text-[11px] text-slate-400">Sinh thử 1 test với seed và cấu hình hiện tại</p>
            </div>
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Kiểm tra input mẫu</span>
            </button>
          </div>

          <div className="relative flex-1 min-h-[160px] max-h-[240px] bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto">
            {samplePreview ? (
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {samplePreview}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Nhấn "Kiểm tra input mẫu" để xem trước định dạng input và output chuẩn
              </div>
            )}
          </div>
        </div>

        {/* Card 5: Tạo bộ test & Hành động */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              5. Tạo bộ test
            </h2>
            {isRunning && <span className="text-xs text-blue-400 font-mono animate-pulse">Đang sinh test...</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning || !!validationError}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 group"
              title="Nhấn để bắt đầu tạo bộ test (Phím tắt: Ctrl+G)"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isRunning ? 'Đang tạo bộ test...' : '▶ Tạo bộ test'}</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-blue-700/80 border border-blue-400/30 text-[10px] font-mono text-blue-100 shadow-sm ml-1">
                Ctrl+G
              </kbd>
            </button>
            {isRunning && (
              <button
                onClick={handleCancel}
                className="py-2.5 px-4 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-semibold text-sm transition flex items-center justify-center gap-1.5"
                title="Dừng quá trình sinh test"
              >
                <Square className="w-4 h-4 fill-red-400 text-red-400" />
                <span>Hủy</span>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Result Panel */}
          {generationSummary && (
            <div className="mt-4 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{generationSummary}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCoverage}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Độ phủ &amp; gợi ý</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('inventory')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kiểm kê test ({generatedTests.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
