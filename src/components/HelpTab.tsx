import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { Search, Keyboard, BookOpen, GitBranch, Code2, Zap, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Copy } from 'lucide-react';
import { Card, CardHeader, CardDivider } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface HelpTabProps {}

const SHORTCUTS = [
  { category: 'Tệp', items: [
    { key: 'Ctrl+S', desc: 'Lưu dự án (.ojproject)' },
    { key: 'Ctrl+O', desc: 'Mở dự án' },
    { key: 'Ctrl+B', desc: 'Đóng gói bài tập' },
  ]},
  { category: 'Sinh test', items: [
    { key: 'Ctrl+G', desc: 'Tạo bộ test' },
    { key: 'Ctrl+P', desc: 'Kế hoạch nhóm test' },
    { key: 'Ctrl+M', desc: 'Ma trận lời giải' },
  ]},
  { category: 'Công cụ', items: [
    { key: 'Ctrl+D', desc: 'Kiểm thử đối chiếu' },
    { key: 'Ctrl+Shift+I', desc: 'Nhập test từ ZIP/thư mục' },
    { key: 'Ctrl+Shift+C', desc: 'So sánh hai bộ test' },
    { key: 'Ctrl+Shift+T', desc: 'Hợp đồng Validator/Checker' },
    { key: 'Ctrl+Shift+R', desc: 'Hồ sơ chạy thử (.ojrun.json)' },
  ]},
  { category: 'Điều hướng', items: [
    { key: 'Ctrl+L', desc: 'Chuyển tab Nhật ký' },
    { key: 'Ctrl+/', desc: 'Phím tắt (hoặc ?)' },
    { key: 'Esc', desc: 'Đóng hộp thoại' },
  ]},
];

const FEATURES = [
  {
    title: '19 Khuôn bài toán',
    desc: 'Hỗ trợ đầy đủ các cấu trúc input phổ biến: Mảng, Đồ thị, Cây, Chuỗi, Lưới, Cờ vua, Tính hình học, Số học, Quy hoạch động, Xâu ký tự, v.v.',
    icon: Code2,
  },
  {
    title: 'Sinh test xác suất (MT19937-64)',
    desc: 'RNG chuẩn MT19937-64 đảm bảo tái lập chính xác. Seed 64-bit cho phép sinh lại cùng bộ test bất cứ lúc nào.',
    icon: Zap,
  },
  {
    title: 'Lời giải chuẩn built-in',
    desc: 'Mỗi khuôn bài có solver tham chiếu tự động sinh output (.out) tương ứng với input.',
    icon: CheckCircle2,
  },
  {
    title: 'Kiểm thử đối chiếu & Thu nhỏ lỗi',
    desc: 'Chạy nhiều lời giải song song, phát hiện WA/TLE/RE. Thu nhỏ heuristic tìm input tối thiểu gây lỗi.',
    icon: GitBranch,
  },
  {
    title: 'Độ phủ & Phân tích',
    desc: 'Phân tích độ phủ mã nguồn, gợi ý test case bổ sung cho các nhánh chưa phủ.',
    icon: BookOpen,
  },
  {
    title: 'Đóng gói chuyên nghiệp',
    desc: 'Xuất ZIP chuẩn OjGen + Kattis Problem Package Format (PPF) 2025-09. Sẵn sàng submit lên các judge.',
    icon: AlertCircle,
  },
];

const KEYBOARD_SHORTCUTS = [
  { key: '?', desc: 'Mở bảng phím tắt' },
  { key: 'Ctrl+S', desc: 'Lưu dự án' },
  { key: 'Ctrl+O', desc: 'Mở dự án' },
  { key: 'Ctrl+G', desc: 'Sinh test' },
  { key: 'Ctrl+P', desc: 'Kế hoạch test' },
  { key: 'Ctrl+B', desc: 'Đóng gói bài' },
  { key: 'Ctrl+D', desc: 'Đối chiếu' },
  { key: 'Ctrl+M', desc: 'Ma trận lời giải' },
  { key: 'Ctrl+L', desc: 'Tab Nhật ký' },
  { key: 'Ctrl+Shift+I', desc: 'Nhập test' },
  { key: 'Ctrl+Shift+C', desc: 'So sánh test' },
  { key: 'Ctrl+Shift+T', desc: 'Hợp đồng Validator/Checker' },
  { key: 'Ctrl+Shift+R', desc: 'Hồ sơ chạy thử' },
  { key: 'Esc', desc: 'Đóng modal' },
];

const gridStyles: React.CSSProperties = {
  gridTemplateColumns: '1fr',
  gap: 'var(--spacing-3)',
};

const featuresGridStyles: React.CSSProperties = {
  gridTemplateColumns: '1fr',
  gap: 'var(--spacing-4)',
};

const conceptsGridStyles: React.CSSProperties = {
  gridTemplateColumns: '1fr',
  gap: 'var(--spacing-3)',
};

const mediaStyles = `
  @media (min-width: 768px) {
    .shortcuts-grid { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .concepts-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

export const HelpTab: React.FC<HelpTabProps> = () => {
  const { language, t } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const shortcutCategories: Record<string, string> = { 'Tệp': 'File', 'Sinh test': 'Generation', 'Công cụ': 'Tools', 'Điều hướng': 'Navigation' };
  const shortcutDescriptions: Record<string, string> = { 'Ctrl+S': 'Save project (.ojproject)', 'Ctrl+O': 'Open project', 'Ctrl+B': 'Package problem', 'Ctrl+G': 'Generate tests', 'Ctrl+P': 'Test group plan', 'Ctrl+M': 'Solution matrix', 'Ctrl+D': 'Differential testing', 'Ctrl+Shift+I': 'Import tests from ZIP/folder', 'Ctrl+Shift+C': 'Compare test sets', 'Ctrl+Shift+T': 'Validator/checker contract', 'Ctrl+Shift+R': 'Run profile (.ojrun.json)', 'Ctrl+L': 'Open log tab', 'Ctrl+/': 'Keyboard shortcuts (or ?)', 'Esc': 'Close dialog' };
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'shortcuts' | 'features' | 'guide' | 'about'>('shortcuts');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredShortcuts = KEYBOARD_SHORTCUTS.filter(s =>
    s.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenGitHub = () => window.open('https://github.com/Namtudifreefire/OjGen-Web', '_blank', 'noopener,noreferrer');
  const handleOpenVNOI = () => window.open('https://vnoi.info', '_blank');
  const handleOpenKattis = () => window.open('https://kattis.com', '_blank');

  const externalLinkIcon = <ExternalLink className="w-3.5 h-3.5" />;
  const bookOpenIcon = <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />;
  const keyboardIcon = <Keyboard className="w-4 h-4" />;
  const zapIcon = <Zap className="w-4 h-4" />;
  const checkCircleIcon = <CheckCircle2 className="w-4 h-4" />;
  const searchIcon = <Search className="w-4 h-4" />;

  const renderShortcutsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        {searchIcon}
        <Input
          placeholder={text('Tìm phím tắt...', 'Search shortcuts...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          style={{ paddingLeft: 'var(--spacing-10)' }}
        />
      </div>

      <div style={gridStyles} className="shortcuts-grid">
        {SHORTCUTS.map((cat) => (
          <Card key={cat.category} style={{ backgroundColor: 'var(--surface-overlay)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)', paddingBottom: 'var(--spacing-2)', borderBottom: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{language === 'en' ? shortcutCategories[cat.category] ?? cat.category : cat.category}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {cat.items.map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-3)' }}>
                  <kbd style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-1) var(--spacing-2)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--surface-text-primary)',
                    backgroundColor: 'var(--surface-sunken)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 0 var(--surface-border)',
                    minWidth: '100px',
                    justifyContent: 'center',
                  }}>
                    {item.key}
                  </kbd>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--surface-text-secondary)', flex: 1, textAlign: 'right' }}>{language === 'en' ? shortcutDescriptions[item.key] ?? item.desc : item.desc}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
          </div>
  );

  const renderFeaturesTab = () => (
    <div style={featuresGridStyles} className="features-grid">
      {FEATURES.map((feature, index) => {
        const featureKeys = ['problemTemplates', 'rng', 'solvers', 'differential', 'coverage', 'packaging'];
        const Icon = feature.icon;
        return (
          <Card key={feature.title}>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon className="w-6 h-6" style={{ color: 'var(--color-primary-600)' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 var(--spacing-1) 0', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
                  {language === 'en' ? t(`help.features.${featureKeys[index]}`) : feature.title}
                </h4>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--surface-text-secondary)', lineHeight: '1.5' }}>
                  {language === 'en' ? t(`help.features.${featureKeys[index]}Desc`) : feature.desc}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
          </div>
  );

  const renderGuideTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <Card>
        <CardHeader title={text("Bắt đầu nhanh", "Quick start")} subtitle={text("Quy trình tạo bộ test cơ bản", "Basic test generation workflow")} icon={<Zap className="w-4 h-4" />} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {[
            { step: 1, title: 'Chọn bài toán', desc: 'Tab "Sinh test" → Chọn "Dạng chính" và "Khuôn input" phù hợp (19 khuôn có sẵn)' },
            { step: 2, title: 'Cấu hình tham số', desc: 'Điều chỉnh N, M, giới trị giá trị... theo yêu cầu đề bài' },
            { step: 3, title: 'Thiết lập nhóm test (tùy chọn)', desc: 'Ctrl+P hoặc nút "Nhóm" → Tạo subtasks với cấu hình khác nhau' },
            { step: 4, title: 'Thêm test tay/mẫu (tùy chọn)', desc: 'Nút "Test tay" → Nhập input/output mẫu từ đề bài' },
            { step: 5, title: 'Sinh test', desc: 'Ctrl+G hoặc nút "Tạo bộ test" → Xem tiến độ và kết quả' },
            { step: 6, title: 'Kiểm tra & Xuất', desc: 'Tab "Kiểm kê" → Xem test, xuất CSV. Nút "Đóng gói bài" → ZIP/Kattis' },
          ].map((s) => (
            <div key={s.step} style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-600)',
                color: 'white',
                fontWeight: 'var(--font-bold)',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                {s.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--surface-text-primary)' }}>{language === 'en' ? t(`help.guide.steps.${s.step - 1}.title`).replace(/^\d+\.\s*/, '') : s.title}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--surface-text-secondary)' }}>{language === 'en' ? t(`help.guide.steps.${s.step - 1}.desc`) : s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title={text("Các khái niệm quan trọng", "Key concepts")} icon={<BookOpen className="w-4 h-4" />} />
        <div style={conceptsGridStyles} className="concepts-grid">
          {[
            { term: 'Seed', def: 'Số 64-bit khởi tạo RNG. Cùng seed + cùng config = cùng bộ test. Dùng để tái lập.' },
            { term: 'Subtask / Nhóm test', def: 'Tập test con với cấu hình riêng (N lớn, N nhỏ, trường hợp đặc biệt). Giúp chấm điểm từng phần.' },
            { term: 'Coverage tags', def: 'Nhãn gắn cho test (edge_case, large_n, random...). Dùng phân tích độ phủ.' },
            { term: 'Validator', def: 'Chương trình kiểm tra input hợp lệ. Chạy trước khi chấm. Exit code 0 = OK.' },
            { term: 'Checker', def: 'Chương trình so sánh output contestant với output chuẩn. Token/Float/Custom/Testlib.' },
            { term: 'Kattis PPF', def: 'Kattis Problem Package Format - chuẩn đóng gói bài thi quốc tế (2025-09).' },
            { term: 'Differential testing', def: 'Chạy nhiều lời giải trên cùng input, phát hiện khác biệt (WA/TLE/RE).' },
            { term: 'Test shrinking', def: 'Thu nhỏ heuristic: tìm input nhỏ nhất vẫn gây lỗi. Giúp debug nhanh.' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)' }}>
              <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-primary-500)', marginBottom: 'var(--spacing-1)' }}>{language === 'en' && i === 1 ? 'Subtask / test group' : c.term}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--surface-text-secondary)' }}>{language === 'en' ? [
                'A 64-bit RNG seed. The same seed and configuration reproduce the same tests.',
                'A group of tests with its own configuration, used for partial scoring.',
                'Labels attached to tests to help analyze coverage.',
                'A program that validates input; exit code 0 means valid.',
                'A program that compares contestant output with the expected output.',
                'Kattis Problem Package Format (2025-09).',
                'Compare outputs from multiple solutions on the same input.',
                'Heuristically reduce an input while preserving a failure.',
              ][i] : c.def}</div>
            </div>
          ))}
        </div>
              </Card>

      <Card>
        <CardHeader title={text("Quy trình Authoring chuyên nghiệp", "Problem authoring workflow")} icon={<GitBranch className="w-4 h-4" />} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {[
            '1. Soạn đề: Tab "Nội dung đề" → Điền mô tả, format, ràng buộc, ví dụ',
            '2. Thiết lập Validator: Tab "Công cụ" → "Hợp đồng Validator/Checker" → Định nghĩa accept/reject patterns',
            '3. Chọn Checker: Token (mặc định), Float (số thực), Testlib (C++), hoặc Custom JS',
            '4. Cấu hình Run Profile: Tab "Công cụ" → "Hồ sơ chạy thử" → Build/Run commands cho C++, Python, Java...',
            '5. Tạo test: Sinh test cơ bản → Thêm edge cases thủ công → Kiểm thử đối chiếu với lời giải AC/WA',
            '6. Phân tích độ phủ: Tab "Độ phủ" → Xem branch coverage → Bổ sung test cho nhánh chưa phủ',
            '7. Selftest: Tab "Công cụ" → "Chạy kiểm tra nội bộ" → Verify 19 khuôn bài hoạt động chính xác',
            '8. Đóng gói: Nút "Đóng gói bài" → Chọn OjGen format hoặc Kattis PPF → Submit lên judge',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--surface-text-secondary)', lineHeight: '1.5' }}>{language === 'en' ? [
                '1. Write the statement: add the description, formats, constraints and examples.',
                '2. Configure the validator contract and its acceptance rules.',
                '3. Choose a checker: token, float, Testlib or custom JavaScript.',
                '4. Configure a run profile for your chosen language.',
                '5. Generate tests and add manual edge cases.',
                '6. Analyze test coverage and add missing cases.',
                '7. Run the internal self-test for the built-in templates.',
                '8. Package the problem as OjGen ZIP or Kattis PPF.',
              ][i] : step}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAboutTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', alignItems: 'center', textAlign: 'center', padding: 'var(--spacing-8)' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-4)', boxShadow: '0 8px 24px rgb(59 130 246 / 0.3)' }}>
        <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-2xl)', color: 'white', letterSpacing: '0.05em' }}>OJ</span>
      </div>
      <h2 style={{ margin: '0 0 var(--spacing-2) 0', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--surface-text-primary)' }}>
        OjGen 3.3.0 Web Edition
      </h2>
      <p style={{ margin: 0, color: 'var(--surface-text-secondary)', maxWidth: '500px' }}>
        {text('Bộ công cụ tạo test cho bài lập trình thi đấu, chuyển thể từ ứng dụng desktop C#/.NET sang Web.', 'A competitive programming test authoring tool adapted from the C#/.NET desktop application.')} 
      </p>

      <Card style={{ maxWidth: '500px', width: '100%', marginTop: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {[
            { label: text("Phiên bản", "Version"), value: '3.3.0' },
            { label: text("Khuôn bài toán", "Problem templates"), value: text("19 cấu trúc", "19 templates") },
            { label: 'RNG', value: 'MT19937-64 (64-bit)' },
            { label: text("Ngôn ngữ", "Language"), value: 'TypeScript + React 19' },
            { label: 'Build tool', value: 'Vite 6' },
            { label: 'Styling', value: text("Tailwind CSS + Design System tùy chỉnh", "Tailwind CSS + custom design system") },
            { label: text("Đóng gói", "Packaging"), value: 'OjGen ZIP + Kattis PPF 2025-09' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-2) 0', borderBottom: i < 6 ? '1px solid var(--surface-border)' : 'none' }}>
              <span style={{ color: 'var(--surface-text-secondary)' }}>{item.label}</span>
              <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--surface-text-primary)', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
        <Button variant="secondary" size="sm" leftIcon={externalLinkIcon} onClick={handleOpenGitHub}>
          GitHub
        </Button>
        <Button variant="secondary" size="sm" leftIcon={externalLinkIcon} onClick={handleOpenVNOI}>
          VNOI
        </Button>
        <Button variant="secondary" size="sm" leftIcon={externalLinkIcon} onClick={handleOpenKattis}>
          Kattis
        </Button>
      </div>

      <p style={{ margin: 'var(--spacing-4) 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--surface-text-muted)' }}>
        © 2026 OjGen. Built with ❤️ for Competitive Programming community.
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', maxWidth: '1000px', margin: '0 auto', flex: 1 }}>
      <Card>
        <CardHeader
          title={text("Trợ giúp & Hướng dẫn", "Help & guide")}
          subtitle="OjGen 3.3.0 Web Edition - Competitive Programming Test Generator"
          icon={bookOpenIcon}
        />

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: 'var(--spacing-1)', borderBottom: '1px solid var(--surface-border)', marginBottom: 'var(--spacing-4)', overflowX: 'auto', overflowY: 'hidden' }}>
          {[
            { id: 'shortcuts', label: text("Phím tắt", "Shortcuts"), icon: keyboardIcon },
            { id: 'features', label: text("Tính năng", "Features"), icon: zapIcon },
            { id: 'guide', label: text("Hướng dẫn", "Guide"), icon: bookOpenIcon },
            { id: 'about', label: text("Giới thiệu", "About"), icon: checkCircleIcon },
          ].map((section) => (
            <button
              key={section.id}
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
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeSection === 'shortcuts' && renderShortcutsTab()}
        {activeSection === 'features' && renderFeaturesTab()}
        {activeSection === 'guide' && renderGuideTab()}
        {activeSection === 'about' && renderAboutTab()}
      </Card>
    </div>
  );
};
