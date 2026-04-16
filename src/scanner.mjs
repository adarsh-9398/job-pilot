/**
 * scanner.mjs — Job portal scanner
 *
 * Scans Greenhouse, Ashby, and Lever job boards via their public APIs.
 * Filters results by title keywords and writes new findings to data/pipeline.md.
 *
 * Usage:  node src/scanner.mjs
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadPortals, ROOT } from './config.mjs';

// ── API fetchers for each ATS platform ──────────────────────────────

async function fetchGreenhouseJobs(boardToken) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).map(j => ({
      title: j.title,
      url: `https://boards.greenhouse.io/${boardToken}/jobs/${j.id}`,
      location: j.location?.name || 'Remote',
    }));
  } catch { return []; }
}

async function fetchAshbyJobs(orgSlug) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${orgSlug}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).map(j => ({
      title: j.title,
      url: `https://jobs.ashbyhq.com/${orgSlug}/${j.id}`,
      location: j.location || 'Remote',
    }));
  } catch { return []; }
}

async function fetchLeverJobs(company) {
  const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(j => ({
      title: j.text,
      url: j.hostedUrl || j.applyUrl,
      location: j.categories?.location || 'Remote',
    }));
  } catch { return []; }
}

// ── Title filter logic ──────────────────────────────────────────────

function matchesFilter(title, filter) {
  const t = title.toLowerCase();
  const positives = (filter.positive || []).map(k => k.toLowerCase());
  const negatives = (filter.negative || []).map(k => k.toLowerCase());

  const hasPositive = positives.length === 0 || positives.some(k => t.includes(k));
  const hasNegative = negatives.some(k => t.includes(k));

  return hasPositive && !hasNegative;
}

// ── Pipeline deduplication ──────────────────────────────────────────

function loadExistingUrls(pipelinePath) {
  if (!existsSync(pipelinePath)) return new Set();
  const content = readFileSync(pipelinePath, 'utf8');
  const urls = new Set();
  for (const line of content.split('\n')) {
    const match = line.match(/https?:\/\/[^\s|]+/);
    if (match) urls.add(match[0].trim());
  }
  return urls;
}

// ── Main scan routine ───────────────────────────────────────────────

async function scanCompany(company) {
  const { name, ats, slug } = company;
  switch (ats) {
    case 'greenhouse': return { name, jobs: await fetchGreenhouseJobs(slug) };
    case 'ashby':      return { name, jobs: await fetchAshbyJobs(slug) };
    case 'lever':      return { name, jobs: await fetchLeverJobs(slug) };
    default:           return { name, jobs: [] };
  }
}

async function main() {
  const config = loadPortals();
  const companies = config.companies || [];
  const filter = config.title_filter || {};

  const dataDir = resolve(ROOT, 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const pipelinePath = resolve(dataDir, 'pipeline.md');
  const logPath = resolve(dataDir, 'scan-log.tsv');
  const existingUrls = loadExistingUrls(pipelinePath);

  console.log(`🔍 Scanning ${companies.length} companies...\n`);

  let totalNew = 0;
  const newEntries = [];
  const timestamp = new Date().toISOString().split('T')[0];

  for (const company of companies) {
    const result = await scanCompany(company);
    const filtered = result.jobs.filter(j => matchesFilter(j.title, filter));
    const fresh = filtered.filter(j => !existingUrls.has(j.url));

    if (fresh.length > 0) {
      console.log(`  ✅ ${result.name}: ${fresh.length} new matches`);
      for (const j of fresh) {
        console.log(`     + ${j.title} | ${j.location}`);
        newEntries.push(`- [ ] ${j.url} | ${result.name} | ${j.title}`);
        existingUrls.add(j.url);
      }
      totalNew += fresh.length;
    } else {
      process.stdout.write(`  · ${result.name}\n`);
    }
  }

  // Write new entries to pipeline
  if (newEntries.length > 0) {
    const header = existsSync(pipelinePath) ? '' : '## Pipeline\n\n';
    appendFileSync(pipelinePath, header + newEntries.join('\n') + '\n', 'utf8');
  }

  // Append to scan log
  appendFileSync(logPath, `${timestamp}\t${companies.length}\t${totalNew}\n`, 'utf8');

  console.log(`\n📊 Scan complete: ${totalNew} new jobs found across ${companies.length} companies.`);
  if (totalNew > 0) {
    console.log(`📄 Results saved to data/pipeline.md`);
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
