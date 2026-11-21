import { Config, Problem } from '../core/types';
import { Rng } from '../core/rng';

export interface SampleCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface GenerateSamplesOptions {
  problem: Problem;
  config: Config;
  count: number;
  seed?: string | bigint;
  compact?: boolean;
  existingInputs?: string[];
}

export interface GenerateSamplesResult {
  samples: SampleCase[];
  usedConfig: Config;
  seedUsed: string;
}

export interface SolveSampleResult {
  ok: boolean;
  output?: string;
  error?: string;
  matchesActiveConfig: boolean;
  constraintNote?: string;
}

const SIZE_PAIRS: Array<[string, string, bigint, bigint]> = [
  ['minN', 'maxN', 3n, 6n],
  ['minM', 'maxM', 3n, 6n],
  ['minQ', 'maxQ', 2n, 4n],
  ['minLen', 'maxLen', 4n, 8n],
  ['minT', 'maxT', 2n, 3n],
];

const VALUE_PAIRS: Array<[string, string]> = [
  ['minVal', 'maxVal'],
  ['minA', 'maxA'],
  ['minB', 'maxB'],
  ['minW', 'maxW'],
  ['min', 'max'],
];

function bigMin(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

function bigMax(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

function clampBig(val: bigint, lo: bigint, hi: bigint): bigint {
  if (val < lo) return lo;
  if (val > hi) return hi;
  return val;
}

function toBig(val: number | bigint): bigint {
  return typeof val === 'bigint' ? val : BigInt(val);
}

/**
 * Normalizes line endings and trims trailing blank lines while keeping a clean display format.
 */
export function normalizeSampleText(raw: string): string {
  return raw.replace(/\r\n/g, '\n').replace(/\n+$/, '');
}

/**
 * Ensures input ends with a trailing newline for Problem.validateInput / Problem.solve.
 */
export function normalizeInputForValidator(raw: string): string {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\n+$/, '');
  return normalized ? `${normalized}\n` : '';
}

/**
 * Builds a readable, valid Config for generating problem statement samples.
 * When `compact` is true, shrinks large size and value ranges so examples remain human-readable
 * while respecting parameter bounds and template-specific invariants.
 */
export function createSampleConfig(problem: Problem, baseConfig: Config, compact: boolean = true): Config {
  const baseValid = problem.validateConfig(baseConfig) === null;
  const candidate = (baseValid ? baseConfig : problem.defaultConfig()).clone();

  if (!compact) {
    return candidate;
  }

  const paramMap = new Map(problem.params.map((p) => [p.key, p]));

  // Handle size pairs: e.g., minN/maxN, minM/maxM, minQ/maxQ, minLen/maxLen, minT/maxT
  for (const [minKey, maxKey, targetMin, targetMax] of SIZE_PAIRS) {
    const minSpec = paramMap.get(minKey);
    const maxSpec = paramMap.get(maxKey);
    if (!minSpec || !maxSpec) continue;

    // MatrixProblem layout === 1 requires minM === maxM
    if (problem.id === 'matrix' && minKey === 'minM' && candidate.getNum('layout') === 1) {
      const fixedM = clampBig(bigMin(candidate.get('minM'), 5n), toBig(minSpec.lo), toBig(maxSpec.hi));
      candidate.set(minKey, fixedM);
      candidate.set(maxKey, fixedM);
      continue;
    }

    // SingleN uses minN/maxN as value range rather than element count
    if (problem.id === 'single_n') continue;

    const oldMin = candidate.get(minKey);
    const oldMax = candidate.get(maxKey);
    const specLo = toBig(minSpec.lo);
    const specHi = toBig(maxSpec.hi);

    // Preserve tight custom ranges (e.g. minN=maxN=1 or <= targetMax), shrink oversized stress ranges
    let nextMax = oldMax > targetMax ? targetMax : oldMax;
    nextMax = clampBig(nextMax, specLo, specHi);

    let nextMin = oldMin;
    if (nextMin > nextMax) {
      nextMin = bigMin(targetMin, nextMax);
    } else if (oldMin > targetMax) {
      nextMin = bigMin(targetMin, nextMax);
    } else if (oldMin === 1n && nextMax >= targetMin && problem.id !== 'grid') {
      nextMin = bigMin(targetMin, nextMax);
    }
    nextMin = clampBig(nextMin, specLo, nextMax);

    // Graph requires at least 2 vertices for meaningful edges
    if (problem.id === 'graph' && minKey === 'minN') {
      nextMax = bigMax(nextMax, bigMin(5n, specHi));
      nextMin = bigMax(nextMin, bigMin(3n, nextMax));
    }

    // Grid needs at least 2x2 if S/T markers are enabled
    if (problem.id === 'grid' && candidate.getBool('markers')) {
      nextMax = bigMax(nextMax, 3n);
      nextMin = bigMax(nextMin, 2n);
    }

    candidate.set(minKey, nextMin);
    candidate.set(maxKey, nextMax);
  }

  // CustomProblem uses single integer `n`
  if (problem.id === 'custom' && candidate.getNum('mode') === 1) {
    const nSpec = paramMap.get('n');
    const lo = nSpec ? toBig(nSpec.lo) : 1n;
    const hi = nSpec ? toBig(nSpec.hi) : 1000000n;
    const curN = candidate.get('n');
    if (curN > 8n) {
      candidate.set('n', clampBig(5n, lo, hi));
    }
  }

  // Graph edges minM/maxM relative to chosen vertex range
  if (problem.id === 'graph' && candidate.getNum('density') === 0) {
    const maxN = Number(candidate.get('maxN'));
    const maxPossibleSimple = Math.max(1, Math.floor((maxN * (maxN - 1)) / 2));
    const upperM = BigInt(Math.min(8, candidate.getBool('simple') ? maxPossibleSimple : 10));
    const curMinM = candidate.get('minM');
    const curMaxM = candidate.get('maxM');
    const nextMaxM = curMaxM > upperM ? upperM : curMaxM;
    const nextMinM = curMinM > nextMaxM ? bigMin(2n, nextMaxM) : curMinM;
    candidate.set('minM', bigMax(1n, nextMinM));
    candidate.set('maxM', bigMax(candidate.get('minM'), nextMaxM));
  }

  // SingleN uses minN/maxN as value range
  if (problem.id === 'single_n') {
    const minN = candidate.get('minN');
    const maxN = candidate.get('maxN');
    if (maxN - minN > 100n) {
      const nextMin = clampBig(minN < 1n && maxN >= 1n ? 1n : minN, minN, maxN);
      const nextMax = bigMin(maxN, nextMin + 49n);
      candidate.set('minN', nextMin);
      candidate.set('maxN', nextMax);
    }
  }

  // Narrow large value ranges to readable sample values
  for (const [minKey, maxKey] of VALUE_PAIRS) {
    const minSpec = paramMap.get(minKey);
    const maxSpec = paramMap.get(maxKey);
    if (!minSpec || !maxSpec) continue;

    const oldMin = candidate.get(minKey);
    const oldMax = candidate.get(maxKey);
    if (oldMax - oldMin <= 40n && oldMax <= 100n && oldMin >= -100n) continue;

    const allowsNegative = oldMin < 0n && oldMax >= 0n;
    let nextMin = allowsNegative ? bigMax(oldMin, -15n) : oldMin >= 0n ? bigMax(oldMin, 1n) : oldMin;
    if (nextMin > oldMax) nextMin = oldMin;

    let nextMax = bigMin(oldMax, nextMin + 24n);
    if (allowsNegative && oldMax >= 15n) {
      nextMax = 15n;
    }

    // Ensure enough distinct values when distinct = 1 on ArrayProblem
    if (problem.id === 'array' && candidate.getNum('mode') === 0 && candidate.getBool('distinct')) {
      const needed = candidate.get('maxN');
      if (nextMax - nextMin + 1n < needed) {
        nextMax = bigMin(oldMax, nextMin + needed + 4n);
        if (nextMax - nextMin + 1n < needed) {
          nextMin = bigMax(oldMin, nextMax - needed - 4n);
        }
      }
    }

    candidate.set(minKey, clampBig(nextMin, toBig(minSpec.lo), toBig(minSpec.hi)));
    candidate.set(maxKey, clampBig(nextMax, candidate.get(minKey), toBig(maxSpec.hi)));
  }

  if (problem.validateConfig(candidate) !== null) {
    return problem.defaultConfig();
  }
  return candidate;
}

export function generateSeedString(): string {
  return Math.floor(1000 + Math.random() * 999000).toString();
}

export function generateSampleTests(options: GenerateSamplesOptions): GenerateSamplesResult {
  const {
    problem,
    config,
    count,
    seed,
    compact = true,
    existingInputs = [],
  } = options;

  const targetCount = Math.max(1, Math.min(10, Math.floor(count)));
  const usedConfig = createSampleConfig(problem, config, compact);
  const seedUsed =
    seed !== undefined && String(seed).trim() !== '' ? String(seed).trim() : generateSeedString();
  const rng = new Rng(seedUsed);

  const seen = new Set(existingInputs.map((s) => normalizeSampleText(s)));
  const samples: SampleCase[] = [];
  const maxAttempts = targetCount * 8;

  for (let attempt = 0; attempt < maxAttempts && samples.length < targetCount; attempt++) {
    const rawInp = problem.generate(rng, usedConfig);
    const normInp = normalizeSampleText(rawInp);
    if (!normInp) continue;
    if (seen.has(normInp) && attempt < maxAttempts - (targetCount - samples.length)) {
      continue;
    }

    const inpForSolve = normalizeInputForValidator(normInp);
    const valErr = problem.validateInput(inpForSolve, usedConfig);
    if (valErr) continue;

    const rawOut = problem.solve(inpForSolve, usedConfig);
    const normOut = normalizeSampleText(rawOut);

    seen.add(normInp);
    samples.push({
      input: normInp,
      output: normOut,
      explanation: '',
    });
  }

  return {
    samples,
    usedConfig,
    seedUsed,
  };
}

/**
 * Validates and computes the reference output for a user-edited sample input.
 * Allows readable small samples even when the active generator config uses large stress bounds.
 */
export function solveSampleInput(problem: Problem, config: Config, rawInput: string): SolveSampleResult {
  const normalized = normalizeInputForValidator(rawInput);
  if (!normalized) {
    return {
      ok: false,
      error: 'Input trống.',
      matchesActiveConfig: false,
    };
  }

  const activeErr = problem.validateInput(normalized, config);
  if (!activeErr) {
    try {
      const output = normalizeSampleText(problem.solve(normalized, config));
      return { ok: true, output, matchesActiveConfig: true };
    } catch (e: any) {
      return {
        ok: false,
        error: e?.message || 'Solve failed',
        matchesActiveConfig: true,
      };
    }
  }

  // Fallback check against relaxed bounds so small statement examples solve cleanly
  const relaxed = config.clone();
  for (const param of problem.params) {
    if (param.type !== 'int') continue;
    if (param.key.startsWith('min') && !param.options) {
      relaxed.set(param.key, toBig(param.lo));
    } else if (param.key.startsWith('max') && !param.options) {
      relaxed.set(param.key, toBig(param.hi));
    }
  }

  const relaxedErr = problem.validateInput(normalized, relaxed);
  if (!relaxedErr) {
    try {
      const output = normalizeSampleText(problem.solve(normalized, relaxed));
      return {
        ok: true,
        output,
        matchesActiveConfig: false,
        constraintNote: activeErr,
      };
    } catch (e: any) {
      return {
        ok: false,
        error: e?.message || activeErr,
        matchesActiveConfig: false,
      };
    }
  }

  return {
    ok: false,
    error: activeErr,
    matchesActiveConfig: false,
  };
}

/**
 * Formats a problem statement with samples into clean Markdown.
 */
export function formatStatementMarkdown(
  statement: {
    name: string;
    code: string;
    timeLimitMs: number;
    memoryLimitMb: number;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    samples: SampleCase[];
  },
  language: 'vi' | 'en'
): string {
  const isEn = language === 'en';
  const samplesBlock = statement.samples
    .map((s, i) => {
      const inp = normalizeSampleText(s.input);
      const out = normalizeSampleText(s.output);
      const exp = s.explanation?.trim();
      return [
        `### ${isEn ? 'Sample' : 'Ví dụ'} ${i + 1}`,
        '',
        '**Input:**',
        '```',
        inp,
        '```',
        '',
        '**Output:**',
        '```',
        out,
        '```',
        exp ? `\n**${isEn ? 'Explanation' : 'Giải thích'}:** ${exp}\n` : '',
      ].join('\n');
    })
    .join('\n');

  return `# ${statement.name}

**${isEn ? 'Problem code' : 'Mã bài'}:** \`${statement.code}\` · **${isEn ? 'Time limit' : 'Thời gian'}:** ${statement.timeLimitMs} ms · **${isEn ? 'Memory limit' : 'Bộ nhớ'}:** ${statement.memoryLimitMb} MB

## ${isEn ? 'Description' : 'Mô tả'}
${statement.description}

## ${isEn ? 'Input format' : 'Định dạng input'}
${statement.inputFormat}

## ${isEn ? 'Output format' : 'Định dạng output'}
${statement.outputFormat}

## ${isEn ? 'Constraints' : 'Ràng buộc'}
${statement.constraints}

## ${isEn ? 'Samples' : 'Ví dụ'}
${samplesBlock || (isEn ? '_No samples yet._' : '_Chưa có ví dụ._')}

---
*Generated by OjGen 3.3.0*
`;
}
