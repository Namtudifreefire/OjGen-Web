// Exact 64-bit Mersenne Twister (MT19937-64) matching C++ std::mt19937_64 and C# OjGen Rng.cs
export class Rng {
  private static readonly N = 312;
  private static readonly M = 156;
  private static readonly MatrixA = 0xB5026F5AA96619E9n;
  private static readonly UpperMask = 0xFFFFFFFF80000000n;
  private static readonly LowerMask = 0x7FFFFFFFn;
  private static readonly MASK64 = 0xFFFFFFFFFFFFFFFFn;

  private mt: BigInt64Array | bigint[] = new Array(Rng.N);
  private idx: number;

  constructor(seed: bigint | number | string = 0) {
    let s: bigint;
    if (typeof seed === 'bigint') {
      s = seed & Rng.MASK64;
    } else if (typeof seed === 'number') {
      s = BigInt(Math.floor(Math.abs(seed))) & Rng.MASK64;
    } else if (typeof seed === 'string') {
      const clean = seed.trim();
      if (/^-?\d+$/.test(clean)) {
        try {
          const parsed = BigInt(clean);
          s = (parsed < 0n ? -parsed : parsed) & Rng.MASK64;
        } catch {
          s = 0n;
        }
      } else if (clean) {
        // Deterministic 64-bit FNV-1a hash for string seeds
        let h = 14695981039346656037n;
        for (let i = 0; i < clean.length; i++) {
          h = (h ^ BigInt(clean.charCodeAt(i))) & Rng.MASK64;
          h = (h * 1099511628211n) & Rng.MASK64;
        }
        s = h;
      } else {
        s = 0n;
      }
    } else {
      s = 0n;
    }

    this.mt[0] = s;
    for (let i = 1; i < Rng.N; i++) {
      const prev = this.mt[i - 1];
      const term = (prev ^ (prev >> 62n)) & Rng.MASK64;
      this.mt[i] = ((6364136223846793005n * term + BigInt(i)) & Rng.MASK64);
    }
    this.idx = Rng.N;
  }

  private twist(): void {
    const { N, M, MatrixA, UpperMask, LowerMask, MASK64 } = Rng;
    let k = 0;
    for (; k < N - M; k++) {
      const x = (this.mt[k] & UpperMask) | (this.mt[k + 1] & LowerMask);
      this.mt[k] = (this.mt[k + M] ^ (x >> 1n) ^ ((x & 1n) !== 0n ? MatrixA : 0n)) & MASK64;
    }
    for (; k < N - 1; k++) {
      const x = (this.mt[k] & UpperMask) | (this.mt[k + 1] & LowerMask);
      this.mt[k] = (this.mt[k + (M - N)] ^ (x >> 1n) ^ ((x & 1n) !== 0n ? MatrixA : 0n)) & MASK64;
    }
    const xl = (this.mt[N - 1] & UpperMask) | (this.mt[0] & LowerMask);
    this.mt[N - 1] = (this.mt[M - 1] ^ (xl >> 1n) ^ ((xl & 1n) !== 0n ? MatrixA : 0n)) & MASK64;
    this.idx = 0;
  }

  public next(): bigint {
    if (this.idx >= Rng.N) {
      this.twist();
    }
    let y = this.mt[this.idx++];
    y ^= (y >> 29n) & 0x5555555555555555n;
    y ^= (y << 17n) & 0x71D67FFFEDA60000n;
    y ^= (y << 37n) & 0xFFF7EEE000000000n;
    y ^= y >> 43n;
    return y & Rng.MASK64;
  }

  /**
   * Uniform integer in [0, bound) with bound > 0 (rejection sampling).
   */
  public below(bound: bigint | number): bigint {
    const b = typeof bound === 'bigint' ? bound : BigInt(bound);
    if (b <= 0n) return 0n;
    const limit = Rng.MASK64 - (Rng.MASK64 % b);
    let x: bigint;
    do {
      x = this.next();
    } while (x >= limit);
    return x % b;
  }

  /**
   * Uniform integer in [lo, hi].
   */
  public range(lo: bigint | number, hi: bigint | number): bigint {
    let l = typeof lo === 'bigint' ? lo : BigInt(lo);
    let h = typeof hi === 'bigint' ? hi : BigInt(hi);
    if (l > h) {
      const tmp = l;
      l = h;
      h = tmp;
    }
    const span = h - l;
    const off = this.below(span + 1n);
    return l + off;
  }

  public rangeNumber(lo: number, hi: number): number {
    return Number(this.range(lo, hi));
  }

  public chance(percent: number): boolean {
    return Number(this.below(100n)) < percent;
  }

  public shuffle<T>(array: T[]): void {
    for (let i = array.length; i > 1; i--) {
      const j = Number(this.below(BigInt(i)));
      const tmp = array[i - 1];
      array[i - 1] = array[j];
      array[j] = tmp;
    }
  }

  public distinctValues(lo: bigint | number, hi: bigint | number, count: number): bigint[] {
    if (count <= 0) return [];
    let l = typeof lo === 'bigint' ? lo : BigInt(lo);
    let h = typeof hi === 'bigint' ? hi : BigInt(hi);
    if (l > h) {
      const tmp = l;
      l = h;
      h = tmp;
    }
    const span = h - l + 1n;
    if (span < BigInt(count)) {
      throw new Error(`Không thể chọn ${count} giá trị phân biệt trong khoảng [${lo}, ${hi}] (chỉ có ${span} giá trị).`);
    }

    // Direct range if span matches count exactly
    if (span === BigInt(count)) {
      const all: bigint[] = [];
      for (let i = 0n; i < span; i++) {
        all.push(l + i);
      }
      this.shuffle(all);
      return all;
    }

    if (span <= BigInt(count * 4 + 16)) {
      const all: bigint[] = [];
      for (let i = 0n; i < span; i++) {
        all.push(l + i);
      }
      this.shuffle(all);
      return all.slice(0, count);
    }

    const seen = new Set<string>();
    const res: bigint[] = [];
    let guard = 0;
    while (res.length < count && guard++ < count * 100) {
      const val = this.range(l, h);
      const k = val.toString();
      if (!seen.has(k)) {
        seen.add(k);
        res.push(val);
      }
    }
    // Fallback: if sampling exhausted guard limit, pick remaining values directly
    if (res.length < count) {
      for (let cur = l; cur <= h && res.length < count; cur++) {
        const k = cur.toString();
        if (!seen.has(k)) {
          seen.add(k);
          res.push(cur);
        }
      }
    }
    return res;
  }
}
