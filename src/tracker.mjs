/**
 * tracker.mjs — Application tracking system
 *
 * Manages a markdown-based application tracker.
 * Supports: adding entries, listing status, merging batch TSV files.
 *
 * Usage:
 *   node src/tracker.mjs add <company> <role> <url> <score> <status>
 *   node src/tracker.mjs list [--status=applied|skip|interview]
 *   node src/tracker.mjs merge   (merges batch/*.tsv into applications.md)
 *   node src/tracker.mjs stats
 */
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './config.mjs';

const DATA_DIR = resolve(ROOT, 'data');
const BATCH_DIR = resolve(ROOT, 'batch');
const APPS_FILE = resolve(DATA_DIR, 'applications.md');

const HEADER = `# Applications Tracker

| # | Date | Company | Role | Status | Score | Report |
|---|------|---------|------|--------|-------|--------|
`;

function ensureDirs() {
  for (const dir of [DATA_DIR, BATCH_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

function loadApplications() {
  if (!existsSync(APPS_FILE)) return [];
  const content = readFileSync(APPS_FILE, 'utf8');
  const lines = content.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('Date'));
  return lines.map(line => {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    return {
      num: parseInt(cols[0]) || 0,
      date: cols[1] || '',
      company: cols[2] || '',
      role: cols[3] || '',
      status: cols[4] || '',
      score: cols[5] || '',
      report: cols[6] || '',
    };
  });
}

function saveApplications(entries) {
  const rows = entries.map(e =>
    `| ${e.num} | ${e.date} | ${e.company} | ${e.role} | ${e.status} | ${e.score} | ${e.report} |`
  ).join('\n');
  writeFileSync(APPS_FILE, HEADER + rows + '\n', 'utf8');
}

function getNextNum(entries) {
  if (entries.length === 0) return 1;
  return Math.max(...entries.map(e => e.num)) + 1;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Commands ────────────────────────────────────────────────────────

function cmdAdd(args) {
  const [company, role, url, score, status] = args;
  if (!company || !role) {
    console.log('Usage: node src/tracker.mjs add <company> <role> <url> <score> <status>');
    return;
  }

  const entries = loadApplications();
  const num = getNextNum(entries);
  entries.push({
    num,
    date: today(),
    company,
    role,
    status: status || 'NEW',
    score: score || '-',
    report: url || '-',
  });
  saveApplications(entries);
  console.log(`✅ Added #${num}: ${company} — ${role} (${status || 'NEW'})`);
}

function cmdList(args) {
  const statusFilter = args.find(a => a.startsWith('--status='))?.split('=')[1]?.toUpperCase();
  const entries = loadApplications();
  const filtered = statusFilter ? entries.filter(e => e.status.toUpperCase() === statusFilter) : entries;

  if (filtered.length === 0) {
    console.log('📭 No applications found.');
    return;
  }

  console.log(`\n📋 Applications${statusFilter ? ` (${statusFilter})` : ''}: ${filtered.length}\n`);
  for (const e of filtered) {
    console.log(`  #${e.num} | ${e.date} | ${e.company} — ${e.role} | ${e.status} | ${e.score}`);
  }
}

function cmdMerge() {
  if (!existsSync(BATCH_DIR)) {
    console.log('📭 No batch/ directory found.');
    return;
  }

  const tsvFiles = readdirSync(BATCH_DIR).filter(f => f.endsWith('.tsv'));
  if (tsvFiles.length === 0) {
    console.log('📭 No TSV files to merge.');
    return;
  }

  const entries = loadApplications();
  let added = 0;

  const mergedDir = resolve(BATCH_DIR, 'merged');
  if (!existsSync(mergedDir)) mkdirSync(mergedDir, { recursive: true });

  for (const file of tsvFiles) {
    const content = readFileSync(resolve(BATCH_DIR, file), 'utf8');
    for (const line of content.split('\n').filter(Boolean)) {
      const cols = line.split('\t');
      if (cols.length < 3) continue;

      const num = getNextNum(entries);
      entries.push({
        num,
        date: cols[0] || today(),
        company: cols[1] || '',
        role: cols[2] || '',
        status: cols[3] || 'NEW',
        score: cols[4] || '-',
        report: cols[5] || '-',
      });
      added++;
    }
    // Move to merged/
    renameSync(resolve(BATCH_DIR, file), resolve(mergedDir, file));
  }

  saveApplications(entries);
  console.log(`✅ Merged ${added} entries from ${tsvFiles.length} file(s).`);
}

function cmdStats() {
  const entries = loadApplications();
  if (entries.length === 0) {
    console.log('📭 No applications tracked yet.');
    return;
  }

  const statusCounts = {};
  for (const e of entries) {
    const s = e.status.toUpperCase();
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  console.log(`\n📊 Application Stats (${entries.length} total)\n`);
  for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    const bar = '█'.repeat(Math.min(count, 30));
    console.log(`  ${status.padEnd(12)} ${bar} ${count}`);
  }
}

// ── Entry point ─────────────────────────────────────────────────────

ensureDirs();
const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case 'add':   cmdAdd(args); break;
  case 'list':  cmdList(args); break;
  case 'merge': cmdMerge(); break;
  case 'stats': cmdStats(); break;
  default:
    console.log('Job Pilot — Application Tracker\n');
    console.log('Commands:');
    console.log('  add <company> <role> <url> <score> <status>');
    console.log('  list [--status=applied|skip|interview]');
    console.log('  merge   (merge batch/*.tsv files)');
    console.log('  stats   (show application statistics)');
}
