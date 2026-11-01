import { Problem, ParamSpec, Config } from '../types';
import { Rng } from '../rng';
import { Util } from '../util';

export class SingleNProblem implements Problem {
  public id = 'single_n';
  public title = 'Số nguyên đơn lẻ (N)';
  public mainCategory = 'Số và bộ giá trị';
  public formatDescription = 'Một dòng duy nhất chứa số nguyên N: [minN, maxN].';

  public params: ParamSpec[] = [
    { key: 'minN', label: 'Giá trị nhỏ nhất (minN)', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', help: 'Cận dưới của N' },
    { key: 'maxN', label: 'Giá trị lớn nhất (maxN)', def: 1000000, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', help: 'Cận trên của N' },
  ];

  public defaultConfig(): Config {
    return new Config({ minN: 1n, maxN: 1000000n });
  }

  public validateConfig(cfg: Config): string | null {
    if (cfg.get('minN') > cfg.get('maxN')) {
      return `minN (${cfg.get('minN')}) không được lớn hơn maxN (${cfg.get('maxN')}).`;
    }
    return null;
  }

  public generate(rng: Rng, cfg: Config): string {
    const n = rng.range(cfg.get('minN'), cfg.get('maxN'));
    return `${n}\n`;
  }

  public validateInput(input: string, cfg: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 1) return `Cần đúng 1 dòng, nhưng có ${lines.length} dòng.`;
    if (lines[0].length !== 1) return `Dòng 1 cần đúng 1 số nguyên, nhưng có ${lines[0].length} token.`;
    const check = Util.parseBigIntToken(lines[0][0], cfg.get('minN'), cfg.get('maxN'), 'N');
    return check.error ?? null;
  }

  public solve(input: string): string {
    const val = input.trim();
    // Default reference behavior: echo value or square if applicable, or identity
    return `${val}\n`;
  }

  public describeConfig(cfg: Config): string {
    return `N ∈ [${cfg.get('minN')}, ${cfg.get('maxN')}]`;
  }
}
