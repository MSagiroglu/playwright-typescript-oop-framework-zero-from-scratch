import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'node:fs/promises';
import type { RunSummary } from '../excel/excelHelper';

/**
 * EN: Render a one-page PDF summary of a run using pdf-lib. Dependency-light and
 *     deterministic — no headless browser or templating engine.
 * TR: pdf-lib ile bir koşunun tek-sayfalık PDF özetini üretir. Az bağımlılık ve deterministik —
 *     headless tarayıcı ya da şablon motoru yok.
 */
export async function writeRunSummaryPdf(filePath: string, summary: RunSummary): Promise<void> {
  // EN: Create an A4 page and embed fonts. / TR: A4 sayfa oluştur ve fontları göm.
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // EN: A4 portrait in points / TR: puan cinsinden A4 dikey
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = 792; // EN: current vertical cursor / TR: mevcut dikey imleç

  // EN: Helvetica is WinAnsi-encoded and can't render arbitrary Unicode (e.g. "→", "—").
  //     Transliterate common cases and drop anything else.
  // TR: Helvetica WinAnsi kodludur ve rastgele Unicode'u (ör. "→", "—") çizemez.
  //     Yaygın durumları çevir, kalanı at.
  const toWinAnsi = (text: string): string =>
    text
      .replace(/→/g, '->')
      .replace(/[—–]/g, '-')
      .replace(/[^\x20-\x7E]/g, '');

  // EN: Draw one line and advance the cursor. / TR: Bir satır çiz ve imleci ilerlet.
  const draw = (text: string, size: number, useBold = false, color = rgb(0.1, 0.1, 0.1)) => {
    page.drawText(toWinAnsi(text), { x: margin, y, size, font: useBold ? bold : font, color });
    y -= size + 8;
  };

  // EN: Title + headline metrics. / TR: Başlık + ana metrikler.
  draw('Test Run Summary', 22, true);
  y -= 6;

  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
  draw(
    `Total: ${summary.total}    Passed: ${summary.passed}    Failed: ${summary.failed}    Skipped: ${summary.skipped}`,
    12,
  );
  draw(`Pass rate: ${passRate}%    Duration: ${Math.round(summary.durationMs / 1000)}s`, 12);
  y -= 10;

  // EN: Per-test list (failures in red), capped to fit one page. / TR: Test-başına liste (hatalar kırmızı), tek sayfaya sığacak şekilde.
  draw('Results', 14, true);
  const failColor = rgb(0.7, 0.1, 0.1);
  for (const row of summary.results.slice(0, 40)) {
    if (y < margin + 20) break; // EN: stop before overflowing the page / TR: sayfa taşmadan dur
    const passed = row.status === 'passed' || row.status === 'expected';
    draw(
      `[${row.status}] ${row.title}`.slice(0, 95),
      10,
      false,
      passed ? rgb(0.1, 0.1, 0.1) : failColor,
    );
  }

  // EN: Save the PDF to disk. / TR: PDF'i diske kaydet.
  const bytes = await pdf.save();
  await fs.writeFile(filePath, bytes);
}
