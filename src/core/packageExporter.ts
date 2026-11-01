import JSZip from 'jszip';
import { GeneratedTestCase, ProblemStatement, Problem, Config } from './types';
import { Util } from './util';

export interface PackageOptions {
  format: 'OjGen' | 'Kattis';
  packageName: string;
  problem: Problem;
  config: Config;
  seed: string;
  statement?: ProblemStatement;
  tests: GeneratedTestCase[];
}

export class ProblemPackageExporter {
  public static async createZip(options: PackageOptions): Promise<Blob> {
    const zip = new JSZip();
    const { format, packageName, problem, config, seed, statement, tests } = options;
    const safeName = (packageName || 'problem').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'Kattis') {
      // Kattis Problem Package Format
      const dataFolder = zip.folder('data')!;
      const sampleFolder = dataFolder.folder('sample')!;
      const secretFolder = dataFolder.folder('secret')!;

      let sampleIdx = 1;
      let secretIdx = 1;

      for (const t of tests) {
        const isSample = t.tags.includes('sample') || t.groupName.toLowerCase().includes('sample');
        if (isSample) {
          sampleFolder.file(`${sampleIdx}.in`, t.input);
          sampleFolder.file(`${sampleIdx}.ans`, t.output);
          sampleIdx++;
        } else {
          secretFolder.file(`${secretIdx}.in`, t.input);
          secretFolder.file(`${secretIdx}.ans`, t.output);
          secretIdx++;
        }
      }

      // problem.yaml
      const yaml = `problem_format_version: '2025-09'
name: '${statement?.name || problem.title}'
author: 'OjGen Web'
source: 'OjGen Problem Authoring Suite'
limits:
  time: ${(statement?.timeLimitMs || 1000) / 1000}
  memory: ${statement?.memoryLimitMb || 256}
`;
      zip.file('problem.yaml', yaml);

      // statement
      if (statement) {
        const doc = `# ${statement.name} (${statement.code})

Thời gian chạy: ${(statement.timeLimitMs || 1000) / 1000}s
Giới hạn bộ nhớ: ${statement.memoryLimitMb || 256}MB

## Mô tả
${statement.description}

## Định dạng dữ liệu vào
${statement.inputFormat}

## Định dạng dữ liệu ra
${statement.outputFormat}

## Ràng buộc
${statement.constraints}
`;
        zip.folder('problem_statement')!.file('problem.vi.md', doc);
      }
    } else {
      // Standard OjGen Format
      const testsFolder = zip.folder('tests')!;
      const checksums: string[] = [];
      const csvRows: string[] = ['index,file_inp,file_out,group,bytes_in,bytes_out,tags'];

      for (const t of tests) {
        const padIndex = String(t.index).padStart(String(tests.length).length > 2 ? 3 : 2, '0');
        const inpName = `test${padIndex}.inp`;
        const outName = `test${padIndex}.out`;

        testsFolder.file(inpName, t.input);
        testsFolder.file(outName, t.output);

        const inHash = await Util.sha256(t.input);
        const outHash = await Util.sha256(t.output);
        checksums.push(`${inHash}  tests/${inpName}`);
        checksums.push(`${outHash}  tests/${outName}`);

        csvRows.push(`${t.index},${inpName},${outName},"${t.groupName}",${t.input.length},${t.output.length},"${t.tags.join(';')}"`);
      }

      zip.file('PACKAGE_SHA256SUMS.txt', checksums.join('\n') + '\n');
      zip.file('inventory.csv', csvRows.join('\n') + '\n');

      const provenance = {
        tool: 'OjGen Web',
        version: '3.3.0',
        exportedAt: new Date().toISOString(),
        problemId: problem.id,
        problemTitle: problem.title,
        seed,
        testCount: tests.length,
        config: config.toJSON(),
      };
      zip.file('provenance.json', JSON.stringify(provenance, null, 2));

      if (statement) {
        const stmtContent = `# ${statement.name} [${statement.code}]

* Thời gian: ${statement.timeLimitMs} ms
* Bộ nhớ: ${statement.memoryLimitMb} MB

### Đề bài
${statement.description}

### Input
${statement.inputFormat}

### Output
${statement.outputFormat}

### Ràng buộc
${statement.constraints}
`;
        zip.file('statement.md', stmtContent);
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  public static downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
