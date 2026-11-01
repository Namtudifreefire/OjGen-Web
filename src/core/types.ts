import { Rng } from './rng';

export type ParamType = 'int' | 'bool' | 'text';

export interface ParamOption {
  value: number | bigint;
  label: string;
}

export interface ParamSpec {
  key: string;
  label: string;
  guiLabel?: string;
  type: ParamType;
  def: number | bigint;
  lo: number | bigint;
  hi: number | bigint;
  defText?: string;
  help?: string;
  options?: ParamOption[];
  choices?: string[];
  multiline?: boolean;
  visibleWhen?: (cfg: Config) => boolean;
}

export class Config {
  public ints: Record<string, bigint> = {};
  public texts: Record<string, string> = {};

  constructor(ints: Record<string, bigint | number> = {}, texts: Record<string, string> = {}) {
    for (const [k, v] of Object.entries(ints)) {
      this.ints[k] = typeof v === 'bigint' ? v : BigInt(v);
    }
    for (const [k, v] of Object.entries(texts)) {
      this.texts[k] = v;
    }
  }

  public get(key: string, defaultVal = 0n): bigint {
    return this.ints[key] ?? defaultVal;
  }

  public getNum(key: string, defaultVal = 0): number {
    return Number(this.get(key, BigInt(defaultVal)));
  }

  public getBool(key: string): boolean {
    return this.get(key) !== 0n;
  }

  public getText(key: string, defaultVal = ''): string {
    return this.texts[key] ?? defaultVal;
  }

  public set(key: string, val: bigint | number): void {
    this.ints[key] = typeof val === 'bigint' ? val : BigInt(val);
  }

  public setText(key: string, val: string): void {
    this.texts[key] = val;
  }

  public clone(): Config {
    const next = new Config();
    for (const [k, v] of Object.entries(this.ints)) {
      next.ints[k] = v;
    }
    for (const [k, v] of Object.entries(this.texts)) {
      next.texts[k] = v;
    }
    return next;
  }

  public toJSON(): { ints: Record<string, string>; texts: Record<string, string> } {
    const rawInts: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.ints)) {
      rawInts[k] = v.toString();
    }
    return { ints: rawInts, texts: { ...this.texts } };
  }

  public static fromJSON(data: any): Config {
    const cfg = new Config();
    if (data?.ints) {
      for (const [k, v] of Object.entries(data.ints)) {
        try {
          cfg.set(k, BigInt(v as string));
        } catch {
          // ignore
        }
      }
    }
    if (data?.texts) {
      for (const [k, v] of Object.entries(data.texts)) {
        cfg.setText(k, String(v));
      }
    }
    return cfg;
  }
}

export interface Problem {
  id: string;
  title: string;
  mainCategory: string;
  formatDescription: string;
  params: ParamSpec[];
  defaultConfig(): Config;
  validateConfig(cfg: Config): string | null;
  generate(rng: Rng, cfg: Config): string;
  validateInput(input: string, cfg: Config): string | null;
  solve(input: string, cfg?: Config): string;
  describeConfig(cfg: Config): string;
  adjustConfig?(cfg: Config, changedKey: string): void;
}

export interface TestGroupSpec {
  id?: string;
  name: string;
  testCount: number;
  seed?: string;
  score?: number;
  prerequisites?: string[];
  coverageTags: string[];
  cfg: Config;
}

export interface ManualTestCase {
  id: string;
  name: string;
  input: string;
  output?: string;
  isSample: boolean;
  isValid?: boolean;
  validationError?: string;
}

export interface GeneratedTestCase {
  index: number;
  fileName: string;
  groupName: string;
  input: string;
  output: string;
  seed: string;
  bytes: number;
  tags: string[];
  sha256?: string;
  metrics?: Record<string, number | string>;
}

export interface ProblemStatement {
  name: string;
  code: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  samples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
}

export interface OjProjectData {
  version: number;
  savedDate: string;
  problemId: string;
  problemName: string;
  problemCode: string;
  testCount: number;
  seed: string;
  solutionName: string;
  config: { ints: Record<string, string>; texts: Record<string, string> };
  groups: Array<{
    name: string;
    testCount: number;
    seed?: string;
    score?: number;
    prerequisites?: string[];
    coverageTags: string[];
    config: { ints: Record<string, string>; texts: Record<string, string> };
  }>;
  manualTests: ManualTestCase[];
  statement?: ProblemStatement;
}
