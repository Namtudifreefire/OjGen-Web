import React, { useEffect, useState } from 'react';
import { GeneratedTestCase, Problem } from '../core/types';
import { Search, Download, Eye, Network, BarChart2, Grid } from 'lucide-react';

interface InventoryTabProps {
  tests: GeneratedTestCase[];
  problem: Problem;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ tests, problem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedTestIndex, setSelectedTestIndex] = useState<number | null>(tests[0]?.index ?? null);
  const [viewMode, setViewMode] = useState<'text' | 'visualize'>('text');

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
    const blob = new Blob(['\uFEFF', rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
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

  // Render SVG Graph Visualization
  const renderGraphVisualizer = (input: string) => {
    const lines = input.trim().split('\n');
    if (lines.length < 1) return null;
    const [nStr, mStr] = lines[0].trim().split(/\s+/);
    const n = parseInt(nStr, 10);
    if (isNaN(n) || n > 100) {
      return (
        <div className="p-4 text-xs text-amber-400 bg-amber-500/10 rounded-lg">
          Đồ thị có {n} đỉnh (quá lớn để hiển thị trực quan trực tiếp).
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
      <svg width={width} height={height} className="bg-slate-950 rounded-lg border border-slate-800 mx-auto">
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
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="12" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fontSize="10"
              fill="#f8fafc"
              fontWeight="bold"
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
        <div className="p-4 text-xs text-amber-400 bg-amber-500/10 rounded-lg">
          Lưới kích thước {rows}×{cols} vượt giới hạn hiển thị chi tiết (≤ 30×30).
        </div>
      );
    }

    const gridLines = lines.slice(1, rows + 1);
    return (
      <div className="overflow-auto max-h-[340px] flex items-center justify-center p-2 bg-slate-950 rounded-lg border border-slate-800">
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(16px, 24px))` }}
        >
          {gridLines.map((line, r) =>
            line.split('').map((ch, c) => {
              let bg = 'bg-slate-800 text-slate-400';
              if (ch === 'S') bg = 'bg-emerald-600 text-white font-bold animate-pulse';
              if (ch === 'T') bg = 'bg-rose-600 text-white font-bold animate-pulse';
              if (ch === '#') bg = 'bg-slate-950 border border-slate-800 text-slate-600';
              if (ch === '.') bg = 'bg-slate-900 text-slate-500';

              return (
                <div
                  key={`${r}-${c}`}
                  className={`w-5 h-5 flex items-center justify-center text-[10px] rounded font-mono ${bg}`}
                  title={`[${r}, ${c}]: ${ch}`}
                >
                  {ch}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Render Histogram for Arrays
  const renderArrayHistogram = (input: string) => {
    const tokens = input.trim().split(/\s+/).slice(1);
    const numbers = tokens.map(Number).filter((n) => !isNaN(n));
    if (numbers.length === 0) return null;

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const bins = 10;
    const step = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);

    for (const num of numbers) {
      const idx = Math.min(bins - 1, Math.floor((num - min) / step));
      counts[idx]++;
    }

    const maxCount = Math.max(...counts) || 1;

    return (
      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
          Phân phối tần số {numbers.length} giá trị ([{min} .. {max}])
        </h4>
        <div className="flex items-end gap-1.5 h-32 pt-4">
          {counts.map((c, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[9px] text-slate-400 font-mono">{c}</span>
              <div
                className="w-full bg-blue-500 rounded-t transition-all"
                style={{ height: `${(c / maxCount) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>🧾 Kiểm kê &amp; Trực quan hóa bộ test</span>
            <span className="text-xs font-normal text-slate-400">({tests.length} test hiện có)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên/nhãn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 w-44 font-mono"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả nhóm</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            disabled={tests.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
          Chưa có test nào được tạo. Hãy sang tab "Tạo bộ test" và bấm "▶ Tạo bộ test".
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Tests List column */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-[520px]">
            <div className="text-xs font-semibold text-slate-400 pb-2 border-b border-slate-800 mb-2 flex justify-between">
              <span>Danh sách test ({filteredTests.length})</span>
              <span>Dung lượng</span>
            </div>

            <div className="flex-1 overflow-auto space-y-1">
              {filteredTests.map((t) => {
                const isSelected = selectedTest?.index === t.index;
                return (
                  <div
                    key={t.index}
                    onClick={() => setSelectedTestIndex(t.index)}
                    className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between border transition ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-semibold flex items-center gap-1.5">
                        <span>{t.fileName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {t.groupName}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="text-[9px] px-1 rounded bg-slate-800/90 text-blue-400 font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{t.bytes} B</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Detail & Visualizer column */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[520px]">
            {selectedTest ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>{selectedTest.fileName} ({selectedTest.groupName})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Seed: {selectedTest.seed} · Dung lượng: {selectedTest.bytes} bytes
                    </p>
                  </div>

                  {/* Toggle View Mode */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <button
                      onClick={() => setViewMode('text')}
                      className={`px-3 py-1 rounded font-medium transition ${
                        viewMode === 'text' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Văn bản (.inp / .out)
                    </button>
                    <button
                      onClick={() => setViewMode('visualize')}
                      className={`px-3 py-1 rounded font-medium transition ${
                        viewMode === 'visualize' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Trực quan hóa
                    </button>
                  </div>
                </div>

                {viewMode === 'text' ? (
                  <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
                    {/* Input View */}
                    <div className="flex flex-col h-full">
                      <span className="text-xs font-mono font-medium text-slate-400 mb-1">
                        Dữ liệu vào (.inp)
                      </span>
                      <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto text-xs font-mono text-emerald-400 leading-relaxed">
                        {selectedTest.input}
                      </pre>
                    </div>

                    {/* Output View */}
                    <div className="flex flex-col h-full">
                      <span className="text-xs font-mono font-medium text-slate-400 mb-1">
                        Đáp án chuẩn (.out)
                      </span>
                      <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto text-xs font-mono text-blue-400 leading-relaxed">
                        {selectedTest.output}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto p-2">
                    {problem.id === 'graph' || problem.id === 'tree' ? (
                      renderGraphVisualizer(selectedTest.input)
                    ) : problem.id === 'grid' ? (
                      renderGridVisualizer(selectedTest.input)
                    ) : problem.id === 'array' || problem.id === 'prefix_sum_range' ? (
                      renderArrayHistogram(selectedTest.input)
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs italic">
                        Khuôn bài này hiển thị trực quan thông qua phân phối số liệu hoặc bảng văn bản.
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Chọn một test từ danh sách bên trái để kiểm tra
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
