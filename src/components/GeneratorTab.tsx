import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Copy,
} from 'lucide-react';
import { Problem, Config, TestGroupSpec, ManualTestCase, GeneratedTestCase } from '../core/types';
import { Rng } from '../core/rng';
import { ALL_PROBLEMS, findProblem } from '../core/problems/allProblems';
import { ALGORITHM_TOPICS, AlgorithmTopic, getTopicUrl } from '../core/topics';
import { ProblemPackageExporter } from '../core/packageExporter';
import { Button } from './ui/Button';
import { Card, CardHeader, CardDivider, CardFooter } from './ui/Card';
import { Input, Select, Textarea } from './ui/Input';
import { Badge, StatusBadge } from './ui/Badge';
import { useTranslation } from '../i18n';
import { categoryLabel, problemTitle, problemFormat, parameterLabel, topicLabel } from '../i18n/problemLabels';
import { validationMessage } from '../i18n/validationMessages';

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
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(currentProblem.mainCategory);
  const [samplePreview, setSamplePreview] = useState<string>('');
  const [sampleCopied, setSampleCopied] = useState(false);
  const [isFormatOpen, setIsFormatOpen] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generationSummary, setGenerationSummary] = useState<string | null>(null);
  const [createZip, setCreateZip] = useState<boolean>(true);

  const categories = Array.from(new Set(ALL_PROBLEMS.map((p) => p.mainCategory)));
  const problemsInCategory = ALL_PROBLEMS.filter((p) => p.mainCategory === selectedCategory);

  const cancelRef = useRef(false);
  const runIdRef = useRef(0);
  const previousProblemIdRef = useRef(currentProblem.id);
  const isMountedRef = useRef(false);

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (runTriggerCount > 0 && !isRunning) {
      handleRun();
    }
  }, [runTriggerCount]);

  useEffect(() => {
    if (previousProblemIdRef.current === currentProblem.id) return;

    previousProblemIdRef.current = currentProblem.id;
    runIdRef.current += 1;
    cancelRef.current = true;
    setIsRunning(false);
    setProgress(0);
    setGenerationSummary(null);
    setSamplePreview('');
    setSelectedCategory(currentProblem.mainCategory);
  }, [currentProblem.id]);

  const handlePreview = () => {
    setSampleCopied(false);
    try {
      const err = currentProblem.validateConfig(config);
      if (err) {
        setSamplePreview(`${text('[LỖI CẤU HÌNH]', '[CONFIGURATION ERROR]')}\n${validationMessage(err, language)}`);
        return;
      }
      const testSeed = seed ? BigInt(seed) : 2026n;
      const rng = new Rng(testSeed);
      const sample = currentProblem.generate(rng, config);
      const validation = currentProblem.validateInput(sample, config);
      let previewText = sample;
      if (validation) {
        previewText += `\n${text('[CẢNH BÁO XÁC THỰC]', '[VALIDATION WARNING]')}: ${validationMessage(validation, language)}`;
      } else {
        const out = currentProblem.solve(sample, config);
        previewText += `\n--- ${text('[ĐÁP ÁN CHUẨN SINH RA (.out)]', '[GENERATED REFERENCE OUTPUT (.out)]')} ---\n${out}`;
      }
      setSamplePreview(previewText);
      onAddLog(text(`Đã sinh thử input mẫu thành công cho ${currentProblem.title}`, `Generated a sample for ${problemTitle(currentProblem, language)}.`), 'info');
    } catch (e: any) {
      setSamplePreview(`${text('[LỖI]', '[ERROR]')}: ${e.message}`);
      onAddLog(text(`Lỗi sinh input mẫu: ${e.message}`, `Sample generation failed: ${e.message}`), 'error');
    }
  };

  const handleRun = async () => {
    const configError = currentProblem.validateConfig(config);
    if (configError) {
      alert(text(`Cấu hình không hợp lệ: ${configError}`, `Invalid configuration: ${validationMessage(configError, language)}`));
      return;
    }

    cancelRef.current = false;
    const runId = ++runIdRef.current;
    setIsRunning(true);
    setProgress(0);
    setGenerationSummary(null);
    onAddLog(text(`Bắt đầu tạo ${testCount} bộ test cho khuôn "${currentProblem.title}"...`, `Generating ${testCount} tests for "${problemTitle(currentProblem, language)}"...`), 'info');

    const actualSeed = seed ? seed : Math.floor(Math.random() * 1000000000).toString();
    const tests: GeneratedTestCase[] = [];
    const baseRng = new Rng(actualSeed);

    try {
      const totalToGen = groups.length > 0 ? groups.reduce((acc, g) => acc + g.testCount, 0) : testCount;
      let testIdx = 1;

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
            if (i % 2 === 0) await new Promise((r) => setTimeout(r, 0));
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
          if (i % 2 === 0) await new Promise((r) => setTimeout(r, 0));
        }
      }

      if (runId !== runIdRef.current) return;
      if (cancelRef.current) {
        onAddLog(text(`Đã dừng tạo test. Đã sinh ${tests.length} test trước khi hủy.`, `Generation stopped after ${tests.length} tests.`), 'warn');
        if (tests.length > 0) setGeneratedTests(tests);
        return;
      }

      setGeneratedTests(tests);
      setProgress(100);
      const summaryMsg = text(`Đã tạo thành công ${tests.length} test (gồm ${manualTests.length} test tay/mẫu) với Seed: ${actualSeed}`, `Generated ${tests.length} tests (${manualTests.length} manual/sample) with seed ${actualSeed}.`);
      setGenerationSummary(summaryMsg);
      onAddLog(summaryMsg, 'success');

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
          onAddLog(text(`Đã tải xuống file ${currentProblem.id}_tests.zip thành công!`, `Downloaded ${currentProblem.id}_tests.zip.`), 'success');
        } catch (err: any) {
          if (runId !== runIdRef.current) return;
          onAddLog(text(`Lỗi tạo file ZIP: ${err.message}`, `ZIP creation failed: ${err.message}`), 'error');
        }
      }
    } catch (err: any) {
      if (runId !== runIdRef.current) return;
      onAddLog(text(`Lỗi tạo bộ test: ${err.message}`, `Test generation failed: ${err.message}`), 'error');
      alert(text(`Lỗi tạo bộ test: ${err.message}`, `Test generation failed: ${err.message}`));
    } finally {
      if (runId === runIdRef.current) setIsRunning(false);
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    onAddLog(text('Đã nhấn hủy tạo bộ test...', 'Test generation cancellation requested...'), 'warn');
  };

  const rawValidationError = currentProblem.validateConfig(config);
  const validationError = rawValidationError && validationMessage(rawValidationError, language);

  const renderParamControl = (param: any) => {
    if (param.visibleWhen && !param.visibleWhen(config)) return null;

    if (param.type === 'bool') {
      const checked = config.getBool(param.key);
      return (
        <label key={param.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2-5)', fontSize: 'var(--text-sm)', color: 'var(--surface-text-primary)', cursor: 'pointer', padding: 'var(--spacing-1) 0' }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              const next = config.clone();
              next.set(param.key, e.target.checked ? 1n : 0n);
              onChangeConfig(next);
            }}
            style={{
              width: '16px',
              height: '16px',
              accentColor: 'var(--color-primary-600)',
              cursor: 'pointer',
            }}
          />
          <span>{parameterLabel(currentProblem, param.label, language)}</span>
        </label>
      );
    }

    if (param.options && param.options.length > 0) {
      const val = config.get(param.key).toString();
      return (
        <div key={param.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)' }}>{parameterLabel(currentProblem, param.label, language)}</label>
          <Select
            value={val}
            onChange={(e) => {
              const next = config.clone();
              next.set(param.key, BigInt(e.target.value));
              onChangeConfig(next);
            }}
            options={param.options.map((opt: any) => ({ value: opt.value.toString(), label: parameterLabel(currentProblem, opt.label, language) }))}
            fullWidth
          />
        </div>
      );
    }

    if (param.type === 'text') {
      const textVal = config.getText(param.key, param.defText || '');
      return (
        <div key={param.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)' }}>{parameterLabel(currentProblem, param.label, language)}</label>
          {param.multiline ? (
            <Textarea
              value={textVal}
              onChange={(e) => {
                const next = config.clone();
                next.setText(param.key, e.target.value);
                onChangeConfig(next);
              }}
              rows={3}
              fullWidth
              placeholder={param.help && parameterLabel(currentProblem, param.help, language)}
            />
          ) : (
            <Input
              value={textVal}
              onChange={(e) => {
                const next = config.clone();
                next.setText(param.key, e.target.value);
                onChangeConfig(next);
              }}
              fullWidth
              placeholder={param.help && parameterLabel(currentProblem, param.help, language)}
            />
          )}
          {param.help && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)', margin: 0 }}>{parameterLabel(currentProblem, param.help, language)}</p>}
        </div>
      );
    }

    const currentVal = config.get(param.key).toString();
    return (
      <div key={param.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)' }}>{parameterLabel(currentProblem, param.label, language)}</label>
          <span style={{ fontSize: '10px', color: 'var(--surface-text-muted)', fontFamily: 'var(--font-mono)' }}>
            [{param.lo.toString()} .. {param.hi.toString()}]
          </span>
        </div>
        <Input
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
          fullWidth
        />
        {param.help && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)', margin: 0 }}>{parameterLabel(currentProblem, param.help, language)}</p>}
      </div>
    );
  };

  return (
    <div className="generator-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <Card>
          <CardHeader
            title={text('1. Chọn bài toán & Chủ đề', '1. Choose a problem & topic')}
            subtitle={text('19 cấu trúc input có sẵn', '19 input templates available')}
            icon={<span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary-500)' }} />}
            action={
              <Button variant="ghost" size="sm" onClick={onOpenSetup}>
                <Sliders className="w-3.5 h-3.5" />
                {text('Thiết lập', 'Setup')}
              </Button>
            }
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                <span>{text('Chủ đề thuật toán (VNOI, CF, QBOJ, LQDOJ, LTOJ, DMOJ)', 'Algorithm topics (VNOI, CF, QBOJ, LQDOJ, LTOJ, DMOJ)')}</span>
                {selectedTopic && (
                  <button
                    onClick={() => setSelectedTopic('')}
                    style={{ fontSize: '10px', color: 'var(--surface-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {text('Xóa lọc', 'Clear filter')}
                  </button>
                )}
              </label>
              <Select
                value={selectedTopic}
                onChange={(e) => {
                  const topicName = e.target.value;
                  setSelectedTopic(topicName);
                  const found = ALGORITHM_TOPICS.find((t) => t.name === topicName);
                  if (found) {
                    const targetProb = findProblem(found.recommendedProblemId);
                    if (targetProb) {
                      onSelectProblem(targetProb);
                      onAddLog(text(`Gợi ý khuôn "${targetProb.title}" từ chủ đề "${found.name}" (${found.source})`, `Suggested template "${problemTitle(targetProb, language)}" for ${topicLabel(found, language)}.`), 'info');
                    }
                  }
                }}
                options={[
                  { value: '', label: text('-- Chọn chủ đề gợi ý (tùy chọn) --', '-- Choose a suggested topic (optional) --') },
                  ...ALGORITHM_TOPICS.map((t) => ({ value: t.name, label: topicLabel(t, language) })),
                ]}
                fullWidth
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-1)' }}>{text('Dạng chính', 'Category')}</label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    const firstInCat = ALL_PROBLEMS.find((p) => p.mainCategory === e.target.value);
                    if (firstInCat) onSelectProblem(firstInCat);
                  }}
                  options={categories.map((c) => ({ value: c, label: categoryLabel(c, language) }))}
                  fullWidth
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-1)' }}>{text('Khuôn input', 'Input template')}</label>
                <Select
                  value={currentProblem.id}
                  onChange={(e) => {
                    const prob = findProblem(e.target.value);
                    if (prob) onSelectProblem(prob);
                  }}
                  options={problemsInCategory.map((p) => ({ value: p.id, label: problemTitle(p, language) }))}
                  fullWidth
                  style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-primary-600)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-2)' }}>
              <Button variant="secondary" size="sm" onClick={onOpenPlan} fullWidth>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-1-5)' }}>
                  🧩 {text('Nhóm', 'Groups')} ({groups.length})
                </span>
              </Button>
              <Button variant="secondary" size="sm" onClick={onOpenManual} fullWidth>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-1-5)' }}>
                  📥 {text('Test tay', 'Manual tests')} ({manualTests.length})
                </span>
              </Button>
              <Button variant="secondary" size="sm" onClick={onOpenDiff} fullWidth>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-1-5)' }}>
                  ⚖ {text('Đối chiếu', 'Compare')}
                </span>
              </Button>
            </div>

            <div style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', overflow: 'hidden', backgroundColor: 'var(--surface-sunken)' }}>
              <button
                onClick={() => setIsFormatOpen(!isFormatOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--surface-text-secondary)',
                  backgroundColor: 'var(--surface-overlay)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-overlay)'; }}
              >
                <span>{text('Định dạng input chính thức', 'Official input format')}</span>
                {isFormatOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isFormatOpen && (
                <div style={{ padding: 'var(--spacing-3)', borderTop: '1px solid var(--surface-border)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--surface-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.6', backgroundColor: 'var(--surface-sunken)' }}>
                  {problemFormat(currentProblem, language)}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={text('2. Tham số sinh test', '2. Generation parameters')}
            subtitle={problemTitle(currentProblem, language)}
            icon={<Sliders className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {currentProblem.params.map(renderParamControl)}
          </div>

          {validationError && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-2)',
              padding: 'var(--spacing-2-5)',
              borderRadius: 'var(--radius-default)',
              backgroundColor: 'var(--color-error-light)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error-dark)',
              fontSize: 'var(--text-xs)',
            }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
              <span>{validationError}</span>
            </div>
          )}
        </Card>
      </div>

      <div className="generator-settings-column" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <Card>
          <CardHeader
            title={text('3. Thiết lập tạo test', '3. Test generation settings')}
            subtitle={text('Sinh input & chạy lời giải chuẩn', 'Generate inputs and reference outputs')}
            icon={<span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Input
              label={text('Số lượng test sinh tự động', 'Number of generated tests')}
              type="number"
              value={testCount}
              onChange={(e) => onChangeTestCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
              fullWidth
              helperText="1 - 1000"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)' }}>{text('Seed ngẫu nhiên (tái lập test)', 'Random seed (reproducible)')}</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <Input
                  placeholder={text('Để trống = ngẫu nhiên', 'Leave blank for random')}
                  value={seed}
                  onChange={(e) => onChangeSeed(e.target.value)}
                  fullWidth
                />
                <Button variant="ghost" size="sm" onClick={() => onChangeSeed(Math.floor(Math.random() * 1000000000).toString())} title={text('Tạo seed ngẫu nhiên', 'Generate a random seed')}>
                  <Dice5 className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
                </Button>
              </div>
            </div>
          </div>

          <CardDivider />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={createZip}
                onChange={(e) => setCreateZip(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary-600)' }}
              />
              <span>{text('Tự động nén và tải ZIP sau khi tạo', 'Automatically download a ZIP after generation')}</span>
            </label>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {text('Lời giải:', 'Solver:')} <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-medium)' }}>{text('Chuẩn built-in', 'Built-in reference')} ({currentProblem.id})</span>
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={text('4. Kiểm tra input mẫu', '4. Preview a test')}
            subtitle={text('Sinh thử 1 test với seed và cấu hình hiện tại', 'Generate one test with the current settings and seed')}
            icon={<Eye className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />}
            action={
              <Button variant="secondary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={handlePreview}>
                {text('Kiểm tra input mẫu', 'Preview test')}
              </Button>
            }
          />

          <div
            style={{
              minHeight: '160px',
              maxHeight: '240px',
              backgroundColor: 'var(--surface-sunken)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-default)',
              padding: 'var(--spacing-3)',
              overflow: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-success)',
              lineHeight: '1.6',
            }}
          >
            {samplePreview ? (
              <>
                <Button variant="secondary" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />} onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(samplePreview);
                    setSampleCopied(true);
                  } catch {
                    onAddLog(text('Không thể sao chép nội dung mẫu.', 'Could not copy the sample.'), 'error');
                  }
                }}>
                  {sampleCopied ? text('Đã sao chép', 'Copied') : text('Sao chép', 'Copy')}
                </Button>
                <pre style={{ margin: 'var(--spacing-2) 0 0', whiteSpace: 'pre-wrap' }}>{samplePreview}</pre>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--surface-text-muted)', fontSize: 'var(--text-xs)', fontStyle: 'italic' }}>
                {text('Nhấn "Kiểm tra input mẫu" để xem trước định dạng input và output chuẩn', 'Select “Preview test” to see an input and reference output.')}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={text('5. Tạo bộ test', '5. Generate tests')}
            icon={<Play className="w-4 h-4" style={{ color: 'var(--color-success)' }} />}
          />

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-4 h-4" />}
              rightIcon={<kbd style={{ fontSize: '10px', padding: '1px 6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>Ctrl+G</kbd>}
              onClick={handleRun}
              disabled={isRunning || !!validationError}
              fullWidth
            >
              {isRunning ? text('Đang tạo bộ test...', 'Generating tests...') : text('Tạo bộ test', 'Generate tests')}
            </Button>

            {isRunning && (
              <Button variant="danger" size="lg" leftIcon={<Square className="w-4 h-4" />} onClick={handleCancel} fullWidth>
                {text('Hủy', 'Cancel')}
              </Button>
            )}
          </div>

          {(isRunning || generationSummary) && (
            <>
              <CardDivider />
              <div style={{ width: '100%', backgroundColor: 'var(--surface-sunken)', borderRadius: 'var(--radius-full)', height: '6px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--color-primary-500)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 300ms ease',
                    width: `${progress}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </>
          )}

          {generationSummary && (
            <>
              <CardDivider />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-default)', backgroundColor: 'var(--color-success-light)', border: '1px solid var(--color-success)', color: 'var(--color-success-dark)' }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', flex: 1 }}>{generationSummary}</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  <Button variant="secondary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />} onClick={onOpenCoverage} fullWidth>
                    {text('Độ phủ & Gợi ý', 'Coverage & suggestions')}
                  </Button>
                  <Button variant="secondary" size="sm" leftIcon={<FileCheck className="w-3.5 h-3.5" />} onClick={() => onNavigateToTab('inventory')} fullWidth>
                    {text('Kiểm kê test', 'Test inventory')} ({generatedTests.length})
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
