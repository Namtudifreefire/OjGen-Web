import { Problem, ParamSpec, Config } from '../types';
import { Rng } from '../rng';
import { Util } from '../util';

export class ArrayProblem implements Problem {
  public id = 'array';
  public title = 'Mảng một chiều / hoán vị';
  public mainCategory = 'Dãy và truy vấn';
  public formatDescription =
    'Dòng 1: số nguyên n (minN ≤ n ≤ maxN).\n' +
    'Dòng 2: n số nguyên a1 ... an (minVal ≤ ai ≤ maxVal), cách nhau một dấu cách.\n' +
    '  mode = 0: giá trị ngẫu nhiên theo [minVal, maxVal].\n' +
    '  mode = 1: hoán vị của 1..n (minVal/maxVal được ẩn).\n' +
    '  distinct = 1: các phần tử đôi một khác nhau.\n' +
    '  sorted   = 0: ngẫu nhiên, 1: không giảm, 2: không tăng.\n' +
    'Ví dụ:\n  5\n  3 -1 4 1 5\n';

  public params: ParamSpec[] = [
    {
      key: 'mode',
      label: 'Kiểu mảng',
      guiLabel: 'Kiểu mảng',
      def: 0,
      lo: 0,
      hi: 1,
      type: 'int',
      options: [
        { value: 0, label: 'Giá trị trong khoảng' },
        { value: 1, label: 'Hoán vị 1..n' },
      ],
    },
    { key: 'minN', label: 'Số phần tử nhỏ nhất (minN)', def: 1, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxN', label: 'Số phần tử lớn nhất (maxN)', def: 10, lo: 1, hi: 1000000, type: 'int' },
    {
      key: 'minVal',
      label: 'Giá trị phần tử nhỏ nhất',
      def: 1,
      lo: -1000000000000000000n,
      hi: 1000000000000000000n,
      type: 'int',
      visibleWhen: (c) => c.getNum('mode') === 0,
    },
    {
      key: 'maxVal',
      label: 'Giá trị phần tử lớn nhất',
      def: 100,
      lo: -1000000000000000000n,
      hi: 1000000000000000000n,
      type: 'int',
      visibleWhen: (c) => c.getNum('mode') === 0,
    },
    {
      key: 'distinct',
      label: 'Các phần tử đôi một khác nhau?',
      def: 0,
      lo: 0,
      hi: 1,
      type: 'bool',
      visibleWhen: (c) => c.getNum('mode') === 0,
    },
    {
      key: 'sorted',
      label: 'Sắp xếp',
      def: 0,
      lo: 0,
      hi: 2,
      type: 'int',
      options: [
        { value: 0, label: 'Ngẫu nhiên' },
        { value: 1, label: 'Không giảm (tăng dần)' },
        { value: 2, label: 'Không tăng (giảm dần)' },
      ],
    },
  ];

  public defaultConfig(): Config {
    return new Config({
      mode: 0n,
      minN: 1n,
      maxN: 10n,
      minVal: 1n,
      maxVal: 100n,
      distinct: 0n,
      sorted: 0n,
    });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.getNum('mode') === 0 && c.get('minVal') > c.get('maxVal')) return 'minVal phải <= maxVal.';
    if (c.getNum('mode') === 0 && c.getBool('distinct')) {
      const span = c.get('maxVal') - c.get('minVal') + 1n;
      if (span < c.get('minN')) {
        return `Miền [minVal, maxVal] chỉ có ${span} giá trị, không đủ cho ${c.get('minN')} phần tử khác nhau.`;
      }
    }
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    let maxN = c.get('maxN');
    if (c.getNum('mode') === 0 && c.getBool('distinct')) {
      const span = c.get('maxVal') - c.get('minVal') + 1n;
      if (maxN > span) maxN = span;
    }
    const n = Number(rng.range(c.get('minN'), maxN));
    let a: bigint[] = [];

    if (c.getNum('mode') === 1) {
      for (let i = 1; i <= n; i++) a.push(BigInt(i));
      rng.shuffle(a);
    } else if (c.getBool('distinct')) {
      a = rng.distinctValues(c.get('minVal'), c.get('maxVal'), n);
    } else {
      for (let i = 0; i < n; i++) {
        a.push(rng.range(c.get('minVal'), c.get('maxVal')));
      }
    }

    const sortMode = c.getNum('sorted');
    if (sortMode === 1) {
      a.sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
    } else if (sortMode === 2) {
      a.sort((x, y) => (x > y ? -1 : x < y ? 1 : 0));
    }

    return `${n}\n${a.map((v) => v.toString()).join(' ')}\n`;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 2) return `Cần đúng 2 dòng, nhận ${lines.length}.`;
    if (lines[0].length !== 1) return `Dòng 1 cần 1 số n, nhận ${lines[0].length}.`;

    const chkN = Util.parseBigIntToken(lines[0][0], c.get('minN'), c.get('maxN'), 'n');
    if (chkN.error) return chkN.error;
    const n = Number(chkN.value!);

    if (lines[1].length !== n) return `Dòng 2 cần ${n} phần tử nhưng nhận ${lines[1].length}.`;

    const mode = c.getNum('mode');
    const minVal = mode === 1 ? 1n : c.get('minVal');
    const maxVal = mode === 1 ? BigInt(n) : c.get('maxVal');

    const seen = new Set<string>();
    const vals: bigint[] = [];

    for (let i = 0; i < n; i++) {
      const chk = Util.parseBigIntToken(lines[1][i], minVal, maxVal, `a[${i + 1}]`);
      if (chk.error) return chk.error;
      const v = chk.value!;
      vals.push(v);
      if (mode === 1 || c.getBool('distinct')) {
        const k = v.toString();
        if (seen.has(k)) return `Phần tử trùng lặp ${v} ở vị trí ${i + 1}.`;
        seen.add(k);
      }
    }

    const sortMode = c.getNum('sorted');
    if (sortMode === 1) {
      for (let i = 1; i < n; i++) {
        if (vals[i] < vals[i - 1]) return `Mảng không tăng dần tại vị trí ${i + 1}.`;
      }
    } else if (sortMode === 2) {
      for (let i = 1; i < n; i++) {
        if (vals[i] > vals[i - 1]) return `Mảng không giảm dần tại vị trí ${i + 1}.`;
      }
    }

    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    if (lines.length < 2) return '0\n';
    const nums = lines[1].trim().split(/\s+/).map(BigInt);
    // Reference output: Sum of array elements
    let sum = 0n;
    for (const v of nums) sum += v;
    return `${sum}\n`;
  }

  public describeConfig(c: Config): string {
    return c.getNum('mode') === 1
      ? `Hoán vị 1..n, n ∈ [${c.get('minN')}, ${c.get('maxN')}]`
      : `n ∈ [${c.get('minN')}, ${c.get('maxN')}], ai ∈ [${c.get('minVal')}, ${c.get('maxVal')}]`;
  }
}
