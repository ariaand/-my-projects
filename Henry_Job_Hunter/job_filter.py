"""
job_filter.py — Job scoring engine.

Scores each job 0-100 based on remote status, title match,
software match, keyword density, flexibility, pay transparency,
and red flag deductions.
"""

import re
from typing import Dict, List, Tuple


# Software tools Adriana knows — each found in JD adds points
SOFTWARE_WEIGHTS = {
    "quickbooks": 7,
    "qbo": 7,
    "quickbooks online": 7,
    "xero": 6,
    "dynamics gp": 5,
    "microsoft dynamics": 4,
    "paylocity": 3,
    "excel": 2,
    "microsoft excel": 2,
    "advanced excel": 3,
    "sage": 2,
    "netsuite": 2,
}

# Title keywords that indicate strong role fit
TITLE_MATCH_KEYWORDS = [
    "bookkeeper", "accountant", "accounting", "accounts payable",
    "accounts receivable", "ap/ar", "ap ar", "payroll", "grant",
    "nonprofit", "non-profit", "staff accountant", "accounting specialist",
    "fractional", "controller",
]

# Remote/flexible indicators
REMOTE_KEYWORDS = ["remote", "work from home", "wfh", "fully remote", "100% remote",
                   "anywhere", "distributed", "telecommute"]
HYBRID_KEYWORDS = ["hybrid", "partially remote"]
FLEXIBLE_KEYWORDS = ["flexible", "flex hours", "flexible schedule", "flexible hours",
                     "part-time", "part time", "contract", "freelance", "fractional",
                     "1099", "choose your hours"]

# Pay transparency
PAY_PATTERNS = [
    r"\$[\d,]+",
    r"[\d,]+\s*(?:k|K)\b",
    r"(?:salary|pay|compensation|rate)\s*:?\s*\$",
    r"up to \$",
    r"\d{2,3},\d{3}",
]

# Hard disqualifiers — jobs with these get heavy penalties
HARD_BLOCKS = [
    "on-site only", "in-office required", "no remote", "must be on-site",
    "commission only", "commission-only", "unpaid", "internship",
    "crypto", "cryptocurrency", "blockchain", "web3", "defi", "nft",
]

# Soft blocks — reduce score but don't disqualify
SOFT_BLOCKS = [
    "cpa required", "cpa license required", "must be cpa",
    "requires cpa", "active cpa",
    "sales", "cold calling",
    "hybrid only",
]

# Keywords Adriana is great at — each hit adds to keyword density score
PREFERRED_KEYWORDS = [
    "reconciliation", "reconciliations", "bookkeeping", "month-end", "month end",
    "accounts payable", "accounts receivable", "payroll", "grant accounting",
    "grant", "nonprofit", "non-profit", "general ledger", "gl", "journal entries",
    "journal entry", "1099", "financial reporting", "full-cycle", "full cycle",
    "year-end", "year end", "audit", "vendor management", "cleanup", "catch-up",
    "multi-entity", "bilingual", "spanish", "w-2", "w2",
]


def _normalize(text: str) -> str:
    return text.lower().strip()


def _text_contains_any(text: str, keywords: List[str]) -> List[str]:
    norm = _normalize(text)
    return [kw for kw in keywords if kw.lower() in norm]


def score_job(job: Dict, config: Dict) -> Tuple[int, str, List[str], List[str]]:
    """
    Score a job 0-100.

    Returns:
        score (int): 0-100
        breakdown (str): human-readable scoring explanation
        software_found (list): matched software keywords
        red_flags (list): found red flag strings
    """
    title = job.get("title", "")
    description = job.get("description", "")
    location = job.get("location", "")
    combined = f"{title} {description} {location}".lower()

    points = {}
    red_flags = []
    software_found = []

    # ── Hard block check ──────────────────────────────────────────────────────
    hard_hits = _text_contains_any(combined, HARD_BLOCKS)
    if hard_hits:
        red_flags.extend(hard_hits)
        # Still score but with -50 penalty applied below

    # ── 1. Remote status (0–25 pts) ───────────────────────────────────────────
    remote_hits = _text_contains_any(combined, REMOTE_KEYWORDS)
    hybrid_hits = _text_contains_any(combined, HYBRID_KEYWORDS)
    if remote_hits:
        points["remote"] = 25
    elif hybrid_hits:
        points["remote"] = 8
        red_flags.append("hybrid (not fully remote)")
    else:
        points["remote"] = 0

    # ── 2. Title match (0–20 pts) ─────────────────────────────────────────────
    title_norm = _normalize(title)
    target_titles = [t.lower() for t in config.get("search", {}).get("target_titles", [])]

    if any(t == title_norm for t in target_titles):
        points["title"] = 20
    elif any(kw in title_norm for kw in TITLE_MATCH_KEYWORDS):
        # Count how many match
        hits = sum(1 for kw in TITLE_MATCH_KEYWORDS if kw in title_norm)
        points["title"] = min(18, 8 + hits * 3)
    else:
        points["title"] = 0

    # ── 3. Software match (0–20 pts) ──────────────────────────────────────────
    sw_score = 0
    for sw, weight in SOFTWARE_WEIGHTS.items():
        if sw in combined:
            sw_score += weight
            software_found.append(sw.title())
    points["software"] = min(20, sw_score)

    # ── 4. Keyword density (0–20 pts) ─────────────────────────────────────────
    preferred = config.get("search", {}).get("preferred_keywords", PREFERRED_KEYWORDS)
    kw_hits = sum(1 for kw in preferred if kw.lower() in combined)
    # Scale: 10+ hits = full 20 pts
    points["keywords"] = min(20, kw_hits * 2)

    # ── 5. Flexibility / schedule (0–10 pts) ──────────────────────────────────
    flex_hits = _text_contains_any(combined, FLEXIBLE_KEYWORDS)
    points["flexibility"] = min(10, len(flex_hits) * 3)

    # ── 6. Pay transparency (0–3 pts) ─────────────────────────────────────────
    has_pay = any(re.search(p, combined) for p in PAY_PATTERNS)
    points["pay_transparency"] = 3 if has_pay else 0

    # ── 7. Nonprofit / grant bonus (0–5 pts) ──────────────────────────────────
    if any(kw in combined for kw in ["nonprofit", "non-profit", "grant", "ngo", "501(c)"]):
        points["nonprofit_bonus"] = 5
    else:
        points["nonprofit_bonus"] = 0

    # ── Red flag deductions ────────────────────────────────────────────────────
    deductions = 0
    if hard_hits:
        deductions += 50  # Effectively kills the score

    soft_hits = _text_contains_any(combined, SOFT_BLOCKS)
    if soft_hits:
        red_flags.extend(soft_hits)
        deductions += len(soft_hits) * 12

    # Blocked keywords from config
    blocked = config.get("search", {}).get("blocked_keywords", [])
    config_blocks = _text_contains_any(combined, blocked)
    if config_blocks:
        red_flags.extend(config_blocks)
        deductions += len(config_blocks) * 10

    raw_score = sum(points.values()) - deductions
    final_score = max(0, min(100, raw_score))

    breakdown = (
        f"Remote:{points['remote']} Title:{points['title']} "
        f"Software:{points['software']} Keywords:{points['keywords']} "
        f"Flex:{points['flexibility']} Pay:{points['pay_transparency']} "
        f"Bonus:{points['nonprofit_bonus']} Deductions:-{deductions}"
    )

    return final_score, breakdown, list(set(software_found)), list(set(red_flags))


def filter_jobs(jobs: List[Dict], config: Dict) -> List[Dict]:
    """
    Score all jobs and attach score data. Return sorted by score descending.
    Jobs below min_display_score are excluded.
    """
    min_score = config.get("search", {}).get("min_display_score", 50)
    scored = []

    for job in jobs:
        score, breakdown, software, flags = score_job(job, config)
        job["score"] = score
        job["score_breakdown"] = breakdown
        job["software_found"] = software
        job["red_flags"] = flags

        if score >= min_score:
            scored.append(job)

    scored.sort(key=lambda j: j["score"], reverse=True)
    return scored
