import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PROBLEMS, findProblem } from '../src/core/problems/allProblems';
import { Config } from '../src/core/types';
import {
  createSampleConfig,
  generateSampleTests,
  solveSampleInput,
  formatStatementMarkdown,
} from '../src/utils/sampleGenerator';

test('sampleGenerator', async (t) => {
  await t.test('generates valid, non-empty samples across all 19 built-in problem templates', () => {
    for (const problem of ALL_PROBLEMS) {
      const result = generateSampleTests({
        problem,
        config: problem.defaultConfig(),
        count: 2,
        seed: '123456',
        compact: true,
      });

      assert.equal(result.samples.length, 2, `Expected 2 samples for ${problem.id}`);
      for (const s of result.samples) {
        assert.ok(s.input.trim().length > 0, `Empty sample input for ${problem.id}`);
        assert.ok(s.output.trim().length > 0, `Empty sample output for ${problem.id}`);
        const solved = solveSampleInput(problem, result.usedConfig, s.input);
        assert.equal(solved.ok, true, `Sample solve failed for ${problem.id}: ${solved.error}`);
        assert.equal(solved.output, s.output);
      }
    }
  });

  await t.test('shrinks oversized stress configuration into readable compact sample dimensions', () => {
    const arrProb = findProblem('array')!;
    const hugeConfig = new Config({
      mode: 0n,
      minN: 100000n,
      maxN: 200000n,
      minVal: 1n,
      maxVal: 1000000000n,
      distinct: 1n,
      sorted: 0n,
    });

    const compactCfg = createSampleConfig(arrProb, hugeConfig, true);
    assert.equal(arrProb.validateConfig(compactCfg), null);
    assert.ok(compactCfg.get('maxN') <= 6n);
    assert.ok(compactCfg.get('minN') >= 1n && compactCfg.get('minN') <= compactCfg.get('maxN'));

    const result = generateSampleTests({
      problem: arrProb,
      config: hugeConfig,
      count: 2,
      seed: '2026',
      compact: true,
    });

    assert.equal(result.samples.length, 2);
    const lines = result.samples[0].input.split('\n');
    const n = Number(lines[0]);
    assert.ok(n >= 1 && n <= 6, `Expected compact n <= 6, got ${n}`);
    assert.equal(lines[1].split(' ').length, n);
  });

  await t.test('preserves MatrixProblem fixed-column invariant when layout = 1', () => {
    const matProb = findProblem('matrix')!;
    const cfg = new Config({
      layout: 1n,
      minN: 100n,
      maxN: 200n,
      minM: 50n,
      maxM: 50n,
      minVal: 1n,
      maxVal: 100000n,
    });

    const compactCfg = createSampleConfig(matProb, cfg, true);
    assert.equal(matProb.validateConfig(compactCfg), null);
    assert.equal(compactCfg.get('minM'), compactCfg.get('maxM'));
  });

  await t.test('is deterministic for a fixed seed and avoids duplicates', () => {
    const arrProb = findProblem('array')!;
    const a = generateSampleTests({
      problem: arrProb,
      config: arrProb.defaultConfig(),
      count: 3,
      seed: '9999',
      compact: true,
    });
    const b = generateSampleTests({
      problem: arrProb,
      config: arrProb.defaultConfig(),
      count: 3,
      seed: '9999',
      compact: true,
    });

    assert.deepEqual(a.samples, b.samples);
    const uniqueInputs = new Set(a.samples.map((s) => s.input));
    assert.equal(uniqueInputs.size, 3);
  });

  await t.test('solveSampleInput computes reference output even when active config has large bounds', () => {
    const arrProb = findProblem('array')!;
    const stressCfg = new Config({
      mode: 0n,
      minN: 1000n,
      maxN: 2000n,
      minVal: 1n,
      maxVal: 100n,
      distinct: 0n,
      sorted: 0n,
    });

    const solved = solveSampleInput(arrProb, stressCfg, '4\n2 4 6 8');
    assert.equal(solved.ok, true);
    assert.equal(solved.output, '20');
    assert.equal(solved.matchesActiveConfig, false);
    assert.ok(solved.constraintNote);

    const invalid = solveSampleInput(arrProb, stressCfg, '4\n2 4');
    assert.equal(invalid.ok, false);
    assert.ok(invalid.error);
  });

  await t.test('formatStatementMarkdown outputs all samples in both vi and en', () => {
    const stmt = {
      name: 'Sum Array',
      code: 'SUMARR',
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      description: 'Find sum.',
      inputFormat: 'N and A',
      outputFormat: 'Sum',
      constraints: 'N <= 10',
      samples: [{ input: '3\n1 2 3', output: '6', explanation: '1+2+3=6' }],
    };

    const enMd = formatStatementMarkdown(stmt, 'en');
    assert.ok(enMd.includes('## Samples'));
    assert.ok(enMd.includes('### Sample 1'));
    assert.ok(enMd.includes('**Explanation:** 1+2+3=6'));

    const viMd = formatStatementMarkdown(stmt, 'vi');
    assert.ok(viMd.includes('## Ví dụ'));
    assert.ok(viMd.includes('### Ví dụ 1'));
    assert.ok(viMd.includes('**Giải thích:** 1+2+3=6'));
  });
});
