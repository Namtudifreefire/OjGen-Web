import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { problemTitle } from '../i18n/problemLabels';
import { validationMessage } from '../i18n/validationMessages';
import { Config, GeneratedTestCase, ManualTestCase, Problem, ProblemStatement } from '../core/types';
import {
  Save,
  FileText,
  Eye,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Play,
  Trash2,
  Plus,
  Dice5,
  BookmarkPlus,
  FolderDown,
} from 'lucide-react';
import { Card, CardHeader } from './ui/Card';
import { Input, Textarea, Select } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  generateSampleTests,
  generateSeedString,
  solveSampleInput,
  formatStatementMarkdown,
  normalizeSampleText,
} from '../utils/sampleGenerator';

interface StatementTabProps {
  statement: ProblemStatement;
  onChangeStatement: (stmt: ProblemStatement) => void;
  problem: Problem;
  config?: Config;
  seed?: string;
  manualTests?: ManualTestCase[];
  generatedTests?: GeneratedTestCase[];
  onAddManualSample?: (sample: { input: string; output: string }) => void;
  onNotify?: (title: string, description?: string, type?: 'success' | 'info' | 'warn' | 'error') => void;
}

interface SampleStatusState {
  type: 'success' | 'warn' | 'error';
  message: string;
}

// Pre-defined icons to avoid JSX-in-props parsing issues
const saveIcon = <Save className="w-3.5 h-3.5" />;
const fileTextIcon = <FileText className="w-4 h-4" />;
const eyeIcon = <Eye className="w-4 h-4" />;
const rotateCcwIcon = <RotateCcw className="w-4 h-4" />;
const downloadIcon = <Download className="w-3.5 h-3.5" />;
const sparklesIcon = <Sparkles className="w-3.5 h-3.5" />;
const plusIcon = <Plus className="w-3.5 h-3.5" />;

export const StatementTab: React.FC<StatementTabProps> = ({
  statement,
  onChangeStatement,
  problem,
  config,
  seed = '2026',
  manualTests = [],
  generatedTests = [],
  onAddManualSample,
  onNotify,
}) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => (language === 'en' ? en : vi);
  const [activeSection, setActiveSection] = useState<'main' | 'samples' | 'limits' | 'metadata' | 'preview'>('main');
  const [localStatement, setLocalStatement] = useState(statement);

  // Sample test generator controls
  const [sampleCountToGen, setSampleCountToGen] = useState<number>(2);
  const [sampleSeed, setSampleSeed] = useState<string>(seed || '2026');
  const [compactSamples, setCompactSamples] = useState<boolean>(true);
  const [sampleStatuses, setSampleStatuses] = useState<Record<number, SampleStatusState>>({});
  const [showImportPicker, setShowImportPicker] = useState<boolean>(false);

  // Optional local limit/metadata UI state so selects/inputs are controlled
  const [timeComplexity, setTimeComplexity] = useState<string>('');
  const [spaceComplexity, setSpaceComplexity] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');

  useEffect(() => setLocalStatement(statement), [statement]);
  useEffect(() => {
    setSampleStatuses({});
  }, [problem.id]);

  const activeConfig = config || problem.defaultConfig();

  const updateField = <K extends keyof ProblemStatement>(field: K, value: ProblemStatement[K]) => {
    const next = { ...localStatement, [field]: value };
    setLocalStatement(next);
    onChangeStatement(next);
  };

  const commitSamples = (nextSamples: ProblemStatement['samples']) => {
    const next = { ...localStatement, samples: nextSamples };
    setLocalStatement(next);
    onChangeStatement(next);
  };

  const handleAddSample = () => {
    commitSamples([...localStatement.samples, { input: '', output: '', explanation: '' }]);
  };

  const handleGenerateSamples = (replaceAll: boolean = false) => {
    try {
      const existingInputs = replaceAll
        ? []
        : localStatement.samples
            .map((s) => normalizeSampleText(s.input))
            .filter(Boolean);

      const res = generateSampleTests({
        problem,
        config: activeConfig,
        count: sampleCountToGen,
        seed: sampleSeed,
        compact: compactSamples,
        existingInputs,
      });

      if (res.samples.length === 0) {
        onNotify?.(
          text('Không thể sinh ví dụ', 'Could not generate samples'),
          text('Kiểm tra lại tham số khuôn bài toán hiện tại.', 'Check the current problem configuration.'),
          'warn'
        );
        return;
      }

      // If current list only contains an empty blank placeholder, replace it cleanly
      const hasOnlyBlankPlaceholder =
        !replaceAll &&
        localStatement.samples.length === 1 &&
        !localStatement.samples[0].input.trim() &&
        !localStatement.samples[0].output.trim();

      const nextSamples =
        replaceAll || hasOnlyBlankPlaceholder
          ? res.samples
          : [...localStatement.samples, ...res.samples];

      const startIndex = replaceAll || hasOnlyBlankPlaceholder ? 0 : localStatement.samples.length;
      const nextStatuses: Record<number, SampleStatusState> = replaceAll ? {} : { ...sampleStatuses };
      res.samples.forEach((_, offset) => {
        nextStatuses[startIndex + offset] = {
          type: 'success',
          message: text('Đã sinh tự động & giải output chuẩn', 'Generated with reference output'),
        };
      });

      setSampleStatuses(nextStatuses);
      commitSamples(nextSamples);
      // Advance seed slightly so clicking again generates fresh distinct cases if desired
      setSampleSeed(generateSeedString());

      onNotify?.(
        text('Đã tạo test ví dụ', 'Sample tests generated'),
        text(
          `Đã thêm ${res.samples.length} ví dụ hợp lệ cho "${problemTitle(problem, language)}".`,
          `Added ${res.samples.length} valid samples for "${problemTitle(problem, language)}".`
        ),
        'success'
      );
    } catch (err: any) {
      onNotify?.(
        text('Lỗi tạo test ví dụ', 'Sample generation error'),
        err?.message || String(err),
        'error'
      );
    }
  };

  const handleRegenerateSingleSample = (index: number) => {
    const existingInputs = localStatement.samples
      .filter((_, i) => i !== index)
      .map((s) => normalizeSampleText(s.input))
      .filter(Boolean);

    const res = generateSampleTests({
      problem,
      config: activeConfig,
      count: 1,
      seed: generateSeedString(),
      compact: compactSamples,
      existingInputs,
    });

    if (res.samples.length === 0) {
      onNotify?.(
        text('Không thể sinh lại ví dụ', 'Could not regenerate sample'),
        text('Kiểm tra lại tham số của bài toán.', 'Check the active problem parameters.'),
        'warn'
      );
      return;
    }

    const generated = res.samples[0];
    const nextSamples = localStatement.samples.map((s, i) =>
      i === index ? { ...s, input: generated.input, output: generated.output } : s
    );
    commitSamples(nextSamples);
    setSampleStatuses((prev) => ({
      ...prev,
      [index]: {
        type: 'success',
        message: text('Đã sinh lại input & output chuẩn', 'Regenerated input & reference output'),
      },
    }));
  };

  const handleSolveSingleSample = (index: number) => {
    const sample = localStatement.samples[index];
    if (!sample) return;

    const result = solveSampleInput(problem, activeConfig, sample.input);
    if (!result.ok || result.output === undefined) {
      setSampleStatuses((prev) => ({
        ...prev,
        [index]: {
          type: 'error',
          message: result.error
            ? validationMessage(result.error, language)
            : text('Input không hợp lệ.', 'Invalid input.'),
        },
      }));
      return;
    }

    const nextSamples = localStatement.samples.map((s, i) =>
      i === index ? { ...s, output: result.output! } : s
    );
    commitSamples(nextSamples);
    setSampleStatuses((prev) => ({
      ...prev,
      [index]: {
        type: result.matchesActiveConfig ? 'success' : 'warn',
        message: result.matchesActiveConfig
          ? text('Input hợp lệ · Đã cập nhật output chuẩn', 'Valid input · Reference output updated')
          : text(
              `Đã giải output (nhỏ hơn giới hạn bộ test hiện tại: ${validationMessage(result.constraintNote || '', language)})`,
              `Solved output (outside current generator bounds: ${validationMessage(result.constraintNote || '', language)})`
            ),
      },
    }));
  };

  const handleRemoveSample = (index: number) => {
    const nextSamples = localStatement.samples.filter((_, i) => i !== index);
    commitSamples(nextSamples);
    setSampleStatuses({});
  };

  const handleSampleChange = (index: number, field: 'input' | 'output' | 'explanation', value: string) => {
    const nextSamples = localStatement.samples.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    commitSamples(nextSamples);
    if (field === 'input') {
      setSampleStatuses((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const handleImportExistingTest = (inp: string, out: string, sourceLabel: string) => {
    const cleanInp = normalizeSampleText(inp);
    const cleanOut = normalizeSampleText(out);
    const hasOnlyBlankPlaceholder =
      localStatement.samples.length === 1 &&
      !localStatement.samples[0].input.trim() &&
      !localStatement.samples[0].output.trim();

    const appended = { input: cleanInp, output: cleanOut, explanation: '' };
    const nextSamples = hasOnlyBlankPlaceholder ? [appended] : [...localStatement.samples, appended];
    const newIndex = hasOnlyBlankPlaceholder ? 0 : localStatement.samples.length;

    commitSamples(nextSamples);
    setSampleStatuses((prev) => ({
      ...prev,
      [newIndex]: {
        type: 'success',
        message: text(`Đã chép từ ${sourceLabel}`, `Imported from ${sourceLabel}`),
      },
    }));
    setShowImportPicker(false);
  };

  const exportMarkdown = () => {
    const md = formatStatementMarkdown(localStatement, language);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${localStatement.code || problem.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'main', label: text('Nội dung chính', 'Main content'), icon: FileText },
    { id: 'samples', label: `${text('Ví dụ mẫu', 'Samples')} (${localStatement.samples.length})`, icon: Sparkles },
    { id: 'limits', label: text('Giới hạn', 'Limits'), icon: RotateCcw },
    { id: 'metadata', label: text('Thông tin bài', 'Problem info'), icon: CheckCircle2 },
    { id: 'preview', label: text('Xem trước đề', 'Preview'), icon: Eye },
  ];

  const availableImportTests: Array<{ id: string; label: string; tag: string; input: string; output: string }> = [
    ...manualTests
      .filter((m) => m.input.trim().length > 0)
      .map((m) => ({
        id: `manual-${m.id}`,
        label: m.name,
        tag: m.isSample ? text('Test mẫu', 'Sample') : text('Test tay', 'Manual'),
        input: m.input,
        output: m.output || normalizeSampleText(problem.solve(m.input.endsWith('\n') ? m.input : `${m.input}\n`, activeConfig)),
      })),
    ...generatedTests.slice(0, 8).map((g) => ({
      id: `gen-${g.index}`,
      label: `${g.fileName} (${g.groupName})`,
      tag: text('Đã sinh', 'Generated'),
      input: g.input,
      output: g.output,
    })),
  ];

  const renderMainSection = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <Input
          label={text('Tên bài toán', 'Problem name')}
          value={localStatement.name}
          onChange={(e) => updateField('name', e.target.value)}
          fullWidth
          placeholder={text('Ví dụ: Tổng mảng số nguyên', 'e.g. Sum of an integer array')}
        />
        <Input
          label={text('Mã bài (Code)', 'Problem code')}
          value={localStatement.code}
          onChange={(e) => updateField('code', e.target.value.toUpperCase())}
          fullWidth
          placeholder="SUMARR"
          helperText={text('Chỉ chữ cái in hoa, số, không dấu cách', 'Uppercase letters and numbers only; no spaces')}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
          <Input
            label={text('Giới hạn thời gian (ms)', 'Time Limit (ms)')}
            type="number"
            value={localStatement.timeLimitMs}
            onChange={(e) => updateField('timeLimitMs', parseInt(e.target.value, 10) || 1000)}
            fullWidth
          />
          <Input
            label={text('Giới hạn bộ nhớ (MB)', 'Memory Limit (MB)')}
            type="number"
            value={localStatement.memoryLimitMb}
            onChange={(e) => updateField('memoryLimitMb', parseInt(e.target.value, 10) || 256)}
            fullWidth
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <Textarea
          label={text('Mô tả bài toán', 'Problem description')}
          value={localStatement.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          fullWidth
          placeholder={text('Mô tả chi tiết bài toán...', 'Describe the problem...')}
        />
        <Textarea
          label={text('Định dạng Input', 'Input format')}
          value={localStatement.inputFormat}
          onChange={(e) => updateField('inputFormat', e.target.value)}
          rows={4}
          fullWidth
          placeholder={text('Mô tả cấu trúc input...', 'Describe the input format...')}
        />
        <Textarea
          label={text('Định dạng Output', 'Output format')}
          value={localStatement.outputFormat}
          onChange={(e) => updateField('outputFormat', e.target.value)}
          rows={3}
          fullWidth
          placeholder={text('Mô tả cấu trúc output...', 'Describe the output format...')}
        />
        <Textarea
          label={text('Ràng buộc', 'Constraints')}
          value={localStatement.constraints}
          onChange={(e) => updateField('constraints', e.target.value)}
          rows={3}
          fullWidth
          placeholder={text('Các ràng buộc về N, giá trị, độ phức tạp...', 'Constraints on N, values and complexity...')}
        />
      </div>
    </div>
  );

  const renderSamplesSection = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {/* Sample Generator Bar */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-3)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-2)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />
                <span>{text('Tạo test ví dụ cho đề bài', 'Generate sample tests for statement')}</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)' }}>
                {text('Khuôn hiện tại:', 'Active template:')}{' '}
                <strong style={{ color: 'var(--surface-text-primary)' }}>{problemTitle(problem, language)}</strong>
                {' · '}
                {text('Tự động sinh input hợp lệ và đáp án chuẩn.', 'Generates valid inputs and reference outputs automatically.')}
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {localStatement.samples.length} {text('ví dụ', localStatement.samples.length === 1 ? 'sample' : 'samples')}
            </Badge>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              gap: 'var(--spacing-3)',
            }}
          >
            <div style={{ width: '110px' }}>
              <Input
                label={text('Số ví dụ', 'Count')}
                type="number"
                min={1}
                max={5}
                value={sampleCountToGen}
                onChange={(e) => setSampleCountToGen(Math.max(1, Math.min(5, parseInt(e.target.value || '1', 10))))}
                fullWidth
              />
            </div>

            <div style={{ width: '170px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)' }}>
                {text('Seed mẫu', 'Sample seed')}
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                <Input
                  value={sampleSeed}
                  onChange={(e) => setSampleSeed(e.target.value)}
                  placeholder={text('Ngẫu nhiên', 'Random')}
                  fullWidth
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSampleSeed(generateSeedString())}
                  aria-label={text('Đổi seed ngẫu nhiên', 'Randomize seed')}
                  title={text('Đổi seed ngẫu nhiên', 'Randomize seed')}
                >
                  <Dice5 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                fontSize: 'var(--text-xs)',
                color: 'var(--surface-text-secondary)',
                cursor: 'pointer',
                paddingBottom: '6px',
              }}
            >
              <input
                type="checkbox"
                checked={compactSamples}
                onChange={(e) => setCompactSamples(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--color-primary-600)', cursor: 'pointer' }}
              />
              <span>{text('Kích thước nhỏ gọn (dễ đọc cho đề bài)', 'Compact size (readable for statements)')}</span>
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginLeft: 'auto' }}>
              <Button variant="primary" size="sm" leftIcon={sparklesIcon} onClick={() => handleGenerateSamples(false)}>
                {text('Tạo test ví dụ', 'Generate sample tests')}
              </Button>
              {localStatement.samples.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={() => handleGenerateSamples(true)}
                  title={text('Thay thế toàn bộ ví dụ hiện tại bằng bộ mới', 'Replace existing samples with newly generated ones')}
                >
                  {text('Tạo mới thay thế', 'Replace all')}
                </Button>
              )}
              <Button variant="ghost" size="sm" leftIcon={plusIcon} onClick={handleAddSample}>
                {text('Thêm ví dụ trống', 'Add blank')}
              </Button>
              {availableImportTests.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FolderDown className="w-3.5 h-3.5" />}
                  onClick={() => setShowImportPicker((v) => !v)}
                >
                  {text('Lấy từ test có sẵn', 'From existing tests')} ({availableImportTests.length})
                </Button>
              )}
            </div>
          </div>

          {showImportPicker && availableImportTests.length > 0 && (
            <div
              style={{
                padding: 'var(--spacing-2-5)',
                backgroundColor: 'var(--surface-overlay)',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)' }}>
                {text('Chọn test để chèn vào ví dụ đề bài:', 'Choose a test to add as a statement sample:')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1-5)' }}>
                {availableImportTests.map((item) => (
                  <Button
                    key={item.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleImportExistingTest(item.input, item.output, item.label)}
                  >
                    <span>{item.label}</span>
                    <span style={{ opacity: 0.7, fontSize: '10px' }}>· {item.tag}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {localStatement.samples.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-8)',
              color: 'var(--surface-text-muted)',
              backgroundColor: 'var(--surface-sunken)',
              border: '1px dashed var(--surface-border)',
              borderRadius: 'var(--radius-default)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
            }}
          >
            {eyeIcon}
            <p style={{ margin: 0, fontWeight: 'var(--font-medium)', color: 'var(--surface-text-primary)' }}>
              {text('Chưa có ví dụ mẫu', 'No samples yet')}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
              {text(
                'Tạo nhanh test ví dụ tự động hoặc thêm ví dụ thủ công cho đề bài.',
                'Auto-generate readable sample tests or add a blank sample manually.'
              )}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
              <Button variant="primary" size="sm" leftIcon={sparklesIcon} onClick={() => handleGenerateSamples(true)}>
                {text('Tạo test ví dụ ngay', 'Generate samples now')}
              </Button>
              <Button variant="secondary" size="sm" leftIcon={plusIcon} onClick={handleAddSample}>
                {text('Thêm ví dụ trống', 'Add blank sample')}
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {localStatement.samples.map((sample, idx) => {
              const status = sampleStatuses[idx];
              return (
                <Card key={idx} style={{ backgroundColor: 'var(--surface-overlay)' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)',
                      marginBottom: 'var(--spacing-3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
                        {text('Ví dụ', 'Sample')} {idx + 1}
                      </span>
                      {status && (
                        <Badge variant={status.type === 'error' ? 'error' : status.type === 'warn' ? 'warning' : 'success'} size="sm">
                          {status.message}
                        </Badge>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-1-5)' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        onClick={() => handleRegenerateSingleSample(idx)}
                        title={text('Sinh lại input và output mẫu mới', 'Regenerate new input and output')}
                      >
                        {text('Sinh lại', 'Regenerate')}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                        onClick={() => handleSolveSingleSample(idx)}
                        title={text('Kiểm tra input và tự tính output chuẩn', 'Validate input and compute reference output')}
                      >
                        {text('Giải Output', 'Solve output')}
                      </Button>
                      {onAddManualSample && sample.input.trim() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<BookmarkPlus className="w-3.5 h-3.5" />}
                          onClick={() => onAddManualSample({ input: sample.input, output: sample.output })}
                          title={text('Lưu ví dụ này thành test sample khi đóng gói bộ test', 'Save as a sample test in manual tests for packaging')}
                        >
                          {text('Lưu vào Test tay', 'Save as test')}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSample(idx)}
                        aria-label={text(`Xóa ví dụ ${idx + 1}`, `Delete sample ${idx + 1}`)}
                        title={text('Xóa ví dụ này', 'Delete sample')}
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--color-error)' }} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Textarea
                      label="Input"
                      value={sample.input}
                      onChange={(e) => handleSampleChange(idx, 'input', e.target.value)}
                      rows={5}
                      fullWidth
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
                      placeholder={text('Dữ liệu đầu vào...', 'Input data...')}
                    />
                    <Textarea
                      label="Output"
                      value={sample.output}
                      onChange={(e) => handleSampleChange(idx, 'output', e.target.value)}
                      rows={5}
                      fullWidth
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
                      placeholder={text('Kết quả mong đợi...', 'Expected output...')}
                    />
                  </div>
                  <div style={{ marginTop: 'var(--spacing-3)' }}>
                    <Textarea
                      label={text('Giải thích (tùy chọn)', 'Explanation (optional)')}
                      value={sample.explanation || ''}
                      onChange={(e) => handleSampleChange(idx, 'explanation', e.target.value)}
                      rows={2}
                      fullWidth
                      placeholder={text('Giải thích cách giải...', 'Explain the sample...')}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLimitsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader title={text('Giới hạn thực thi', 'Execution limits')} subtitle={text('Cấu hình cho judge system', 'Judge settings')} icon={rotateCcwIcon} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
            <Input
              label={text('Giới hạn thời gian (ms)', 'Time Limit (ms)')}
              type="number"
              value={localStatement.timeLimitMs}
              onChange={(e) => updateField('timeLimitMs', parseInt(e.target.value, 10) || 1000)}
              fullWidth
            />
            <Input
              label={text('Giới hạn bộ nhớ (MB)', 'Memory Limit (MB)')}
              type="number"
              value={localStatement.memoryLimitMb}
              onChange={(e) => updateField('memoryLimitMb', parseInt(e.target.value, 10) || 256)}
              fullWidth
            />
          </div>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--surface-sunken)', borderRadius: 'var(--radius-default)', fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)' }}>
            <strong>{text('Gợi ý:', 'Tips:')}</strong>
            <ul style={{ margin: 'var(--spacing-2) 0 0 0', paddingLeft: 'var(--spacing-4)' }}>
              <li>{text('Thời gian: 1000 ms cho bài cơ bản, 2000–5000 ms cho bài khó', 'Time: 1000 ms for basic problems, 2000–5000 ms for harder problems')}</li>
              <li>{text('Bộ nhớ: 256 MB tiêu chuẩn, 512 MB–1 GB cho bài cần nhiều bộ nhớ', 'Memory: 256 MB is typical; use 512 MB–1 GB for memory-intensive problems')}</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={text('Độ phức tạp mong đợi', 'Expected complexity')} subtitle={text('Hướng dẫn cho người giải', 'Guidance for solvers')} icon={<CheckCircle2 className="w-4 h-4" />} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Select
            label={text('Độ phức tạp thời gian', 'Time complexity')}
            value={timeComplexity}
            onChange={(e) => setTimeComplexity(e.target.value)}
            options={[
              { value: '', label: text('-- Chọn độ phức tạp --', '-- Select complexity --') },
              { value: 'O(N)', label: text('O(N) - Tuyến tính', 'O(N) - Linear') },
              { value: 'O(N log N)', label: text('O(N log N) - Tuyến tính-logarit', 'O(N log N) - Linearithmic') },
              { value: 'O(N^2)', label: text('O(N²) - Bậc hai', 'O(N²) - Quadratic') },
              { value: 'O(N^3)', label: text('O(N³) - Bậc ba', 'O(N³) - Cubic') },
              { value: 'O(2^N)', label: text('O(2^N) - Mũ', 'O(2^N) - Exponential') },
            ]}
            fullWidth
          />
          <Select
            label={text('Độ phức tạp không gian', 'Space complexity')}
            value={spaceComplexity}
            onChange={(e) => setSpaceComplexity(e.target.value)}
            options={[
              { value: '', label: text('-- Chọn độ phức tạp --', '-- Select complexity --') },
              { value: 'O(1)', label: text('O(1) - Hằng số', 'O(1) - Constant') },
              { value: 'O(N)', label: text('O(N) - Tuyến tính', 'O(N) - Linear') },
              { value: 'O(N^2)', label: text('O(N²) - Bậc hai', 'O(N²) - Quadratic') },
            ]}
            fullWidth
          />
        </div>
      </Card>
    </div>
  );

  const renderMetadataSection = () => (
    <Card>
      <CardHeader title={text('Thông tin bổ sung', 'Additional information')} subtitle={text('Metadata cho đóng gói và xuất bản', 'Metadata for packaging and publishing')} icon={<FileText className="w-4 h-4" />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <Input
          label={text('Tác giả', 'Author')}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          fullWidth
          placeholder={text('Tên tác giả bài toán', 'Problem author')}
        />
        <Input
          label={text('Nguồn gốc', 'Source')}
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          fullWidth
          placeholder={text('Ví dụ: VNOI, Codeforces, tự soạn...', 'e.g. VNOI, Codeforces, original...')}
        />
        <Select
          label={text('Độ khó', 'Difficulty')}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          options={[
            { value: '', label: text('-- Chọn độ khó --', '-- Select difficulty --') },
            { value: 'easy', label: text('Dễ', 'Easy') },
            { value: 'medium', label: text('Trung bình', 'Medium') },
            { value: 'hard', label: text('Khó', 'Hard') },
            { value: 'expert', label: text('Chuyên gia', 'Expert') },
          ]}
          fullWidth
        />
        <Textarea
          label={text('Ghi chú nội bộ', 'Internal notes')}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={3}
          fullWidth
          placeholder={text('Ghi chú cho team authoring...', 'Notes for the authoring team...')}
        />
      </div>
    </Card>
  );

  const renderPreviewSection = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--surface-sunken)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-default)',
      }}
    >
      <div style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: 'var(--spacing-3)' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--surface-text-primary)' }}>
          {localStatement.name || text('(Chưa đặt tên bài)', '(Untitled problem)')}{' '}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)', fontWeight: 'var(--font-medium)' }}>
            [{localStatement.code || problem.id.toUpperCase()}]
          </span>
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)' }}>
          {text('Thời gian:', 'Time limit:')} {localStatement.timeLimitMs} ms · {text('Bộ nhớ:', 'Memory limit:')} {localStatement.memoryLimitMb} MB
        </p>
      </div>

      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
          {text('Đề bài', 'Description')}
        </h4>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--surface-text-secondary)', whiteSpace: 'pre-wrap' }}>
          {localStatement.description || '—'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
            {text('Dữ liệu vào', 'Input')}
          </h4>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)', whiteSpace: 'pre-wrap' }}>
            {localStatement.inputFormat || '—'}
          </p>
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
            {text('Dữ liệu ra', 'Output')}
          </h4>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)', whiteSpace: 'pre-wrap' }}>
            {localStatement.outputFormat || '—'}
          </p>
        </div>
      </div>

      {localStatement.constraints && (
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
            {text('Ràng buộc', 'Constraints')}
          </h4>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--surface-text-secondary)', whiteSpace: 'pre-wrap' }}>
            {localStatement.constraints}
          </p>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
          <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
            {text('Ví dụ', 'Samples')} ({localStatement.samples.length})
          </h4>
          <Button variant="secondary" size="sm" leftIcon={sparklesIcon} onClick={() => setActiveSection('samples')}>
            {text('Chỉnh sửa / Tạo ví dụ', 'Edit / Generate samples')}
          </Button>
        </div>

        {localStatement.samples.length === 0 ? (
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontStyle: 'italic', color: 'var(--surface-text-muted)' }}>
            {text('Chưa có test ví dụ.', 'No sample tests yet.')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {localStatement.samples.map((s, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-default)',
                  backgroundColor: 'var(--surface-overlay)',
                  overflow: 'hidden',
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div
                    className="border-b md:border-b-0 md:border-r border-[var(--surface-border)]"
                    style={{ padding: 'var(--spacing-2-5)' }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-muted)', marginBottom: '4px' }}>
                      Input {idx + 1}
                    </div>
                    <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--surface-text-primary)', whiteSpace: 'pre-wrap' }}>
                      {s.input || '—'}
                    </pre>
                  </div>
                  <div style={{ padding: 'var(--spacing-2-5)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-muted)', marginBottom: '4px' }}>
                      Output {idx + 1}
                    </div>
                    <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-success)', whiteSpace: 'pre-wrap' }}>
                      {s.output || '—'}
                    </pre>
                  </div>
                </div>
                {s.explanation && (
                  <div style={{ padding: 'var(--spacing-2) var(--spacing-2-5)', borderTop: '1px solid var(--surface-border)', fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)' }}>
                    <strong>{text('Giải thích:', 'Explanation:')}</strong> {s.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
      <Card>
        <CardHeader
          title={text('Soạn nội dung đề bài', 'Statement editor')}
          subtitle={`${localStatement.name} (${localStatement.code})`}
          action={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="ghost" size="sm" leftIcon={downloadIcon} onClick={exportMarkdown}>
                {text('Xuất Markdown', 'Export Markdown')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={saveIcon}
                onClick={() => {
                  onChangeStatement(localStatement);
                  onNotify?.(text('Đã lưu đề bài', 'Statement saved'), `${localStatement.name} (${localStatement.code})`, 'success');
                }}
              >
                {text('Lưu thay đổi', 'Save changes')}
              </Button>
            </div>
          }
        />

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: 'var(--spacing-1)', borderBottom: '1px solid var(--surface-border)', marginBottom: 'var(--spacing-4)', overflowX: 'auto', overflowY: 'hidden' }}>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id as any)}
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  alignItems: 'center',
                  gap: 'var(--spacing-1-5)',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeSection === section.id ? 'var(--font-semibold)' : 'var(--font-medium)',
                  color: activeSection === section.id ? 'var(--tab-selected-text)' : 'var(--surface-text-secondary)',
                  backgroundColor: activeSection === section.id ? 'var(--tab-selected-bg)' : 'transparent',
                  border: 'none',
                  borderBottom: activeSection === section.id ? '2px solid var(--tab-selected-border)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {activeSection === 'main' && renderMainSection()}
          {activeSection === 'samples' && renderSamplesSection()}
          {activeSection === 'limits' && renderLimitsSection()}
          {activeSection === 'metadata' && renderMetadataSection()}
          {activeSection === 'preview' && renderPreviewSection()}
        </div>
      </Card>
    </div>
  );
};
