#!/usr/bin/env python3
"""
Web enrichment script — GPT-4o web search to find PM, owner, leasing brokers,
tenants, and building website for scored buildings.

Stores:
  - building_intelligence.building_website
  - building_intelligence.web_enriched_at
  - building_intelligence.web_enrichment_raw  (full GPT response JSON)
  - contacts rows per entity found (source='web_enriched')
  - updates pm_name/pm_confidence if GPT finds something better

Usage:
  python enrich_buildings.py --dry-run --limit 5
  python enrich_buildings.py --limit 1000
  python enrich_buildings.py --parcel-id nyc_1001817504
  python enrich_buildings.py --all         # all buildings with leads
"""

import argparse
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
OPENAI_KEY   = os.environ["OPENAI_API_KEY"]

db     = create_client(SUPABASE_URL, SUPABASE_KEY)
openai = OpenAI(api_key=OPENAI_KEY)

CATEGORIES_TEXT = """
  property_manager  — Company hired to run day-to-day building operations (not a broker)
  owner             — Building owner: REIT, LLC, partnership, individual, condo board
  leasing_broker    — Real estate broker marketing the building (NOT the property manager)
  tenant            — A business currently leasing space in the building
  contractor        — Trades/construction company doing work at the building
  government        — Any city/state/federal agency
  institution       — Non-profit, hospital, university, religious org
  unknown           — Cannot determine role
""".strip()

WRITE_CATEGORIES  = {"property_manager", "owner", "leasing_broker", "tenant"}
PM_UPDATE_MIN_CONF = 0.70   # only update pm_name if GPT confidence >= this
MAX_WORKERS        = 5      # concurrent GPT calls
GPT_MODEL          = "gpt-4o"
INPUT_COST_PER_M   = 2.50   # $ per 1M input tokens
OUTPUT_COST_PER_M  = 10.00  # $ per 1M output tokens


# ── Prompt ────────────────────────────────────────────────────────────────────

def build_prompt(address: str) -> str:
    return f"""Research the commercial property at the EXACT address: {address}

Run these searches:
1. "{address}" — find the building's own website or leasing/marketing page
2. "{address} property manager"
3. "{address} owner"
4. "{address} management"

For every company or person you find, categorize using ONLY:
{CATEGORIES_TEXT}

STRICT CONFIDENCE RULES — be conservative:
- confidence >= 0.8 ONLY if a source explicitly contains "{address}" or a clear variant like "117 W 26 St"
- confidence 0.5–0.7 if the entity is named in association with this building but the source URL doesn't explicitly state the address
- confidence <= 0.3 if inferred from name similarity alone (e.g. "Hudson" in company name ≠ this building)
- address_confirmed: true only if the source page explicitly references this address

Return ONLY a JSON object (no markdown fences, no extra text):
{{
  "building_website": "official building or leasing site URL, or null",
  "entities": [
    {{
      "name": "company or person name",
      "category": "one category from the list",
      "contact_person": "Full Name, Title — or null if not found",
      "confidence": 0.0,
      "reasoning": "1-2 sentences on why you assigned this category and confidence",
      "source_url": "URL of source or null",
      "address_confirmed": false
    }}
  ],
  "notes": "acquisition details, recent sale, ownership context, or anything else relevant"
}}"""


# ── GPT call ──────────────────────────────────────────────────────────────────

def call_gpt(address: str) -> dict | None:
    try:
        resp = openai.responses.create(
            model=GPT_MODEL,
            tools=[{"type": "web_search_preview"}],
            input=build_prompt(address),
        )
        raw_text = ""
        for item in resp.output:
            if hasattr(item, "content"):
                for block in item.content:
                    if hasattr(block, "text"):
                        raw_text = block.text
                        break

        text = re.sub(r"^```(?:json)?\s*", "", raw_text.strip())
        text = re.sub(r"\s*```$", "", text.strip())
        result = json.loads(text)

        in_tok  = resp.usage.input_tokens
        out_tok = resp.usage.output_tokens
        cost    = in_tok / 1_000_000 * INPUT_COST_PER_M + out_tok / 1_000_000 * OUTPUT_COST_PER_M

        result["_meta"] = {
            "model":         GPT_MODEL,
            "input_tokens":  in_tok,
            "output_tokens": out_tok,
            "cost_usd":      round(cost, 6),
            "enriched_at":   datetime.now(timezone.utc).isoformat(),
            "address":       address,
        }
        return result
    except Exception as e:
        print(f"    GPT error for {address}: {e}", flush=True)
        return None


# ── Write results ─────────────────────────────────────────────────────────────

def write_results(parcel_id: str, result: dict, existing_pm_conf: int, dry_run: bool) -> int:
    entities         = result.get("entities") or []
    notes            = result.get("notes") or ""
    building_website = result.get("building_website")
    meta             = result.get("_meta", {})
    written = 0

    # ── Contacts ──────────────────────────────────────────────────────────────
    for entity in entities:
        if entity.get("category") not in WRITE_CATEGORIES:
            continue
        if (entity.get("confidence") or 0) < 0.35:
            continue

        name = (entity.get("name") or "").strip()
        if not name:
            continue

        # Parse "First Last, Title" from contact_person
        contact_raw   = (entity.get("contact_person") or "").strip()
        first = last = title = None
        if contact_raw and contact_raw.lower() != "null":
            parts = contact_raw.split(",", 1)
            name_parts = parts[0].strip().split(" ", 1)
            first = name_parts[0] if name_parts else None
            last  = name_parts[1] if len(name_parts) > 1 else None
            title = parts[1].strip() if len(parts) > 1 else None

        conf_int = int((entity.get("confidence") or 0) * 100)

        row = {
            "parcel_id":       parcel_id,
            "contact_type":    entity["category"],
            "business_name":   name,
            "first_name":      first,
            "last_name":       last,
            "title":           title,
            "source":          "web_enriched",
            "confidence":      conf_int,
            "ai_entity_type":  entity["category"],
            "ai_confidence":   entity.get("confidence"),
        }

        label = f"{entity['category']} — {name}" + (f" ({contact_raw})" if contact_raw else "")
        if dry_run:
            print(f"    [DRY] contact: {label}  conf={conf_int}%")
        else:
            try:
                # dedup_hash is a generated column (parcel_id|first|last) — let DB compute it
                db.table("contacts").upsert(row, on_conflict="dedup_hash", ignore_duplicates=True).execute()
                written += 1
            except Exception as e:
                print(f"    warn: contact upsert failed for {name}: {e}")

    # ── building_intelligence update ──────────────────────────────────────────
    pm_candidates = [e for e in entities if e.get("category") == "property_manager"]
    best_pm = (max(pm_candidates, key=lambda e: e.get("confidence", 0))
               if pm_candidates else None)

    bi_update: dict = {
        "web_enriched_at":    meta.get("enriched_at"),
        "web_enrichment_raw": result,   # full GPT response including meta
    }
    if building_website:
        bi_update["building_website"] = building_website

    if (best_pm
            and (best_pm.get("confidence") or 0) >= PM_UPDATE_MIN_CONF
            and best_pm.get("address_confirmed")
            and int((best_pm.get("confidence") or 0) * 100) > (existing_pm_conf or 0)):
        bi_update["pm_name"]       = best_pm["name"]
        bi_update["pm_confidence"] = int(best_pm["confidence"] * 100)
        if dry_run:
            print(f"    [DRY] update pm_name → {best_pm['name']} ({bi_update['pm_confidence']}%)")
        else:
            print(f"    → PM updated: {best_pm['name']} ({bi_update['pm_confidence']}%)")

    if dry_run:
        if building_website:
            print(f"    [DRY] building_website → {building_website}")
    else:
        try:
            db.table("building_intelligence").update(bi_update).eq("parcel_id", parcel_id).execute()
        except Exception as e:
            print(f"    warn: building_intelligence update failed: {e}")

    return written


# ── Fetch buildings ───────────────────────────────────────────────────────────

def fetch_buildings(args) -> list[dict]:
    if args.parcel_id:
        r = (db.table("building_intelligence")
             .select("parcel_id, address, pm_name, pm_confidence, web_enriched_at, web_enrichment_raw")
             .eq("parcel_id", args.parcel_id)
             .execute())
        return r.data or []

    # Fetch in 1k chunks directly from building_intelligence
    buildings: list[dict] = []
    start = 0
    while True:
        q = (db.table("building_intelligence")
             .select("parcel_id, address, pm_name, pm_confidence, web_enriched_at, web_enrichment_raw")
             .not_.like("building_class", "Y%"))

        if not args.all:
            if args.min_score:
                q = q.gte("signal_score", args.min_score)
            else:
                q = q.gt("signal_score", 0)

        if not args.redo:
            q = q.is_("web_enriched_at", "null")

        r = q.range(start, start + 999).execute()
        data = r.data or []
        buildings.extend(data)
        if len(data) < 1000:
            break
        start += 1000

    # Sort by pm_confidence asc so lowest-confidence get enriched first
    buildings.sort(key=lambda b: b.get("pm_confidence") or 0)

    if args.limit:
        buildings = buildings[:args.limit]

    return buildings


# ── Process one building ──────────────────────────────────────────────────────

def process_one(building: dict, dry_run: bool, from_cache: bool = False) -> dict:
    parcel_id = building["parcel_id"]
    address   = (building.get("address") or "").strip()
    if not address:
        return {"parcel_id": parcel_id, "skipped": True, "cost": 0}

    if from_cache:
        result = building.get("web_enrichment_raw")
        if not result:
            return {"parcel_id": parcel_id, "skipped": True, "cost": 0}
    else:
        full_address = f"{address}, New York, NY"
        result = call_gpt(full_address)
        if not result:
            return {"parcel_id": parcel_id, "skipped": True, "cost": 0}

    cost    = result["_meta"]["cost_usd"]
    written = write_results(parcel_id, result, building.get("pm_confidence") or 0, dry_run)

    entities    = result.get("entities") or []
    pm_found    = next((e for e in entities if e.get("category") == "property_manager"), None)
    owner_found = next((e for e in entities if e.get("category") == "owner"), None)
    website     = result.get("building_website")

    summary = []
    if website:               summary.append(f"site={website}")
    if pm_found:              summary.append(f"PM={pm_found['name']} ({int((pm_found.get('confidence',0))*100)}%)")
    if owner_found:           summary.append(f"owner={owner_found['name']} ({int((owner_found.get('confidence',0))*100)}%)")
    if summary:
        print(f"    → {' | '.join(summary)}", flush=True)
    else:
        print(f"    → nothing found", flush=True)

    return {
        "parcel_id":   parcel_id,
        "address":     address,
        "cost":        cost,
        "written":     written,
        "pm_found":    bool(pm_found),
        "owner_found": bool(owner_found),
        "site_found":  bool(website),
        "skipped":     False,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run",    action="store_true", help="Don't write to DB")
    parser.add_argument("--all",        action="store_true", help="Include buildings without leads")
    parser.add_argument("--redo",       action="store_true", help="Re-enrich already-enriched buildings")
    parser.add_argument("--from-cache", action="store_true", help="Write contacts from stored web_enrichment_raw (no GPT calls, free)")
    parser.add_argument("--limit",      type=int,            help="Max buildings to process")
    parser.add_argument("--parcel-id",  type=str,            help="Single parcel")
    parser.add_argument("--workers",    type=int, default=5, help="Concurrent GPT calls (default 5)")
    parser.add_argument("--min-score",  type=int,            help="Only buildings with lead score >= this")
    args = parser.parse_args()

    # --from-cache implies --redo (need already-enriched buildings)
    if args.from_cache:
        args.redo = True

    buildings = fetch_buildings(args)
    total = len(buildings)
    print(f"\nBuildings to process: {total}")
    if args.dry_run:
        print("DRY RUN — no writes\n")
    elif args.from_cache:
        print("FROM CACHE — reading web_enrichment_raw, no GPT calls, $0.00\n")
    else:
        est_cost = total * 0.015  # rough estimate
        print(f"Estimated cost: ~${est_cost:.2f} (actual will vary)\n")

    results        = []
    total_cost     = 0.0
    pm_found_n     = 0
    owner_found_n  = 0
    site_found_n   = 0
    total_written  = 0
    skipped_n      = 0

    def run(i_building):
        i, building = i_building
        address = building.get("address") or "?"
        pm_now  = building.get("pm_name") or "none"
        conf    = building.get("pm_confidence") or 0
        print(f"[{i}/{total}] {address}  (pm={pm_now}, conf={conf}%)", flush=True)
        return process_one(building, args.dry_run, args.from_cache)

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(run, (i+1, b)): b for i, b in enumerate(buildings)}
        for future in as_completed(futures):
            r = future.result()
            results.append(r)
            if r.get("skipped"):
                skipped_n += 1
                continue
            total_cost    += r.get("cost", 0)
            total_written += r.get("written", 0)
            if r.get("pm_found"):    pm_found_n   += 1
            if r.get("owner_found"): owner_found_n += 1
            if r.get("site_found"):  site_found_n  += 1

    processed = total - skipped_n
    print(f"\n{'='*55}")
    print(f"Processed:        {processed} buildings ({skipped_n} skipped)")
    print(f"PM found:         {pm_found_n}  ({100*pm_found_n//max(processed,1)}%)")
    print(f"Owner found:      {owner_found_n}  ({100*owner_found_n//max(processed,1)}%)")
    print(f"Website found:    {site_found_n}  ({100*site_found_n//max(processed,1)}%)")
    print(f"Contacts written: {total_written}")
    print(f"Actual cost:      ${total_cost:.4f}")
    print(f"Cost per bldg:    ${total_cost/max(processed,1):.5f}")


if __name__ == "__main__":
    main()
