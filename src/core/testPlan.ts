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

  public static generateAdversarialPresets(problem: Problem, sourceConfig: Config, existingNames: string[]): TestGroupSpec[] {
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
    if (changedLow) addGroup('Biên nhỏ', low);

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
    if (changedHigh) addGroup('Biên lớn', high);

    // Array duplicates
    if (problem.id === 'array' && sourceConfig.getNum('mode') === 0) {
      const repeated = sourceConfig.clone();
      repeated.set('distinct', 0);
      repeated.set('minVal', 0);
      repeated.set('maxVal', 0);
      addGroup('Nhiều phần tử trùng', repeated);
    }

    // Graph strongly connected
    if (problem.id === 'graph' && sourceConfig.getBool('directed')) {
      const strong = sourceConfig.clone();
      strong.set('stronglyConnected', 1);
      strong.set('dag', 0);
      addGroup('Đồ thị liên thông mạnh', strong);
    }

    return result;
  }

  public static validatePlan(groups: TestGroupSpec[]): string | null {
    if (groups.length === 0) return null;
    let totalScore = 0;
    const names = new Set<string>();

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (!g.name.trim()) return `Nhóm ${i + 1} chưa có tên.`;
      if (names.has(g.name.toLowerCase())) return `Trùng tên nhóm: "${g.name}".`;
      names.add(g.name.toLowerCase());
      if (g.testCount <= 0) return `Nhóm "${g.name}" có số test ≤ 0.`;
      if (typeof g.score === 'number') totalScore += g.score;
    }

    // Check prerequisites
    for (const g of groups) {
      if (g.prerequisites) {
        for (const prereq of g.prerequisites) {
          if (!names.has(prereq.toLowerCase())) {
            return `Nhóm "${g.name}" phụ thuộc vào nhóm không tồn tại: "${prereq}".`;
          }
          if (prereq.toLowerCase() === g.name.toLowerCase()) {
            return `Nhóm "${g.name}" không thể phụ thuộc vào chính nó.`;
          }
        }
      }
    }

    return null;
  }
}
