/**
 * pdf.mjs — ATS-optimized PDF resume generator
 *
 * Reads the HTML template, injects tailored content, and renders a PDF
 * using Playwright's headless Chromium.
 *
 * Usage:  node src/pdf.mjs <input.html> <output.pdf> [--format=a4|letter]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const inputFile = args.find(a => !a.startsWith('--'));
  const outputFile = args.filter(a => !a.startsWith('--'))[1];
  const formatFlag = args.find(a => a.startsWith('--format='));
  const format = formatFlag ? formatFlag.split('=')[1] : 'a4';

  if (!inputFile || !outputFile) {
    console.log('Usage: node src/pdf.mjs <input.html> <output.pdf> [--format=a4|letter]');
    process.exit(1);
  }

  return {
    input: resolve(ROOT, inputFile),
    output: resolve(ROOT, outputFile),
    format,
  };
}

/**
 * Normalize unicode characters that confuse ATS parsers.
 */
function normalizeForATS(html) {
  let count = 0;
  const replacements = [
    [/\u2013/g, '-'],   // en-dash → hyphen
    [/\u2014/g, '-'],   // em-dash → hyphen
    [/\u2018/g, "'"],   // left single quote
    [/\u2019/g, "'"],   // right single quote
    [/\u201C/g, '"'],   // left double quote
    [/\u201D/g, '"'],   // right double quote
    [/\u2026/g, '...'], // ellipsis
    [/\u00A0/g, ' '],   // non-breaking space
  ];

  let result = html;
  for (const [pattern, replacement] of replacements) {
    const matches = result.match(pattern);
    if (matches) count += matches.length;
    result = result.replace(pattern, replacement);
  }
  return { html: result, replacements: count };
}

async function generatePDF({ input, output, format }) {
  if (!existsSync(input)) {
    console.error(`❌ Input file not found: ${input}`);
    process.exit(1);
  }

  console.log(`📄 Input:  ${input}`);
  console.log(`📁 Output: ${output}`);
  console.log(`📏 Format: ${format.toUpperCase()}`);

  // Read and normalize HTML
  let html = readFileSync(input, 'utf8');
  const { html: normalized, replacements } = normalizeForATS(html);
  html = normalized;
  if (replacements > 0) {
    console.log(`🧹 ATS normalization: ${replacements} character replacements`);
  }

  // Resolve font paths to absolute file URLs
  html = html.replace(
    /url\(['"]?\.\/(fonts\/[^'")\s]+)['"]?\)/g,
    (_, fontPath) => `url('file://${resolve(ROOT, fontPath)}')`
  );

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle' });

    const dimensions = format === 'letter'
      ? { width: '8.5in', height: '11in' }
      : { width: '210mm', height: '297mm' };

    await page.pdf({
      path: output,
      ...dimensions,
      margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' },
      printBackground: true,
    });

    await browser.close();

    // Report results
    const { statSync } = await import('node:fs');
    const stats = statSync(output);
    const sizeKB = (stats.size / 1024).toFixed(1);

    // Count pages (rough heuristic from PDF content)
    const pdfContent = readFileSync(output);
    const pageCount = (pdfContent.toString('binary').match(/\/Type\s*\/Page[^s]/g) || []).length;

    console.log(`✅ PDF generated: ${output}`);
    console.log(`📊 Pages: ${pageCount}`);
    console.log(`📦 Size: ${sizeKB} KB`);
  } catch (err) {
    console.error(`❌ PDF generation failed: ${err.message}`);
    if (err.message.includes('Executable')) {
      console.error('\n💡 Run: npm run setup   (installs Chromium for Playwright)');
    }
    process.exit(1);
  }
}

const config = parseArgs();
generatePDF(config);
