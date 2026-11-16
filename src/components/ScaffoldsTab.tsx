import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { problemTitle } from '../i18n/problemLabels';
import { Problem } from '../core/types';
import { Save, Copy, FileCode, Terminal, AlertCircle, CheckCircle2, Zap, Code, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardDivider, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Textarea, Select } from './ui/Input';
import { Badge } from './ui/Badge';

interface ScaffoldsTabProps {
  currentProblem: Problem;
  onAddLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

const VALIDATOR_TEMPLATES = {
  cpp: `// Validator cho ${''} - Tự động sinh bởi OjGen
#include <bits/stdc++.h>
using namespace std;

class Validator {
private:
    string input_data;
    size_t pos = 0;

    // Đọc token tiếp theo (bỏ qua whitespace)
    string nextToken() {
        while (pos < input_data.size() && isspace(input_data[pos])) pos++;
        if (pos >= input_data.size()) return "";
        size_t start = pos;
        while (pos < input_data.size() && !isspace(input_data[pos])) pos++;
        return input_data.substr(start, pos - start);
    }

    // Đọc số nguyên
    long long nextLong() {
        string tok = nextToken();
        if (tok.empty()) throw runtime_error("Unexpected EOF");
        return stoll(tok);
    }

    // Đọc số thực
    double nextDouble() {
        string tok = nextToken();
        if (tok.empty()) throw runtime_error("Unexpected EOF");
        return stod(tok);
    }

    // Đọc chuỗi
    string nextString() {
        return nextToken();
    }

public:
    Validator(const string& input) : input_data(input) {}

    void validate() {
        // TODO: Implement validation logic theo cấu trúc input
        // Ví dụ:
        // long long N = nextLong();
        // assert(1 <= N && N <= 100000);
        // for (int i = 0; i < N; i++) {
        //     long long x = nextLong();
        //     assert(1 <= x && x <= 1000000000);
        // }
        // assert(nextToken().empty()); // Không còn token thừa
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
    try {
        Validator validator(input);
        validator.validate();
        return 0; // AC
    } catch (const exception& e) {
        cerr << "Validation failed: " << e.what() << endl;
        return 1; // WA
    }
}`,

  python: `# Validator cho ${''} - Tự động sinh bởi OjGen
import sys

def validate():
    data = sys.stdin.read().strip().split()
    if not data:
        return

    it = iter(data)

    def next_token():
        try:
            return next(it)
        except StopIteration:
            raise ValueError("Unexpected EOF")

    def next_int():
        return int(next_token())

    def next_float():
        return float(next_token())

    # TODO: Implement validation logic
    # N = next_int()
    # assert 1 <= N <= 100000
    # for _ in range(N):
    #     x = next_int()
    #     assert 1 <= x <= 1000000000
    # try:
    #     next_token()
    #     raise ValueError("Extra tokens in input")
    # except StopIteration:
    #     pass

    # Consume all tokens
    list(it)

if __name__ == "__main__":
    try:
        validate()
        sys.exit(0)
    except Exception as e:
        print(f"Validation failed: {e}", file=sys.stderr)
        sys.exit(1)
`,

  javascript: `// Validator cho ${''} - Tự động sinh bởi OjGen
const fs = require('fs');

function validate() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length === 0) return;

    let pos = 0;

    function nextToken() {
        if (pos >= input.length) throw new Error("Unexpected EOF");
        return input[pos++];
    }

    function nextInt() {
        return parseInt(nextToken(), 10);
    }

    function nextFloat() {
        return parseFloat(nextToken());
    }

    // TODO: Implement validation logic
    // const N = nextInt();
    // if (!(1 <= N && N <= 100000)) throw new Error("N out of range");
    // for (let i = 0; i < N; i++) {
    //     const x = nextInt();
    //     if (!(1 <= x && x <= 1000000000)) throw new Error("x out of range");
    // }
    // if (pos < input.length) throw new Error("Extra tokens in input");
}

try {
    validate();
    process.exit(0);
} catch (e) {
    console.error("Validation failed:", e.message);
    process.exit(1);
}
`,
};

const CHECKER_TEMPLATES = {
  token_cpp: `// Token Checker (Exact match) - Tự động sinh bởi OjGen
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 4) return 1;
    ifstream in(argv[1]), out(argv[2]), ans(argv[3]);

    string token_out, token_ans;
    while (out >> token_out) {
        if (!(ans >> token_ans)) {
            cerr << "Extra output token: " << token_out << endl;
            return 1; // WA
        }
        if (token_out != token_ans) {
            cerr << "Token mismatch: expected '" << token_ans << "', got '" << token_out << "'" << endl;
            return 1; // WA
        }
    }
    if (ans >> token_ans) {
        cerr << "Missing output token: " << token_ans << endl;
        return 1; // WA
    }
    return 0; // AC
}`,

  float_cpp: `// Float Checker (Relative/Absolute tolerance) - Tự động sinh bởi OjGen
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-6;
const double ABS_EPS = 1e-9;

bool equal_double(double a, double b) {
    if (isnan(a) || isnan(b)) return false;
    if (isinf(a) || isinf(b)) return a == b;
    if (a == b) return true;
    double diff = fabs(a - b);
    double mx = max(fabs(a), fabs(b));
    return diff <= ABS_EPS || diff / mx <= EPS;
}

int main(int argc, char* argv[]) {
    if (argc < 4) return 1;
    ifstream in(argv[1]), out(argv[2]), ans(argv[3]);

    double val_out, val_ans;
    while (out >> val_out) {
        if (!(ans >> val_ans)) {
            cerr << "Extra output value: " << val_out << endl;
            return 1;
        }
        if (!equal_double(val_out, val_ans)) {
            cerr << "Float mismatch: expected " << val_ans << ", got " << val_out << endl;
            return 1;
        }
    }
    if (ans >> val_ans) {
        cerr << "Missing output value: " << val_ans << endl;
        return 1;
    }
    return 0;
}`,

  custom_js: `// Custom Checker (JavaScript) - Tự động sinh bởi OjGen
// Hàm check(input, output, expected) trả về true nếu đúng

function check(input, output, expected) {
    // So sánh token đơn giản
    const outTokens = output.trim().split(/\\s+/);
    const expTokens = expected.trim().split(/\\s+/);

    if (outTokens.length !== expTokens.length) {
        return false;
    }

    for (let i = 0; i < outTokens.length; i++) {
        if (outTokens[i] !== expTokens[i]) {
            return false;
        }
    }
    return true;
}

// Export cho Node.js
if (typeof module !== 'undefined') {
    module.exports = { check };
}
`,

  testlib_cpp: `// Testlib Checker (C++) - Tự động sinh bởi OjGen
// Yêu cầu: testlib.h (https://github.com/MikeMirzayanov/testlib)
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {
    registerTestlibCmd(argc, argv);

    // TODO: Implement custom checker logic using testlib
    // Ví dụ:
    // int n = inf.readInt();
    // vector<int> a(n);
    // for (int i = 0; i < n; i++) a[i] = inf.readInt();
    //
    // int participant_ans = ouf.readInt();
    // int jury_ans = ans.readInt();
    //
    // if (participant_ans != jury_ans) {
    //     quitf(_wa, "Answer mismatch: expected %d, got %d", jury_ans, participant_ans);
    // }
    //
    // quitf(_ok, "Correct answer: %d", participant_ans);

    quitf(_ok, "Default testlib checker");
}`,
};

const TEMPLATE_CATEGORIES = [
  { id: 'validator', label: 'Validator', icon: CheckCircle2, color: 'var(--color-success)' },
  { id: 'checker_token', label: 'Checker: Token', icon: FileCode, color: 'var(--color-primary-500)' },
  { id: 'checker_float', label: 'Checker: Float', icon: AlertCircle, color: 'var(--color-warning)' },
  { id: 'checker_custom', label: 'Checker: Custom JS', icon: Zap, color: 'var(--color-info)' },
  { id: 'checker_testlib', label: 'Checker: Testlib C++', icon: Terminal, color: '#a78bfa' },
];

export const ScaffoldsTab: React.FC<ScaffoldsTabProps> = ({ currentProblem, onAddLog }) => {
  const { t, language: uiLanguage } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<'validator' | 'checker_token' | 'checker_float' | 'checker_custom' | 'checker_testlib'>('validator');
  const [language, setLanguage] = useState<'cpp' | 'python' | 'javascript'>('cpp');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateCode();
  }, [activeCategory, language, currentProblem, uiLanguage]);

  const generateCode = () => {
    let code = '';
    if (activeCategory === 'validator') {
      const template = VALIDATOR_TEMPLATES[language];
      code = template.replace('${currentProblem}', currentProblem.title);
    } else {
      const checkerKeys = {
        checker_token: 'token_cpp',
        checker_float: 'float_cpp',
        checker_custom: 'custom_js',
        checker_testlib: 'testlib_cpp',
      } as const;
      const template = CHECKER_TEMPLATES[checkerKeys[activeCategory]];
      code = template;
    }
    if (uiLanguage === 'en') {
      const comments: Record<string, string> = {
        'Validator cho': 'Validator for', 'Tự động sinh bởi OjGen': 'Generated by OjGen',
        'Đọc token tiếp theo (bỏ qua whitespace)': 'Read the next token (skip whitespace)',
        'Đọc số nguyên': 'Read an integer', 'Đọc số thực': 'Read a floating-point number',
        'Đọc chuỗi': 'Read a string', 'Implement validation logic theo cấu trúc input': 'Implement validation for the input format',
        'Ví dụ:': 'Example:', 'Không còn token thừa': 'No remaining tokens',
        'Hàm check(input, output, expected) trả về true nếu đúng': 'check(input, output, expected) returns true for a correct answer',
        'So sánh token đơn giản': 'Simple token comparison',
        'Yêu cầu:': 'Requires:',
      };
      for (const [vi, en] of Object.entries(comments)) code = code.replaceAll(vi, en);
    }
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onAddLog(uiLanguage === 'en' ? 'Code copied to clipboard.' : 'Đã chép code vào clipboard', 'success');
  };

  const downloadFile = () => {
    const ext = activeCategory === 'validator' || activeCategory === 'checker_testlib' ? 'cpp' :
                activeCategory === 'checker_custom' ? 'js' : 'cpp';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCategory}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onAddLog(uiLanguage === 'en' ? `Downloaded ${activeCategory}.${ext}` : `Đã tải xuống ${activeCategory}.${ext}`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
      <Card>
        <CardHeader
          title={t('scaffolds.title')}
          subtitle={t('scaffolds.subtitle', { problem: problemTitle(currentProblem, uiLanguage) })}
          icon={<FileCode className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />}
        />

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 'var(--spacing-1)', borderBottom: '1px solid var(--surface-border)', marginBottom: 'var(--spacing-4)', overflowX: 'auto', overflowY: 'hidden' }}>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              style={{
                display: 'flex',
                flexShrink: 0,
                alignItems: 'center',
                gap: 'var(--spacing-1-5)',
                padding: 'var(--spacing-2) var(--spacing-3)',
                fontSize: 'var(--text-sm)',
                fontWeight: activeCategory === cat.id ? 'var(--font-semibold)' : 'var(--font-medium)',
                color: activeCategory === cat.id ? cat.color : 'var(--surface-text-secondary)',
                backgroundColor: activeCategory === cat.id ? `color-mix(in srgb, ${cat.color} 9%, transparent)` : 'transparent',
                border: 'none',
                borderBottom: activeCategory === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Options */}
        {(activeCategory === 'validator') && (
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)' }}>{t('scaffolds.language')}:</span>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                options={[
                  { value: 'cpp', label: 'C++17' },
                  { value: 'python', label: 'Python 3' },
                  { value: 'javascript', label: 'JavaScript (Node.js)' },
                ]}
                style={{ width: 'auto', minWidth: '180px' }}
              />
            </div>
          </div>
        )}

        {/* Code Editor */}
        <div style={{ backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-default)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-3) var(--spacing-4)', backgroundColor: 'var(--surface-overlay)', borderBottom: '1px solid var(--surface-border)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--surface-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {activeCategory === 'validator' ? `validator.${language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : 'js'}` : `${activeCategory}.${activeCategory === 'checker_custom' ? 'js' : 'cpp'}`}
            </span>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button variant="ghost" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />} onClick={copyToClipboard} disabled={copied}>
                {copied ? t('scaffolds.copied') : t('scaffolds.copy')}
              </Button>
              <Button variant="secondary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />} onClick={downloadFile}>
                {t('scaffolds.download')}
              </Button>
            </div>
          </div>
          <pre style={{ margin: 0, padding: 'var(--spacing-4)', maxHeight: '500px', overflow: 'auto', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--surface-text-primary)', lineHeight: '1.6' }}>
            <code>{generatedCode}</code>
          </pre>
        </div>

        {/* Usage Guide */}
        <CardDivider />
        <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--surface-overlay)', borderRadius: 'var(--radius-default)', border: '1px solid var(--surface-border)' }}>
          <h4 style={{ margin: '0 0 var(--spacing-3) 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--surface-text-primary)' }}>
            {t('scaffolds.usageGuide')}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <div>
              <h5 style={{ margin: '0 0 var(--spacing-2) 0', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--color-primary-500)' }}>Validator (Input Validator)</h5>
              <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)', lineHeight: '1.8' }}>
                <li>{t('scaffolds.validatorItems.0')}</li>
                <li>{t('scaffolds.validatorItems.1')}</li>
                <li>{t('scaffolds.validatorItems.2')}</li>
                <li>Compile: <code style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'var(--surface-sunken)', padding: '1px 4px', borderRadius: 'var(--radius-sm)' }}>g++ -std=c++17 -O2 validator.cpp -o validator</code></li>
              </ul>
            </div>
            <div>
              <h5 style={{ margin: '0 0 var(--spacing-2) 0', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--color-primary-500)' }}>Checker (Output Checker)</h5>
              <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--surface-text-secondary)', lineHeight: '1.8' }}>
                <li>{t('scaffolds.checkerItems.0')}</li>
                <li>{t('scaffolds.checkerItems.1')}</li>
                <li>{t('scaffolds.checkerItems.2')}</li>
                <li>{t('scaffolds.checkerItems.3')}</li>
                <li>{t('scaffolds.checkerItems.4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
