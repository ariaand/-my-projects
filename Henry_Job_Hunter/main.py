"""
main.py — Henry Job Hunter orchestrator.

Usage:
  python main.py                   # Full run: search + score + tailor top jobs
  python main.py --search-only     # Search and score jobs, skip tailoring
  python main.py --tailor-only     # Tailor resumes for high-score jobs in tracker
  python main.py --report          # Print tracker summary
  python main.py --manual          # Score + tailor a single job (paste URL/description)
  python main.py --setup           # First-time folder + config check
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime

import yaml
from dotenv import load_dotenv

from job_filter import filter_jobs
from job_sources import fetch_all_jobs
from job_tracker import (
    add_job,
    get_jobs_for_tailoring,
    load_tracker,
    print_summary,
    update_job,
)
from resume_tailor import tailor_for_job
from cover_letter_generator import generate_cover_letter

load_dotenv()

# ── Logging setup ─────────────────────────────────────────────────────────────

def setup_logging(logs_dir: str) -> None:
    os.makedirs(logs_dir, exist_ok=True)
    log_file = os.path.join(logs_dir, f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )


# ── Config loading ────────────────────────────────────────────────────────────

def load_config(config_path: str = "config.yaml") -> dict:
    if not os.path.exists(config_path):
        print(f"ERROR: config.yaml not found at {config_path}")
        print("Run: python main.py --setup")
        sys.exit(1)
    with open(config_path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_profile(profile_path: str = "templates/candidate_profile.json") -> dict:
    if not os.path.exists(profile_path):
        print(f"ERROR: Candidate profile not found at {profile_path}")
        sys.exit(1)
    with open(profile_path, encoding="utf-8") as f:
        return json.load(f)


# ── Directory setup ───────────────────────────────────────────────────────────

def setup_directories(config: dict, base_dir: str = ".") -> None:
    dirs = [
        config["output"]["jobs_found_dir"],
        config["output"]["resumes_dir"],
        config["output"]["cover_letters_dir"],
        config["output"]["notes_dir"],
        config["output"]["logs_dir"],
        "templates",
        "config",
    ]
    for d in dirs:
        os.makedirs(os.path.join(base_dir, d), exist_ok=True)
    print("  Directories ready.")


# ── Search + score ────────────────────────────────────────────────────────────

def run_search(config: dict, tracker_path: str) -> list:
    """Fetch jobs from all sources, score them, add new ones to tracker."""
    print("\n[1/3] SEARCHING JOB BOARDS...")
    raw_jobs = fetch_all_jobs(config)

    print("\n[2/3] SCORING JOBS...")
    scored_jobs = filter_jobs(raw_jobs, config)

    new_count = 0
    skipped = 0
    for job in scored_jobs:
        result = add_job(job, tracker_path)
        if result:
            new_count += 1
        else:
            skipped += 1

    print(f"\n  New jobs added to tracker : {new_count}")
    print(f"  Duplicates skipped        : {skipped}")
    print(f"  Tracker location          : {tracker_path}")

    return scored_jobs


# ── Tailor resumes ────────────────────────────────────────────────────────────

def run_tailoring(config: dict, profile: dict, tracker_path: str, api_key: str, base_dir: str) -> None:
    """Generate tailored resumes and cover letters for jobs above threshold."""
    threshold = config["search"]["tailoring_threshold"]
    pending = get_jobs_for_tailoring(tracker_path, threshold)

    if not pending:
        print(f"\n  No jobs above score {threshold} pending tailoring.")
        return

    print(f"\n[3/3] TAILORING RESUMES ({len(pending)} jobs above score {threshold})...")

    for i, job_record in enumerate(pending, 1):
        job_id = job_record.get("id")
        title = job_record.get("job_title", "")
        company = job_record.get("company", "")
        score = job_record.get("match_score", 0)

        print(f"\n  [{i}/{len(pending)}] {title} — {company}  (score: {score})")
        print(f"  Link: {job_record.get('job_link', '')}")

        # Build a job dict from the tracker record
        job = {
            "title": title,
            "company": company,
            "link": job_record.get("job_link", ""),
            "description": "",  # Not stored in CSV — fetch if needed
            "source": job_record.get("source", ""),
            "score": int(score or 0),
            "software_found": [s.strip() for s in job_record.get("required_software", "").split(",") if s.strip()],
            "red_flags": [s.strip() for s in job_record.get("red_flags", "").split(",") if s.strip()],
            "score_breakdown": job_record.get("score_breakdown", ""),
            "salary": job_record.get("pay_range", ""),
        }

        # Note: if description is empty (loaded from CSV), AI tailoring will still work
        # but won't have the full JD. Prompt user to paste it for best results.
        if not job["description"]:
            print("  ⚠  Job description not stored in tracker.")
            print("     For best results, paste the job description now.")
            print("     (Press Enter to skip and use generic tailoring)")
            desc = input("  Paste description (or press Enter to skip): ").strip()
            job["description"] = desc

        try:
            # Tailor resume
            resume_paths = tailor_for_job(job, profile, config, api_key, base_dir)
            print(f"  ✓ Resume: {os.path.basename(resume_paths['docx'])}")

            # Cover letter
            cl_paths = generate_cover_letter(job, profile, config, api_key, base_dir)
            print(f"  ✓ Cover letter: {os.path.basename(cl_paths['docx'])}")

            # Update tracker
            update_job(job_id, {
                "resume_version": os.path.basename(resume_paths["docx"]),
                "cover_letter_created": "Yes",
                "application_status": "Ready to Apply",
            }, tracker_path)

        except Exception as e:
            logging.error(f"  ✗ Failed for {title} at {company}: {e}")
            print(f"  ✗ Error: {e}")

    print("\n  Tailoring complete. Check tailored_resumes/ and cover_letters/")


# ── Manual mode ───────────────────────────────────────────────────────────────

def run_manual(config: dict, profile: dict, tracker_path: str, api_key: str, base_dir: str) -> None:
    """Interactively score and tailor a single job the user provides."""
    print("\n── MANUAL JOB ENTRY ──")
    print("Paste details for a job you found manually.\n")

    title = input("Job Title: ").strip()
    company = input("Company Name: ").strip()
    link = input("Job URL: ").strip()
    salary = input("Salary/Pay Range (or press Enter to skip): ").strip()
    print("Paste the full job description. When done, type END on a new line:")

    lines = []
    while True:
        line = input()
        if line.strip().upper() == "END":
            break
        lines.append(line)
    description = "\n".join(lines)

    from job_filter import score_job
    job = {
        "title": title,
        "company": company,
        "link": link,
        "description": description,
        "salary": salary,
        "source": "Manual",
        "remote_status": "",
        "schedule_type": "",
    }

    score, breakdown, software, flags = score_job(job, config)
    job["score"] = score
    job["score_breakdown"] = breakdown
    job["software_found"] = software
    job["red_flags"] = flags

    print(f"\n  Match Score: {score}/100")
    print(f"  Breakdown : {breakdown}")
    print(f"  Software  : {', '.join(software) or 'None detected'}")
    if flags:
        print(f"  Red Flags : {', '.join(flags)}")

    add_job(job, tracker_path)
    print(f"  ✓ Job added to tracker.")

    threshold = config["search"]["tailoring_threshold"]
    if score >= threshold:
        do_tailor = input(f"\n  Score {score} ≥ threshold {threshold}. Generate tailored materials? (y/n): ")
        if do_tailor.lower() == "y":
            try:
                resume_paths = tailor_for_job(job, profile, config, api_key, base_dir)
                cl_paths = generate_cover_letter(job, profile, config, api_key, base_dir)
                print(f"\n  ✓ Resume: {resume_paths['docx']}")
                print(f"  ✓ Resume PDF: {resume_paths['pdf']}")
                print(f"  ✓ Cover Letter: {cl_paths['docx']}")
                print(f"  ✓ Cover Letter PDF: {cl_paths['pdf']}")
                print(f"  ✓ Strategy Note: {resume_paths['note']}")
            except Exception as e:
                print(f"  ✗ Error: {e}")
    else:
        print(f"  Score {score} is below tailoring threshold ({threshold}). Saved to tracker only.")


# ── Apply checklist ───────────────────────────────────────────────────────────

def print_apply_checklist(config: dict, tracker_path: str) -> None:
    """Print the 'Ready to Apply' checklist for jobs that are ready."""
    jobs = load_tracker(tracker_path)
    ready = [j for j in jobs if j.get("application_status") == "Ready to Apply"]

    if not ready:
        print("  No jobs with status 'Ready to Apply' found.")
        return

    print(f"\n{'='*60}")
    print(f"  APPLY NOW CHECKLIST  ({len(ready)} jobs ready)")
    print(f"{'='*60}")

    for job in ready:
        print(f"\n  Company  : {job.get('company', '')}")
        print(f"  Title    : {job.get('job_title', '')}")
        print(f"  Score    : {job.get('match_score', '')}/100")
        print(f"  Link     : {job.get('job_link', '')}")
        print(f"  Resume   : tailored_resumes/{job.get('resume_version', 'Not generated')}")
        cover = "Yes" if job.get("cover_letter_created") == "Yes" else "Not generated"
        print(f"  Cover Ltr: cover_letters/ — {cover}")
        print(f"  Note     : application_notes/ — check for strategy note")
        print(f"  Pay      : {job.get('pay_range', 'Not listed')}")
        print(f"  Status   : {job.get('application_status', '')}")
        print(f"  {'-'*50}")


# ── Setup check ───────────────────────────────────────────────────────────────

def run_setup(config: dict, base_dir: str) -> None:
    print("\n── HENRY JOB HUNTER SETUP CHECK ──\n")
    setup_directories(config, base_dir)

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("  ⚠  ANTHROPIC_API_KEY not set.")
        print("     Copy .env.example to .env and add your key.")
        print("     Get a key at: https://console.anthropic.com")
    else:
        print(f"  ✓ ANTHROPIC_API_KEY found ({api_key[:10]}...)")

    profile_path = os.path.join(base_dir, "templates", "candidate_profile.json")
    if os.path.exists(profile_path):
        print(f"  ✓ Candidate profile found: {profile_path}")
    else:
        print(f"  ✗ Candidate profile missing: {profile_path}")

    print("\n  Setup complete. Run: python main.py")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Henry Job Hunter — Remote Accounting Job Search")
    parser.add_argument("--search-only", action="store_true", help="Search and score only, skip tailoring")
    parser.add_argument("--tailor-only", action="store_true", help="Tailor resumes for pending high-score jobs")
    parser.add_argument("--report", action="store_true", help="Print tracker summary")
    parser.add_argument("--checklist", action="store_true", help="Print apply-now checklist")
    parser.add_argument("--manual", action="store_true", help="Manually add and score a single job")
    parser.add_argument("--setup", action="store_true", help="Run setup check")
    parser.add_argument("--config", default="config.yaml", help="Path to config.yaml")
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(base_dir, args.config)

    config = load_config(config_path)
    logs_dir = os.path.join(base_dir, config["output"]["logs_dir"])
    setup_logging(logs_dir)
    setup_directories(config, base_dir)

    tracker_path = os.path.join(base_dir, config["output"]["tracker_file"])

    print("\n" + "="*60)
    print("  HENRY JOB HUNTER — for Adriana Flores")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("="*60)

    if args.setup:
        run_setup(config, base_dir)
        return

    if args.report:
        print_summary(tracker_path)
        return

    if args.checklist:
        print_apply_checklist(config, tracker_path)
        return

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key and not args.search_only:
        print("\n  ERROR: ANTHROPIC_API_KEY not set.")
        print("  Copy .env.example → .env and add your key, OR run with --search-only")
        sys.exit(1)

    profile = load_profile(os.path.join(base_dir, "templates", "candidate_profile.json"))

    if args.manual:
        run_manual(config, profile, tracker_path, api_key, base_dir)
        print_summary(tracker_path)
        return

    if args.tailor_only:
        run_tailoring(config, profile, tracker_path, api_key, base_dir)
        print_summary(tracker_path)
        return

    # Default: full run
    run_search(config, tracker_path)

    if not args.search_only:
        run_tailoring(config, profile, tracker_path, api_key, base_dir)

    print_summary(tracker_path)
    print_apply_checklist(config, tracker_path)
    print("\n  Done! Check jobs_found/job_tracker.csv for all results.\n")


if __name__ == "__main__":
    main()
