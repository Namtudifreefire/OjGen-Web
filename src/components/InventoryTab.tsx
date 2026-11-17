import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import { GeneratedTestCase, Problem } from '../core/types';
import { Search, Download, Eye, Network, BarChart2, Grid, Copy, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardDivider } from './ui/Card';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table } from './ui/Table';

const downloadIcon = <Download className="w-3.5 h-3.5" />;
const chevronLeftIcon = <ChevronLeft className="w-3.5 h-3.5" />;
const chevronRightIcon = <ChevronRight className="w-3.5 h-3.5" />;
const gridIcon = <Grid className="w-3.5 h-3.5" />;
const barChartIcon = <BarChart2 className="w-3.5 h-3.5" />;
const searchIcon = <Search className="w-4 h-4" />;
const networkIcon = <Network className="w-12 h-12" />;
const copyIcon = <Copy className="w-3.5 h-3.5" />;
const checkCircleIcon = <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />;
const eyeIcon = <Eye className="w-3.5 h-3.5" />;

interface InventoryTabProps {
  tests: GeneratedTestCase[];
  problem: Problem;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ tests, problem }) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedTestIndex, setSelectedTestIndex] = useState<number | null>(tests[0]?.index ?? null);
  const [viewMode, setViewMode] = useState<'text' | 'visualize'>('text');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const groups = Array.from(new Set(tests.map((t) => t.groupName)));

  const filteredTests = tests.filter((t) => {
    const matchesGroup = selectedGroup === 'all' || t.groupName === selectedGroup;
    const matchesSearch =
      searchTerm === '' ||
      t.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  useEffect(() => {
    setSelectedTestIndex(tests[0]?.index ?? null);
    setSelectedGroup('all');
    setSearchTerm('');
    setViewMode('text');
  }, [tests]);

  const selectedTest = filteredTests.find((test) => test.index === selectedTestIndex) ?? filteredTests[0] ?? null;

  const exportCsv = () => {
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [
      ['index', 'file', 'group', 'bytes', 'tags'].map(escapeCsv).join(','),
      ...tests.map((test) =>
        [test.index, test.fileName, test.groupName, test.bytes, test.tags.join(';')].map(escapeCsv).join(',')
      ),
    ];
    const blob = new Blob(['﻿', rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${problem.id}_inventory.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 100);
  };

  const copyTest = (test: GeneratedTestCase) => {
    navigator.clipboard.writeText(`${test.input}\n---\n${test.output}`);
    setCopiedIndex(test.index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render SVG Graph Visualization
  const renderGraphVisualizer = (input: string) => {
    const lines = input.trim().split('\n');
    if (lines.length < 1) return null;
    const [nStr, mStr] = lines[0].trim().split(/\s+/);
    const n = parseInt(nStr, 10);
    if (isNaN(n) || n > 100) {
      return (
        <div style={{ padding: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-light)', borderRadius: 'var(--radius-default)' }}>
          {text(`Đồ thị có ${n} đỉnh (quá lớn để hiển thị trực quan trực tiếp).`, `The graph has ${n} vertices and is too large to visualize.`)}
        </div>
      );
    }

    const width = 400;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;

    const nodes = Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n;
      return {
        id: i + 1,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const edges: Array<{ u: number; v: number; w?: string }> = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 2) {
        edges.push({
          u: parseInt(parts[0], 10),
          v: parseInt(parts[1], 10),
          w: parts[2],
        });
      }
    }

    return (
      <svg width={width} height={height} style={{ backgroundColor: 'var(--surface-sunken)', borderRadius: 'var(--radius-default)', border: '1px solid var(--surface-border)', display: 'block', margin: '0 auto' }}>
        {edges.map((e, idx) => {
          const uNode = nodes.find((node) => node.id === e.u);
          const vNode = nodes.find((node) => node.id === e.v);
          if (!uNode || !vNode) return null;
          return (
            <line
              key={idx}
              x1={uNode.x}
              y1={uNode.y}
              x2={vNode.x}
              y2={vNode.y}
              stroke="var(--color-primary-500)"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="12" fill="var(--surface-raised)" stroke="var(--color-primary-400)" strokeWidth="2" />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fontSize="10"
              fill="var(--surface-text-primary)"
              fontWeight="bold"
              fontFamily="var(--font-sans)"
            >
              {node.id}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Render Grid Visualization
  const renderGridVisualizer = (input: string) => {
    const lines = input.trim().split('\n');
    if (lines.length < 2) return null;
    const [rStr, cStr] = lines[0].trim().split(/\s+/);
    const rows = parseInt(rStr, 10);
    const cols = parseInt(cStr, 10);
    if (isNaN(rows) || isNaN(cols) || rows > 30 || cols > 30) {
      return (
        <div style={{ padding: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-light)', borderRadius: 'var(--radius-default)' }}>
          {text(`Lưới kích thước ${rows}×${cols} vượt giới hạn hiển thị chi tiết (≤ 30×30).`, `The ${rows}×${cols} grid exceeds the detailed view limit (≤ 30×30).`)}
        </div>
      );
    }

    const cellData: string[][] = [];
    let lineIdx = 1;
    for (let r = 0; r < rows && lineIdx < lines.length; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols && lineIdx < lines.length; c++) {
        const parts = lines[lineIdx].trim().split(/\s+/);
        row.push(parts[0] || '0');
        if (parts.length > 1) {
          for (let i = 1; i < parts.length; i++) {
            if (c + i < cols) row[c + i] = parts[i];
          }
        }
        lineIdx++;
      }
      while (row.length < cols) row.push('0');
      cellData.push(row);
    }

    const cellSize = Math.min(400 / cols, 300 / rows, 30);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', backgroundColor: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
          <tbody>
            {cellData.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      border: '1px solid var(--surface-border)',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontSize: `${Math.max(8, cellSize * 0.4)}px`,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--surface-text-primary)',
                      backgroundColor: (r + c) % 2 === 0 ? 'transparent' : 'var(--surface-overlay)',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handlePrevTest = () => {
    const idx = filteredTests.findIndex(t => t.index === selectedTestIndex);
    if (idx > 0) setSelectedTestIndex(filteredTests[idx - 1].index);
  };

  const handleNextTest = () => {
    const idx = filteredTests.findIndex(t => t.index === selectedTestIndex);
    if (idx < filteredTests.length - 1) setSelectedTestIndex(filteredTests[idx + 1].index);
  };

  const columns = [
    { key: 'index', header: '#', width: '50px', align: 'center' as const },
    { key: 'fileName', header: text('Tên file', 'File name'), width: '140px' },
    { key: 'groupName', header: text('Nhóm', 'Group'), width: '140px' },
    { key: 'bytes', header: text('Kích thước', 'Size'), width: '100px', align: 'right' as const, render: (row: GeneratedTestCase) => `${row.bytes} B` },
    {
      key: 'tags',
      header: 'Tags',
      render: (row: GeneratedTestCase) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)' }}>
          {row.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '90px',
      align: 'center' as const,
      render: (row: GeneratedTestCase) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-1)', justifyContent: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyTest(row)}
            aria-label={text('Sao chép test', 'Copy test')}
            disabled={copiedIndex === row.index}
          >
            {copiedIndex === row.index ? checkCircleIcon : copyIcon}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedTestIndex(row.index); setViewMode('visualize'); }}
            aria-label={text('Xem chi tiết', 'View details')}
          >
            {eyeIcon}
          </Button>
        </div>
      ),
    },
  ];

  const groupOptions = [{ value: 'all', label: text('Tất cả nhóm', 'All groups') }, ...groups.map((g) => ({ value: g, label: g }))];

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
      <Card>
        <CardHeader
          title={text('Kiểm kê bộ test', 'Test inventory')}
          subtitle={`${tests.length} ${text('test', 'tests')} · ${groups.length} ${text('nhóm', 'groups')}`}
          action={
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="secondary" size="sm" leftIcon={downloadIcon} onClick={exportCsv}>
                {text('Xuất CSV', 'Export CSV')}
              </Button>
            </div>
          }
        />

        <CardDivider />

        {/* Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: 'var(--spacing-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-text-muted)', pointerEvents: 'none' }}>
              {searchIcon}
            </span>
            <Input
              placeholder={text('Tìm theo tên file, tags...', 'Search by file name or tags...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              style={{ paddingLeft: 'var(--spacing-10)' }}
            />
          </div>

          <Select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            options={groupOptions}
            style={{ minWidth: '180px' }}
          />

          <div style={{ display: 'flex', gap: 'var(--spacing-1)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', backgroundColor: 'var(--surface-overlay)', padding: 'var(--spacing-1)' }}>
            <Button
              variant={viewMode === 'text' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('text')}
              aria-label={text('Xem danh sách', 'List view')}
              style={{ padding: 'var(--spacing-1) var(--spacing-2)' }}
            >
              {gridIcon}
            </Button>
            <Button
              variant={viewMode === 'visualize' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('visualize')}
              aria-label={text('Trực quan hóa', 'Visualization')}
              style={{ padding: 'var(--spacing-1) var(--spacing-2)' }}
            >
              {barChartIcon}
            </Button>
          </div>
        </div>
      </Card>

      {tests.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-3)', color: 'var(--surface-text-muted)' }}>
            <span>{networkIcon}</span>
            <p style={{ fontSize: 'var(--text-base)', margin: 0 }}>{text('Chưa có test nào', 'No tests yet')}</p>
            <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>{text('Hãy tạo test từ tab "Tạo bộ test" hoặc nhập từ file', 'Generate tests from the Generator tab or import them from a file.')}</p>
          </div>
        </Card>
      ) : (
        <div>
          {/* Table View */}
          {viewMode === 'text' && (
            <Card>
              <Table
                columns={columns}
                data={filteredTests}
                keyExtractor={(row) => String(row.index)}
                onRowClick={(row) => setSelectedTestIndex(row.index)}
                selectable={false}
                striped
                hoverable
                bordered
              />
            </Card>
          )}

          {/* Visualization View */}
          {viewMode === 'visualize' && selectedTest && (
            <Card>
              <CardHeader
                title={text('Trực quan hóa test', 'Test visualization')}
                subtitle={selectedTest.fileName}
                action={
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <Button variant="secondary" size="sm" leftIcon={chevronLeftIcon} onClick={handlePrevTest} disabled={filteredTests.indexOf(selectedTest) === 0}>
                    </Button>
                    <Button variant="secondary" size="sm" rightIcon={chevronRightIcon} onClick={handleNextTest} disabled={filteredTests.indexOf(selectedTest) === filteredTests.length - 1}>
                    </Button>
                  </div>
                }
              />

              <CardDivider />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  <div style={{ backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', padding: 'var(--spacing-3)', maxHeight: '300px', overflow: 'auto' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Input</div>
                    <pre style={{ margin: 0, fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--surface-text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {selectedTest.input}
                    </pre>
                  </div>
                  <div style={{ backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', padding: 'var(--spacing-3)', maxHeight: '300px', overflow: 'auto' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Output</div>
                    <pre style={{ margin: 0, fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-success)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {selectedTest.output}
                    </pre>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', marginBottom: 'var(--spacing-3)' }}>{text('Trực quan hóa', 'Visualization')}</div>
                  {(() => {
                    const input = selectedTest.input;
                    if (problem.id.includes('graph') || problem.id === 'GraphProblem') {
                      return renderGraphVisualizer(input);
                    }
                    if (problem.id.includes('grid') || problem.id === 'GridProblem') {
                      return renderGridVisualizer(input);
                    }
                    return (
                      <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--surface-text-muted)', fontSize: 'var(--text-sm)' }}>
                        <span style={{ display: 'inline-block', opacity: 0.3 }}>{networkIcon}</span>
                        <p>{text('Không có trực quan hóa cho loại bài này', 'No visualization is available for this problem type.')}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
