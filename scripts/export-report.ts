/**
 * EN: Reads Playwright's JSON results and exports an Excel workbook and a PDF summary —
 *     the reporting side of the Excel/PDF libraries.
 * TR: Playwright'ın JSON sonuçlarını okur ve bir Excel çalışma kitabı + PDF özeti dışa aktarır —
 *     Excel/PDF kütüphanelerinin raporlama tarafı.
 *
 *   npm test && npm run export:report
 */
import fs from 'node:fs';
import path from 'node:path';
import { writeRunSummary, type RunSummary, type TestResultRow } from '../utils/excel/excelHelper';
import { writeRunSummaryPdf } from '../utils/pdf/pdfReporter';

// EN: Minimal shapes for the parts of the Playwright JSON we read. / TR: Okuduğumuz Playwright JSON parçalarının minimal tipleri.
interface JsonSpec {
  title: string;
  ok: boolean;
  tests: { results: { status: string; duration: number }[] }[];
}
interface JsonSuite {
  specs: JsonSpec[];
  suites?: JsonSuite[];
}
interface JsonReport {
  stats: { duration: number; expected: number; unexpected: number; flaky: number; skipped: number };
  suites: JsonSuite[];
}

async function main(): Promise<void> {
  const resultsPath = path.resolve('test-results/results.json');
  if (!fs.existsSync(resultsPath)) {
    throw new Error(`No results at ${resultsPath}. Run the tests first (e.g. \`npm test\`).`);
  }

  // EN: Parse the JSON report. / TR: JSON raporu ayrıştır.
  const report = JSON.parse(fs.readFileSync(resultsPath, 'utf-8')) as JsonReport;

  // EN: Flatten nested suites into one row per spec. / TR: İç içe suite'leri, spec başına bir satıra düzleştir.
  const rows: TestResultRow[] = [];
  const collect = (suites: JsonSuite[]): void => {
    for (const suite of suites) {
      for (const spec of suite.specs) {
        const result = spec.tests[0]?.results[0];
        rows.push({
          title: spec.title,
          status: spec.ok ? 'passed' : (result?.status ?? 'failed'),
          durationMs: result?.duration ?? 0,
        });
      }
      if (suite.suites) collect(suite.suites);
    }
  };
  collect(report.suites);

  // EN: Aggregate headline stats. / TR: Ana istatistikleri topla.
  const summary: RunSummary = {
    total:
      report.stats.expected + report.stats.unexpected + report.stats.skipped + report.stats.flaky,
    passed: report.stats.expected,
    failed: report.stats.unexpected,
    skipped: report.stats.skipped,
    durationMs: report.stats.duration,
    results: rows,
  };

  // EN: Write both artifacts into reports/. / TR: İki dosyayı da reports/ içine yaz.
  fs.mkdirSync('reports', { recursive: true });
  await writeRunSummary('reports/summary.xlsx', summary);
  await writeRunSummaryPdf('reports/summary.pdf', summary);

  console.log(
    `Exported reports/summary.xlsx and reports/summary.pdf ` +
      `(${summary.passed}/${summary.total} passed).`,
  );
}

void main();
