"""
job_tracker.py — CSV-based job application tracker.
Handles reading, writing, and updating job records.
"""

import csv
import os
from datetime import datetime
from typing import List, Dict, Optional


TRACKER_COLUMNS = [
    "id",
    "date_found",
    "company",
    "job_title",
    "job_link",
    "source",
    "pay_range",
    "remote_status",
    "schedule_flexibility",
    "required_software",
    "match_score",
    "score_breakdown",
    "resume_version",
    "cover_letter_created",
    "application_status",
    "applied_date",
    "follow_up_date",
    "notes",
    "red_flags",
]

STATUS_OPTIONS = [
    "New",
    "Tailored",
    "Ready to Apply",
    "Applied",
    "Interviewing",
    "Offer",
    "Rejected",
    "Passed",
    "No Response",
]


def load_tracker(tracker_path: str) -> List[Dict]:
    """Load all jobs from the CSV tracker."""
    if not os.path.exists(tracker_path):
        return []

    with open(tracker_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def save_tracker(jobs: List[Dict], tracker_path: str) -> None:
    """Overwrite the CSV tracker with updated data."""
    os.makedirs(os.path.dirname(tracker_path), exist_ok=True)
    with open(tracker_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=TRACKER_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(jobs)


def add_job(job: Dict, tracker_path: str) -> Optional[str]:
    """
    Add a new job to the tracker. Skip if already exists (same URL).
    Returns the job ID if added, None if duplicate.
    """
    jobs = load_tracker(tracker_path)

    # Deduplicate by URL
    existing_urls = {j.get("job_link", "").strip() for j in jobs}
    if job.get("job_link", "").strip() in existing_urls:
        return None

    job_id = _next_id(jobs)
    record = {col: "" for col in TRACKER_COLUMNS}
    record.update({
        "id": job_id,
        "date_found": datetime.now().strftime("%Y-%m-%d"),
        "company": job.get("company", ""),
        "job_title": job.get("title", ""),
        "job_link": job.get("link", ""),
        "source": job.get("source", ""),
        "pay_range": job.get("salary", ""),
        "remote_status": job.get("remote_status", ""),
        "schedule_flexibility": job.get("schedule_type", ""),
        "required_software": ", ".join(job.get("software_found", [])),
        "match_score": str(job.get("score", 0)),
        "score_breakdown": job.get("score_breakdown", ""),
        "application_status": "New",
        "red_flags": ", ".join(job.get("red_flags", [])),
        "notes": job.get("notes", ""),
    })

    jobs.append(record)
    save_tracker(jobs, tracker_path)
    return job_id


def update_job(job_id: str, updates: Dict, tracker_path: str) -> bool:
    """Update a specific field on an existing job record."""
    jobs = load_tracker(tracker_path)
    for job in jobs:
        if job.get("id") == str(job_id):
            job.update(updates)
            save_tracker(jobs, tracker_path)
            return True
    return False


def get_jobs_for_tailoring(tracker_path: str, threshold: int = 75) -> List[Dict]:
    """Return jobs above threshold that haven't been tailored yet."""
    jobs = load_tracker(tracker_path)
    return [
        j for j in jobs
        if int(j.get("match_score", 0) or 0) >= threshold
        and not j.get("resume_version")
        and j.get("application_status") in ("New", "")
    ]


def print_summary(tracker_path: str) -> None:
    """Print a brief tracker summary to the console."""
    jobs = load_tracker(tracker_path)
    if not jobs:
        print("No jobs tracked yet.")
        return

    statuses: Dict[str, int] = {}
    scores = []
    for j in jobs:
        s = j.get("application_status", "Unknown")
        statuses[s] = statuses.get(s, 0) + 1
        try:
            scores.append(int(j.get("match_score", 0) or 0))
        except ValueError:
            pass

    print(f"\n{'='*50}")
    print(f"  HENRY JOB HUNTER — TRACKER SUMMARY")
    print(f"{'='*50}")
    print(f"  Total jobs tracked : {len(jobs)}")
    if scores:
        print(f"  Avg match score    : {sum(scores)//len(scores)}/100")
        print(f"  Top score          : {max(scores)}/100")
    print(f"\n  Status breakdown:")
    for status, count in sorted(statuses.items()):
        print(f"    {status:<20} {count}")
    print(f"{'='*50}\n")


def _next_id(jobs: List[Dict]) -> str:
    if not jobs:
        return "1"
    try:
        max_id = max(int(j.get("id", 0)) for j in jobs)
    except (ValueError, TypeError):
        max_id = len(jobs)
    return str(max_id + 1)
