export type HighlightMode = 'auto' | 'code' | 'json' | 'data' | 'plain';
export type ResolvedHighlightMode = Exclude<HighlightMode, 'auto'>;

export type TokenType =
  | 'comment'
  | 'keyword'
  | 'string'
  | 'number'
  | 'boolean'
  | 'operator'
  | 'punctuation'
  | 'key'
  | 'preprocessor'
  | 'identifier'
  | 'plain';

export interface HighlightToken {
  type: TokenType;
  value: string;
}

export interface HighlightedLine {
  lineNumber: number;
  tokens: HighlightToken[];
}

export interface HighlightOptions {
  mode?: HighlightMode;
  maxChars?: number;
  maxLines?: number;
}

export interface HighlightResult {
  mode: ResolvedHighlightMode;
  lines: HighlightedLine[];
  truncated: boolean;
  totalChars: number;
  totalLines: number;
  shownChars: number;
  shownLines: number;
}

export const DEFAULT_MAX_PREVIEW_CHARS = 60_000;
export const DEFAULT_MAX_PREVIEW_LINES = 2_000;

const CODE_KEYWORDS = new Set([
  // C / C++ / Java / JS / TS / Python / Rust / Go common keywords
  'alignas', 'alignof', 'and', 'as', 'async', 'auto', 'await', 'bool', 'break',
  'case', 'catch', 'char', 'class', 'const', 'constexpr', 'continue', 'def',
  'default', 'delete', 'do', 'double', 'elif', 'else', 'enum', 'except',
  'explicit', 'export', 'extends', 'extern', 'finally', 'float', 'fn', 'for',
  'from', 'function', 'global', 'if', 'implements', 'import', 'in', 'include',
  'inline', 'int', 'interface', 'is', 'lambda', 'let', 'long', 'match', 'mut',
  'namespace', 'new', 'nonlocal', 'not', 'operator', 'or', 'override', 'package',
  'pass', 'private', 'protected', 'pub', 'public', 'raise', 'readonly', 'return',
  'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'template', 'this',
  'throw', 'throws', 'try', 'type', 'typedef', 'typename', 'typeof', 'unsigned',
  'using', 'var', 'virtual', 'void', 'volatile', 'while', 'with', 'yield',
  // Common CP types / IO identifiers highlighted as keywords in code mode
  'vector', 'string', 'pair', 'map', 'set', 'unordered_map', 'unordered_set',
  'queue', 'stack', 'deque', 'priority_queue', 'cin', 'cout', 'endl', 'printf',
  'scanf', 'std', 'console', 'print', 'println', 'self',
]);

const BOOLEAN_OR_LITERAL_KEYWORDS = new Set([
  'true', 'false', 'null', 'nullptr', 'None', 'True', 'False', 'undefined', 'NaN', 'Infinity',
]);

const DATA_KEYWORDS = new Set([
  'YES', 'NO', 'yes', 'no', 'Yes', 'No',
  'TRUE', 'FALSE', 'true', 'false',
  'POSSIBLE', 'IMPOSSIBLE', 'possible', 'impossible',
  'WIN', 'LOSE', 'DRAW', 'ALICE', 'BOB', 'FIRST', 'SECOND',
  'NULL', 'null', 'NONE', 'none', 'INF', '-INF',
]);

export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

export function detectHighlightMode(content: string): ResolvedHighlightMode {
  const sample = content.slice(0, 4096).trim();
  if (!sample) return 'data';

  // JSON detection: starts with { or [ and looks like JSON key/array notation
  if (
    (sample.startsWith('{') || sample.startsWith('[')) &&
    (/["']\s*:/.test(sample) || /^[\[\]{}\s,0-9.\-"tfnulea]+$/i.test(sample))
  ) {
    try {
      if (content.length <= 65536) {
        JSON.parse(content);
        return 'json';
      }
    } catch {
      // Partial/truncated JSON still benefits from json highlighting if it has key-value syntax
      if (/^[{[]\s*("[^"]*"\s*:|[\d\-"'[{])/.test(sample) && /"\s*:/.test(sample)) {
        return 'json';
      }
    }
  }

  // Code detection: look for clear multi-signal code markers
  const codeSignals = [
    /(^|\n)\s*#\s*(include|define|ifdef|ifndef|pragma)\b/,
    /(^|\n)\s*(import|from|export|package|using namespace)\b/,
    /(^|\n)\s*(function|def|class|struct|interface|type|const|let|var)\s+[A-Za-z_]/,
    /\b(int\s+main\s*\(|return\s+[^;\n]+;|console\.log\s*\(|std::|cout\s*<<|cin\s*>>)/,
    /=>/,
    /\/\*[\s\S]*?\*\//,
    /(^|\n)\s*\/\/.*/,
    /;\s*(\n|$)/,
  ];

  let score = 0;
  for (const pattern of codeSignals) {
    if (pattern.test(sample)) {
      score += 1;
    }
  }

  if (score >= 2 || (score === 1 && /[{}()]/.test(sample))) {
    return 'code';
  }

  return 'data';
}

function pushToken(tokens: HighlightToken[], type: TokenType, value: string): void {
  if (!value) return;
  const prev = tokens[tokens.length - 1];
  if (prev && prev.type === type) {
    prev.value += value;
  } else {
    tokens.push({ type, value });
  }
}

function readQuotedString(line: string, start: number, quote: string): number {
  let i = start + 1;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === quote) {
      return i + 1;
    }
    i += 1;
  }
  return line.length;
}

function readNumber(line: string, start: number): number | null {
  const rest = line.slice(start);
  const match = rest.match(
    /^-?(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(?:[uUlLfFnN]*)/
  );
  if (!match) return null;
  const matched = match[0];
  if (matched === '-') return null;
  // Ensure trailing word characters don't accidentally stick a number to an identifier like 123abc
  const afterIdx = start + matched.length;
  if (afterIdx < line.length && /[A-Za-z_]/.test(line[afterIdx])) {
    return null;
  }
  return afterIdx;
}

function isUnaryMinusContext(line: string, pos: number): boolean {
  if (pos === 0) return true;
  const prev = line[pos - 1];
  return /[\s(\[{,:;=+\-*/<>!&|?~^]/.test(prev);
}

function tokenizeJsonLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /\s/.test(line[j])) j++;
      pushToken(tokens, 'plain', line.slice(i, j));
      i = j;
      continue;
    }

    if (ch === '"') {
      const end = readQuotedString(line, i, '"');
      const after = line.slice(end).trimStart();
      const tokenType: TokenType = after.startsWith(':') ? 'key' : 'string';
      pushToken(tokens, tokenType, line.slice(i, end));
      i = end;
      continue;
    }

    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      const end = readNumber(line, i);
      if (end !== null) {
        pushToken(tokens, 'number', line.slice(i, end));
        i = end;
        continue;
      }
    }

    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const tokenType: TokenType = BOOLEAN_OR_LITERAL_KEYWORDS.has(word) ? 'boolean' : 'identifier';
      pushToken(tokens, tokenType, word);
      i = j;
      continue;
    }

    if ('{}[],:'.includes(ch)) {
      pushToken(tokens, 'punctuation', ch);
      i += 1;
      continue;
    }

    pushToken(tokens, 'operator', ch);
    i += 1;
  }

  return tokens;
}

function tokenizeCodeLine(
  line: string,
  state: { inBlockComment: boolean }
): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;

  while (i < line.length) {
    if (state.inBlockComment) {
      const closeIdx = line.indexOf('*/', i);
      if (closeIdx === -1) {
        pushToken(tokens, 'comment', line.slice(i));
        break;
      }
      pushToken(tokens, 'comment', line.slice(i, closeIdx + 2));
      i = closeIdx + 2;
      state.inBlockComment = false;
      continue;
    }

    const ch = line[i];

    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /\s/.test(line[j])) j++;
      pushToken(tokens, 'plain', line.slice(i, j));
      i = j;
      continue;
    }

    // Line comments // or # (Python comment vs C preprocessor)
    if (ch === '/' && line[i + 1] === '/') {
      pushToken(tokens, 'comment', line.slice(i));
      break;
    }

    if (ch === '/' && line[i + 1] === '*') {
      const closeIdx = line.indexOf('*/', i + 2);
      if (closeIdx === -1) {
        pushToken(tokens, 'comment', line.slice(i));
        state.inBlockComment = true;
        break;
      }
      pushToken(tokens, 'comment', line.slice(i, closeIdx + 2));
      i = closeIdx + 2;
      continue;
    }

    if (ch === '#') {
      const trimmedBefore = line.slice(0, i).trim();
      const rest = line.slice(i);
      if (
        trimmedBefore === '' &&
        /^#\s*(include|define|undef|if|ifdef|ifndef|elif|else|endif|pragma|line|error)\b/.test(rest)
      ) {
        pushToken(tokens, 'preprocessor', rest);
      } else {
        pushToken(tokens, 'comment', rest);
      }
      break;
    }

    // Strings & chars
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = readQuotedString(line, i, ch);
      pushToken(tokens, 'string', line.slice(i, end));
      i = end;
      continue;
    }

    // Numbers
    if ((ch >= '0' && ch <= '9') || (ch === '-' && isUnaryMinusContext(line, i))) {
      const end = readNumber(line, i);
      if (end !== null) {
        pushToken(tokens, 'number', line.slice(i, end));
        i = end;
        continue;
      }
    }

    // Identifiers / Keywords / Booleans
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (BOOLEAN_OR_LITERAL_KEYWORDS.has(word)) {
        pushToken(tokens, 'boolean', word);
      } else if (CODE_KEYWORDS.has(word)) {
        pushToken(tokens, 'keyword', word);
      } else {
        pushToken(tokens, 'identifier', word);
      }
      i = j;
      continue;
    }

    // Punctuation brackets/delimiters
    if ('{}[](),.;:'.includes(ch)) {
      // Handle :: and -> as operators
      if (ch === ':' && line[i + 1] === ':') {
        pushToken(tokens, 'operator', '::');
        i += 2;
        continue;
      }
      pushToken(tokens, 'punctuation', ch);
      i += 1;
      continue;
    }

    // Operators
    if ('+-*/%=<>!&|^~?@'.includes(ch)) {
      let j = i + 1;
      while (j < line.length && '+-*/%=<>!&|^~?'.includes(line[j])) j++;
      pushToken(tokens, 'operator', line.slice(i, j));
      i = j;
      continue;
    }

    pushToken(tokens, 'plain', ch);
    i += 1;
  }

  return tokens;
}

function tokenizeDataLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /\s/.test(line[j])) j++;
      pushToken(tokens, 'plain', line.slice(i, j));
      i = j;
      continue;
    }

    // Comment lines starting with # or //
    if (ch === '#' && line.slice(0, i).trim() === '' && /^#\s+\S/.test(line.slice(i))) {
      pushToken(tokens, 'comment', line.slice(i));
      break;
    }
    if (ch === '/' && line[i + 1] === '/') {
      pushToken(tokens, 'comment', line.slice(i));
      break;
    }

    // Quoted strings in structured test inputs
    if (ch === '"') {
      const end = readQuotedString(line, i, '"');
      pushToken(tokens, 'string', line.slice(i, end));
      i = end;
      continue;
    }

    // Numeric tokens (standalone or preceded by whitespace/brackets/punctuation)
    if (
      (ch >= '0' && ch <= '9') ||
      (ch === '-' && isUnaryMinusContext(line, i))
    ) {
      const end = readNumber(line, i);
      if (end !== null) {
        // Confirm next character isn't mid-word unless delimiter
        pushToken(tokens, 'number', line.slice(i, end));
        i = end;
        continue;
      }
    }

    // Words / verdicts / identifiers
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_-]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (DATA_KEYWORDS.has(word)) {
        pushToken(tokens, 'boolean', word);
      } else {
        pushToken(tokens, 'identifier', word);
      }
      i = j;
      continue;
    }

    if ('{}[](),;:'.includes(ch)) {
      pushToken(tokens, 'punctuation', ch);
      i += 1;
      continue;
    }

    if ('+-*/%=<>!&|^~.#@'.includes(ch)) {
      pushToken(tokens, 'operator', ch);
      i += 1;
      continue;
    }

    pushToken(tokens, 'plain', ch);
    i += 1;
  }

  return tokens;
}

export function highlightContent(
  rawContent: string,
  options: HighlightOptions = {}
): HighlightResult {
  const normalized = normalizeLineEndings(rawContent);
  const maxChars = options.maxChars ?? DEFAULT_MAX_PREVIEW_CHARS;
  const maxLines = options.maxLines ?? DEFAULT_MAX_PREVIEW_LINES;
  const requestedMode = options.mode ?? 'auto';
  const mode: ResolvedHighlightMode =
    requestedMode === 'auto' ? detectHighlightMode(normalized) : requestedMode;

  const allLines = normalized.split('\n');
  const totalLines = allLines.length;
  const totalChars = normalized.length;

  const linesToProcess: string[] = [];
  let accumulatedChars = 0;
  let truncated = false;

  for (let idx = 0; idx < allLines.length; idx++) {
    if (idx >= maxLines) {
      truncated = true;
      break;
    }

    const line = allLines[idx];
    const sepCost = idx > 0 ? 1 : 0;

    if (accumulatedChars + sepCost + line.length > maxChars) {
      const remaining = Math.max(0, maxChars - accumulatedChars - sepCost);
      if (remaining > 0 || idx === 0) {
        linesToProcess.push(line.slice(0, remaining));
        accumulatedChars += sepCost + Math.min(line.length, remaining);
      }
      truncated = true;
      break;
    }

    linesToProcess.push(line);
    accumulatedChars += sepCost + line.length;
  }

  const codeState = { inBlockComment: false };
  const highlightedLines: HighlightedLine[] = linesToProcess.map((line, index) => {
    let tokens: HighlightToken[];
    if (mode === 'plain') {
      tokens = line.length > 0 ? [{ type: 'plain', value: line }] : [];
    } else if (mode === 'json') {
      tokens = tokenizeJsonLine(line);
    } else if (mode === 'code') {
      tokens = tokenizeCodeLine(line, codeState);
    } else {
      tokens = tokenizeDataLine(line);
    }

    return {
      lineNumber: index + 1,
      tokens,
    };
  });

  return {
    mode,
    lines: highlightedLines,
    truncated,
    totalChars,
    totalLines,
    shownChars: accumulatedChars,
    shownLines: highlightedLines.length,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
