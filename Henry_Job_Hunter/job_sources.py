"""
job_sources.py — Job board scrapers and RSS readers.

Sources:
  - Indeed (RSS)
  - We Work Remotely (RSS)
  - RemoteOK (public JSON API)
  - Working Nomads (public JSON API)
  - LinkedIn / ZipRecruiter / FlexJobs / Robert Half — URL generators only
    (these boards block automated scraping — open in browser)
"""

import time
import logging
import re
from typing import List, Dict
from datetime import datetime

import feedparser
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# Polite browser-like headers
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/json,*/*",
    "Accept-Language": "en-US,en;q=0.9",
}

REQUEST_DELAY = 2.5  # seconds between requests — be polite


def _safe_get(url: str, timeout: int = 15) -> requests.Response | None:
    """GET with error handling and rate-limit delay."""
    try:
        time.sleep(REQUEST_DELAY)
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return resp
    except requests.RequestException as e:
        logger.warning(f"Request failed for {url}: {e}")
        return None


def _clean_html(html: str) -> str:
    """Strip HTML tags from a string."""
    return BeautifulSoup(html, "lxml").get_text(" ", strip=True)


def _empty_job(source: str) -> Dict:
    return {
        "source": source,
        "title": "",
        "company": "",
        "link": "",
        "description": "",
        "date_posted": "",
        "location": "",
        "salary": "",
        "remote_status": "",
        "schedule_type": "",
    }


# ── Indeed RSS ────────────────────────────────────────────────────────────────

def fetch_indeed(query: str, max_results: int = 20) -> List[Dict]:
    """
    Fetch jobs from Indeed RSS feed.
    Note: Indeed occasionally limits RSS results. If you get 0, try a VPN
    or switch to searching manually at indeed.com.
    """
    encoded = query.replace(" ", "+")
    url = (
        f"https://www.indeed.com/rss?q={encoded}"
        f"&sort=date&fromage=14&radius=0"
    )
    logger.info(f"[Indeed] Searching: {query}")

    try:
        feed = feedparser.parse(url)
        jobs = []
        for entry in feed.entries[:max_results]:
            job = _empty_job("Indeed")
            job["title"] = entry.get("title", "")
            job["company"] = entry.get("source", {}).get("title", "")
            job["link"] = entry.get("link", "")
            job["description"] = _clean_html(entry.get("summary", ""))
            job["date_posted"] = entry.get("published", "")
            job["location"] = entry.get("tags", [{}])[0].get("label", "") if entry.get("tags") else ""
            jobs.append(job)
        logger.info(f"[Indeed] Found {len(jobs)} results for '{query}'")
        return jobs
    except Exception as e:
        logger.error(f"[Indeed] Feed error: {e}")
        return []


# ── We Work Remotely RSS ──────────────────────────────────────────────────────

def fetch_weworkremotely(max_results: int = 30) -> List[Dict]:
    """Fetch remote finance/accounting jobs from We Work Remotely RSS."""
    url = "https://weworkremotely.com/categories/remote-finance-accounting-jobs.rss"
    logger.info("[WeWorkRemotely] Fetching finance/accounting feed")

    try:
        feed = feedparser.parse(url)
        jobs = []
        for entry in feed.entries[:max_results]:
            job = _empty_job("We Work Remotely")
            job["title"] = entry.get("title", "")
            job["company"] = entry.get("author", "")
            job["link"] = entry.get("link", "")
            job["description"] = _clean_html(entry.get("summary", ""))
            job["date_posted"] = entry.get("published", "")
            job["remote_status"] = "Remote"
            jobs.append(job)
        logger.info(f"[WeWorkRemotely] Found {len(jobs)} jobs")
        return jobs
    except Exception as e:
        logger.error(f"[WeWorkRemotely] Feed error: {e}")
        return []


# ── RemoteOK API ──────────────────────────────────────────────────────────────

REMOTEOK_TAGS = ["accounting", "finance", "bookkeeping", "quickbooks"]

def fetch_remoteok(max_results: int = 20) -> List[Dict]:
    """
    Fetch jobs from RemoteOK's free public JSON API.
    Combines results for accounting-related tags.
    """
    all_jobs: List[Dict] = []
    seen_ids = set()

    for tag in REMOTEOK_TAGS:
        url = f"https://remoteok.com/api?tag={tag}"
        logger.info(f"[RemoteOK] Tag: {tag}")
        resp = _safe_get(url)
        if not resp:
            continue

        try:
            data = resp.json()
            # First item is a disclaimer object, skip it
            entries = [d for d in data if isinstance(d, dict) and "id" in d]
            for entry in entries[:max_results]:
                job_id = str(entry.get("id", ""))
                if job_id in seen_ids:
                    continue
                seen_ids.add(job_id)

                job = _empty_job("RemoteOK")
                job["title"] = entry.get("position", "")
                job["company"] = entry.get("company", "")
                job["link"] = entry.get("url", f"https://remoteok.com/l/{job_id}")
                job["description"] = _clean_html(entry.get("description", ""))
                job["date_posted"] = entry.get("date", "")
                job["salary"] = entry.get("salary_min", "") or entry.get("salary_max", "")
                job["remote_status"] = "Remote"
                all_jobs.append(job)
        except Exception as e:
            logger.error(f"[RemoteOK] Parse error for tag '{tag}': {e}")

    logger.info(f"[RemoteOK] Total unique jobs: {len(all_jobs)}")
    return all_jobs


# ── Working Nomads API ────────────────────────────────────────────────────────

def fetch_workingnomads(max_results: int = 25) -> List[Dict]:
    """Fetch accounting/finance jobs from Working Nomads public API."""
    url = "https://www.workingnomads.com/api/exposed_jobs/?category=accounting-finance"
    logger.info("[WorkingNomads] Fetching accounting-finance jobs")

    resp = _safe_get(url)
    if not resp:
        return []

    try:
        data = resp.json()
        jobs = []
        for entry in data[:max_results]:
            job = _empty_job("Working Nomads")
            job["title"] = entry.get("title", "")
            job["company"] = entry.get("company_name", "")
            job["link"] = entry.get("url", "")
            job["description"] = _clean_html(entry.get("description", ""))
            job["date_posted"] = entry.get("pub_date", "")
            job["remote_status"] = "Remote"
            job["salary"] = entry.get("salary", "")
            jobs.append(job)
        logger.info(f"[WorkingNomads] Found {len(jobs)} jobs")
        return jobs
    except Exception as e:
        logger.error(f"[WorkingNomads] Parse error: {e}")
        return []


# ── URL Generators (open these manually in your browser) ─────────────────────

def generate_search_urls(queries: List[str]) -> Dict[str, List[str]]:
    """
    Build search URLs for job boards that block automated scraping.
    Open these in your browser to search manually.
    """
    urls: Dict[str, List[str]] = {
        "LinkedIn": [],
        "ZipRecruiter": [],
        "FlexJobs": [],
        "Robert Half": [],
        "Upwork": [],
    }

    for q in queries:
        encoded = q.replace(" ", "%20")
        encoded_plus = q.replace(" ", "+")

        urls["LinkedIn"].append(
            f"https://www.linkedin.com/jobs/search/?keywords={encoded}"
            f"&f_WT=2&f_JT=F%2CP%2CC%2CT"  # remote, full/part/contract/temp
        )
        urls["ZipRecruiter"].append(
            f"https://www.ziprecruiter.com/jobs-search?search={encoded_plus}"
            f"&location=Remote"
        )
        urls["FlexJobs"].append(
            f"https://www.flexjobs.com/search?search={encoded_plus}"
            f"&location=Remote"
        )
        urls["Robert Half"].append(
            f"https://www.roberthalf.com/us/en/jobs?keyword={encoded_plus}"
            f"&location=remote"
        )
        urls["Upwork"].append(
            f"https://www.upwork.com/nx/jobs/search/?q={encoded_plus}"
            f"&category2_uid=531770282580668418"  # Accounting category
        )

    return urls


# ── Master fetch function ─────────────────────────────────────────────────────

def fetch_all_jobs(config: Dict) -> List[Dict]:
    """
    Run all enabled job sources and return combined deduplicated list.
    """
    queries = config.get("search", {}).get("search_queries", ["bookkeeper remote"])
    max_per_run = config.get("search", {}).get("max_jobs_per_run", 50)

    all_jobs: List[Dict] = []
    seen_links: set = set()

    # RSS / API sources
    print("  Searching We Work Remotely...")
    for job in fetch_weworkremotely(max_results=30):
        if job["link"] not in seen_links:
            seen_links.add(job["link"])
            all_jobs.append(job)

    print("  Searching RemoteOK...")
    for job in fetch_remoteok(max_results=25):
        if job["link"] not in seen_links:
            seen_links.add(job["link"])
            all_jobs.append(job)

    print("  Searching Working Nomads...")
    for job in fetch_workingnomads(max_results=25):
        if job["link"] not in seen_links:
            seen_links.add(job["link"])
            all_jobs.append(job)

    # Indeed — query per search term (can be slow)
    indeed_queries = queries[:3]  # Limit to avoid rate limiting
    for q in indeed_queries:
        print(f"  Searching Indeed: '{q}'...")
        for job in fetch_indeed(q, max_results=15):
            if job["link"] not in seen_links:
                seen_links.add(job["link"])
                all_jobs.append(job)

    print(f"\n  Total raw jobs collected: {len(all_jobs)}")

    # Generate manual search URLs
    urls = generate_search_urls(queries[:4])
    print("\n  ── Manual search URLs (open these in your browser) ──")
    for board, board_urls in urls.items():
        if board_urls:
            print(f"  {board}: {board_urls[0]}")

    return all_jobs[:max_per_run]
