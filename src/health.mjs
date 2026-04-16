/**
 * health.mjs — Project health checker
 *
 * Validates that all required files, configs, and tools are in place.
 *
 * Usage:  node src/health.mjs
 */
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const checks = [
  { name: 'cv.md exists',              pass: () => existsSync(resolve(ROOT, 'cv.md')) },
  { name: 'config/profile.yml exists', pass: () => existsSync(resolve(ROOT, 'config/profile.yml')) },
  { name: 'config/portals.yml exists', pass: () => existsSync(resolve(ROOT, 'config/portals.yml')) },
  { name: 'templates/resume.html',     pass: () => existsSync(resolve(ROOT, 'templates/resume.html')) },
  { name: 'fonts/ directory',          pass: () => existsSync(resolve(ROOT, 'fonts')) },
  { name: 'Node.js >= 18',            pass: () => {
    try {
      const v = process.versions.node.split('.')[0];
      return parseInt(v) >= 18;
    } catch { return false; }
  }},
  { name: 'js-yaml installed',        pass: () => {
    try { require.resolve?.('js-yaml') || existsSync(resolve(ROOT, 'node_modules/js-yaml')); return existsSync(resolve(ROOT, 'node_modules/js-yaml')); } catch { return existsSync(resolve(ROOT, 'node_modules/js-yaml')); }
  }},
  { name: 'Playwright installed',     pass: () => existsSync(resolve(ROOT, 'node_modules/playwright')) },
  { name: 'Chromium browser',         pass: () => {
    try {
      execSync('npx playwright install --dry-run chromium 2>&1', { cwd: ROOT, stdio: 'pipe' });
      return true;
    } catch { return existsSync(resolve(process.env.HOME || '', '.cache/ms-playwright')); }
  }},
  { name: 'data/ directory',          pass: () => existsSync(resolve(ROOT, 'data')) },
  { name: 'output/ directory',        pass: () => existsSync(resolve(ROOT, 'output')) },
  { name: 'reports/ directory',       pass: () => existsSync(resolve(ROOT, 'reports')) },
];

console.log('\n🩺 Job Pilot — Health Check\n');

let allPassed = true;
for (const check of checks) {
  const ok = check.pass();
  const icon = ok ? '✅' : '❌';
  console.log(`  ${icon} ${check.name}`);
  if (!ok) allPassed = false;
}

console.log(allPassed ? '\n🎉 All checks passed!' : '\n⚠️  Some checks failed. Fix them before running.');
process.exit(allPassed ? 0 : 1);
