import { Problem, ParamSpec, Config } from '../types';
import { Rng } from '../rng';
import { Util } from '../util';

export class TwoIntsProblem implements Problem {
  public id = 'two_ints';
  public title = 'Hai số nguyên (A, B)';
  public mainCategory = 'Số và bộ giá trị';
  public formatDescription = 'Một dòng duy nhất chứa hai số nguyên A B cách nhau bởi một dấu cách.';

  public params: ParamSpec[] = [
    { key: 'minA', label: 'Cận dưới A (minA)', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'maxA', label: 'Cận trên A (maxA)', def: 1000000, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'minB', label: 'Cận dưới B (minB)', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'maxB', label: 'Cận trên B (maxB)', def: 1000000, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    {
      key: 'order',
      label: 'Ràng buộc thứ tự',
      def: 0,
      lo: 0,
      hi: 2,
      type: 'int',
      options: [
        { value: 0, label: 'Tùy ý (không ràng buộc)' },
        { value: 1, label: 'A ≤ B' },
        { value: 2, label: 'A < B' },
      ],
    },
    { key: 'distinct', label: 'A khác B', def: 0, lo: 0, hi: 1, type: 'bool' },
  ];

  public defaultConfig(): Config {
    return new Config({ minA: 1n, maxA: 1000000n, minB: 1n, maxB: 1000000n, order: 0n, distinct: 0n });
  }

  public validateConfig(cfg: Config): string | null {
    if (cfg.get('minA') > cfg.get('maxA')) return 'minA không được lớn hơn maxA.';
    if (cfg.get('minB') > cfg.get('maxB')) return 'minB không được lớn hơn maxB.';
    const order = cfg.getNum('order');
    if (order === 1 && cfg.get('minA') > cfg.get('maxB')) return 'Ràng buộc A ≤ B không thể thỏa mãn với minA > maxB.';
    if (order === 2 && cfg.get('minA') >= cfg.get('maxB')) return 'Ràng buộc A < B không thể thỏa mãn với minA ≥ maxB.';
    if (cfg.getBool('distinct') && cfg.get('minA') === cfg.get('maxA') && cfg.get('minB') === cfg.get('maxB') && cfg.get('minA') === cfg.get('minB')) {
      return 'Không thể chọn A khác B khi cả A và B chỉ có đúng một giá trị giống nhau.';
    }
    return null;
  }

  public generate(rng: Rng, cfg: Config): string {
    const order = cfg.getNum('order');
    const distinct = cfg.getBool('distinct');
    let a: bigint, b: bigint;
    let attempts = 0;
    while (attempts++ < 1000) {
      a = rng.range(cfg.get('minA'), cfg.get('maxA'));
      b = rng.range(cfg.get('minB'), cfg.get('maxB'));
      if (order === 1 && a > b) continue;
      if (order === 2 && a >= b) continue;
      if (distinct && a === b) continue;
      return `${a} ${b}\n`;
    }
    // Fallback if rejected
    a = cfg.get('minA');
    b = cfg.get('maxB');
    return `${a} ${b}\n`;
  }

  public validateInput(input: string, cfg: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 1) return `Cần 1 dòng, nhận ${lines.length}.`;
    if (lines[0].length !== 2) return `Dòng 1 cần 2 số nguyên, nhận ${lines[0].length}.`;
    const chkA = Util.parseBigIntToken(lines[0][0], cfg.get('minA'), cfg.get('maxA'), 'A');
    if (chkA.error) return chkA.error;
    const chkB = Util.parseBigIntToken(lines[0][1], cfg.get('minB'), cfg.get('maxB'), 'B');
    if (chkB.error) return chkB.error;

    const a = chkA.value!;
    const b = chkB.value!;
    const order = cfg.getNum('order');
    if (order === 1 && a > b) return `Vi phạm ràng buộc A ≤ B: A = ${a}, B = ${b}.`;
    if (order === 2 && a >= b) return `Vi phạm ràng buộc A < B: A = ${a}, B = ${b}.`;
    if (cfg.getBool('distinct') && a === b) return `A và B phải khác nhau: A = B = ${a}.`;
    return null;
  }

  public solve(input: string): string {
    const tokens = input.trim().split(/\s+/);
    if (tokens.length >= 2) {
      const a = BigInt(tokens[0]);
      const b = BigInt(tokens[1]);
      return `${a + b}\n`; // Default sum A + B
    }
    return '0\n';
  }

  public describeConfig(cfg: Config): string {
    return `A ∈ [${cfg.get('minA')}, ${cfg.get('maxA')}], B ∈ [${cfg.get('minB')}, ${cfg.get('maxB')}]`;
  }
}
