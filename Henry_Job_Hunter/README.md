# Henry Job Hunter 🎯
**Automated remote accounting & bookkeeping job search for Adriana Flores**

Finds remote accounting jobs, scores them 0–100 for fit, and for the best matches:
auto-generates a tailored resume (DOCX + PDF) and cover letter using Claude AI.

---

## Folder Structure

```
Henry_Job_Hunter/
├── main.py                   ← Run this
├── job_sources.py            ← Job board scrapers (Indeed, RemoteOK, WWR, etc.)
├── job_filter.py             ← Scoring engine (0–100)
├── resume_tailor.py          ← Claude-powered resume rewriting + DOCX/PDF
├── cover_letter_generator.py ← Claude-powered cover letters + DOCX/PDF
├── job_tracker.py            ← CSV tracker management
├── config.yaml               ← All settings (edit this to customize)
├── requirements.txt          ← Python dependencies
├── .env.example              ← Environment variable template
├── templates/
│   └── candidate_profile.json  ← Your real resume data (source of truth)
├── jobs_found/
│   └── job_tracker.csv       ← Auto-generated job tracker
├── tailored_resumes/         ← Tailored DOCX + PDF resumes
├── cover_letters/            ← Tailored DOCX + PDF cover letters
├── application_notes/        ← Strategy notes for each job
└── logs/                     ← Run logs
```

---

## Step 1 — Install

**Requires Python 3.10+**

```bash
# Open a terminal and navigate to this folder
cd Henry_Job_Hunter

# Install dependencies
pip install -r requirements.txt
```

---

## Step 2 — Add Your API Key

1. Copy `.env.example` to `.env` (same folder):
   ```bash
   copy .env.example .env
   ```
2. Open `.env` in Notepad and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
3. Get a free API key at: **https://console.anthropic.com**

---

## Step 3 — Verify Setup

```bash
python main.py --setup
```

You should see green checkmarks for your API key and candidate profile.

---

## Step 4 — Run a Job Search

```bash
# Full run: search + score + generate tailored resumes for top matches
python main.py

# Search only (no AI tailoring, no API key needed)
python main.py --search-only

# Only tailor resumes for high-score jobs already in tracker
python main.py --tailor-only
```

---

## Step 5 — Review Jobs Before Applying

Open `jobs_found/job_tracker.csv` in Excel to review all found jobs.

Each row shows:
- Match score (0–100)
- Remote status
- Pay range
- Required software
- Resume/cover letter generated
- Application status
- Red flags

**Do NOT apply until you have reviewed the tailored materials.**

---

## Step 6 — See Your Apply Checklist

```bash
python main.py --checklist
```

This shows all "Ready to Apply" jobs with their resume and cover letter file names.

---

## Step 7 — Add a Job Manually

Found a job on LinkedIn or FlexJobs? Add it yourself:

```bash
python main.py --manual
```

You'll be prompted to enter:
- Job title
- Company name
- Job URL
- Salary (optional)
- Paste the job description

The system will score it and generate tailored materials if it scores high enough.

---

## How Jobs Are Scored (0–100)

| Factor | Max Points |
|---|---|
| Fully remote status | 25 |
| Title match (bookkeeper, accountant, etc.) | 20 |
| Software match (QBO, Xero, Dynamics, etc.) | 20 |
| Keyword density (reconciliation, AP/AR, payroll, etc.) | 20 |
| Schedule flexibility (part-time, contract, flex) | 10 |
| Nonprofit/grant bonus | 5 |
| Pay transparency | 3 |
| Red flag deductions | −10 to −50 |

**Jobs scoring 75+ get a tailored resume and cover letter.**
**Jobs scoring 50–74 are tracked but not auto-tailored** (you can manually tailor them).

---

## How to Update Keywords

Open `config.yaml` and edit:

```yaml
search:
  preferred_keywords:     # Add keywords you want to match
    - "fund accounting"
    - "Sage Intacct"

  blocked_keywords:       # Add things to always avoid
    - "must be local"

  tailoring_threshold: 75  # Lower this to tailor more jobs
```

---

## How to Add Job Sources

In `job_sources.py`, the `fetch_all_jobs()` function calls each source.
To add a new RSS feed:

```python
def fetch_my_new_source():
    feed = feedparser.parse("https://example.com/jobs.rss")
    jobs = []
    for entry in feed.entries:
        job = _empty_job("My Source")
        job["title"] = entry.get("title", "")
        job["link"] = entry.get("link", "")
        job["description"] = entry.get("summary", "")
        jobs.append(job)
    return jobs
```

Then call it inside `fetch_all_jobs()`.

---

## Manual Search URLs

The system automatically prints search URLs for LinkedIn, ZipRecruiter, FlexJobs,
Robert Half, and Upwork each time you run a search. Open these in your browser
to find additional jobs not available via RSS.

---

## View Tracker Summary

```bash
python main.py --report
```

---

## Important Notes

- **Applications are NEVER submitted automatically.** You always review and apply manually.
- The AI never fabricates experience, certifications, or employers.
- Only real skills from your profile are used in tailored resumes.
- All files are saved locally — nothing is sent to third parties except the Anthropic API (for resume tailoring and cover letter generation).
- Respect job board terms of service. This system uses RSS feeds and public APIs only for automated collection.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ANTHROPIC_API_KEY not set` | Copy `.env.example` → `.env` and add key |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Indeed returns 0 results | Indeed sometimes blocks RSS. Use `--search-only` and search manually |
| Resume looks wrong | Open the DOCX in Word and format manually if needed |
| `json.JSONDecodeError` | Job description may be too short for AI. Try `--manual` with full JD pasted |

---

*Built with Claude Code for Adriana Flores — Henry Job Hunter v1.0*
