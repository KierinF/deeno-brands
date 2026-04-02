#!/usr/bin/env python3
"""
Per-building contact classification.
Layer 1: classify each contact as 'person' or 'entity' → sets ai_entity_type
Layer 2: assign unlinked person contacts to the highest-confidence org at the
         building of the matching type → sets organization_id + assignment_source

Usage:
  # Dry run (no DB writes)
  python classify_buildings.py --parcel-ids nyc_1021380040,nyc_4059000002

  # Apply to DB
  python classify_buildings.py --parcel-ids nyc_1021380040,nyc_4059000002 --apply
"""

import argparse
import json
import os

from openai import OpenAI
from supabase import create_client, Client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
OPENAI_KEY   = os.environ["OPENAI_API_KEY"]

MODEL      = "gpt-5-nano"
BATCH_SIZE = 50

# ── Rule-based pre-filter ─────────────────────────────────────────────────────
# Words that only appear in company/org names, never real human surnames
ENTITY_KEYWORDS = {
    'llc','lp','llp','inc','corp','corporation','ltd','limited','pllc',
    'construction','constructoin','constructors','constru',
    'management','mngmt','mgt',
    'development','developer',
    'realty','properties','property',
    'hospital','hosp','presbyterian','presby','prebyterian',
    'university','college','trustees','foundation',
    'transport','storage','terminal','army',
    'cleaners','laundry',
    'bank','telephone','telecom',
    'department','dept','authority','commission','board',
    'agency','services','service',
    'condominium','condomini','condomin',
    'restoration','contractors',
    'lendlease','buttermark',
}

GARBAGE_PHRASES = {
    'name not on file','owner of','onwer of','doctor rick',
    'name not','not on file',
}

def rule_based_classify(first: str, last: str, biz: str) -> str | None:
    """Return 'person', 'entity', or None (needs API)."""
    combined = f"{first} {last}".lower().strip()
    biz_lower = (biz or '').lower()

    # Garbage placeholders → entity
    if combined in GARBAGE_PHRASES or any(g in combined for g in GARBAGE_PHRASES):
        return 'entity'

    # MD/DO/PhD suffix → person
    if any(sfx in last.lower() for sfx in [', md', ' md', '.md', ', do', ', phd']):
        return 'person'

    # Business name set + looks like real first/last name → person
    # (e.g. JOHN HANSEN / ARGO REAL ESTATE LLC)
    if biz and first and last and not any(kw in first.lower() for kw in ENTITY_KEYWORDS):
        return 'person'

    # Any entity keyword in the combined name → entity
    words = combined.replace('.', ' ').replace(',', ' ').replace('/', ' ').split()
    if any(w in ENTITY_KEYWORDS for w in words):
        return 'entity'

    return None  # ambiguous — needs API

supabase      = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_KEY)

SYSTEM_PROMPT = """You classify NYC building contacts from government records as "person" or "entity". Return JSON.

RULES:
1. Real human first+last name → person
2. Company/institution name split across first+last fields → entity
3. If first+last looks like a person AND business_name is set → person (they work there)
4. Placeholder garbage → entity

FEW-SHOT EXAMPLES (learn these patterns):
first="Frank" last="Briguglio" biz="" → person
first="Turner Construction" last="Comp" biz="" → entity (company truncated across fields)
first="Joshua" last="Guttman" biz="Pearl Realty Management" → person (human + employer)
first="JOHN" last="HANSEN" biz="ARGO REAL ESTATE LLC" → person (human + employer)
first="Nancy" last="F. Kahn, MD" biz="" → person (doctor)
first="E." last="Yoko Furuya, MD" biz="" → person (doctor)
first="New York" last="Presbyterian" biz="" → entity (institution split)
first="Presbyterian" last="Hospital" biz="" → entity (institution)
first="Glass Farmhouse" last="Condomini" biz="" → entity (building name truncated)
first="Name Not On" last="File" biz="" → entity (placeholder)
first="Downing Mgt." last="Cp." biz="" → entity (management company)
first="Aalco Transport &" last="Storage" biz="" → entity (company)
first="CHRIS" last="MERRIT" biz="CORD MEYER DEVELOPENT" → person (human + employer)
first="Angel" last="Perez" biz="" → person
first="Robert Delmonico" last="Jr" biz="" → person (human with suffix)

Return {"results":[{"entity_type":"person"|"entity","confidence":0.0-1.0},...]} — exactly as many as input."""


def classify_batch(contacts: list[dict]) -> list[dict]:
    """Classify contacts — rule-based pre-filter first, API only for ambiguous cases."""
    indexed: list[tuple[int, dict, str | None]] = []
    for i, c in enumerate(contacts):
        first = (c.get("first_name") or "").strip()
        last  = (c.get("last_name")  or "").strip()
        biz   = (c.get("business_name") or "").strip()
        indexed.append((i, c, rule_based_classify(first, last, biz)))

    rule_hits  = [(i, r) for i, _, r in indexed if r is not None]
    api_needed = [(i, c) for i, c, r in indexed if r is None]

    results: dict[int, dict] = {}
    for i, r in rule_hits:
        results[i] = {"entity_type": r, "confidence": 0.97}

    if api_needed:
        lines = [
            f'{j}: first="{(c.get("first_name") or "").strip()}" last="{(c.get("last_name") or "").strip()}" biz="{(c.get("business_name") or "").strip()}"'
            for j, (_, c) in enumerate(api_needed)
        ]
        user_msg = (
            f"Classify these {len(api_needed)} contacts, return JSON with exactly {len(api_needed)} results:\n"
            + "\n".join(lines)
            + '\n\nReturn {"results":[...]}'
        )
        resp = openai_client.chat.completions.create(
            model=MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_msg},
            ],
        )
        api_results = json.loads(resp.choices[0].message.content).get("results", [])
        while len(api_results) < len(api_needed):
            api_results.append({"entity_type": "entity", "confidence": 0.5})
        for (orig_i, _), r in zip(api_needed, api_results):
            results[orig_i] = r

    return [results[i] for i in range(len(contacts))]


def run(parcel_ids: list[str], apply: bool):
    # ── Fetch contacts ────────────────────────────────────────────────────────
    CLASSIFIED_TYPES = ["property_manager", "owner"]

    contacts = (
        supabase.table("contacts")
        .select("id, parcel_id, contact_type, first_name, last_name, business_name, source, confidence, organization_id, ai_entity_type")
        .in_("parcel_id", parcel_ids)
        .in_("contact_type", CLASSIFIED_TYPES)
        .execute()
        .data
    )

    # ── Fetch orgs for Layer 2 lookup ─────────────────────────────────────────
    orgs = (
        supabase.table("organizations")
        .select("id, parcel_id, business_name, org_type, confidence")
        .in_("parcel_id", parcel_ids)
        .order("confidence", desc=True)
        .execute()
        .data
    )

    # Best org per (parcel_id, org_type) — already sorted desc by confidence
    best_org: dict[tuple, dict] = {}
    for o in orgs:
        key = (o["parcel_id"], o["org_type"])
        if key not in best_org:
            best_org[key] = o

    # contact_type → org_type mapping for Layer 2
    TYPE_TO_ORG = {
        "property_manager": "property_manager",
        "owner":            "owner",
    }

    print(f"\nFetched {len(contacts)} contacts across {len(parcel_ids)} buildings")

    # ── Layer 1: classify ─────────────────────────────────────────────────────
    batches = [contacts[i:i+BATCH_SIZE] for i in range(0, len(contacts), BATCH_SIZE)]
    classifications: list[dict] = []   # parallel list to contacts

    for i, batch in enumerate(batches):
        print(f"  Batch {i+1}/{len(batches)} ({len(batch)} contacts)...")
        results = classify_batch(batch)
        classifications.extend(results)

    # ── Build update plans ────────────────────────────────────────────────────
    l1_rows = []   # (contact, classification)
    l2_rows = []   # contacts that get org linked

    for contact, clf in zip(contacts, classifications):
        entity_type = clf.get("entity_type", "entity")
        l1_rows.append((contact, clf, entity_type))

        # Layer 2: person with no org yet → link to best org of matching type
        if entity_type == "person" and not contact.get("organization_id"):
            org_type = TYPE_TO_ORG.get(contact.get("contact_type", ""))
            if org_type:
                org = best_org.get((contact["parcel_id"], org_type))
                if org:
                    l2_rows.append((contact, org))

    # ── Print results ─────────────────────────────────────────────────────────
    persons  = [r for r in l1_rows if r[2] == "person"]
    entities = [r for r in l1_rows if r[2] == "entity"]

    print(f"\n{'─'*80}")
    print(f"LAYER 1 — Person vs Entity")
    print(f"  Persons : {len(persons)}")
    print(f"  Entities: {len(entities)}")

    print(f"\nSample persons:")
    print(f"  {'NAME':<32} {'TYPE':<8} {'CONF':<5}  REASON")
    for contact, clf, _ in persons[:15]:
        name = f"{contact.get('first_name','') or ''} {contact.get('last_name','') or ''}".strip()
        if not name:
            name = contact.get("business_name", "")[:30]
        conf = clf.get("confidence", 0)
        rsn  = clf.get("reasoning", "")[:35]
        print(f"  {name:<32} person   {conf:.2f}   {rsn}")

    print(f"\nSample entities:")
    for contact, clf, _ in entities[:10]:
        name = contact.get("business_name") or f"{contact.get('first_name','')} {contact.get('last_name','')}".strip()
        name = (name or "")[:30]
        conf = clf.get("confidence", 0)
        rsn  = clf.get("reasoning", "")[:35]
        print(f"  {name:<32} entity   {conf:.2f}   {rsn}")

    print(f"\n{'─'*80}")
    print(f"LAYER 2 — Person → Org assignment")
    print(f"  Persons linked to org: {len(l2_rows)}")
    if l2_rows:
        print(f"\n  {'PERSON':<30} → {'ORG':<30} TYPE")
        for contact, org in l2_rows[:15]:
            person_name = f"{contact.get('first_name','') or ''} {contact.get('last_name','') or ''}".strip()
            print(f"  {person_name:<30}   {(org.get('business_name') or '')[:30]:<30} {org.get('org_type','')}")

    if not apply:
        print(f"\n[DRY RUN] — pass --apply to write to DB")
        return

    # ── Apply Layer 1 ─────────────────────────────────────────────────────────
    print(f"\nApplying Layer 1...")
    for contact, clf, entity_type in l1_rows:
        supabase.table("contacts").update({
            "ai_entity_type":   entity_type,
            "ai_confidence":    clf.get("confidence"),
            "ai_classified_at": "now()",
        }).eq("id", contact["id"]).execute()
    print(f"  ✓ {len(l1_rows)} contacts classified")

    # ── Apply Layer 2 ─────────────────────────────────────────────────────────
    print(f"Applying Layer 2...")
    for contact, org in l2_rows:
        supabase.table("contacts").update({
            "organization_id":   org["id"],
            "assignment_source": "ai_l2",
        }).eq("id", contact["id"]).execute()
    print(f"  ✓ {len(l2_rows)} persons linked to orgs")

    print(f"\nDone.")


def main():
    parser = argparse.ArgumentParser(description="Per-building person/entity classifier")
    parser.add_argument("--parcel-ids", required=True, help="Comma-separated parcel IDs")
    parser.add_argument("--apply", action="store_true", help="Write to DB (default: dry run)")
    args = parser.parse_args()

    ids = [p.strip() for p in args.parcel_ids.split(",")]
    run(ids, apply=args.apply)


if __name__ == "__main__":
    main()
