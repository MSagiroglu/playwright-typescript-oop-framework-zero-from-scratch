/**
 * EN: Emails the run summary with the Excel + PDF reports attached. Safe by default: if SMTP
 *     is not configured it logs and exits 0, so a fresh clone never breaks.
 * TR: Excel + PDF raporları ekli olarak koşu özetini e-postayla gönderir. Varsayılan olarak
 *     güvenli: SMTP yapılandırılmamışsa loglar ve 0 ile çıkar, böylece taze bir clone bozulmaz.
 *
 * EN: Configure via env (CI secrets): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO, EMAIL_FROM
 * TR: Env ile yapılandır (CI secret'ları): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO, EMAIL_FROM
 *
 *   npm run email:report
 */
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

async function main(): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO } = process.env;

  // EN: No SMTP → skip cleanly. / TR: SMTP yok → temizce atla.
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_TO) {
    console.log(
      'Email skipped: SMTP is not configured (set SMTP_HOST/SMTP_USER/SMTP_PASS/EMAIL_TO).',
    );
    return;
  }

  // EN: Build subject/body from the JSON results if present. / TR: Varsa JSON sonuçlarından konu/gövde oluştur.
  const resultsPath = path.resolve('test-results/results.json');
  let subject = 'Playwright Test Run';
  let body = 'See attached Excel and PDF reports.';

  if (fs.existsSync(resultsPath)) {
    const stats = JSON.parse(fs.readFileSync(resultsPath, 'utf-8')).stats;
    const total = stats.expected + stats.unexpected + stats.skipped + stats.flaky;
    subject = `Playwright Test Run — ${stats.expected}/${total} passed`;
    body = `Passed: ${stats.expected}\nFailed: ${stats.unexpected}\nSkipped: ${stats.skipped}\nDuration: ${Math.round(stats.duration / 1000)}s`;
  }

  // EN: Attach the exported reports that exist. / TR: Var olan dışa aktarılmış raporları ekle.
  const attachments = ['reports/summary.xlsx', 'reports/summary.pdf']
    .filter((file) => fs.existsSync(file))
    .map((file) => ({ path: file }));

  // EN: Create the SMTP transport. / TR: SMTP taşıyıcısını oluştur.
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465, // EN: TLS on 465 / TR: 465'te TLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // EN: Send the email. / TR: E-postayı gönder.
  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? SMTP_USER,
    to: EMAIL_TO,
    subject,
    text: body,
    attachments,
  });

  console.log(`Email sent to ${EMAIL_TO} with ${attachments.length} attachment(s).`);
}

void main();
