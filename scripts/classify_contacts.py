#!/usr/bin/env python3
"""
GPT-4o mini contact classification pipeline.

Fixes broken ECB names, sub-classifies entity types, validates pm_name entries.

Usage:
  # Test run — 50 ECB records, review output before committing
  python classify_contacts.py --source nyc_ecb --type violation_respondent --limit 50

  # Full ECB run
  python classify_contacts.py --source nyc_ecb --type violation_respondent

  # DOB electrical owners
  python classify_contacts.py --source nyc_dob_electrical --type owner

  # Review results without applying
  python classify_contacts.py --review

  # Apply high-confidence results (>=0.80) after review
  python classify_contacts.py --apply --min-confidence 0.80
"""

import argparse
import json
import os
import sys
import time
from typing import Optional

from openai import OpenAI
from supabase import create_client, Client

# ── Config ────────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]  # service role key needed
OPENAI_KEY   = os.environ["OPENAI_API_KEY"]

BATCH_SIZE   = 50
MODEL        = "gpt-4o-mini"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client    = OpenAI(api_key=OPENAI_KEY)

# ── Prompt ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You classify NYC building contacts for a fire suppression sales CRM.

For each contact you receive, return:
- corrected_name: the full, correctly spelled business name. Reconstruct truncated names,
  rejoin names that were split across first/last name fields, expand obvious abbreviations.
  If it's a person (not a company), return their full name as-is.
- entity_type: one of these exact strings:
    property_manager  — company or person hired to manage the building day-to-day
                        (e.g. AKAM Associates, Douglas Elliman, Cushman & Wakefield, Related Management)
    owner             — the building owner entity (individual, LLC, REIT, partnership)
                        (e.g. SL Green Realty, Brookfield, a "123 Main St LLC")
    tenant            — a business or person leasing space in the building
                        (restaurants, retailers, offices, hotels operating as tenant)
    contractor        — a construction, trades, or maintenance company doing work there
                        (plumbers, electricians, scaffolding, sign companies, GCs)
    government        — any city, state, or federal agency
                        (NYC DDC, NYC DHS, MTA, CUNY, etc.)
    institution       — non-profit, hospital, university, religious org, cultural org
                        (NYU, Lenox Hill Hospital, a church, a museum)
    unknown           — genuinely cannot determine from the name alone
- confidence: float 0.0–1.0 reflecting how certain you are
- reasoning: one sentence max explaining your classification

Key heuristics:
- "LLC", "Corp", "Inc", "LP", "Associates", "Realty", "Properties" in the name alone
  does NOT make it a property_manager — many owners are LLCs. Look for management indicators.
- Management indicators: "Management", "Mgmt", "Property Management", known PM firm names
- A building-address LLC like "123 West 45th Street LLC" is almost always the owner entity
- Hotels operating the property are tenants from the building's perspective
- Scaffolding, plumbing, electrical, sign companies are contractors
- If first_name + last_name looks like it was a company name split in two, reconstruct it

Examples:
  first="S.L Green Real"  last="Estate"      → {corrected_name:"SL Green Realty Corp", entity_type:"owner", confidence:0.95}
  first="Cushman &"       last="Wakefield"   → {corrected_name:"Cushman & Wakefield", entity_type:"property_manager", confidence:0.99}
  first="Flintlock"       last="Construction Se" → {corrected_name:"Flintlock Construction", entity_type:"contractor", confidence:0.95}
  first="Nyc"             last="Dhs"         → {corrected_name:"NYC Dept of Homeless Services", entity_type:"government", confidence:0.97}
  first="Triumph Hotels"  last="Lemarquis"   → {corrected_name:"Triumph Hotels", entity_type:"tenant", confidence:0.85}
  first="Omar"            last="Bagels"      → {corrected_name:"Omar Bagels", entity_type:"tenant", confidence:0.90}
  first="Extell"          last="Development Compan" → {corrected_name:"Extell Development Company", entity_type:"owner", confidence:0.95}
  first="Mott Hall"       last="Doe"         → {corrected_name:"Mott Hall", entity_type:"institution", confidence:0.80}
  first="Cuny Bmcc"       last="Performing Arts" → {corrected_name:"CUNY BMCC Performing Arts", entity_type:"institution", confidence:0.95}
  biz="444 PARK AVE SOUTH OWNER LLC"         → {corrected_name:"444 Park Ave South Owner LLC", entity_type:"owner", confidence:0.97}
  biz="BOSTON PROPERTIES"                    → {corrected_name:"Boston Properties", entity_type:"owner", confidence:0.90}
  biz="VORNADO OFFICE MANAGEMENT"            → {corrected_name:"Vornado Office Management", entity_type:"property_manager", confidence:0.97}

Return a JSON object: {"results": [ ...one per input, same order... ]}
""".strip()

# ── Core classification ───────────────────────────────────────────────────────

def format_contact_for_prompt(c: dict) -> str:
    first = (c.get("first_name") or "").strip()
    last  = (c.get("last_name")  or "").strip()
    biz   = (c.get("business_name") or "").strip()
    addr  = (c.get("building_address") or "").strip()
    src   = c.get("source", "")
    return (
        f'id:{c["id"]} '
        f'first:"{first}" last:"{last}" '
        f'biz:"{biz}" '
        f'address:"{addr}" '
        f'source:{src}'
    )

def classify_batch(contacts: list[dict]) -> list[dict]:
    lines = [format_contact_for_prompt(c) for c in contacts]
    user_msg = "Classify these contacts:\n" + "\n".join(lines) + "\n\nReturn JSON."

    response = openai_client.chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_msg},
        ],
        temperature=0,
    )

    raw = json.loads(response.choices[0].message.content)
    results = raw.get("results", [])

    if len(results) != len(contacts):
        print(f"  WARNING: got {len(results)} results for {len(contacts)} contacts — padding with unknowns")
        while len(results) < len(contacts):
            results.append({"corrected_name": None, "entity_type": "unknown", "confidence": 0.0, "reasoning": "missing from response"})

    return results

# ── Fetch contacts ────────────────────────────────────────────────────────────

def fetch_contacts(source: str, contact_type: str, limit: Optional[int]) -> list[dict]:
    # Join building address for better context
    q = (
        supabase.table("contacts")
        .select("id, first_name, last_name, business_name, source, parcel_id, building_intelligence(address)")
        .eq("source", source)
        .eq("contact_type", contact_type)
        .is_("ai_classified_at", "null")
    )
    if limit:
        q = q.limit(limit)

    rows = q.execute().data

    # Flatten nested building address
    for r in rows:
        bi = r.pop("building_intelligence", None) or {}
        r["building_address"] = bi.get("address", "") if isinstance(bi, dict) else ""

    return rows

# ── Run classification ────────────────────────────────────────────────────────

def run_classification(source: str, contact_type: str, limit: Optional[int]):
    contacts = fetch_contacts(source, contact_type, limit)
    if not contacts:
        print("No unclassified contacts found for that source/type.")
        return

    print(f"Classifying {len(contacts)} contacts [{source} / {contact_type}]")
    total_batches = (len(contacts) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(contacts), BATCH_SIZE):
        batch   = contacts[i : i + BATCH_SIZE]
        batch_n = i // BATCH_SIZE + 1
        print(f"  Batch {batch_n}/{total_batches} ({len(batch)} records)...", end=" ", flush=True)

        try:
            results = classify_batch(batch)
        except Exception as e:
            print(f"ERROR: {e}")
            time.sleep(2)
            continue

        # Write to audit table
        audit_rows = []
        contact_ids = []
        for contact, result in zip(batch, results):
            audit_rows.append({
                "contact_id":        contact["id"],
                "ai_entity_type":    result.get("entity_type"),
                "ai_corrected_name": result.get("corrected_name"),
                "ai_confidence":     result.get("confidence"),
                "ai_reasoning":      result.get("reasoning"),
            })
            contact_ids.append(contact["id"])

        supabase.table("contact_ai_classifications").insert(audit_rows).execute()

        # Stamp contacts so we don't reprocess them
        supabase.table("contacts").update(
            {"ai_classified_at": "now()"}
        ).in_("id", contact_ids).execute()

        print("done")
        time.sleep(0.2)  # gentle rate limiting

    print(f"\nDone. Run --review to inspect results before applying.")

# ── Review ────────────────────────────────────────────────────────────────────

def review():
    rows = (
        supabase.table("contact_ai_classifications")
        .select("id, contact_id, ai_entity_type, ai_corrected_name, ai_confidence, ai_reasoning, contacts(first_name, last_name, business_name, source, contact_type)")
        .eq("applied", False)
        .order("ai_confidence", desc=True)
        .limit(200)
        .execute()
        .data
    )

    if not rows:
        print("No unapplied classifications found.")
        return

    print(f"\n{'─'*100}")
    print(f"{'ORIGINAL NAME':<35} {'BIZ':<30} {'→'} {'AI NAME':<30} {'TYPE':<18} {'CONF':<6} REASONING")
    print(f"{'─'*100}")

    by_type: dict[str, list] = {}
    for r in rows:
        t = r.get("ai_entity_type", "unknown")
        by_type.setdefault(t, []).append(r)

    for entity_type, group in sorted(by_type.items()):
        print(f"\n  ── {entity_type.upper()} ({len(group)}) ──")
        for r in group[:10]:  # show up to 10 per type
            c = r.get("contacts") or {}
            orig = f"{c.get('first_name','')} {c.get('last_name','')}".strip() or c.get("business_name","")
            biz  = (c.get("business_name") or "")[:28]
            name = (r.get("ai_corrected_name") or "")[:28]
            conf = r.get("ai_confidence", 0)
            rsn  = (r.get("ai_reasoning") or "")[:40]
            print(f"  {orig:<35} {biz:<30} → {name:<30} {entity_type:<18} {conf:<6.2f} {rsn}")
        if len(group) > 10:
            print(f"  ... and {len(group)-10} more")

    counts = {t: len(g) for t, g in by_type.items()}
    print(f"\n{'─'*100}")
    print(f"Total unapplied: {len(rows)}")
    print(f"By type: {json.dumps(counts, indent=2)}")

# ── Apply ─────────────────────────────────────────────────────────────────────

def apply_classifications(min_confidence: float):
    rows = (
        supabase.table("contact_ai_classifications")
        .select("id, contact_id, ai_entity_type, ai_corrected_name, ai_confidence")
        .eq("applied", False)
        .gte("ai_confidence", min_confidence)
        .execute()
        .data
    )

    if not rows:
        print(f"No unapplied classifications with confidence >= {min_confidence}")
        return

    print(f"Applying {len(rows)} classifications (confidence >= {min_confidence})...")

    # Map entity_type to allowed contact_type values
    TYPE_MAP = {
        "property_manager": "property_manager",
        "owner":            "owner",
        "tenant":           "tenant",
        "contractor":       "trade_referral",
        "government":       "violation_respondent",  # keep label, note in ai_entity_type
        "institution":      "violation_respondent",
        "unknown":          None,  # don't change contact_type
    }

    applied_ids = []
    for r in rows:
        contact_id   = r["contact_id"]
        entity_type  = r.get("ai_entity_type")
        corrected    = r.get("ai_corrected_name")
        confidence   = r.get("ai_confidence", 0)

        update: dict = {
            "ai_entity_type":    entity_type,
            "ai_corrected_name": corrected,
            "ai_confidence":     confidence,
        }

        # Apply corrected business name if present
        if corrected:
            update["business_name"] = corrected

        # Only change contact_type if we have a clear mapping
        new_type = TYPE_MAP.get(entity_type)
        if new_type:
            update["contact_type"] = new_type

        supabase.table("contacts").update(update).eq("id", contact_id).execute()
        applied_ids.append(r["id"])

    # Mark as applied in bulk
    supabase.table("contact_ai_classifications").update(
        {"applied": True}
    ).in_("id", applied_ids).execute()

    print(f"Applied {len(applied_ids)} classifications.")

# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="GPT-4o mini contact classifier")
    parser.add_argument("--source",         help="contacts.source to process (e.g. nyc_ecb)")
    parser.add_argument("--type",           help="contacts.contact_type to process (e.g. violation_respondent)")
    parser.add_argument("--limit",          type=int, help="Max records to process (for test runs)")
    parser.add_argument("--review",         action="store_true", help="Print unapplied results for review")
    parser.add_argument("--apply",          action="store_true", help="Apply classifications to contacts table")
    parser.add_argument("--min-confidence", type=float, default=0.80, help="Min confidence to auto-apply (default 0.80)")
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
