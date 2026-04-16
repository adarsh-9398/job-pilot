# Job Pilot — Agent Instructions

This file provides context for ANY AI coding agent operating in this workspace.
Read the agent-specific file that matches your identity:

| Agent | Config File |
|-------|------------|
| **Antigravity** (Google DeepMind) | `ANTIGRAVITY.md` |
| **GitHub Copilot** | `.github/copilot-instructions.md` |
| **Cursor** | `.cursorrules` |
| **Cline** | `.clinerules` |
| **Claude Code** | `CLAUDE.md` |

## Universal Context

This is **Job Pilot**, an AI-powered job search pipeline. The core workflow is:

1. **Scan** → `node src/scanner.mjs` finds jobs from Greenhouse/Ashby/Lever APIs
2. **Evaluate** → AI reads cv.md + JD and scores the fit (1-5 on 5 dimensions)
3. **Generate PDF** → `node src/pdf.mjs` creates ATS-optimized resumes via Playwright
4. **Track** → `node src/tracker.mjs` manages application status in markdown

### Key Files
- `cv.md` — The candidate's resume (source of truth, never fabricate data)
- `config/profile.yml` — Identity, target roles, preferences
- `config/portals.yml` — Companies to scan
- `templates/resume.html` — HTML template for PDF generation

### Rules (ALL agents must follow)
1. Never invent skills or experience not in cv.md
2. Never auto-submit applications without explicit user approval
3. Always read cv.md before evaluating a job or generating a resume
4. Score jobs honestly — bad fits should be flagged, not sugar-coated
