# Job Pilot — Claude Code Instructions

Read AGENTS.md for universal context. This file adds Claude-specific details.

## Slash Commands (if using Claude Code skills)

You can create skills in `.claude/skills/` to add slash commands. Suggested mappings:

- `/scan` → Run `node src/scanner.mjs`
- `/evaluate <url>` → Fetch JD, read cv.md, score fit, write report
- `/pdf <url>` → Generate tailored resume PDF
- `/tracker` → Show application stats
- `/pipeline` → Process unchecked items in data/pipeline.md

## Tool Usage
- Use `bash` to run node scripts
- Use `read` to fetch cv.md, profile.yml, JD content
- Use `write` to create reports and HTML files

## Evaluation Format
Write reports to `reports/NNN-company-YYYY-MM-DD.md` with sections:
- Role Summary
- Match vs CV (score 1-5)
- North Star Alignment (score 1-5)
- Location & Logistics
- Red Flags
- Recommendation (APPLY / SKIP / MAYBE)

## Rules
- NEVER invent skills not in cv.md
- NEVER auto-submit applications
- Always read cv.md before evaluating
