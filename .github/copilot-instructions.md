# Job Pilot — GitHub Copilot Instructions

You are working in the **Job Pilot** project, an AI-powered job search pipeline.

## Project Context
- **Stack:** Node.js ES Modules, Playwright, js-yaml
- **Purpose:** Scan job portals, evaluate fit, generate ATS resumes, track applications

## When the user asks to evaluate a job:
1. Fetch the job description from the URL
2. Read `cv.md` for the candidate's real background
3. Read `config/profile.yml` for target roles
4. Score on: Role Match, Skill Overlap, Location Fit, Growth, Culture (1-5 each)
5. Write report to `reports/NNN-company-YYYY-MM-DD.md`

## When the user asks to generate a resume:
1. Read `cv.md` and the JD
2. Extract 8-12 keywords from JD
3. Build HTML from `templates/resume.html`, inject keywords naturally
4. Save to `output/` and run `node src/pdf.mjs` to generate PDF

## When the user asks to scan:
Run `node src/scanner.mjs` — it reads `config/portals.yml` and fetches from ATS APIs.

## Rules
- NEVER invent skills not present in cv.md
- NEVER auto-submit applications
- Always read cv.md before any evaluation or PDF generation
- Score honestly
