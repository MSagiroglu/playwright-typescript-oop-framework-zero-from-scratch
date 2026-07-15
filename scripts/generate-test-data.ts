/**
 * EN: Generates the Excel test-data workbook from the JSON source of truth, so the committed
 *     .xlsx never drifts from the data and can be regenerated on any machine.
 * TR: Excel test-verisi çalışma kitabını, tek doğruluk kaynağı olan JSON'dan üretir; böylece
 *     commit'lenen .xlsx veriden sapmaz ve her makinede yeniden üretilebilir.
 *
 *   npm run generate:data
 */
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';

// EN: Shape of a login scenario row. / TR: Bir login senaryo satırının şekli.
interface LoginScenario {
  name: string;
  username: string;
  password: string;
  expectedError: string;
}

async function main(): Promise<void> {
  const dataDir = path.resolve('test-data');
  // EN: Read the JSON source. / TR: JSON kaynağını oku.
  const source = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'login-scenarios.json'), 'utf-8'),
  ) as LoginScenario[];

  // EN: Build a workbook with a header row + one row per scenario. / TR: Başlık satırı + senaryo başına bir satır olan bir çalışma kitabı oluştur.
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('LoginScenarios');
  sheet.columns = [
    { header: 'name', key: 'name', width: 24 },
    { header: 'username', key: 'username', width: 20 },
    { header: 'password', key: 'password', width: 16 },
    { header: 'expectedError', key: 'expectedError', width: 60 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(source);

  // EN: Write the .xlsx next to the JSON. / TR: .xlsx'i JSON'ın yanına yaz.
  const target = path.join(dataDir, 'login-scenarios.xlsx');
  await workbook.xlsx.writeFile(target);
  console.log(`Wrote ${source.length} scenarios to ${target}`);
}

void main();
