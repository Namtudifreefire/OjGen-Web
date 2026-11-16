import { Problem, Config, TestGroupSpec, GeneratedTestCase } from './types';

export interface CoverageReport {
  summary: string;
  confidence: string;
  observations: string[];
  suggestions: string[];
}

export class CoverageAnalyzer {
  public static analyze(
    problem: Problem,
    config: Config,
    groups: TestGroupSpec[],
    tests: GeneratedTestCase[],
    language: 'vi' | 'en' = 'vi'
  ): CoverageReport {
    const text = (vi: string, en: string) => language === 'en' ? en : vi;
    const observations: string[] = [];
    const suggestions: string[] = [];

    const totalTests = tests.length;
    observations.push(text(`Tổng cộng ${totalTests} test trong ${groups.length > 0 ? groups.length : 1} nhóm.`, `${totalTests} tests in ${groups.length > 0 ? groups.length : 1} groups.`));

    // Check tags
    const allTags = new Set<string>();
    for (const g of groups) {
      for (const t of g.coverageTags) allTags.add(t.toLowerCase());
    }
    for (const test of tests) {
      for (const t of test.tags) allTags.add(t.toLowerCase());
    }

    if (allTags.has('small')) observations.push(text('Đã có nhóm/test kiểm thử kích thước nhỏ (small).', 'Small tests are present.'));
    else suggestions.push(text('Nên thêm nhóm test nhỏ (small / N nhỏ) để kiểm tra tính đúng đắn cơ bản.', 'Add small tests to check basic correctness.'));

    if (allTags.has('boundary')) observations.push(text('Đã có nhóm/test chạm biên cực trị (boundary).', 'Boundary tests are present.'));
    else suggestions.push(text('Nên thêm nhóm test biên (boundary) tại cận min hoặc max của tham số.', 'Add tests at minimum and maximum parameter bounds.'));

    if (allTags.has('stress')) observations.push(text('Đã có nhóm kiểm thử áp lực lớn (stress).', 'Stress tests are present.'));
    else suggestions.push(text('Nên thêm test stress ở ngưỡng cận trên để kiểm tra tràn thời gian (TLE) hoặc tràn bộ nhớ (MLE).', 'Add stress tests near the upper bounds to check time and memory limits.'));

    if (allTags.has('adversarial')) observations.push(text('Đã có nhóm test chống thuật toán tham lam/bẫy góc (adversarial).', 'Adversarial tests are present.'));

    if (problem.id === 'array') {
      const mode = config.getNum('mode');
      if (mode === 0) {
        observations.push(text(`Mảng số nguyên với minVal = ${config.get('minVal')}, maxVal = ${config.get('maxVal')}.`, `Integer array with minVal = ${config.get('minVal')}, maxVal = ${config.get('maxVal')}.`));
        if (config.get('minVal') > 0n) {
          suggestions.push(text('Cân nhắc thêm test chứa số 0 hoặc số âm nếu bài toán cho phép.', 'Consider tests containing zero or negative values if permitted.'));
        }
      }
    } else if (problem.id === 'graph') {
      observations.push(text(`Đồ thị: directed = ${config.getBool('directed')}, weighted = ${config.getBool('weighted')}.`, `Graph: directed = ${config.getBool('directed')}, weighted = ${config.getBool('weighted')}.`));
      if (!config.getBool('connected')) {
        suggestions.push(text('Đồ thị chưa bắt buộc liên thông: nên kiểm tra cả đồ thị có nhiều thành phần liên thông / đỉnh cô lập.', 'Connectivity is not required; consider disconnected graphs and isolated vertices.'));
      }
    }

    const summary = text(`Báo cáo phân tích độ phủ: ${observations.length} quan sát, ${suggestions.length} đề xuất cải thiện.`, `Coverage report: ${observations.length} observations and ${suggestions.length} suggestions.`);

    return {
      summary,
      confidence: 'Heuristic',
      observations,
      suggestions: suggestions.length > 0 ? suggestions : [text('Bộ test đã phủ tốt các khía cạnh cơ bản.', 'The test set covers the basic cases.')],
    };
  }
}
