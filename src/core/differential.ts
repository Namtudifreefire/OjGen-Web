import { Problem, Config } from './types';
import { Rng } from './rng';

export interface DifferentialFailure {
  testIndex: number;
  input: string;
  referenceOutput: string;
  candidateOutput: string;
  reason: string;
  minimizedInput: string;
  minimizationTrials: number;
}

export interface DifferentialResult {
  ok: boolean;
  tested: number;
  mismatches: number;
  failures: DifferentialFailure[];
}

export class DifferentialTester {
  public static normalizeOutput(text: string): string {
    return text.trim().split(/\s+/).join(' ');
  }

  public static run(
    problem: Problem,
    config: Config,
    testCount: number,
    candidateFn: (input: string) => string,
    minimize = true
  ): DifferentialResult {
    const rng = new Rng(42);
    const failures: DifferentialFailure[] = [];

    for (let i = 0; i < testCount; i++) {
      const input = problem.generate(rng, config);
      const refOut = problem.solve(input, config);
      let candOut = '';
      try {
        candOut = candidateFn(input);
      } catch (err: any) {
        candOut = `[RUNTIME_ERROR: ${err.message}]`;
      }

      const refNorm = DifferentialTester.normalizeOutput(refOut);
      const candNorm = DifferentialTester.normalizeOutput(candOut);

      if (refNorm !== candNorm) {
        let minimized = input;
        let trials = 0;

        if (minimize) {
          const shrinkRes = DifferentialTester.shrink(problem, config, input, candidateFn);
          minimized = shrinkRes.input;
          trials = shrinkRes.trials;
        }

        failures.push({
          testIndex: i + 1,
          input,
          referenceOutput: refOut.trim(),
          candidateOutput: candOut.trim(),
          reason: candOut.startsWith('[RUNTIME_ERROR') ? 'Lỗi thực thi (Runtime Error)' : 'Kết quả khác nhau (Wrong Answer)',
          minimizedInput: minimized,
          minimizationTrials: trials,
        });

        if (failures.length >= 10) break; // Limit reported failures
      }
    }

    return {
      ok: failures.length === 0,
      tested: testCount,
      mismatches: failures.length,
      failures,
    };
  }

  private static shrink(
    problem: Problem,
    config: Config,
    initialInput: string,
    candidateFn: (input: string) => string
  ): { input: string; trials: number } {
    let current = initialInput;
    let trials = 0;
    const maxTrials = 64;

    const checkStillFails = (candidateInput: string): boolean => {
      if (problem.validateInput(candidateInput, config) !== null) return false;
      const rOut = DifferentialTester.normalizeOutput(problem.solve(candidateInput, config));
      try {
        const cOut = DifferentialTester.normalizeOutput(candidateFn(candidateInput));
        return rOut !== cOut;
      } catch {
        return true;
      }
    };

    // Heuristic reduction for array-like inputs (n on line 1, array on line 2)
    const lines = current.trim().split('\n');
    if (lines.length === 2 && !lines[0].includes(' ')) {
      const originalArr = lines[1].trim().split(/\s+/);
      let arr = [...originalArr];

      // Try halving or dropping elements
      while (arr.length > 2 && trials < maxTrials) {
        trials++;
        const half = arr.slice(0, Math.floor(arr.length / 2));
        const testInput = `${half.length}\n${half.join(' ')}\n`;
        if (checkStillFails(testInput)) {
          arr = half;
          current = testInput;
        } else {
          break;
        }
      }

      // Try reducing numbers towards 0
      for (let i = 0; i < arr.length && trials < maxTrials; i++) {
        if (!/^-?\d+$/.test(arr[i])) continue;
        try {
          const origVal = BigInt(arr[i]);
          if (origVal !== 0n) {
            trials++;
            const testArr = [...arr];
            testArr[i] = '0';
            const testInput = `${testArr.length}\n${testArr.join(' ')}\n`;
            if (checkStillFails(testInput)) {
              arr = testArr;
              current = testInput;
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    return { input: current, trials };
  }
}
