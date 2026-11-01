import { Problem, ParamSpec, Config } from '../types';
import { Rng } from '../rng';
import { Util } from '../util';
import { SingleNProblem } from './singleN';
import { TwoIntsProblem } from './twoInts';
import { ArrayProblem } from './array';

// --- QUERIES PROBLEM ---
export class QueriesProblem implements Problem {
  public id = 'queries';
  public title = 'Mảng và truy vấn';
  public mainCategory = 'Dãy và truy vấn';
  public formatDescription =
    'Dòng 1: n q.\n' +
    'Dòng 2: n số nguyên a1 ... an (minVal ≤ ai ≤ maxVal).\n' +
    'q dòng tiếp theo, mỗi dòng một truy vấn:\n' +
    '  1 i x : gán a[i] = x   (1 ≤ i ≤ n, minVal ≤ x ≤ maxVal)\n' +
    '  2 l r : truy vấn đoạn [l, r]   (1 ≤ l ≤ r ≤ n)\n' +
    'Tỷ lệ truy vấn loại 1 do updatePct quy định (0..100).\n';

  public params: ParamSpec[] = [
    { key: 'minN', label: 'Số phần tử nhỏ nhất (minN)', def: 1, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxN', label: 'Số phần tử lớn nhất (maxN)', def: 10, lo: 1, hi: 1000000, type: 'int' },
    { key: 'minVal', label: 'Giá trị phần tử nhỏ nhất', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'maxVal', label: 'Giá trị phần tử lớn nhất', def: 100, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'minQ', label: 'Số truy vấn nhỏ nhất (minQ)', def: 1, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxQ', label: 'Số truy vấn lớn nhất (maxQ)', def: 10, lo: 1, hi: 1000000, type: 'int' },
    { key: 'updatePct', label: 'Tỷ lệ % truy vấn cập nhật (loại 1)', def: 30, lo: 0, hi: 100, type: 'int', help: '0 = chỉ có hỏi đoạn, 100 = chỉ có cập nhật' },
  ];

  public defaultConfig(): Config {
    return new Config({ minN: 1n, maxN: 10n, minVal: 1n, maxVal: 100n, minQ: 1n, maxQ: 10n, updatePct: 30n });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.get('minVal') > c.get('maxVal')) return 'minVal phải <= maxVal.';
    if (c.get('minQ') > c.get('maxQ')) return 'minQ phải <= maxQ.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const q = Number(rng.range(c.get('minQ'), c.get('maxQ')));
    const lo = c.get('minVal');
    const hi = c.get('maxVal');
    const pct = c.getNum('updatePct');

    const arr: bigint[] = [];
    for (let i = 0; i < n; i++) arr.push(rng.range(lo, hi));

    const queries: string[] = [];
    let hasRange = false;
    for (let k = 0; k < q; k++) {
      let isUpdate = rng.chance(pct);
      if (k === q - 1 && !hasRange && pct < 100) isUpdate = false;
      if (isUpdate) {
        const i = Number(rng.range(1, n));
        const x = rng.range(lo, hi);
        queries.push(`1 ${i} ${x}`);
      } else {
        hasRange = true;
        const l = Number(rng.range(1, n));
        const r = Number(rng.range(l, n));
        queries.push(`2 ${l} ${r}`);
      }
    }

    return `${n} ${q}\n${arr.map(v => v.toString()).join(' ')}\n${queries.join('\n')}\n`;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 2) return 'Thiếu dòng khai báo n, q hoặc mảng.';
    if (lines[0].length !== 2) return 'Dòng 1 cần n và q.';
    const chkN = Util.parseBigIntToken(lines[0][0], c.get('minN'), c.get('maxN'), 'n');
    if (chkN.error) return chkN.error;
    const chkQ = Util.parseBigIntToken(lines[0][1], c.get('minQ'), c.get('maxQ'), 'q');
    if (chkQ.error) return chkQ.error;

    const n = Number(chkN.value!);
    const q = Number(chkQ.value!);

    if (lines[1].length !== n) return `Dòng 2 cần đúng ${n} phần tử.`;
    if (lines.length !== 2 + q) return `Cần đúng ${q} dòng truy vấn (tổng ${2 + q} dòng).`;
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    if (lines.length < 2) return '';
    const [nStr, qStr] = lines[0].trim().split(/\s+/);
    const n = parseInt(nStr, 10);
    const arr = lines[1].trim().split(/\s+/).map(BigInt);
    const answers: string[] = [];

    for (let i = 2; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts[0] === '1') {
        const idx = parseInt(parts[1], 10) - 1;
        const val = BigInt(parts[2]);
        if (idx >= 0 && idx < arr.length) arr[idx] = val;
      } else if (parts[0] === '2') {
        const l = parseInt(parts[1], 10) - 1;
        const r = parseInt(parts[2], 10) - 1;
        let sum = 0n;
        for (let j = Math.max(0, l); j <= Math.min(arr.length - 1, r); j++) {
          sum += arr[j];
        }
        answers.push(sum.toString());
      }
    }
    return answers.join('\n') + (answers.length > 0 ? '\n' : '');
  }

  public describeConfig(c: Config): string {
    return `n ∈ [${c.get('minN')}, ${c.get('maxN')}], q ∈ [${c.get('minQ')}, ${c.get('maxQ')}], cập nhật: ${c.get('updatePct')}%`;
  }
}

// --- PREFIX SUM RANGE PROBLEM (QBOJ sumarr) ---
export class PrefixSumRangeProblem implements Problem {
  public id = 'prefix_sum_range';
  public title = 'Tiền tố: truy vấn tổng đoạn (QBOJ sumarr)';
  public mainCategory = 'Dãy và truy vấn';
  public formatDescription =
    'Dòng 1: n.\n' +
    'Dòng 2: n số nguyên a1 ... an.\n' +
    'Dòng 3: q.\n' +
    'q dòng tiếp theo: mỗi dòng chứa x y (1 ≤ x ≤ y ≤ n).\n' +
    'Lời giải chuẩn in tổng a[x..y] cho mỗi truy vấn.';

  public params: ParamSpec[] = [
    { key: 'minN', label: 'Số phần tử nhỏ nhất', def: 1, lo: 1, hi: 100000, type: 'int' },
    { key: 'maxN', label: 'Số phần tử lớn nhất', def: 1000, lo: 1, hi: 100000, type: 'int' },
    { key: 'minQ', label: 'Số truy vấn nhỏ nhất', def: 1, lo: 1, hi: 100000, type: 'int' },
    { key: 'maxQ', label: 'Số truy vấn lớn nhất', def: 1000, lo: 1, hi: 100000, type: 'int' },
    { key: 'minVal', label: 'Giá trị phần tử nhỏ nhất', def: 0, lo: 0, hi: 1000000000, type: 'int' },
    { key: 'maxVal', label: 'Giá trị phần tử lớn nhất', def: 1000000000, lo: 0, hi: 1000000000, type: 'int' },
  ];

  public defaultConfig(): Config {
    return new Config({ minN: 1n, maxN: 1000n, minQ: 1n, maxQ: 1000n, minVal: 0n, maxVal: 1000000000n });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.get('minQ') > c.get('maxQ')) return 'minQ phải <= maxQ.';
    if (c.get('minVal') > c.get('maxVal')) return 'minVal phải <= maxVal.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const q = Number(rng.range(c.get('minQ'), c.get('maxQ')));
    const arr: bigint[] = [];
    for (let i = 0; i < n; i++) arr.push(rng.range(c.get('minVal'), c.get('maxVal')));

    const queries: string[] = [];
    for (let i = 0; i < q; i++) {
      let x = 1;
      let y = n;
      if (i === 1) { x = 1; y = 1; }
      else if (i === 2) { x = n; y = n; }
      else if (i > 2) {
        x = Number(rng.range(1, n));
        y = Number(rng.range(x, n));
      }
      queries.push(`${x} ${y}`);
    }

    return `${n}\n${arr.map(v => v.toString()).join(' ')}\n${q}\n${queries.join('\n')}\n`;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 3) return 'Cần ít nhất 3 dòng.';
    const chkN = Util.parseBigIntToken(lines[0][0], c.get('minN'), c.get('maxN'), 'n');
    if (chkN.error) return chkN.error;
    const n = Number(chkN.value!);
    if (lines[1].length !== n) return `Dòng 2 cần ${n} số.`;
    const chkQ = Util.parseBigIntToken(lines[2][0], c.get('minQ'), c.get('maxQ'), 'q');
    if (chkQ.error) return chkQ.error;
    const q = Number(chkQ.value!);
    if (lines.length !== 3 + q) return `Cần ${q} truy vấn.`;
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    if (lines.length < 4) return '';
    const n = parseInt(lines[0].trim(), 10);
    const arr = lines[1].trim().split(/\s+/).map(BigInt);
    const pref = new Array<bigint>(n + 1).fill(0n);
    for (let i = 0; i < n; i++) pref[i + 1] = pref[i] + arr[i];

    const q = parseInt(lines[2].trim(), 10);
    const out: string[] = [];
    for (let i = 0; i < q && 3 + i < lines.length; i++) {
      const [xStr, yStr] = lines[3 + i].trim().split(/\s+/);
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      out.push((pref[y] - pref[x - 1]).toString());
    }
    return out.join('\n') + '\n';
  }

  public describeConfig(c: Config): string {
    return `QBOJ sumarr: n ∈ [${c.get('minN')}, ${c.get('maxN')}], q ∈ [${c.get('minQ')}, ${c.get('maxQ')}]`;
  }
}

// --- TDC PREFIX SUBSEQUENCE PROBLEM ---
export class TdcPrefixSumProblem implements Problem {
  public id = 'prefix_subsequence_range';
  public title = 'Tiền tố: tổng dãy con theo truy vấn (QBOJ TDC)';
  public mainCategory = 'Dãy và truy vấn';
  public formatDescription =
    'Dòng 1: n q (1 ≤ n, q ≤ 100000).\n' +
    'Dòng 2: n số nguyên a1 ... an (|ai| ≤ 10000000).\n' +
    'q dòng tiếp theo: mỗi dòng có l r (1 ≤ l ≤ r ≤ n).\n' +
    'Tổng lớn nhất của một dãy con = tổng các phần tử dương trong [l, r].';

  public params: ParamSpec[] = [
    { key: 'minN', label: 'Số phần tử nhỏ nhất (minN)', def: 1, lo: 1, hi: 100000, type: 'int' },
    { key: 'maxN', label: 'Số phần tử lớn nhất (maxN)', def: 1000, lo: 1, hi: 100000, type: 'int' },
    { key: 'minQ', label: 'Số truy vấn nhỏ nhất (minQ)', def: 1, lo: 1, hi: 100000, type: 'int' },
    { key: 'maxQ', label: 'Số truy vấn lớn nhất (maxQ)', def: 1000, lo: 1, hi: 100000, type: 'int' },
    { key: 'minVal', label: 'Giá trị phần tử nhỏ nhất', def: -10000000, lo: -10000000, hi: 10000000, type: 'int' },
    { key: 'maxVal', label: 'Giá trị phần tử lớn nhất', def: 10000000, lo: -10000000, hi: 10000000, type: 'int' },
  ];

  public defaultConfig(): Config {
    return new Config({ minN: 1n, maxN: 1000n, minQ: 1n, maxQ: 1000n, minVal: -10000000n, maxVal: 10000000n });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.get('minQ') > c.get('maxQ')) return 'minQ phải <= maxQ.';
    if (c.get('minVal') > c.get('maxVal')) return 'minVal phải <= maxVal.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const q = Number(rng.range(c.get('minQ'), c.get('maxQ')));
    const arr: bigint[] = [];
    for (let i = 0; i < n; i++) arr.push(rng.range(c.get('minVal'), c.get('maxVal')));

    const queries: string[] = [];
    for (let i = 0; i < q; i++) {
      let l = 1, r = n;
      if (i === 1) { l = 1; r = 1; }
      else if (i === 2) { l = n; r = n; }
      else if (i > 2) {
        l = Number(rng.range(1, n));
        r = Number(rng.range(l, n));
      }
      queries.push(`${l} ${r}`);
    }

    return `${n} ${q}\n${arr.map(v => v.toString()).join(' ')}\n${queries.join('\n')}\n`;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 2) return 'Thiếu dòng khai báo.';
    const chkN = Util.parseBigIntToken(lines[0][0], c.get('minN'), c.get('maxN'), 'n');
    if (chkN.error) return chkN.error;
    const n = Number(chkN.value!);
    const chkQ = Util.parseBigIntToken(lines[0][1], c.get('minQ'), c.get('maxQ'), 'q');
    if (chkQ.error) return chkQ.error;
    const q = Number(chkQ.value!);
    if (lines[1].length !== n) return `Dòng 2 cần ${n} phần tử.`;
    if (lines.length !== 2 + q) return `Cần ${q} dòng truy vấn.`;
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    if (lines.length < 3) return '';
    const [nStr, qStr] = lines[0].trim().split(/\s+/);
    const n = parseInt(nStr, 10);
    const q = parseInt(qStr, 10);
    const arr = lines[1].trim().split(/\s+/).map(BigInt);
    const prefPos = new Array<bigint>(n + 1).fill(0n);
    for (let i = 0; i < n; i++) {
      prefPos[i + 1] = prefPos[i] + (arr[i] > 0n ? arr[i] : 0n);
    }
    const out: string[] = [];
    for (let i = 0; i < q && 2 + i < lines.length; i++) {
      const [lStr, rStr] = lines[2 + i].trim().split(/\s+/);
      const l = parseInt(lStr, 10);
      const r = parseInt(rStr, 10);
      out.push((prefPos[r] - prefPos[l - 1]).toString());
    }
    return out.join('\n') + '\n';
  }

  public describeConfig(c: Config): string {
    return `QBOJ TDC: n ∈ [${c.get('minN')}, ${c.get('maxN')}], q ∈ [${c.get('minQ')}, ${c.get('maxQ')}]`;
  }
}

// --- STRING PROBLEM ---
export class StringProblem implements Problem {
  public id = 'string';
  public title = 'Xâu ký tự';
  public mainCategory = 'Xâu và ký tự';
  public formatDescription =
    'Nếu printLen = 1: dòng 1 là độ dài L của xâu.\n' +
    'Dòng tiếp theo: xâu s gồm L ký tự (minLen ≤ L ≤ maxLen) lấy từ tập charset.\n' +
    'charset: lower (a-z), upper (A-Z), letters, digits, alnum, binary (01), dna (ACGT), hoặc tự chọn.';

  public params: ParamSpec[] = [
    { key: 'minLen', label: 'Độ dài nhỏ nhất', def: 1, lo: 1, hi: 10000000, type: 'int' },
    { key: 'maxLen', label: 'Độ dài lớn nhất', def: 20, lo: 1, hi: 10000000, type: 'int' },
    {
      key: 'charset',
      label: 'Tập ký tự',
      def: 0,
      lo: 0,
      hi: 0,
      defText: 'lower',
      type: 'text',
      choices: ['lower', 'upper', 'letters', 'digits', 'alnum', 'binary', 'dna'],
    },
    { key: 'printLen', label: 'Ghi độ dài xâu ở dòng đầu?', def: 0, lo: 0, hi: 1, type: 'bool' },
  ];

  public static resolveCharset(spec: string): { charset: string; error: string | null } {
    const k = spec.trim().toLowerCase();
    if (k === 'lower') return { charset: 'abcdefghijklmnopqrstuvwxyz', error: null };
    if (k === 'upper') return { charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', error: null };
    if (k === 'letters') return { charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', error: null };
    if (k === 'digits') return { charset: '0123456789', error: null };
    if (k === 'alnum') return { charset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', error: null };
    if (k === 'binary') return { charset: '01', error: null };
    if (k === 'dna') return { charset: 'ACGT', error: null };

    let lit = spec;
    if (lit.startsWith('set:')) lit = lit.slice(4);
    const seen = new Set<string>();
    let res = '';
    for (const ch of lit) {
      const code = ch.charCodeAt(0);
      if (code < 33 || code > 126) {
        return { charset: '', error: 'Tập ký tự chỉ được chứa ký tự ASCII in được.' };
      }
      if (!seen.has(ch)) {
        seen.add(ch);
        res += ch;
      }
    }
    if (res.length === 0) return { charset: '', error: 'Tập ký tự rỗng.' };
    return { charset: res, error: null };
  }

  public defaultConfig(): Config {
    return new Config({ minLen: 1n, maxLen: 20n, printLen: 0n }, { charset: 'lower' });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minLen') > c.get('maxLen')) return 'minLen phải <= maxLen.';
    const { error } = StringProblem.resolveCharset(c.getText('charset', 'lower'));
    return error;
  }

  public generate(rng: Rng, c: Config): string {
    const len = Number(rng.range(c.get('minLen'), c.get('maxLen')));
    const { charset } = StringProblem.resolveCharset(c.getText('charset', 'lower'));
    let str = '';
    for (let i = 0; i < len; i++) {
      const idx = Number(rng.below(charset.length));
      str += charset[idx];
    }
    return c.getBool('printLen') ? `${len}\n${str}\n` : `${str}\n`;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    const printLen = c.getBool('printLen');
    if (printLen) {
      if (lines.length !== 2) return `Cần 2 dòng khi printLen = 1, nhận ${lines.length}.`;
      const chkLen = Util.parseBigIntToken(lines[0][0], c.get('minLen'), c.get('maxLen'), 'len');
      if (chkLen.error) return chkLen.error;
      const expected = Number(chkLen.value!);
      if (lines[1][0].length !== expected) return `Độ dài xâu (${lines[1][0].length}) khác với số khai báo (${expected}).`;
    } else {
      if (lines.length !== 1) return `Cần 1 dòng khi printLen = 0, nhận ${lines.length}.`;
      const len = lines[0][0].length;
      if (len < Number(c.get('minLen')) || len > Number(c.get('maxLen'))) {
        return `Độ dài xâu ${len} nằm ngoài [${c.get('minLen')}, ${c.get('maxLen')}].`;
      }
    }
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    const s = lines[lines.length - 1].trim();
    // Reference output: string length or reverse
    return `${s.split('').reverse().join('')}\n`;
  }

  public describeConfig(c: Config): string {
    return `Độ dài ∈ [${c.get('minLen')}, ${c.get('maxLen')}], charset: ${c.getText('charset', 'lower')}`;
  }
}

// --- MATRIX PROBLEM ---
export class MatrixProblem implements Problem {
  public id = 'matrix';
  public title = 'Ma trận / hai mảng (doublearr)';
  public mainCategory = 'Ma trận và lưới';
  public formatDescription =
    'Bố cục:\n' +
    '  0: dòng đầu n m, tiếp theo n dòng, mỗi dòng m số.\n' +
    '  1: dòng đầu n, m cố định trong cấu hình, tiếp theo n dòng.\n' +
    '  2: dòng đầu n, tiếp theo hai mảng, mỗi mảng trên một dòng.';

  public params: ParamSpec[] = [
    {
      key: 'layout',
      label: 'Bố cục dữ liệu',
      def: 0,
      lo: 0,
      hi: 2,
      type: 'int',
      options: [
        { value: 0, label: 'Ma trận n × m (ghi n m)' },
        { value: 1, label: 'Ma trận, m cố định (chỉ ghi n)' },
        { value: 2, label: 'Hai mảng cùng độ dài n' },
      ],
    },
    { key: 'minN', label: 'Số dòng / độ dài mảng nhỏ nhất', def: 1, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxN', label: 'Số dòng / độ dài mảng lớn nhất', def: 10, lo: 1, hi: 1000000, type: 'int' },
    { key: 'minM', label: 'Số cột nhỏ nhất', def: 1, lo: 1, hi: 1000000, type: 'int', visibleWhen: c => c.getNum('layout') !== 2 },
    { key: 'maxM', label: 'Số cột lớn nhất', def: 10, lo: 1, hi: 1000000, type: 'int', visibleWhen: c => c.getNum('layout') !== 2 },
    { key: 'minVal', label: 'Giá trị nhỏ nhất', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'maxVal', label: 'Giá trị lớn nhất', def: 100, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
  ];

  public defaultConfig(): Config {
    return new Config({ layout: 0n, minN: 1n, maxN: 10n, minM: 1n, maxM: 10n, minVal: 1n, maxVal: 100n });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.get('minVal') > c.get('maxVal')) return 'minVal phải <= maxVal.';
    if (c.getNum('layout') !== 2 && c.get('minM') > c.get('maxM')) return 'minM phải <= maxM.';
    if (c.getNum('layout') === 1 && c.get('minM') !== c.get('maxM')) return 'Bố cục chỉ ghi n yêu cầu minM = maxM.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const layout = c.getNum('layout');
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const m = layout === 2 ? n : Number(rng.range(c.get('minM'), c.get('maxM')));
    const rows = layout === 2 ? 2 : n;

    let res = `${n}${layout === 0 ? ` ${m}` : ''}\n`;
    for (let r = 0; r < rows; r++) {
      const rowVals: string[] = [];
      for (let col = 0; col < m; col++) {
        rowVals.push(rng.range(c.get('minVal'), c.get('maxVal')).toString());
      }
      res += rowVals.join(' ') + '\n';
    }
    return res;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 2) return 'Thiếu dòng dữ liệu.';
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    let total = 0n;
    for (let i = 1; i < lines.length; i++) {
      for (const tok of lines[i].trim().split(/\s+/)) {
        if (tok) total += BigInt(tok);
      }
    }
    return `${total}\n`;
  }

  public describeConfig(c: Config): string {
    return `Ma trận/hai mảng: layout=${c.get('layout')}, n ∈ [${c.get('minN')}, ${c.get('maxN')}]`;
  }
}

// --- GRID PROBLEM ---
export class GridProblem implements Problem {
  public id = 'grid';
  public title = 'Lưới ký tự';
  public mainCategory = 'Ma trận và lưới';
  public formatDescription =
    'Dòng 1: n m. Tiếp theo n dòng, mỗi dòng là một xâu dài m.\n' +
    'Ký tự lấy từ charset; có thể bật tùy chọn để đặt đúng một ô S và một ô T.';

  public params: ParamSpec[] = [
    { key: 'minN', label: 'Số hàng nhỏ nhất', def: 2, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxN', label: 'Số hàng lớn nhất', def: 10, lo: 1, hi: 1000000, type: 'int' },
    { key: 'minM', label: 'Số cột nhỏ nhất', def: 2, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxM', label: 'Số cột lớn nhất', def: 10, lo: 1, hi: 1000000, type: 'int' },
    {
      key: 'charset',
      label: 'Tập ký tự',
      def: 0,
      lo: 0,
      hi: 0,
      defText: '.#',
      type: 'text',
      choices: ['.#', '01', 'binary', 'dna', 'lower', 'upper', 'set:S.T#'],
    },
    { key: 'markers', label: 'Đặt đúng một S và một T?', def: 0, lo: 0, hi: 1, type: 'bool' },
  ];

  public defaultConfig(): Config {
    return new Config({ minN: 2n, maxN: 10n, minM: 2n, maxM: 10n, markers: 0n }, { charset: '.#' });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.get('minM') > c.get('maxM')) return 'minM phải <= maxM.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const m = Number(rng.range(c.get('minM'), c.get('maxM')));
    const rawCharset = c.getText('charset', '.#');
    const fillCharset = rawCharset.replace(/[ST]/g, '') || '.';
    const total = n * m;

    const cells: string[] = [];
    for (let i = 0; i < total; i++) {
      cells.push(fillCharset[Number(rng.below(fillCharset.length))]);
    }

    if (c.getBool('markers') && total >= 2) {
      const sIdx = Number(rng.below(total));
      let tIdx = Number(rng.below(total - 1));
      if (tIdx >= sIdx) tIdx++;
      cells[sIdx] = 'S';
      cells[tIdx] = 'T';
    }

    let out = `${n} ${m}\n`;
    for (let r = 0; r < n; r++) {
      out += cells.slice(r * m, (r + 1) * m).join('') + '\n';
    }
    return out;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 2) return 'Thiếu dòng khai báo.';
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    return `${lines.length - 1}\n`;
  }

  public describeConfig(c: Config): string {
    return `Lưới: [${c.get('minN')}, ${c.get('maxN')}] × [${c.get('minM')}, ${c.get('maxM')}], markers: ${c.getBool('markers')}`;
  }
}

// --- PAIR LIST PROBLEM ---
export class PairListProblem implements Problem {
  public id = 'pairs';
  public title = 'Danh sách cặp / đoạn';
  public mainCategory = 'Danh sách cặp và đoạn';
  public formatDescription =
    'Dòng 1: n. Tiếp theo n dòng, mỗi dòng có một cặp x y.\n' +
    'Nếu chọn dữ liệu đoạn, mọi cặp thỏa x ≤ y.';

  public params: ParamSpec[] = [
    { key: 'minN', label: 'Số cặp nhỏ nhất', def: 1, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxN', label: 'Số cặp lớn nhất', def: 20, lo: 1, hi: 1000000, type: 'int' },
    { key: 'minVal', label: 'Giá trị nhỏ nhất', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'maxVal', label: 'Giá trị lớn nhất', def: 100, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int' },
    { key: 'intervals', label: 'Cặp là đoạn [l, r] (l ≤ r)?', def: 0, lo: 0, hi: 1, type: 'bool' },
  ];

  public defaultConfig(): Config {
    return new Config({ minN: 1n, maxN: 20n, minVal: 1n, maxVal: 100n, intervals: 0n });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.get('minVal') > c.get('maxVal')) return 'minVal phải <= maxVal.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const isInterval = c.getBool('intervals');
    let out = `${n}\n`;
    for (let i = 0; i < n; i++) {
      const x = rng.range(c.get('minVal'), c.get('maxVal'));
      const y = isInterval ? rng.range(x, c.get('maxVal')) : rng.range(c.get('minVal'), c.get('maxVal'));
      out += `${x} ${y}\n`;
    }
    return out;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 1) return 'Rỗng.';
    const n = parseInt(lines[0][0], 10);
    if (lines.length !== n + 1) return `Cần ${n} cặp.`;
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    return `${lines.length - 1}\n`;
  }

  public describeConfig(c: Config): string {
    return `Cặp/đoạn: n ∈ [${c.get('minN')}, ${c.get('maxN')}], intervals: ${c.getBool('intervals')}`;
  }
}

// --- GRAPH PROBLEM ---
export class GraphProblem implements Problem {
  public id = 'graph';
  public title = 'Đồ thị';
  public mainCategory = 'Đồ thị và cây';
  public formatDescription =
    'Dòng 1: n m (số đỉnh, số cạnh).\n' +
    'm dòng tiếp: u v (hoặc u v w khi weighted = 1), đỉnh đánh số 1..n.\n' +
    'Tùy chọn: có hướng, đơn, liên thông, stronglyConnected, dag, bipartite, weighted.';

  public params: ParamSpec[] = [
    { key: 'minN', label: 'Số đỉnh nhỏ nhất (minN)', def: 2, lo: 1, hi: 200000, type: 'int' },
    { key: 'maxN', label: 'Số đỉnh lớn nhất (maxN)', def: 8, lo: 1, hi: 200000, type: 'int' },
    {
      key: 'density',
      label: 'Mật độ cạnh',
      def: 0,
      lo: 0,
      hi: 3,
      type: 'int',
      options: [
        { value: 0, label: 'Tự đặt minM/maxM' },
        { value: 1, label: 'Thưa' },
        { value: 2, label: 'Vừa' },
        { value: 3, label: 'Dày' },
      ],
    },
    { key: 'minM', label: 'Số cạnh nhỏ nhất (minM)', def: 1, lo: 0, hi: 1000000, type: 'int', visibleWhen: c => c.getNum('density') === 0 },
    { key: 'maxM', label: 'Số cạnh lớn nhất (maxM)', def: 10, lo: 0, hi: 1000000, type: 'int', visibleWhen: c => c.getNum('density') === 0 },
    { key: 'directed', label: 'Đồ thị có hướng?', def: 0, lo: 0, hi: 1, type: 'bool' },
    { key: 'simple', label: 'Đồ thị đơn?', def: 1, lo: 0, hi: 1, type: 'bool' },
    { key: 'connected', label: 'Bắt buộc liên thông?', def: 0, lo: 0, hi: 1, type: 'bool' },
    { key: 'stronglyConnected', label: 'Liên thông mạnh (có hướng)?', def: 0, lo: 0, hi: 1, type: 'bool', visibleWhen: c => c.getBool('directed') },
    { key: 'dag', label: 'DAG (có hướng không chu trình)?', def: 0, lo: 0, hi: 1, type: 'bool', visibleWhen: c => c.getBool('directed') },
    { key: 'bipartite', label: 'Đồ thị hai phía?', def: 0, lo: 0, hi: 1, type: 'bool' },
    { key: 'weighted', label: 'Có trọng số cạnh?', def: 0, lo: 0, hi: 1, type: 'bool' },
    { key: 'minW', label: 'Trọng số nhỏ nhất', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getBool('weighted') },
    { key: 'maxW', label: 'Trọng số lớn nhất', def: 1000000000, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getBool('weighted') },
  ];

  public defaultConfig(): Config {
    return new Config({
      minN: 2n,
      maxN: 8n,
      density: 0n,
      minM: 1n,
      maxM: 10n,
      directed: 0n,
      simple: 1n,
      connected: 0n,
      stronglyConnected: 0n,
      dag: 0n,
      bipartite: 0n,
      weighted: 0n,
      minW: 1n,
      maxW: 1000000000n,
    });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.getNum('density') === 0 && c.get('minM') > c.get('maxM')) return 'minM phải <= maxM.';
    if (c.getBool('weighted') && c.get('minW') > c.get('maxW')) return 'minW phải <= maxW.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const directed = c.getBool('directed');
    const weighted = c.getBool('weighted');
    const simple = c.getBool('simple');
    const connected = c.getBool('connected');
    const dag = directed && c.getBool('dag');

    let minM = c.getNum('density') === 0 ? Number(c.get('minM')) : (c.getNum('density') === 1 ? n - 1 : n * 2);
    let maxM = c.getNum('density') === 0 ? Number(c.get('maxM')) : (c.getNum('density') === 3 ? n * (n - 1) / 2 : n * 2);
    if (connected && minM < n - 1) minM = n - 1;
    if (minM > maxM) maxM = minM;

    const m = Math.max(1, Math.min(maxM, Number(rng.range(minM, maxM))));
    const edges: Array<{ u: number; v: number; w?: bigint }> = [];
    const edgeSet = new Set<string>();

    // Spanning tree if connected
    if (connected && n > 1) {
      for (let v = 2; v <= n; v++) {
        const u = Number(rng.range(1, v - 1));
        const key = directed ? `${u}->${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
        edges.push({ u, v, w: weighted ? rng.range(c.get('minW'), c.get('maxW')) : undefined });
        edgeSet.add(key);
      }
    }

    // Additional edges
    let attempts = 0;
    while (edges.length < m && attempts++ < 20000) {
      let u = Number(rng.range(1, n));
      let v = Number(rng.range(1, n));
      if (simple && u === v) continue;
      if (dag && u > v) [u, v] = [v, u];
      if (dag && u === v) continue;
      const key = directed ? `${u}->${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (simple && edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ u, v, w: weighted ? rng.range(c.get('minW'), c.get('maxW')) : undefined });
    }

    let out = `${n} ${edges.length}\n`;
    for (const e of edges) {
      out += weighted ? `${e.u} ${e.v} ${e.w}\n` : `${e.u} ${e.v}\n`;
    }
    return out;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 1) return 'Input rỗng.';
    if (lines[0].length !== 2) return 'Dòng 1 cần 2 số nguyên: n và m.';

    const chkN = Util.parseBigIntToken(lines[0][0], c.get('minN'), c.get('maxN'), 'n');
    if (chkN.error) return chkN.error;
    const n = Number(chkN.value!);

    const m = parseInt(lines[0][1], 10);
    if (isNaN(m) || m < 0) return `Số cạnh m = '${lines[0][1]}' không phải số nguyên không âm.`;
    if (lines.length !== m + 1) return `Cần đúng ${m} dòng cạnh (nhận được ${lines.length - 1} dòng).`;

    const weighted = c.getBool('weighted');
    const simple = c.getBool('simple');
    const edgeSet = new Set<string>();

    for (let i = 1; i <= m; i++) {
      const row = lines[i];
      const expectedToks = weighted ? 3 : 2;
      if (row.length !== expectedToks) {
        return `Dòng ${i + 1} cần ${expectedToks} số (${weighted ? 'u v w' : 'u v'}), nhận ${row.length}.`;
      }
      const u = parseInt(row[0], 10);
      const v = parseInt(row[1], 10);
      if (isNaN(u) || u < 1 || u > n) return `Dòng ${i + 1}: đỉnh u = '${row[0]}' nằm ngoài phạm vi [1, ${n}].`;
      if (isNaN(v) || v < 1 || v > n) return `Dòng ${i + 1}: đỉnh v = '${row[1]}' nằm ngoài phạm vi [1, ${n}].`;

      if (simple) {
        if (u === v) return `Dòng ${i + 1}: đồ thị đơn không được chứa khuyên (u = v = ${u}).`;
        const key = c.getBool('directed') ? `${u}->${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
        if (edgeSet.has(key)) return `Dòng ${i + 1}: cạnh nối (${u}, ${v}) bị lặp lại trong đồ thị đơn.`;
        edgeSet.add(key);
      }

      if (weighted) {
        const chkW = Util.parseBigIntToken(row[2], c.get('minW'), c.get('maxW'), `Trọng số cạnh ${i}`);
        if (chkW.error) return chkW.error;
      }
    }
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    return `${lines.length - 1}\n`;
  }

  public describeConfig(c: Config): string {
    return `Đồ thị: n ∈ [${c.get('minN')}, ${c.get('maxN')}], có hướng: ${c.getBool('directed')}, có trọng số: ${c.getBool('weighted')}`;
  }
}

// --- TREE PROBLEM ---
export class TreeProblem implements Problem {
  public id = 'tree';
  public title = 'Cây';
  public mainCategory = 'Đồ thị và cây';
  public formatDescription =
    'Dòng 1: n. Có thể ghi n-1 cạnh u v [w], hoặc ghi n-1 cha của các đỉnh 2..n trên một dòng.\n' +
    'Cấu hình chọn kiểu cây: ngẫu nhiên, đường thẳng, hình sao hoặc cây nhị phân.';

  public params: ParamSpec[] = [
    {
      key: 'layout',
      label: 'Cách ghi cây',
      def: 0,
      lo: 0,
      hi: 1,
      type: 'int',
      options: [
        { value: 0, label: 'Danh sách cạnh u v' },
        { value: 1, label: 'Danh sách cha của 2..n' },
      ],
    },
    { key: 'minN', label: 'Số đỉnh nhỏ nhất', def: 1, lo: 1, hi: 200000, type: 'int' },
    { key: 'maxN', label: 'Số đỉnh lớn nhất', def: 20, lo: 1, hi: 200000, type: 'int' },
    {
      key: 'shape',
      label: 'Cấu trúc cây',
      def: 0,
      lo: 0,
      hi: 3,
      type: 'int',
      options: [
        { value: 0, label: 'Cây ngẫu nhiên' },
        { value: 1, label: 'Đường thẳng' },
        { value: 2, label: 'Hình sao' },
        { value: 3, label: 'Cây nhị phân' },
      ],
    },
    { key: 'weighted', label: 'Cạnh có trọng số?', def: 0, lo: 0, hi: 1, type: 'bool', visibleWhen: c => c.getNum('layout') === 0 },
    { key: 'minW', label: 'Trọng số nhỏ nhất', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getNum('layout') === 0 && c.getBool('weighted') },
    { key: 'maxW', label: 'Trọng số lớn nhất', def: 100, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getNum('layout') === 0 && c.getBool('weighted') },
  ];

  public defaultConfig(): Config {
    return new Config({ layout: 0n, minN: 1n, maxN: 20n, shape: 0n, weighted: 0n, minW: 1n, maxW: 100n });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.getNum('layout') === 0 && c.getBool('weighted') && c.get('minW') > c.get('maxW')) return 'minW phải <= maxW.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(rng.range(c.get('minN'), c.get('maxN')));
    const layout = c.getNum('layout');
    const shape = c.getNum('shape');
    const weighted = c.getBool('weighted');

    const parents = new Array<number>(n + 1);
    for (let v = 2; v <= n; v++) {
      if (shape === 1) parents[v] = v - 1;
      else if (shape === 2) parents[v] = 1;
      else if (shape === 3) parents[v] = Math.floor(v / 2);
      else parents[v] = Number(rng.range(1, v - 1));
    }

    if (layout === 1) {
      const pList: string[] = [];
      for (let v = 2; v <= n; v++) pList.push(parents[v].toString());
      return `${n}\n${pList.join(' ')}\n`;
    }

    let out = `${n}\n`;
    for (let v = 2; v <= n; v++) {
      const u = parents[v];
      if (weighted) {
        const w = rng.range(c.get('minW'), c.get('maxW'));
        out += `${u} ${v} ${w}\n`;
      } else {
        out += `${u} ${v}\n`;
      }
    }
    return out;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 1) return 'Input rỗng.';

    const chkN = Util.parseBigIntToken(lines[0][0], c.get('minN'), c.get('maxN'), 'n');
    if (chkN.error) return chkN.error;
    const n = Number(chkN.value!);

    if (n === 1) {
      if (lines.length !== 1) return 'Với cây n = 1, chỉ có dòng khai báo n = 1.';
      return null;
    }

    const layout = c.getNum('layout');
    if (layout === 1) {
      // Parent list on line 2
      if (lines.length !== 2) return `Cách ghi parent list cần đúng 2 dòng, nhận ${lines.length}.`;
      if (lines[1].length !== n - 1) return `Dòng 2 cần đúng ${n - 1} cha của các đỉnh 2..${n}, nhận ${lines[1].length}.`;
      for (let i = 0; i < n - 1; i++) {
        const v = i + 2;
        const pVal = parseInt(lines[1][i], 10);
        if (isNaN(pVal) || pVal < 1 || pVal > n) return `Cha của đỉnh ${v} ('${lines[1][i]}') phải nằm trong [1, ${n}].`;
      }
    } else {
      // Edge list: n - 1 lines
      if (lines.length !== n) return `Cây ${n} đỉnh cần đúng ${n - 1} cạnh (tổng ${n} dòng, nhận ${lines.length}).`;
      const weighted = c.getBool('weighted');
      for (let i = 1; i < n; i++) {
        const row = lines[i];
        const exp = weighted ? 3 : 2;
        if (row.length !== exp) return `Dòng cạnh ${i} cần ${exp} số, nhận ${row.length}.`;
        const u = parseInt(row[0], 10);
        const v = parseInt(row[1], 10);
        if (isNaN(u) || u < 1 || u > n) return `Dòng cạnh ${i}: đỉnh u = '${row[0]}' nằm ngoài [1, ${n}].`;
        if (isNaN(v) || v < 1 || v > n) return `Dòng cạnh ${i}: đỉnh v = '${row[1]}' nằm ngoài [1, ${n}].`;
        if (u === v) return `Dòng cạnh ${i}: cây không được chứa khuyên (u = v = ${u}).`;
        if (weighted) {
          const chkW = Util.parseBigIntToken(row[2], c.get('minW'), c.get('maxW'), `Trọng số cạnh ${i}`);
          if (chkW.error) return chkW.error;
        }
      }
    }
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    return `${lines.length - 1}\n`;
  }

  public describeConfig(c: Config): string {
    return `Cây: n ∈ [${c.get('minN')}, ${c.get('maxN')}], shape=${c.get('shape')}, layout=${c.get('layout')}`;
  }
}

// --- MULTI TEST PROBLEM ---
export class MultiTestProblem implements Problem {
  public id = 'multi_test';
  public title = 'Nhiều bộ test (mảng / xâu)';
  public mainCategory = 'Nhiều bộ test';
  public formatDescription =
    'Dòng 1: số bộ test T. Mỗi bộ gồm một dòng n, sau đó một dòng dữ liệu dài n.\n' +
    'Chọn dữ liệu là dãy số nguyên hoặc xâu ký tự.';

  public params: ParamSpec[] = [
    {
      key: 'content',
      label: 'Dữ liệu mỗi test',
      def: 0,
      lo: 0,
      hi: 1,
      type: 'int',
      options: [
        { value: 0, label: 'Mảng số nguyên' },
        { value: 1, label: 'Xâu ký tự' },
      ],
    },
    { key: 'minT', label: 'Số bộ test nhỏ nhất', def: 2, lo: 1, hi: 10000, type: 'int' },
    { key: 'maxT', label: 'Số bộ test lớn nhất', def: 5, lo: 1, hi: 10000, type: 'int' },
    { key: 'minN', label: 'Độ dài nhỏ nhất', def: 1, lo: 1, hi: 1000000, type: 'int' },
    { key: 'maxN', label: 'Độ dài lớn nhất', def: 10, lo: 1, hi: 1000000, type: 'int' },
    { key: 'minVal', label: 'Giá trị phần tử nhỏ nhất', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getNum('content') === 0 },
    { key: 'maxVal', label: 'Giá trị phần tử lớn nhất', def: 100, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getNum('content') === 0 },
    { key: 'charset', label: 'Tập ký tự', def: 0, lo: 0, hi: 0, defText: 'lower', type: 'text', visibleWhen: c => c.getNum('content') === 1 },
  ];

  public defaultConfig(): Config {
    return new Config({ content: 0n, minT: 2n, maxT: 5n, minN: 1n, maxN: 10n, minVal: 1n, maxVal: 100n }, { charset: 'lower' });
  }

  public validateConfig(c: Config): string | null {
    if (c.get('minT') > c.get('maxT')) return 'minT phải <= maxT.';
    if (c.get('minN') > c.get('maxN')) return 'minN phải <= maxN.';
    if (c.getNum('content') === 0 && c.get('minVal') > c.get('maxVal')) return 'minVal phải <= maxVal.';
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const t = Number(rng.range(c.get('minT'), c.get('maxT')));
    const isString = c.getNum('content') === 1;
    const { charset } = StringProblem.resolveCharset(c.getText('charset', 'lower'));

    let out = `${t}\n`;
    for (let tc = 0; tc < t; tc++) {
      const n = Number(rng.range(c.get('minN'), c.get('maxN')));
      out += `${n}\n`;
      if (isString) {
        let s = '';
        for (let i = 0; i < n; i++) s += charset[Number(rng.below(charset.length))];
        out += `${s}\n`;
      } else {
        const arr: string[] = [];
        for (let i = 0; i < n; i++) arr.push(rng.range(c.get('minVal'), c.get('maxVal')).toString());
        out += `${arr.join(' ')}\n`;
      }
    }
    return out;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length < 1) return 'Rỗng.';
    return null;
  }

  public solve(input: string): string {
    const lines = input.trim().split('\n');
    const t = parseInt(lines[0].trim(), 10);
    const answers: string[] = [];
    for (let i = 0; i < t; i++) {
      const lineIdx = 1 + i * 2 + 1;
      if (lineIdx < lines.length) {
        const parts = lines[lineIdx].trim().split(/\s+/);
        if (parts.length > 0 && !isNaN(Number(parts[0]))) {
          let sum = 0n;
          for (const p of parts) sum += BigInt(p);
          answers.push(sum.toString());
        } else {
          answers.push(lines[lineIdx].length.toString());
        }
      }
    }
    return answers.join('\n') + '\n';
  }

  public describeConfig(c: Config): string {
    return `Nhiều bộ test: T ∈ [${c.get('minT')}, ${c.get('maxT')}], N ∈ [${c.get('minN')}, ${c.get('maxN')}]`;
  }
}

// --- CUSTOM PROBLEM ---
export class CustomProblem implements Problem {
  public id = 'custom';
  public title = 'Tùy chỉnh: dãy số nguyên, giới hạn chung hoặc riêng từng vị trí';
  public mainCategory = 'Dữ liệu tùy chỉnh';
  public formatDescription =
    'Mỗi test gồm n số nguyên (n cố định cho mọi test).\n' +
    '  mode = 1: mọi số trong [min, max].\n' +
    '  mode = 2: số thứ i trong [lo_i, hi_i]; bounds: "1:10,50:100,-20:20".\n' +
    '  header = 1: ghi n ở dòng đầu.\n' +
    '  layout = 1: cùng một dòng, layout = 2: mỗi số một dòng.';

  public params: ParamSpec[] = [
    { key: 'n', label: 'Số lượng số nguyên trong mỗi test (n)', def: 10, lo: 1, hi: 1000000, type: 'int' },
    {
      key: 'mode',
      label: 'Chế độ giới hạn',
      def: 1,
      lo: 1,
      hi: 2,
      type: 'int',
      options: [
        { value: 1, label: 'Giới hạn chung cho mọi số' },
        { value: 2, label: 'Giới hạn riêng từng vị trí' },
      ],
    },
    { key: 'min', label: 'Giá trị nhỏ nhất', def: 1, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getNum('mode') === 1 },
    { key: 'max', label: 'Giá trị lớn nhất', def: 100, lo: -1000000000000000000n, hi: 1000000000000000000n, type: 'int', visibleWhen: c => c.getNum('mode') === 1 },
    {
      key: 'bounds',
      label: 'Giới hạn riêng (lo1:hi1,lo2:hi2,...)',
      def: 0,
      lo: 0,
      hi: 0,
      defText: '1:10,50:100,-20:20',
      type: 'text',
      multiline: true,
      visibleWhen: c => c.getNum('mode') === 2,
    },
    { key: 'header', label: 'Ghi n ở dòng đầu?', def: 0, lo: 0, hi: 1, type: 'bool' },
    {
      key: 'layout',
      label: 'Bố cục',
      def: 1,
      lo: 1,
      hi: 2,
      type: 'int',
      options: [
        { value: 1, label: 'Các số trên cùng một dòng' },
        { value: 2, label: 'Mỗi số một dòng' },
      ],
    },
  ];

  public static parseBounds(text: string): { bounds: Array<[bigint, bigint]>; error: string | null } {
    const raw = text.trim();
    if (!raw) return { bounds: [], error: 'Chuỗi bounds rỗng.' };
    const tokens = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    const bounds: Array<[bigint, bigint]> = [];
    for (let i = 0; i < tokens.length; i++) {
      const parts = tokens[i].split(':');
      if (parts.length !== 2) return { bounds: [], error: `Phần tử ${i + 1} ('${tokens[i]}') không đúng định dạng lo:hi.` };
      try {
        const lo = BigInt(parts[0].trim());
        const hi = BigInt(parts[1].trim());
        if (lo > hi) return { bounds: [], error: `Phần tử ${i + 1} có lo (${lo}) > hi (${hi}).` };
        bounds.push([lo, hi]);
      } catch {
        return { bounds: [], error: `Phần tử ${i + 1} không phải số nguyên.` };
      }
    }
    return { bounds, error: null };
  }

  public defaultConfig(): Config {
    return new Config({ n: 10n, mode: 1n, min: 1n, max: 100n, header: 0n, layout: 1n }, { bounds: '1:10,50:100,-20:20' });
  }

  public validateConfig(c: Config): string | null {
    if (c.getNum('mode') === 1 && c.get('min') > c.get('max')) return 'min phải <= max.';
    if (c.getNum('mode') === 2) {
      const { bounds, error } = CustomProblem.parseBounds(c.getText('bounds'));
      if (error) return error;
      if (BigInt(bounds.length) !== c.get('n')) return `Số cặp giới hạn (${bounds.length}) phải bằng n (${c.get('n')}).`;
    }
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const n = Number(c.get('n'));
    const mode = c.getNum('mode');
    const header = c.getBool('header');
    const layout = c.getNum('layout');

    const nums: bigint[] = [];
    if (mode === 1) {
      for (let i = 0; i < n; i++) nums.push(rng.range(c.get('min'), c.get('max')));
    } else {
      const { bounds } = CustomProblem.parseBounds(c.getText('bounds'));
      for (let i = 0; i < n; i++) {
        const [lo, hi] = bounds[i] || [1n, 100n];
        nums.push(rng.range(lo, hi));
      }
    }

    let out = header ? `${n}\n` : '';
    out += layout === 1 ? nums.map(v => v.toString()).join(' ') + '\n' : nums.map(v => v.toString()).join('\n') + '\n';
    return out;
  }

  public validateInput(input: string, c: Config): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    const n = Number(c.get('n'));
    const header = c.getBool('header');
    let startIdx = 0;
    if (header) {
      if (lines.length < 1) return 'Thiếu dòng header n.';
      if (lines[0].length !== 1) return 'Dòng 1 header phải chứa đúng một số n.';
      const chkN = Util.parseBigIntToken(lines[0][0], c.get('n'), c.get('n'), 'n');
      if (chkN.error) return chkN.error;
      startIdx = 1;
    }
    const valTokens: string[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      valTokens.push(...lines[i]);
    }
    if (valTokens.length !== n) {
      return `Cần đúng ${n} số nguyên (nhận được ${valTokens.length}).`;
    }
    const mode = c.getNum('mode');
    let boundsList: Array<[bigint, bigint]> = [];
    if (mode === 2) {
      const parsed = CustomProblem.parseBounds(c.getText('bounds'));
      if (parsed.error) return parsed.error;
      boundsList = parsed.bounds;
    }
    for (let i = 0; i < n; i++) {
      const lo = mode === 2 ? boundsList[i][0] : c.get('min');
      const hi = mode === 2 ? boundsList[i][1] : c.get('max');
      const chk = Util.parseBigIntToken(valTokens[i], lo, hi, `Số thứ ${i + 1}`);
      if (chk.error) return chk.error;
    }
    return null;
  }

  public solve(input: string, c?: Config): string {
    const lines = input.trim().split('\n').filter(Boolean);
    const header = (c && c.getBool('header')) || (lines.length > 1 && lines[0].trim().split(/\s+/).length === 1);
    const startLine = header ? 1 : 0;
    let sum = 0n;
    for (let i = startLine; i < lines.length; i++) {
      for (const tok of lines[i].trim().split(/\s+/)) {
        if (tok) {
          try { sum += BigInt(tok); } catch { /* ignore */ }
        }
      }
    }
    return `${sum}\n`;
  }

  public describeConfig(c: Config): string {
    return `Tùy chỉnh: n = ${c.get('n')}, mode = ${c.get('mode')}`;
  }
}

// --- CHESS HELPERS & PROBLEMS ---
const KNIGHT_DELTAS: Array<[number, number]> = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

function isKnightMove(x1: number, y1: number, x2: number, y2: number): boolean {
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
}

function countKnightMoves(x: number, y: number): number {
  let cnt = 0;
  for (const [dx, dy] of KNIGHT_DELTAS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) cnt++;
  }
  return cnt;
}

function knightShortestPath(x1: number, y1: number, x2: number, y2: number): number {
  if (x1 < 0 || x1 > 7 || y1 < 0 || y1 > 7 || x2 < 0 || x2 > 7 || y2 < 0 || y2 > 7) return -1;
  if (x1 === x2 && y1 === y2) return 0;
  const dist: number[][] = Array.from({ length: 8 }, () => new Array(8).fill(-1));
  const queue: Array<[number, number]> = [[x1, y1]];
  dist[x1][y1] = 0;
  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    if (cx === x2 && cy === y2) return dist[cx][cy];
    for (const [dx, dy] of KNIGHT_DELTAS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && dist[nx][ny] === -1) {
        dist[nx][ny] = dist[cx][cy] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return -1;
}

function pickChessPosition(rng: Rng, mode: number): [number, number] {
  if (mode === 1) {
    // Corner
    const corners: Array<[number, number]> = [[0, 0], [0, 7], [7, 0], [7, 7]];
    return corners[Number(rng.below(4))];
  }
  if (mode === 2) {
    // Edge (non-corner)
    const edges: Array<[number, number]> = [];
    for (let i = 1; i <= 6; i++) {
      edges.push([0, i], [7, i], [i, 0], [i, 7]);
    }
    return edges[Number(rng.below(edges.length))];
  }
  if (mode === 3) {
    // Center (2..5)
    return [Number(rng.range(2, 5)), Number(rng.range(2, 5))];
  }
  // Any
  return [Number(rng.range(0, 7)), Number(rng.range(0, 7))];
}

export class ChessMovesProblem implements Problem {
  public id = 'chess_moves';
  public title = 'Cờ vua: Đếm nước đi của quân Mã';
  public mainCategory = 'Dữ liệu tùy chỉnh';
  public formatDescription =
    'Một dòng duy nhất chứa x y (0 ≤ x, y ≤ 7) là tọa độ của quân Mã trên bàn cờ 8×8.\n' +
    'Lời giải chuẩn in số ô hợp lệ mà Mã có thể đi tới.';

  public params: ParamSpec[] = [
    {
      key: 'position',
      label: 'Vùng chọn tọa độ',
      def: 0,
      lo: 0,
      hi: 3,
      type: 'int',
      options: [
        { value: 0, label: 'Bất kỳ' },
        { value: 1, label: 'Góc bàn cờ' },
        { value: 2, label: 'Cạnh bàn cờ (không ở góc)' },
        { value: 3, label: 'Vùng trung tâm (2–5)' },
      ],
    },
  ];

  public defaultConfig(): Config {
    return new Config({ position: 0n });
  }

  public validateConfig(): string | null {
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const [x, y] = pickChessPosition(rng, c.getNum('position'));
    return `${x} ${y}\n`;
  }

  public validateInput(input: string): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 1 || lines[0].length !== 2) return 'Cần 1 dòng chứa 2 số tọa độ 0..7.';
    return null;
  }

  public solve(input: string): string {
    const [x, y] = input.trim().split(/\s+/).map(Number);
    return `${countKnightMoves(x, y)}\n`;
  }

  public describeConfig(c: Config): string {
    return `Quân Mã 8×8, position mode = ${c.get('position')}`;
  }
}

export class ChessPieceMovesProblem implements Problem {
  public id = 'chess_piece_moves';
  public title = 'Cờ vua: Đếm nước đi của quân cờ';
  public mainCategory = 'Dữ liệu tùy chỉnh';
  public formatDescription =
    'Input: x y (0 ≤ x, y ≤ 7). Output: số nước đi hợp lệ trên bàn cờ trống 8×8 cho quân cờ đã chọn.';

  public params: ParamSpec[] = [
    {
      key: 'piece',
      label: 'Quân cờ',
      def: 0,
      lo: 0,
      hi: 4,
      type: 'int',
      options: [
        { value: 0, label: 'Mã (Knight)' },
        { value: 1, label: 'Vua (King)' },
        { value: 2, label: 'Xe (Rook)' },
        { value: 3, label: 'Tượng (Bishop)' },
        { value: 4, label: 'Hậu (Queen)' },
      ],
    },
    {
      key: 'position',
      label: 'Vùng chọn tọa độ',
      def: 0,
      lo: 0,
      hi: 3,
      type: 'int',
      options: [
        { value: 0, label: 'Bất kỳ' },
        { value: 1, label: 'Góc bàn cờ' },
        { value: 2, label: 'Cạnh bàn cờ (không ở góc)' },
        { value: 3, label: 'Vùng trung tâm (2–5)' },
      ],
    },
  ];

  public defaultConfig(): Config {
    return new Config({ piece: 0n, position: 0n });
  }

  public validateConfig(): string | null {
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const [x, y] = pickChessPosition(rng, c.getNum('position'));
    return `${x} ${y}\n`;
  }

  public validateInput(input: string): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 1 || lines[0].length !== 2) return 'Cần 1 dòng chứa x y (0..7).';
    return null;
  }

  public solve(input: string, c?: Config): string {
    const [x, y] = input.trim().split(/\s+/).map(Number);
    const piece = c ? c.getNum('piece') : 0;
    if (piece === 0) return `${countKnightMoves(x, y)}\n`;
    if (piece === 1) {
      // King: 8 directions, 1 step
      let cnt = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) cnt++;
        }
      }
      return `${cnt}\n`;
    }
    if (piece === 2) {
      // Rook: 14 moves always on 8x8 empty board
      return '14\n';
    }
    if (piece === 3) {
      // Bishop
      const cnt = Math.min(x, y) + Math.min(x, 7 - y) + Math.min(7 - x, y) + Math.min(7 - x, 7 - y);
      return `${cnt}\n`;
    }
    // Queen = Rook (14) + Bishop
    const diag = Math.min(x, y) + Math.min(x, 7 - y) + Math.min(7 - x, y) + Math.min(7 - x, 7 - y);
    return `${14 + diag}\n`;
  }

  public describeConfig(c: Config): string {
    const names = ['Mã', 'Vua', 'Xe', 'Tượng', 'Hậu'];
    return `Quân cờ: ${names[c.getNum('piece')] || 'Mã'}`;
  }
}

export class ChessKnightTargetsProblem implements Problem {
  public id = 'chess_knight_targets';
  public title = 'Cờ vua: Liệt kê ô quân Mã có thể đi';
  public mainCategory = 'Dữ liệu tùy chỉnh';
  public formatDescription =
    'Input: x y.\n' +
    'Output dòng 1: số ô có thể đi k.\n' +
    'k dòng tiếp theo: mỗi dòng một cặp u v theo thứ tự từ điển tăng dần.';

  public params: ParamSpec[] = [
    {
      key: 'position',
      label: 'Vùng chọn tọa độ',
      def: 0,
      lo: 0,
      hi: 3,
      type: 'int',
      options: [
        { value: 0, label: 'Bất kỳ' },
        { value: 1, label: 'Góc' },
        { value: 2, label: 'Cạnh' },
        { value: 3, label: 'Trung tâm' },
      ],
    },
  ];

  public defaultConfig(): Config {
    return new Config({ position: 0n });
  }

  public validateConfig(): string | null {
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const [x, y] = pickChessPosition(rng, c.getNum('position'));
    return `${x} ${y}\n`;
  }

  public validateInput(input: string): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 1 || lines[0].length !== 2) return 'Cần x y.';
    return null;
  }

  public solve(input: string): string {
    const [x, y] = input.trim().split(/\s+/).map(Number);
    const targets: Array<[number, number]> = [];
    for (const [dx, dy] of KNIGHT_DELTAS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) targets.push([nx, ny]);
    }
    targets.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
    let out = `${targets.length}\n`;
    for (const [tx, ty] of targets) out += `${tx} ${ty}\n`;
    return out;
  }

  public describeConfig(c: Config): string {
    return `Liệt kê đích Mã, mode = ${c.get('position')}`;
  }
}

export class ChessKnightReachabilityProblem implements Problem {
  public id = 'chess_knight_reachability';
  public title = 'Cờ vua: Kiểm tra Mã đi một nước';
  public mainCategory = 'Dữ liệu tùy chỉnh';
  public formatDescription =
    'Input: x1 y1 x2 y2.\n' +
    'Output: YES nếu Mã có thể đi từ (x1, y1) tới (x2, y2) trong đúng 1 nước, ngược lại NO.';

  public params: ParamSpec[] = [
    { key: 'forceReachable', label: 'Tỷ lệ % sinh ca YES (có thể đi tới)', def: 50, lo: 0, hi: 100, type: 'int' },
  ];

  public defaultConfig(): Config {
    return new Config({ forceReachable: 50n });
  }

  public validateConfig(): string | null {
    return null;
  }

  public generate(rng: Rng, c: Config): string {
    const x1 = Number(rng.range(0, 7));
    const y1 = Number(rng.range(0, 7));
    if (rng.chance(c.getNum('forceReachable'))) {
      const validTargets: Array<[number, number]> = [];
      for (const [dx, dy] of KNIGHT_DELTAS) {
        const nx = x1 + dx;
        const ny = y1 + dy;
        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) validTargets.push([nx, ny]);
      }
      const [x2, y2] = validTargets[Number(rng.below(validTargets.length))];
      return `${x1} ${y1} ${x2} ${y2}\n`;
    }
    const x2 = Number(rng.range(0, 7));
    const y2 = Number(rng.range(0, 7));
    return `${x1} ${y1} ${x2} ${y2}\n`;
  }

  public validateInput(input: string): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 1 || lines[0].length !== 4) return 'Cần x1 y1 x2 y2.';
    return null;
  }

  public solve(input: string): string {
    const [x1, y1, x2, y2] = input.trim().split(/\s+/).map(Number);
    return isKnightMove(x1, y1, x2, y2) ? 'YES\n' : 'NO\n';
  }

  public describeConfig(c: Config): string {
    return `Kiểm tra 1 nước Mã, tỷ lệ YES: ${c.get('forceReachable')}%`;
  }
}

export class ChessKnightShortestPathProblem implements Problem {
  public id = 'chess_knight_shortest';
  public title = 'Cờ vua: Đường đi ngắn nhất của quân Mã';
  public mainCategory = 'Dữ liệu tùy chỉnh';
  public formatDescription =
    'Input: x1 y1 x2 y2.\n' +
    'Output: số nước đi ít nhất của quân Mã từ (x1, y1) tới (x2, y2) trên bàn cờ trống 8×8.';

  public params: ParamSpec[] = [];

  public defaultConfig(): Config {
    return new Config();
  }

  public validateConfig(): string | null {
    return null;
  }

  public generate(rng: Rng): string {
    const x1 = Number(rng.range(0, 7));
    const y1 = Number(rng.range(0, 7));
    const x2 = Number(rng.range(0, 7));
    const y2 = Number(rng.range(0, 7));
    return `${x1} ${y1} ${x2} ${y2}\n`;
  }

  public validateInput(input: string): string | null {
    const { lines, error } = Util.splitLines(input);
    if (error) return error;
    if (lines.length !== 1 || lines[0].length !== 4) return 'Cần x1 y1 x2 y2.';
    return null;
  }

  public solve(input: string): string {
    const [x1, y1, x2, y2] = input.trim().split(/\s+/).map(Number);
    return `${knightShortestPath(x1, y1, x2, y2)}\n`;
  }

  public describeConfig(): string {
    return 'Đường đi ngắn nhất quân Mã (BFS)';
  }
}

// Master Problems Registry
export const ALL_PROBLEMS: Problem[] = [
  new SingleNProblem(),
  new TwoIntsProblem(),
  new ArrayProblem(),
  new QueriesProblem(),
  new PrefixSumRangeProblem(),
  new TdcPrefixSumProblem(),
  new StringProblem(),
  new MatrixProblem(),
  new GridProblem(),
  new PairListProblem(),
  new GraphProblem(),
  new TreeProblem(),
  new MultiTestProblem(),
  new CustomProblem(),
  new ChessMovesProblem(),
  new ChessPieceMovesProblem(),
  new ChessKnightTargetsProblem(),
  new ChessKnightReachabilityProblem(),
  new ChessKnightShortestPathProblem(),
];

export function findProblem(id: string): Problem | undefined {
  return ALL_PROBLEMS.find(p => p.id === id);
}
