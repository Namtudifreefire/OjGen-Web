import { Problem, Config, TestGroupSpec } from './types';

export class TestPlanManager {
  private static readonly DIMENSIONS = [
    ['minN', 'maxN'],
    ['minLen', 'maxLen'],
    ['minRows', 'maxRows'],
    ['minCols', 'maxCols'],
    ['minQ', 'maxQ'],
    ['minT', 'maxT'],
  ];

  public static generateAdversarialPresets(problem: Problem, sourceConfig: Config, existingNames: string[], language: 'vi' | 'en' = 'vi'): TestGroupSpec[] {
    const text = (vi: string, en: string) => language === 'en' ? en : vi;
    const used = new Set(existingNames.map(n => n.toLowerCase()));
    const result: TestGroupSpec[] = [];

    const addGroup = (name: string, cfg: Config) => {
      if (problem.validateConfig(cfg) !== null) return;
      let unique = name;
      let counter = 2;
      while (used.has(unique.toLowerCase())) {
        unique = `${name} ${counter++}`;
      }
      used.add(unique.toLowerCase());
      result.push({
        name: unique,
        testCount: 5,
        cfg: cfg.clone(),
        coverageTags: ['adversarial'],
        score: 0,
      });
    };

    // Low boundary
    const low = sourceConfig.clone();
    let changedLow = false;
    for (const [minKey, maxKey] of TestPlanManager.DIMENSIONS) {
      if (problem.params.some(p => p.key === minKey) && problem.params.some(p => p.key === maxKey)) {
        const val = sourceConfig.get(minKey);
        low.set(minKey, val);
        low.set(maxKey, val);
        changedLow = true;
      }
    }
    if (changedLow) addGroup(text('Biên nhỏ', 'Lower boundary'), low);

    // High boundary
    const high = sourceConfig.clone();
    let changedHigh = false;
    for (const [minKey, maxKey] of TestPlanManager.DIMENSIONS) {
      if (problem.params.some(p => p.key === minKey) && problem.params.some(p => p.key === maxKey)) {
        const val = sourceConfig.get(maxKey);
        high.set(minKey, val);
        high.set(maxKey, val);
        changedHigh = true;
      }
    }
    if (changedHigh) addGroup(text('Biên lớn', 'Upper boundary'), high);

    // Array duplicates
    if (problem.id === 'array' && sourceConfig.getNum('mode') === 0) {
      const repeated = sourceConfig.clone();
      repeated.set('distinct', 0);
      repeated.set('minVal', 0);
      repeated.set('maxVal', 0);
      addGroup(text('Nhiều phần tử trùng', 'Repeated elements'), repeated);
    }

    // Graph strongly connected
    if (problem.id === 'graph' && sourceConfig.getBool('directed')) {
      const strong = sourceConfig.clone();
      strong.set('stronglyConnected', 1);
      strong.set('dag', 0);
      addGroup(text('Đồ thị liên thông mạnh', 'Strongly connected graph'), strong);
    }

    return result;
  }

  public static validatePlan(groups: TestGroupSpec[], language: 'vi' | 'en' = 'vi'): string | null {
    const text = (vi: string, en: string) => language === 'en' ? en : vi;
    if (groups.length === 0) return null;
    let totalScore = 0;
    const names = new Set<string>();

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (!g.name.trim()) return text(`Nhóm ${i + 1} chưa có tên.`, `Group ${i + 1} has no name.`);
      if (names.has(g.name.toLowerCase())) return text(`Trùng tên nhóm: "${g.name}".`, `Duplicate group name: "${g.name}".`);
      names.add(g.name.toLowerCase());
      if (g.testCount <= 0) return text(`Nhóm "${g.name}" có số test ≤ 0.`, `Group "${g.name}" must have at least one test.`);
      if (typeof g.score === 'number') totalScore += g.score;
    }

    // Check prerequisites
    for (const g of groups) {
      if (g.prerequisites) {
        for (const prereq of g.prerequisites) {
          if (!names.has(prereq.toLowerCase())) {
            return text(`Nhóm "${g.name}" phụ thuộc vào nhóm không tồn tại: "${prereq}".`, `Group "${g.name}" depends on a nonexistent group: "${prereq}".`);
          }
          if (prereq.toLowerCase() === g.name.toLowerCase()) {
            return text(`Nhóm "${g.name}" không thể phụ thuộc vào chính nó.`, `Group "${g.name}" cannot depend on itself.`);
          }
        }
      }
    }

    return null;
  }
}
