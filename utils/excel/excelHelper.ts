import ExcelJS from 'exceljs';

/**
 * EN: Excel helpers — read data-driven rows from a workbook and write a run summary.
 * TR: Excel yardımcıları — bir çalışma kitabından veri-güdümlü satırları oku ve koşu özeti yaz.
 */

// EN: One test's outcome as a report row. / TR: Bir testin sonucunun rapor satırı hali.
export interface TestResultRow {
  title: string;
  status: string;
  durationMs: number;
}

// EN: Aggregated run statistics for the Excel/PDF reporters. / TR: Excel/PDF raporlayıcıları için toplu koşu istatistikleri.
export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  results: TestResultRow[];
}

/**
 * EN: Read a worksheet into objects keyed by the header row. Used for data-driven tests
 *     whose scenarios live in an .xlsx file.
 * TR: Bir çalışma sayfasını, başlık satırına göre anahtarlanmış nesnelere okur. Senaryoları
 *     .xlsx dosyasında olan veri-güdümlü testler için kullanılır.
 */
export async function readRows(
  filePath: string,
  sheetName?: string,
): Promise<Record<string, string>[]> {
  // EN: Load the workbook from disk. / TR: Çalışma kitabını diskten yükle.
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  // EN: Use the named sheet or the first one. / TR: İsimli sayfayı ya da ilkini kullan.
  const sheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];
  if (!sheet) {
    throw new Error(`Worksheet not found in ${filePath}`);
  }

  // EN: Row 1 is the header. / TR: 1. satır başlıktır.
  const headers = (sheet.getRow(1).values as unknown[]).map((h) => String(h ?? '').trim());
  const rows: Record<string, string>[] = [];

  // EN: Map every data row to { header: value }. / TR: Her veri satırını { başlık: değer } olarak eşle.
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // EN: skip header / TR: başlığı atla
    const values = row.values as unknown[];
    const record: Record<string, string> = {};
    for (let col = 1; col < headers.length; col += 1) {
      const key = headers[col];
      if (key) record[key] = String(values[col] ?? '');
    }
    rows.push(record);
  });

  return rows;
}

/**
 * EN: Write two worksheets (Summary + Details) describing a completed run.
 * TR: Tamamlanmış bir koşuyu anlatan iki çalışma sayfası (Özet + Detaylar) yaz.
 */
export async function writeRunSummary(filePath: string, summary: RunSummary): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  // EN: "Summary" sheet — the headline metrics. / TR: "Özet" sayfası — ana metrikler.
  const overview = workbook.addWorksheet('Summary');
  overview.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 16 },
  ];
  overview.addRows([
    { metric: 'Total', value: summary.total },
    { metric: 'Passed', value: summary.passed },
    { metric: 'Failed', value: summary.failed },
    { metric: 'Skipped', value: summary.skipped },
    { metric: 'Duration (s)', value: Math.round(summary.durationMs / 1000) },
  ]);
  overview.getRow(1).font = { bold: true };

  // EN: "Details" sheet — one row per test. / TR: "Detaylar" sayfası — test başına bir satır.
  const details = workbook.addWorksheet('Details');
  details.columns = [
    { header: 'Test', key: 'title', width: 70 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'durationMs', width: 16 },
  ];
  details.addRows(summary.results);
  details.getRow(1).font = { bold: true };

  // EN: Persist the workbook. / TR: Çalışma kitabını kaydet.
  await workbook.xlsx.writeFile(filePath);
}
