import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectHighlightMode,
  formatBytes,
  highlightContent,
  HighlightResult,
} from '../src/utils/syntaxHighlight';

function reconstructText(result: HighlightResult): string {
  return result.lines
    .map((line) => line.tokens.map((token) => token.value).join(''))
    .join('\n');
}

describe('syntaxHighlight', () => {
  it('detects competitive programming data, JSON, and source code accurately', () => {
    assert.equal(detectHighlightMode('5\n1 -2 3 40 500\n'), 'data');
    assert.equal(detectHighlightMode('YES\n'), 'data');
    assert.equal(detectHighlightMode('{"n": 4, "edges": [[1, 2], [2, 3]], "ok": true}'), 'json');
    assert.equal(
      detectHighlightMode('#include <iostream>\nint main() {\n  // hello\n  return 0;\n}\n'),
      'code'
    );
    assert.equal(
      detectHighlightMode('def solve(arr):\n  # sum\n  return sum(arr)\n'),
      'code'
    );
  });

  it('preserves lossless round-trip across code, json, data, and plain modes', () => {
    const codeSample = [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      '/* multi-line',
      '   block comment */',
      'int main() {',
      '  const string s = "hello \\"world\\""; // comment',
      '  long long x = -42 + 0x1f;',
      '  bool ok = true;',
      '  return 0;',
      '}',
    ].join('\n');

    for (const mode of ['auto', 'code', 'data', 'json', 'plain'] as const) {
      const res = highlightContent(codeSample, { mode });
      assert.equal(reconstructText(res), codeSample);
      assert.equal(res.truncated, false);
      assert.equal(res.lines[0].lineNumber, 1);
      assert.equal(res.lines[res.lines.length - 1].lineNumber, 10);
    }
  });

  it('tokenizes C++/JS code elements including preprocessor, multi-line comments, strings, numbers, and keywords', () => {
    const sample = [
      '#include <vector>',
      '/* start',
      'end */',
      'const msg = "ok\\n"; // note',
      'return -12.5e3;',
    ].join('\n');

    const result = highlightContent(sample, { mode: 'code' });
    assert.equal(result.mode, 'code');

    assert.deepEqual(result.lines[0].tokens, [
      { type: 'preprocessor', value: '#include <vector>' },
    ]);
    assert.deepEqual(result.lines[1].tokens, [
      { type: 'comment', value: '/* start' },
    ]);
    assert.deepEqual(result.lines[2].tokens, [
      { type: 'comment', value: 'end */' },
    ]);

    const line4Types = result.lines[3].tokens.map((t) => [t.type, t.value]);
    assert.deepEqual(line4Types, [
      ['keyword', 'const'],
      ['plain', ' '],
      ['identifier', 'msg'],
      ['plain', ' '],
      ['operator', '='],
      ['plain', ' '],
      ['string', '"ok\\n"'],
      ['punctuation', ';'],
      ['plain', ' '],
      ['comment', '// note'],
    ]);

    const line5Types = result.lines[4].tokens.map((t) => [t.type, t.value]);
    assert.deepEqual(line5Types, [
      ['keyword', 'return'],
      ['plain', ' '],
      ['number', '-12.5e3'],
      ['punctuation', ';'],
    ]);
  });

  it('tokenizes JSON keys, strings, numbers, booleans, and punctuation', () => {
    const json = '{\n  "count": 42,\n  "valid": false,\n  "items": ["a", "b"]\n}';
    const result = highlightContent(json, { mode: 'auto' });
    assert.equal(result.mode, 'json');
    assert.equal(reconstructText(result), json);

    const keyLine = result.lines[1].tokens.filter((t) => t.type !== 'plain');
    assert.deepEqual(keyLine, [
      { type: 'key', value: '"count"' },
      { type: 'punctuation', value: ':' },
      { type: 'number', value: '42' },
      { type: 'punctuation', value: ',' },
    ]);

    const boolLine = result.lines[2].tokens.filter((t) => t.type !== 'plain');
    assert.deepEqual(boolLine, [
      { type: 'key', value: '"valid"' },
      { type: 'punctuation', value: ':' },
      { type: 'boolean', value: 'false' },
      { type: 'punctuation', value: ',' },
    ]);
  });

  it('tokenizes competitive programming arrays, negative numbers, and verdicts', () => {
    const data = '5\n10 -20 0 3.14\nYES\n#..#\n';
    const result = highlightContent(data, { mode: 'data' });
    assert.equal(result.mode, 'data');
    assert.equal(reconstructText(result), data);

    const numTokens = result.lines[1].tokens.filter((t) => t.type === 'number');
    assert.deepEqual(
      numTokens.map((t) => t.value),
      ['10', '-20', '0', '3.14']
    );

    assert.deepEqual(result.lines[2].tokens, [{ type: 'boolean', value: 'YES' }]);
  });

  it('truncates safely when exceeding maxLines or maxChars', () => {
    const manyLines = Array.from({ length: 50 }, (_, i) => `line ${i + 1}`).join('\n');
    const lineLimited = highlightContent(manyLines, { maxLines: 10 });
    assert.equal(lineLimited.truncated, true);
    assert.equal(lineLimited.totalLines, 50);
    assert.equal(lineLimited.shownLines, 10);

    const longLine = '1234567890'.repeat(20);
    const charLimited = highlightContent(longLine, { maxChars: 25 });
    assert.equal(charLimited.truncated, true);
    assert.equal(charLimited.totalChars, 200);
    assert.equal(charLimited.shownChars, 25);
    assert.equal(reconstructText(charLimited), longLine.slice(0, 25));
  });

  it('normalizes CRLF endings and formats byte sizes cleanly', () => {
    const res = highlightContent('1\r\n2\r3', { mode: 'data' });
    assert.equal(res.lines.length, 3);
    assert.equal(reconstructText(res), '1\n2\n3');

    assert.equal(formatBytes(512), '512 B');
    assert.equal(formatBytes(2048), '2.0 KB');
    assert.equal(formatBytes(1024 * 1024 * 2), '2.00 MB');
  });
});
