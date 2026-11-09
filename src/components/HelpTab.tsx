import React from 'react';
import { HelpCircle, BookOpen, Layers, CheckSquare, Sparkles, Terminal } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const HelpTab: React.FC = () => {
  const { lang, t } = useLanguage();

  if (lang === 'en') {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6 text-slate-200">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <span>OjGen 3.3.0 Web User Guide</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated testcase generation, validation, and contest packaging suite for competitive programming
          </p>
        </div>

        {/* Section 1 */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 1. Testcase Generation Workflow
          </h2>
          <div className="text-xs leading-relaxed space-y-2 text-slate-300">
            <p>
              • <strong>Step 1: Choose a Problem Template.</strong> Select quickly from recommended competitive programming topics (VNOI, Codeforces, QBOJ, LQDOJ, LTOJ, DMOJ) to match your problem's input specification.
            </p>
            <p>
              • <strong>Step 2: Customize Generation Parameters.</strong> Adjust array size N, value ranges min/max, permutation mode, string length, query count Q, or graph properties (connected, weighted, DAG).
            </p>
            <p>
              • <strong>Step 3: Define Subtasks / Test Groups.</strong> Use the "Test Plan" dialog to split tests into scored subtasks, configure prerequisite subtasks, and apply adversarial coverage tags (small, boundary, stress, adversarial) or preset packs.
            </p>
            <p>
              • <strong>Step 4: Inspect Sample Output & Generate.</strong> Click "Preview Sample" to check an isolated generated testcase and canonical answer. Then click "Generate Tests" (or press Ctrl+G). Enable auto-download to receive a ready-to-use ZIP file.
            </p>
          </div>
        </section>

        {/* Section 2: 19 input templates */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" /> 2. 19 Supported Input Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-400 block mb-1">Numbers & Tuples:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><code className="text-slate-300">single_n</code>: Single integer N</li>
                <li><code className="text-slate-300">two_ints</code>: Pair of integers A and B with ordering options</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-400 block mb-1">Arrays & Queries:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><code className="text-slate-300">array</code>: 1D array / permutation / sorted sequences</li>
                <li><code className="text-slate-300">queries</code>: Array with Q point/range updates & queries</li>
                <li><code className="text-slate-300">prefix_sum_range</code>: QBOJ sumarr range queries</li>
                <li><code className="text-slate-300">prefix_subsequence_range</code>: QBOJ TDC subsequence queries</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-400 block mb-1">Matrix, Grid & Strings:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><code className="text-slate-300">string</code>: String generation with custom charsets</li>
                <li><code className="text-slate-300">matrix</code>: R×C matrix or dual parallel arrays</li>
                <li><code className="text-slate-300">grid</code>: Character maze grid with optional S and T</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-400 block mb-1">Graphs, Trees & Chess:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><code className="text-slate-300">graph</code>: Simple, connected, DAG, or bipartite graphs</li>
                <li><code className="text-slate-300">tree</code>: Random, star, line, or binary trees</li>
                <li><code className="text-slate-300">pairs</code>: Interval or segment pairs [L, R]</li>
                <li><code className="text-slate-300">chess_*</code>: 5 Chess and Knight move challenge templates</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Counterexample Shrinking & Differential */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> 3. Differential Testing & Counterexample Shrinker
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The shrinker currently implements a delta-debugging heuristic for two-line array inputs: it iteratively removes elements and zeroes values over up to 64 trials while ensuring the candidate solution continues to fail. Run the minimized test against your solver to reproduce minimal corner cases.
          </p>
        </section>

        {/* Section 4: Problem Packaging */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4" /> 4. Contest Packaging (OjGen & Kattis PPF)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            OjGen Standard packages include all .inp/.out files, <code>PACKAGE_SHA256SUMS.txt</code>, <code>inventory.csv</code>, <code>provenance.json</code>, and problem statement Markdown. Kattis packages organize tests into <code>data/sample</code> and <code>data/secret</code> with <code>problem.yaml</code>. Verify destination judge requirements before uploading.
          </p>
        </section>

        {/* Section 5: Global Shortcuts */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> 5. Global Keyboard Shortcuts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Save current project (.ojproject.json)</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Start automatic testcase generation</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + G</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Quick switch to Log tab</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + L</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Open project file (.ojproject.json)</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + O</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Open Test Plan / Subtasks modal</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + P</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Open Package modal (ZIP / Kattis)</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + B</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Open keyboard shortcuts reference</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">?</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span>Close currently open dialog</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Esc</kbd>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 text-slate-200">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span>Hướng dẫn sử dụng OjGen 3.3.0 Web</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Bộ công cụ tạo test tự động, kiểm định và đóng gói đề thi lập trình thi đấu
        </p>
      </div>

      {/* Section 1 */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> 1. Quy trình tạo bộ test
        </h2>
        <div className="text-xs leading-relaxed space-y-2 text-slate-300">
          <p>
            • <strong>Bước 1: Chọn khuôn bài toán.</strong> Có thể chọn nhanh từ danh mục chủ đề thuật toán (VNOI, Codeforces, QBOJ, LQDOJ, LTOJ, DMOJ) để lấy gợi ý khuôn phù hợp nhất với cấu trúc dữ liệu của đề.
          </p>
          <p>
            • <strong>Bước 2: Tùy chỉnh tham số sinh test.</strong> Điều chỉnh số lượng phần tử N, khoảng giá trị min/max, chế độ hoán vị, độ dài chuỗi, số lượng truy vấn Q, hoặc các đặc tính đồ thị (liên thông, có trọng số, DAG).
          </p>
          <p>
            • <strong>Bước 3: Chia nhóm test (Subtasks).</strong> Dùng tính năng "Nhóm test" để phân chia tối đa 100 nhóm có điểm số, điều kiện tiên quyết, nhãn độ phủ (small, boundary, stress, adversarial) hoặc tạo nhanh bằng nút "Adversarial Presets".
          </p>
          <p>
            • <strong>Bước 4: Kiểm tra input mẫu và Tạo bộ test.</strong> Nhấn "Xem thử mẫu" để xem trước 1 test được sinh. Sau đó nhấn "Tạo bộ test" (hoặc Ctrl+G) để sinh test; ZIP chỉ tự tải nếu bật tùy chọn "Tự động nén và tải ZIP sau khi tạo".
          </p>
        </div>
      </section>

      {/* Section 2: 19 cấu trúc input */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" /> 2. Danh sách 19 cấu trúc input được hỗ trợ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-blue-400 block mb-1">Số và bộ giá trị:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><code className="text-slate-300">single_n</code>: Một số nguyên N</li>
              <li><code className="text-slate-300">two_ints</code>: Hai số nguyên A B, tùy chọn thứ tự</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-blue-400 block mb-1">Dãy và truy vấn:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><code className="text-slate-300">array</code>: Mảng 1 chiều / hoán vị / sắp xếp</li>
              <li><code className="text-slate-300">queries</code>: Mảng + Q truy vấn cập nhật/đoạn</li>
              <li><code className="text-slate-300">prefix_sum_range</code>: QBOJ sumarr</li>
              <li><code className="text-slate-300">prefix_subsequence_range</code>: QBOJ TDC</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-blue-400 block mb-1">Ma trận, Lưới &amp; Xâu:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><code className="text-slate-300">string</code>: Xâu ký tự với đa dạng charset</li>
              <li><code className="text-slate-300">matrix</code>: Ma trận n×m hoặc 2 mảng song song</li>
              <li><code className="text-slate-300">grid</code>: Lưới ký tự với tùy chọn S và T</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-blue-400 block mb-1">Đồ thị, Cây &amp; Cờ vua:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><code className="text-slate-300">graph</code>: Đồ thị đơn, liên thông, DAG, 2 phía</li>
              <li><code className="text-slate-300">tree</code>: Cây ngẫu nhiên, sao, xích, nhị phân</li>
              <li><code className="text-slate-300">pairs</code>: Danh sách cặp / đoạn [l, r]</li>
              <li><code className="text-slate-300">chess_*</code>: 5 khuôn bài cờ vua và quân Mã</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Thu nhỏ phản ví dụ & Đối chiếu */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4" /> 3. Kiểm thử đối chiếu &amp; Shrinker cấu trúc
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Shrinker hiện là heuristic cơ bản cho input mảng hai dòng: thử bỏ bớt phần tử và giảm giá trị số về 0, tối đa 64 lượt thử. Nó chưa thu nhỏ cấu trúc graph, tree, grid hoặc truy vấn. Hãy chạy lại phản ví dụ đã thu nhỏ để xác nhận lỗi vẫn còn.
        </p>
      </section>

      {/* Section 4: Đóng gói bài */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4" /> 4. Đóng gói chuẩn Kattis PPF và OjGen
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Gói OjGen Standard chứa dữ liệu input/output, <code>PACKAGE_SHA256SUMS.txt</code>, <code>inventory.csv</code>, <code>provenance.json</code> và đề Markdown nếu có. Gói Kattis tạo <code>problem.yaml</code>, <code>data/sample</code>, <code>data/secret</code> và đề tiếng Việt nếu có; gói này hiện không kèm checksum hoặc inventory. Hãy kiểm tra lại cấu trúc và metadata theo yêu cầu của hệ thống chấm đích trước khi nộp.
        </p>
      </section>

      {/* Section 5: Phím tắt bàn phím (Global Shortcuts) */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> 5. Phím tắt bàn phím tiện ích (Global Shortcuts)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Lưu dự án hiện tại (.ojproject.json)</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + S</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Bắt đầu sinh bộ test tự động</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + G</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Chuyển nhanh sang tab Nhật ký</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + L</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Mở tệp dự án (.ojproject.json)</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + O</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Mở Kế hoạch phân nhóm test / Subtasks</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + P</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Mở Đóng gói bài tập (ZIP / Kattis)</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Ctrl + B</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Mở bảng tra cứu phím tắt</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">?</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span>Đóng hộp thoại đang mở</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-[11px] font-semibold text-slate-200 border border-slate-700">Esc</kbd>
          </div>
        </div>
      </section>
    </div>
  );
};
