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
    tests: GeneratedTestCase[]
  ): CoverageReport {
    const observations: string[] = [];
    const suggestions: string[] = [];

    const totalTests = tests.length;
    observations.push(`Tổng cộng ${totalTests} test trong ${groups.length > 0 ? groups.length : 1} nhóm.`);

    // Check tags
    const allTags = new Set<string>();
    for (const g of groups) {
      for (const t of g.coverageTags) allTags.add(t.toLowerCase());
    }
    for (const test of tests) {
      for (const t of test.tags) allTags.add(t.toLowerCase());
    }

    if (allTags.has('small')) observations.push('Đã có nhóm/test kiểm thử kích thước nhỏ (small).');
    else suggestions.push('Nên thêm nhóm test nhỏ (small / N nhỏ) để kiểm tra tính đúng đắn cơ bản.');

    if (allTags.has('boundary')) observations.push('Đã có nhóm/test chạm biên cực trị (boundary).');
    else suggestions.push('Nên thêm nhóm test biên (boundary) tại cận min hoặc max của tham số.');

    if (allTags.has('stress')) observations.push('Đã có nhóm kiểm thử áp lực lớn (stress).');
    else suggestions.push('Nên thêm test stress ở ngưỡng cận trên để kiểm tra tràn thời gian (TLE) hoặc tràn bộ nhớ (MLE).');

    if (allTags.has('adversarial')) observations.push('Đã có nhóm test chống thuật toán tham lam/bẫy góc (adversarial).');

    if (problem.id === 'array') {
      const mode = config.getNum('mode');
      if (mode === 0) {
        observations.push(`Mảng số nguyên với minVal = ${config.get('minVal')}, maxVal = ${config.get('maxVal')}.`);
        if (config.get('minVal') > 0n) {
          suggestions.push('Cân nhắc thêm test chứa số 0 hoặc số âm nếu bài toán cho phép.');
        }
      }
    } else if (problem.id === 'graph') {
      observations.push(`Đồ thị: directed = ${config.getBool('directed')}, weighted = ${config.getBool('weighted')}.`);
      if (!config.getBool('connected')) {
        suggestions.push('Đồ thị chưa bắt buộc liên thông: nên kiểm tra cả đồ thị có nhiều thành phần liên thông / đỉnh cô lập.');
      }
    }

    const summary = `Báo cáo phân tích độ phủ: ${observations.length} quan sát, ${suggestions.length} đề xuất cải thiện.`;

    return {
      summary,
      confidence: 'Heuristic',
      observations,
      suggestions: suggestions.length > 0 ? suggestions : ['Bộ test đã phủ tốt các khía cạnh cơ bản.'],
    };
  }
}
