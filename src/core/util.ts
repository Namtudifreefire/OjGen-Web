export class Util {
  public static normalizeLineEndings(text: string): string {
    if (!text) return '';
    let s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!s.endsWith('\n')) s += '\n';
    return s;
  }

  public static splitLines(input: string): { lines: string[][]; error: string | null } {
    if (input.length === 0) return { lines: [], error: "File input rỗng." };
    if (!input.endsWith('\n')) return { lines: [], error: "File input không kết thúc bằng ký tự xuống dòng." };

    const rawLines = input.slice(0, -1).split('\n');
    const lines: string[][] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const lineNo = i + 1;
      const where = `Dòng ${lineNo}: `;

      if (line.length === 0) return { lines: [], error: where + "dòng trống không hợp lệ." };
      if (line.includes('\r')) return { lines: [], error: where + "chứa ký tự \\r (CRLF)." };
      if (line.startsWith(' ') || line.endsWith(' ')) return { lines: [], error: where + "có khoảng trắng thừa ở đầu/cuối dòng." };
      if (line.includes('  ')) return { lines: [], error: where + "có hai dấu cách liên tiếp." };
      if (line.includes('\t')) return { lines: [], error: where + "chứa ký tự tab." };

      lines.push(line.split(' '));
    }

    return { lines, error: null };
  }

  public static parseBigIntToken(tok: string, lo: bigint, hi: bigint, what: string): { value?: bigint; error?: string } {
    if (!/^-?\d+$/.test(tok)) {
      return { error: `${what}: '${tok}' không phải số nguyên hợp lệ.` };
    }
    try {
      const val = BigInt(tok);
      if (val < lo || val > hi) {
        return { error: `${what} = ${tok} nằm ngoài [${lo}, ${hi}].` };
      }
      return { value: val };
    } catch {
      return { error: `${what}: '${tok}' vượt quá giới hạn biểu diễn.` };
    }
  }

  public static formatNumber(n: number | bigint): string {
    return n.toString();
  }

  public static async sha256(text: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Simple fallback hash if crypto.subtle not available
    let h = 0n;
    for (let i = 0; i < text.length; i++) {
      h = (h * 31n + BigInt(text.charCodeAt(i))) & 0xFFFFFFFFFFFFFFFFn;
    }
    return h.toString(16).padStart(16, '0');
  }
}
