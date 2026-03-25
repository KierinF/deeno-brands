#!/usr/bin/env python3
"""
GPT-4.1-mini contact classification pipeline.

For each contact, produces:
  1. entity_type      — categorize as property_manager / owner / tenant /
                        contractor / government / institution / unknown
  2. canonical_name   — normalized company name for dedup grouping
                        (same company, different spellings → same canonical)
  3. actionable       — bool: worth calling for fire suppression at this building
  4. corrected_name   — display-only name fix (never overwrites business_name)

Usage:
  # Test run — 50 ECB records
  python classify_contacts.py --source nyc_ecb --type violation_respondent --limit 50

  # Full ECB run
  python classify_contacts.py --source nyc_ecb --type violation_respondent

  # DOB electrical owners
  python classify_contacts.py --source nyc_dob_electrical --type owner

  # pm_stitching leftovers
  python classify_contacts.py --source pm_stitching --type property_manager

  # Review results (not yet applied)
  python classify_contacts.py --review

  # Apply high-confidence results
  python classify_contacts.py --apply --min-confidence 0.80
"""

import argparse
import json
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

from openai import OpenAI
from supabase import create_client, Client

# ── Config ────────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
OPENAI_KEY   = os.environ["OPENAI_API_KEY"]

BATCH_SIZE   = 50
MODEL        = "gpt-4.1-mini"
PAGE_SIZE    = 1000  # fetch in pages to bypass Supabase 1k default limit
MAX_WORKERS  = 10    # parallel GPT batches

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client    = OpenAI(api_key=OPENAI_KEY)

# ── Prompt ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You classify NYC building contacts for a fire suppression sales CRM.
The goal is data quality: correct labels, deduplication keys, and actionability flags
so reps know exactly who to call and why.

For each contact return these fields:

entity_type — one of:
  property_manager  Building management company or individual hired to run day-to-day ops
                    (AKAM, Douglas Elliman, Cushman & Wakefield, Related, Vornado Mgmt)
  owner             The building owner (REIT, LLC, individual, partnership, condo board)
                    (Brookfield, Extell, SL Green, "123 Main St LLC", a named trustee)
  tenant            Business leasing space — retail, restaurant, hotel, office occupant
                    (Duane Reade, a restaurant, a hotel chain operating as lessee)
  contractor        Trades/construction company doing work at the building
                    (scaffolding, plumbing, electrical, GC, sign companies)
  government        Any city/state/federal agency (NYC DOE, NYC DDC, MTA, CUNY, NYCHA)
  institution       Non-profit, hospital, university, religious/cultural org
                    (NYU, Columbia, Mount Sinai, a church, a museum)
  unknown           Cannot determine from name alone (bare person names with no company)

canonical_name — A clean, normalized company name for deduplication.
  Rules:
  - Fix typos and OCR errors ("Cughman" → "Cushman & Wakefield")
  - Expand abbreviations ("NYC DOE" → "NYC Department of Education")
  - Strip trailing legal suffixes for grouping: "Flintlock Construction Corp." → "Flintlock Construction"
  - Use proper title case
  - Different spellings of the same company MUST return the SAME canonical_name
  - For individual persons with no company: return their full name cleaned up
  - For unknown entities: best-effort cleanup

corrected_name — Same as canonical_name unless the full legal name matters for display
  (e.g. "Cushman & Wakefield" not "Cushman and Wakefield")

confidence — 0.0–1.0 overall confidence in classification

reasoning — one sentence explaining entity_type decision

IMPORTANT DEDUP EXAMPLES — these must return the SAME canonical_name:
  "Cushman & Wakefield", "Cushman & Wakefield R.", "Cughman & Wakefield",
  "Cushman And Wakefield"  → canonical: "Cushman & Wakefield"

  "NYC Department of Education", "Nyc Doe", "Dept Of Ed", "Board Of Education D.O.E.",
  "Department Of Education P"  → canonical: "NYC Department of Education"

  "Flintlock Construction", "Flintlock Construction Se", "Flint Lock Construction S"
    → canonical: "Flintlock Construction"

  "Turner Construction Company", "Turner Consttruction Comp"
    → canonical: "Turner Construction Company"

  "Tishman Construction", "Tishman Construction Of N", "Tishman Const."
    → canonical: "Tishman Construction"

Return: {"results": [ ...one object per input, same order... ]}
Fields per result: entity_type, canonical_name, corrected_name, confidence, reasoning
""".strip()

# ── Core classification ───────────────────────────────────────────────────────

def format_contact(c: dict) -> str:
    first = (c.get("first_name") or "").strip()
    last  = (c.get("last_name")  or "").strip()
    biz   = (c.get("business_name") or "").strip()
    addr  = (c.get("building_address") or "").strip()
    src   = c.get("source", "")
    return (
        f'id:{c["id"]} '
        f'first:"{first}" last:"{last}" '
        f'biz:"{biz}" '
        f'addr:"{addr}" src:{src}'
    )

def classify_batch(contacts: list[dict]) -> list[dict]:
    lines    = [format_contact(c) for c in contacts]
    user_msg = "Classify the following contacts and return JSON:\n" + "\n".join(lines) + '\n\nReturn {"results":[...]}'

    response = openai_client.chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_msg},
        ],
        temperature=0,
    )

    results = json.loads(response.choices[0].message.content).get("results", [])

    # Pad if model returned fewer results than expected
    while len(results) < len(contacts):
        results.append({
            "entity_type": "unknown", "canonical_name": None,
            "reasoning": "missing from response",
        })

    return results

# ── Fetch contacts with pagination ────────────────────────────────────────────

def fetch_contacts(source: str, contact_type: str, limit: Optional[int]) -> list[dict]:
    all_rows = []
    offset   = 0

    while True:
        page_limit = PAGE_SIZE
        if limit:
            page_limit = min(PAGE_SIZE, limit - len(all_rows))
            if page_limit <= 0:
                break

        rows = (
            supabase.table("contacts")
            .select("id, first_name, last_name, business_name, source, parcel_id")
            .eq("source", source)
            .eq("contact_type", contact_type)
            .is_("ai_classified_at", "null")
            .range(offset, offset + page_limit - 1)
            .execute()
            .data
        )

        if not rows:
            break

        all_rows.extend(rows)
        offset += len(rows)

        if len(rows) < page_limit:
            break  # last page
        if limit and len(all_rows) >= limit:
            break

    # Fetch building addresses in one query
    parcel_ids = list({r["parcel_id"] for r in all_rows if r.get("parcel_id")})
    addr_map   = {}
    if parcel_ids:
        # Fetch in chunks to avoid URL length limits
        for i in range(0, len(parcel_ids), 500):
            chunk = parcel_ids[i:i+500]
            bi_rows = (
                supabase.table("building_intelligence")
                .select("parcel_id, address")
                .in_("parcel_id", chunk)
                .execute()
                .data
            )
            addr_map.update({r["parcel_id"]: r["address"] for r in bi_rows})

    for r in all_rows:
        r["building_address"] = addr_map.get(r.get("parcel_id"), "")

    return all_rows

# ── Run classification ────────────────────────────────────────────────────────

def classify_and_save(batch: list[dict], batch_n: int, total_batches: int) -> int:
    """Classify one batch and write results to DB. Returns number saved."""
    try:
        results = classify_batch(batch)
    except Exception as e:
        print(f"  [{batch_n}/{total_batches}] ERROR: {e} — skipping")
        return 0

    audit_rows  = []
    contact_ids = []
    for contact, result in zip(batch, results):
        audit_rows.append({
            "contact_id":           contact["id"],
            "ai_entity_type":       result.get("entity_type"),
            "ai_corrected_name":    result.get("corrected_name"),
            "ai_canonical_name":    result.get("canonical_name"),
            "ai_confidence":        result.get("confidence"),
            "ai_reasoning":         result.get("reasoning"),
        })
        contact_ids.append(contact["id"])

    supabase.table("contact_ai_classifications").insert(audit_rows).execute()
    supabase.table("contacts").update(
        {"ai_classified_at": "now()"}
    ).in_("id", contact_ids).execute()

    print(f"  [{batch_n}/{total_batches}] {len(batch)} records... done")
    return len(batch)


def run_classification(source: str, contact_type: str, limit: Optional[int]):
    contacts = fetch_contacts(source, contact_type, limit)
    if not contacts:
        print("No unclassified contacts found.")
        return

    batches       = [contacts[i:i+BATCH_SIZE] for i in range(0, len(contacts), BATCH_SIZE)]
    total_batches = len(batches)
    print(f"Classifying {len(contacts)} contacts [{source} / {contact_type}] — {total_batches} batches ({MAX_WORKERS} parallel)")

    total_saved = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(classify_and_save, batch, n+1, total_batches): n
            for n, batch in enumerate(batches)
        }
        for fut in as_completed(futures):
            total_saved += fut.result()

    print(f"\nDone — {total_saved} records classified. Run --review to inspect, --apply to commit.")

# ── Review ────────────────────────────────────────────────────────────────────

def review():
    rows = (
        supabase.table("contact_ai_classifications")
        .select("id, ai_entity_type, ai_canonical_name, ai_corrected_name, ai_confidence, ai_reasoning, contacts(first_name, last_name, business_name, source, contact_type)")
        .eq("applied", False)
        .order("ai_confidence", desc=True)
        .limit(500)
        .execute()
        .data
    )

    if not rows:
        print("No unapplied classifications.")
        return

    by_type: dict[str, list] = {}
    for r in rows:
        t = r.get("ai_entity_type") or "unknown"
        by_type.setdefault(t, []).append(r)

    print(f"\n{'─'*100}")
    print(f"{'ORIGINAL':<30} {'CANONICAL NAME':<32} {'TYPE':<18} {'CONF':<5}  REASON")
    print(f"{'─'*100}")

    for entity_type, group in sorted(by_type.items()):
        print(f"\n  ── {entity_type.upper()} ({len(group)}) ──")
        for r in group[:8]:
            c    = r.get("contacts") or {}
            orig = (f"{c.get('first_name','')} {c.get('last_name','')}".strip()
                    or c.get("business_name",""))[:28]
            can  = (r.get("ai_canonical_name") or "")[:30]
            conf = r.get("ai_confidence", 0)
            rsn  = (r.get("ai_reasoning") or "")[:38]
            print(f"  {orig:<30} {can:<32} {entity_type:<18} {conf:<5.2f}  {rsn}")
        if len(group) > 8:
            print(f"  ... and {len(group)-8} more")

    counts = {t: len(g) for t, g in by_type.items()}
    print(f"\n{'─'*100}")
    print(f"Total reviewed: {len(rows)}")
    print(f"By type: {json.dumps(counts, indent=2)}")

    # Canonical dedup preview
    canonical_counts: dict[str, int] = {}
    for r in rows:
        cn = r.get("ai_canonical_name")
        if cn:
            canonical_counts[cn] = canonical_counts.get(cn, 0) + 1
    dupes = {k: v for k, v in canonical_counts.items() if v > 1}
    if dupes:
        print(f"\nCanonical groups with multiple contacts (dedup hits):")
        for name, count in sorted(dupes.items(), key=lambda x: -x[1])[:15]:
            print(f"  {name:<40} {count} contacts")

# ── Apply ─────────────────────────────────────────────────────────────────────

def apply_classifications(min_confidence: float):
    # Fetch in pages
    all_rows = []
    offset   = 0
    while True:
        page = (
            supabase.table("contact_ai_classifications")
            .select("id, contact_id, ai_entity_type, ai_corrected_name, ai_canonical_name, ai_confidence")
            .eq("applied", False)
            .gte("ai_confidence", min_confidence)
            .range(offset, offset + 999)
            .execute()
            .data
        )
        if not page:
            break
        all_rows.extend(page)
        if len(page) < 1000:
            break
        offset += 1000

    if not all_rows:
        print(f"No unapplied classifications with confidence >= {min_confidence}")
        return

    # Map entity_type → allowed contact_type values
    TYPE_MAP = {
        "property_manager": "property_manager",
        "owner":            "owner",
        "tenant":           "tenant",
        "contractor":       "trade_referral",
        "institution":      "institution",
        "government":       None,   # keep as violation_respondent
        "unknown":          None,
    }

    print(f"Applying {len(all_rows)} classifications (confidence >= {min_confidence})...")
    applied_ids = []

    for r in all_rows:
        update = {
            "ai_entity_type":    r.get("ai_entity_type"),
            "ai_corrected_name": r.get("ai_corrected_name"),
            "ai_canonical_name": r.get("ai_canonical_name"),
            "ai_confidence":     r.get("ai_confidence"),
            # Never touch business_name — it's the raw source key
        }

        new_type = TYPE_MAP.get(r.get("ai_entity_type") or "")
        if new_type:
            update["contact_type"] = new_type

        supabase.table("contacts").update(update).eq("id", r["contact_id"]).execute()
        applied_ids.append(r["id"])

    # Mark applied in chunks
    for i in range(0, len(applied_ids), 500):
        supabase.table("contact_ai_classifications").update(
            {"applied": True}
        ).in_("id", applied_ids[i:i+500]).execute()

    print(f"Applied {len(applied_ids)} classifications.")

# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="GPT-4.1-mini contact classifier")
    parser.add_argument("--source",         help="contacts.source to process")
    parser.add_argument("--type",           help="contacts.contact_type to process")
    parser.add_argument("--limit",          type=int, help="Max records (for test runs)")
    parser.add_argument("--review",         action="store_true")
    parser.add_argument("--apply",          action="store_true")
    parser.add_argument("--min-confidence", type=float, default=0.80)
    args = parser.parse_args()

    if args.review:
        review()
    elif args.apply:
        apply_classifications(args.min_confidence)
    elif args.source and args.type:
        run_classification(args.source, args.type, args.limit)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
