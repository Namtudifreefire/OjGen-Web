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
  Layers,
  Edit3,
  Scale,
  Copy,
  Check,
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
  const [sampleCopied, setSampleCopied] = useState<boolean>(false);

  const handleCopySample = () => {
    if (!samplePreview) return;
    navigator.clipboard?.writeText(samplePreview).catch(() => {});
    setSampleCopied(true);
    setTimeout(() => setSampleCopied(false), 2000);
  };

  // Categories list
  const categories = Array.from(new Set(ALL_PROBLEMS.map((p) => p.mainCategory)));
  const problemsInCategory = ALL_PROBLEMS.filter((p) => p.mainCategory === selectedCategory);

  // Sync category when problem changes
  useEffect(() => {
    setSelectedCategory(currentProblem.mainCategory);
  }, [currentProblem]);

  useEffect(() => {
    if (previousProblemIdRef.current === currentProblem.id) return;

    previousProblemIdRef.current = currentProblem.id;
    runIdRef.current += 1;
    cancelRef.current = true;
    setIsRunning(false);
    setProgress(0);
    setGenerationSummary(null);
    setSamplePreview('');
  }, [currentProblem.id]);

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
  const runIdRef = React.useRef(0);
  const previousProblemIdRef = React.useRef(currentProblem.id);
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
      onAddLog(`Cấu hình không hợp lệ: ${configError}`, 'error');
      return;
    }

    cancelRef.current = false;
    const runId = ++runIdRef.current;
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
        if (cancelRef.current || runId !== runIdRef.current) break;
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
          if (cancelRef.current || runId !== runIdRef.current) break;
          const gCfg = group.cfg || config;
          const gSeed = group.seed ? BigInt(group.seed) : baseRng.next();
          const gRng = new Rng(gSeed);
          for (let i = 0; i < group.testCount; i++) {
            if (cancelRef.current || runId !== runIdRef.current) break;
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
          if (cancelRef.current || runId !== runIdRef.current) break;
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

      if (runId !== runIdRef.current) return;
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
      if (runId === runIdRef.current && createZip && tests.length > 0) {
        try {
          const blob = await ProblemPackageExporter.createZip({
            format: 'OjGen',
            packageName: currentProblem.id,
            problem: currentProblem,
            config,
            seed: actualSeed,
            tests,
          });
          if (runId !== runIdRef.current || cancelRef.current) return;
          ProblemPackageExporter.downloadBlob(blob, `${currentProblem.id}_tests.zip`);
          onAddLog(`Đã tải xuống file ${currentProblem.id}_tests.zip thành công!`, 'success');
        } catch (err: any) {
          if (runId !== runIdRef.current) return;
          onAddLog(`Lỗi tạo file ZIP: ${err.message}`, 'error');
        }
      }
    } catch (err: any) {
      if (runId !== runIdRef.current) return;
      onAddLog(`Lỗi tạo bộ test: ${err.message}`, 'error');
    } finally {
      if (runId === runIdRef.current) setIsRunning(false);
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
        {/* Card 1: Khuôn bài toán */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Khuôn bài toán</h2>
              <p className="text-[11px] text-slate-400">Chọn cấu trúc input phù hợp với đề thi</p>
            </div>
            <span className="text-xs font-mono text-slate-400">19 khuôn</span>
          </div>

          {/* Algorithm Topic selector */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Chủ đề thuật toán gợi ý</span>
              {selectedTopic && (
                <button
                  onClick={() => setSelectedTopic('')}
                  className="text-[10px] text-slate-400 hover:text-white transition"
                >
                  Xóa lọc
                </button>
              )}
            </div>
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
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">-- Chọn chủ đề gợi ý (VNOI, CF, QBOJ...) --</option>
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
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition"
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
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:border-blue-500 transition"
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
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              title="Phân chia nhóm test và điểm số (Ctrl+P)"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Nhóm ({groups.length})</span>
            </button>
            <button
              onClick={onOpenManual}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              title="Thêm các test tay hoặc test mẫu"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Test tay ({manualTests.length})</span>
            </button>
            <button
              onClick={onOpenDiff}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              title="Kiểm thử đối chiếu lời giải chuẩn & ứng viên (Ctrl+D)"
            >
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Đối chiếu</span>
            </button>
          </div>

          {/* Collapsible Format Description */}
          <div className="mt-3 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70">
            <button
              onClick={() => setIsFormatOpen(!isFormatOpen)}
              className="w-full px-3 py-1.5 text-xs font-medium text-slate-300 flex items-center justify-between hover:bg-slate-900/60 transition"
            >
              <span>Định dạng input chính thức</span>
              {isFormatOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {isFormatOpen && (
              <div className="p-3 border-t border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-slate-950 leading-relaxed select-text">
                {currentProblem.formatDescription}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Tham số sinh dữ liệu */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Tham số sinh dữ liệu</h2>
              <p className="text-[11px] text-slate-400">{currentProblem.title}</p>
            </div>
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
        {/* Card: Thiết lập & Điều khiển tạo test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Tạo bộ test &amp; Xuất dữ liệu</h2>
              <p className="text-[11px] text-slate-400">Bộ sinh Mersenne Twister 64-bit · Lời giải chuẩn: {currentProblem.id}</p>
            </div>
            {isRunning && (
              <span className="text-xs text-blue-400 font-mono animate-pulse">
                Đang tạo test ({progress}%)...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Số lượng test sinh tự động
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={testCount}
                onChange={(e) => onChangeTestCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition select-text"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Seed ngẫu nhiên (tái lập test)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Để trống = ngẫu nhiên"
                  value={seed}
                  onChange={(e) => onChangeSeed(e.target.value)}
                  className="flex-1 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition select-text"
                />
                <button
                  onClick={() => onChangeSeed(Math.floor(Math.random() * 1000000000).toString())}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
                  title="Tạo seed ngẫu nhiên mới"
                >
                  <Dice5 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 mb-3">
            <button
              onClick={handleRun}
              disabled={isRunning || !!validationError}
              className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs transition flex items-center justify-center gap-2"
              title="Nhấn để bắt đầu tạo toàn bộ test (Phím tắt: Ctrl+G)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Đang tạo bộ test...' : 'Tạo bộ test'}</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-blue-700 text-[9px] font-mono text-blue-100 ml-1">
                Ctrl+G
              </kbd>
            </button>

            <button
              onClick={handlePreview}
              disabled={isRunning || !!validationError}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center justify-center gap-1.5"
              title="Sinh thử 1 test mẫu với cấu hình và seed hiện tại"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Xem thử mẫu</span>
            </button>

            {isRunning && (
              <button
                onClick={handleCancel}
                className="py-2 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-medium transition flex items-center justify-center gap-1.5"
                title="Dừng quá trình sinh test"
              >
                <Square className="w-3.5 h-3.5 fill-current text-red-400" />
                <span>Hủy</span>
              </button>
            )}
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={createZip}
                onChange={(e) => setCreateZip(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Tự động nén và tải ZIP sau khi tạo</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Giải: <span className="text-slate-300">{currentProblem.id}</span>
            </span>
          </div>

          {/* Progress Bar */}
          {(isRunning || progress > 0) && (
            <div
              className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800"
              role="progressbar"
              aria-label="Tiến độ tạo bộ test"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="bg-blue-500 h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Result Panel */}
          {generationSummary && (
            <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{generationSummary}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCoverage}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>Độ phủ</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('inventory')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kiểm kê ({generatedTests.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card: Xem trước dữ liệu mẫu (Live Preview) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Xem trước input &amp; output</h2>
              <p className="text-[11px] text-slate-400">Kiểm tra 1 test được sinh với cấu hình và seed hiện tại</p>
            </div>
            {samplePreview && (
              <button
                onClick={handleCopySample}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Sao chép toàn bộ mẫu"
              >
                {sampleCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{sampleCopied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            )}
          </div>

          <div className="relative flex-1 min-h-[200px] max-h-[380px] bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto font-mono text-xs text-slate-200">
            {samplePreview ? (
              <pre className="whitespace-pre-wrap leading-relaxed select-text font-mono">
                {samplePreview}
              </pre>
            ) : (
              <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-slate-500 text-xs gap-1.5 p-4 select-none">
                <Eye className="w-6 h-6 text-slate-600 mb-1" />
                <p className="text-slate-400 font-sans font-medium">Chưa có dữ liệu xem trước</p>
                <p className="text-slate-500 font-sans max-w-sm">
                  Nhấn <span className="text-slate-300 font-medium">"Xem thử mẫu"</span> ở trên để sinh thử 1 test theo cấu hình và seed hiện tại, kèm đáp án chuẩn sinh ra.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
