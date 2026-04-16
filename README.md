# Job Pilot 🚀

An AI-powered job search pipeline that scans portals, evaluates roles against your resume, generates ATS-optimized PDFs, and tracks applications — all orchestrated by conversational AI.

## Features

| Feature | Description |
|---------|-------------|
| **Portal Scanner** | Scans Greenhouse, Ashby, and Lever APIs for jobs matching your keywords |
| **Job Evaluator** | AI scores jobs on 5 dimensions against your resume (via Antigravity) |
| **ATS Resume Generator** | Tailored PDFs with keyword injection, clean typography, ATS-safe layout |
| **Application Tracker** | Markdown-based tracker with stats, filtering, and batch merge |
| **Health Check** | Validates your setup before you start |

## Quick Start

```bash
# 1. Install dependencies
npm install
npm run setup              # installs Chromium for PDF generation

# 2. Configure
cp config/profile.example.yml config/profile.yml   # edit with your details

# 3. Add your resume
# Edit cv.md with your experience in markdown format

# 4. Health check
npm run health             # validates everything is set up

# 5. Scan for jobs
npm run scan               # scans all configured portals

# 6. Use with Antigravity
# Open Antigravity in this workspace and ask:
#   "Evaluate this job: <paste URL>"
#   "Generate a resume for <company>"
#   "Show my application stats"
```

## Project Structure

```
job-pilot/
├── ANTIGRAVITY.md           # AI agent instructions
├── cv.md                    # Your resume (markdown)
├── config/
│   ├── profile.yml          # Your identity & target roles
│   ├── profile.example.yml  # Template
│   └── portals.yml          # Companies to scan
├── src/
│   ├── scanner.mjs          # Portal scanner (Greenhouse/Ashby/Lever)
│   ├── pdf.mjs              # ATS PDF generator (Playwright)
│   ├── tracker.mjs          # Application tracker
│   ├── health.mjs           # Setup validator
│   └── config.mjs           # YAML config loader
├── templates/
│   └── resume.html          # HTML resume template
├── fonts/                   # Space Grotesk + DM Sans (woff2)
├── data/                    # Pipeline & tracker data (gitignored)
├── output/                  # Generated PDFs (gitignored)
├── reports/                 # Evaluation reports (gitignored)
└── batch/                   # TSV files for batch tracker merge
```

## Commands

| Command | What it does |
|---------|-------------|
| `npm run scan` | Scan all portals for matching jobs |
| `npm run pdf -- <input.html> <output.pdf>` | Generate PDF from HTML |
| `npm run tracker -- add <company> <role> <url> <score> <status>` | Add an application |
| `npm run tracker -- list` | List all tracked applications |
| `npm run tracker -- stats` | Show application statistics |
| `npm run tracker -- merge` | Merge batch TSV files |
| `npm run health` | Validate project setup |

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **PDF Engine:** Playwright + Chromium
- **Config:** YAML (js-yaml)
- **AI Agent:** Antigravity (Google DeepMind)
- **Fonts:** Space Grotesk + DM Sans

## Roadmap

- [ ] LinkedIn job alert email parser
- [ ] Cover letter auto-generator
- [ ] Interview prep with STAR stories
- [ ] Salary benchmarking via web scraping
- [ ] Web dashboard for pipeline visualization
- [ ] Skill gap analyzer (compare resume vs trending JDs)
- [ ] Follow-up reminder system
- [ ] Company research module (Glassdoor, LinkedIn)
- [ ] Multi-language resume support
- [ ] Resume A/B testing tracker

## License

MIT
