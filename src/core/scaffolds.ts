import { Problem, Config } from './types';

export interface ScaffoldTemplate {
  key: string;
  displayName: string;
  fileName: string;
  source: string;
  readme: string;
}

export class AuthoringScaffolds {
  public static build(problem: Problem, config: Config): ScaffoldTemplate[] {
    const problemHint = problem.formatDescription
      .trimEnd()
      .split('\n')
      .map(line => '// ' + line)
      .join('\n');
    const configHint = problem
      .describeConfig(config)
      .trimEnd()
      .split('\n')
      .map(line => '// ' + line)
      .join('\n');

    return [
      {
        key: 'validator_cpp',
        displayName: 'Validator C++ (standalone)',
        fileName: 'validator.cpp',
        source: `#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv) {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ifstream file;
    if (argc > 1) file.open(argv[1]);
    istream& in = (argc > 1) ? static_cast<istream&>(file) : cin;
    if (!in) { cerr << "cannot open input\\n"; return 1; }

    // Ràng buộc cấu trúc theo khuôn:
${problemHint}
${configHint}

    // TODO: Đọc và kiểm tra các giới hạn
    string extra;
    if (in >> extra) { cerr << "extra token: " << extra << "\\n"; return 1; }
    return 0; // 0 = valid input
}
`,
        readme: 'Validator C++ độc lập: nhận argv[1] là đường dẫn file input hoặc đọc từ stdin. Trả về mã 0 nếu hợp lệ, mã 1 nếu vi phạm.',
      },
      {
        key: 'validator_py',
        displayName: 'Validator Python',
        fileName: 'validator.py',
        source: `#!/usr/bin/env python3
import sys
from pathlib import Path

# Ràng buộc cấu trúc theo khuôn:
${problem.formatDescription.trimEnd().split('\n').map(l => '# ' + l).join('\n')}

raw = Path(sys.argv[1]).read_text(encoding="utf-8") if len(sys.argv) > 1 else sys.stdin.read()
lines = raw.splitlines()

# TODO: Parse exact lines/tokens and enforce constraints
if not lines:
    sys.exit("Input file is empty")

print("Valid input")
sys.exit(0)
`,
        readme: 'Validator Python: kiểm tra tính hợp lệ của input. Trả về mã 0 khi hợp lệ.',
      },
      {
        key: 'checker_cpp',
        displayName: 'Checker C++ (Token Compare Starter)',
        fileName: 'checker.cpp',
        source: `#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv) {
    if (argc != 4) {
        cerr << "Usage: checker input contestant_output jury_output\\n";
        return 2;
    }
    ifstream input(argv[1]), contestant(argv[2]), jury(argv[3]);
    if (!input || !contestant || !jury) {
        cerr << "Cannot open checker files\\n";
        return 2;
    }

    vector<string> got, expected;
    for (string tok; contestant >> tok;) got.push_back(tok);
    for (string tok; jury >> tok;) expected.push_back(tok);

    if (got != expected) {
        cout << "Wrong Answer\\n";
        return 1;
    }
    cout << "Accepted\\n";
    return 0;
}
`,
        readme: 'Checker so sánh token chuẩn: so sánh từng từ của lời giải thí sinh và đáp án chuẩn.',
      },
      {
        key: 'checker_testlib',
        displayName: 'Checker C++ (Testlib)',
        fileName: 'checker_testlib.cpp',
        source: `#include "testlib.h"

int main(int argc, char* argv[]) {
    registerTestlibCmd(argc, argv);
    // inf: input, ouf: contestant output, ans: jury answer
    while (!ans.seekEof()) {
        string expected = ans.readToken();
        string got = ouf.readToken();
        if (expected != got) {
            quitf(_wa, "expected '%s', got '%s'", expected.c_str(), got.c_str());
        }
    }
    quitf(_ok, "answers match");
}
`,
        readme: 'Checker theo chuẩn testlib.h của Codeforces/Polygon.',
      },
      {
        key: 'checker_py_float',
        displayName: 'Checker Python (Sai số số thực)',
        fileName: 'checker_float.py',
        source: `#!/usr/bin/env python3
import math, sys
from pathlib import Path

if len(sys.argv) != 4:
    sys.exit(2)

_, contestant, jury = sys.argv[1:]
got = Path(contestant).read_text(encoding="utf-8").split()
expected = Path(jury).read_text(encoding="utf-8").split()

if len(got) != len(expected):
    sys.exit(1)

for a, b in zip(got, expected):
    try:
        x, y = float(a), float(b)
        if not (math.isfinite(x) and math.isfinite(y) and math.isclose(x, y, rel_tol=1e-6, abs_tol=1e-8)):
            sys.exit(1)
    except ValueError:
        if a != b:
            sys.exit(1)

print("Accepted")
sys.exit(0)
`,
        readme: 'So sánh từng số thực với rel_tol=1e-6, abs_tol=1e-8.',
      },
    ];
  }
}
