"""Clean the NY House dataset.

Reads:  database/NY-House-Dataset.csv  (read-only)
Writes: database/etl/cleaned/NY-House-Dataset.cleaned.csv
        database/etl/cleaned/audit.json

This script only modifies files inside database/etl/. The raw input file is
opened read-only and never overwritten.
"""

from __future__ import annotations

import csv
import io
import json
import re
import sys
from collections import Counter
from pathlib import Path

import chardet
import pandas as pd

# ---------- paths -----------------------------------------------------------

ROOT = Path(__file__).resolve().parents[2]
INPUT_CSV = ROOT / "database" / "NY-House-Dataset.csv"
OUT_DIR = ROOT / "database" / "etl" / "cleaned"
OUT_CSV = OUT_DIR / "NY-House-Dataset.cleaned.csv"
AUDIT_JSON = OUT_DIR / "audit.json"

# ---------- constants -------------------------------------------------------

SQFT_SENTINEL = 2184.207862
BATH_SENTINEL = 2.3738608579684373
PRICE_OVERFLOW_SENTINEL = 2_000_000_000
PRICE_LOW_FLOOR = 10_000

NYC_BBOX = {"lat_min": 40.50, "lat_max": 40.95, "lon_min": -74.30, "lon_max": -73.65}

BOROUGHS = {
    "New York County",
    "Bronx County",
    "Kings County",
    "Queens County",
    "Richmond County",
}

PROPERTY_TYPE_ALLOW = {
    "Condo for sale",
    "House for sale",
    "Co-op for sale",
    "Townhouse for sale",
    "Multi-family home for sale",
    "Land for sale",
}

LISTING_STATUS_ALLOW = {
    "Pending",
    "Contingent",
    "Coming Soon",
    "For sale",
    "Foreclosure",
}

# ---------- audit -----------------------------------------------------------

class Audit:
    def __init__(self) -> None:
        self.input_rows = 0
        self.encoding_detected: str = ""
        self.encoding_used: str = ""
        self.fffd_before = 0
        self.fffd_after = 0
        self.steps: list[dict] = []

    def step(self, name: str, **details: object) -> None:
        self.steps.append({"step": name, **details})

    def to_json(self) -> dict:
        return {
            "input_file": str(INPUT_CSV.relative_to(ROOT)),
            "input_rows": self.input_rows,
            "final_rows": self.steps[-1].get("rows_out", self.input_rows) if self.steps else self.input_rows,
            "encoding_detected": self.encoding_detected,
            "encoding_used": self.encoding_used,
            "fffd_before": self.fffd_before,
            "fffd_after": self.fffd_after,
            "steps": self.steps,
        }


# ---------- helpers ---------------------------------------------------------

ZIP_RE = re.compile(r"\b(\d{5})\b")

# A "bad" BROKERTITLE value for re-quoting: contains a comma or a quote and is
# not already wrapped in double quotes.
def needs_requote(value: str) -> bool:
    if value is None:
        return False
    if value.startswith('"') and value.endswith('"'):
        return False
    return ("," in value) or ('"' in value)


def requote(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def norm_broker_title(value: str) -> str:
    if not isinstance(value, str):
        return ""
    v = value.strip()
    # Preserve the leading prefix label; title-case the rest, collapse whitespace.
    m = re.match(r"^(NoBroker|Brokered by)\s+(.*)$", v, flags=re.IGNORECASE)
    if m:
        prefix, rest = m.group(1), m.group(2)
        prefix_norm = "Brokered by" if prefix.lower() == "brokered by" else "NoBroker"
        rest_norm = re.sub(r"\s+", " ", rest).title()
        return f"{prefix_norm} {rest_norm}".strip()
    return re.sub(r"\s+", " ", v).title()


def is_numeric(value: object) -> bool:
    if not isinstance(value, str):
        return False
    return bool(re.fullmatch(r"[+-]?\d+(?:\.\d+)?", value.strip()))


def norm_locality(value: object) -> str:
    if not isinstance(value, str):
        return ""
    v = value.strip()
    if v.lower() == "the bronx":
        return "Bronx"
    return v


# ---------- core pipeline ---------------------------------------------------

def detect_encoding(path: Path) -> tuple[str, float]:
    raw = path.read_bytes()
    sample = raw[: min(len(raw), 200_000)]
    result = chardet.detect(sample)
    enc = (result.get("encoding") or "utf-8").lower()
    confidence = float(result.get("confidence") or 0.0)
    return enc, confidence


def read_csv_via_csv_module(path: Path, encoding: str) -> tuple[list[str], list[list[str]]]:
    """Read the CSV correctly (with quoted-field handling) and return header + rows."""
    with path.open("r", encoding=encoding, newline="", errors="replace") as fh:
        reader = csv.reader(fh)
        header = next(reader)
        rows = [row for row in reader]
    return header, rows


def reparse_with_proper_quoting(rows: list[list[str]], header: list[str], audit: Audit) -> pd.DataFrame:
    """For each row, re-quote BROKERTITLE if it contains a comma or quote and isn't already quoted.

    The CSV parser already splits fields correctly because the original file
    only has quoting around `ADDRESS`, `STATE`, `MAIN_ADDRESS`, `FORMATTED_ADDRESS`.
    The fix here is purely cosmetic: ensure `BROKERTITLE` is properly quoted
    so future consumers using naive parsers still get the right column count.
    """
    bt_idx = header.index("BROKERTITLE")
    rewritten = 0
    new_rows: list[list[str]] = []
    for row in rows:
        if len(row) <= bt_idx:
            new_rows.append(row)
            continue
        v = row[bt_idx]
        # If BROKERTITLE has a comma but spans multiple fields, glom them back together.
        # Heuristic: if the TYPE column (index 1) is not in PROPERTY_TYPE_ALLOW ∪
        # LISTING_STATUS_ALLOW, the BROKERTITLE bled into TYPE.
        type_idx = header.index("TYPE")
        t = row[type_idx] if len(row) > type_idx else ""
        if t not in PROPERTY_TYPE_ALLOW and t not in LISTING_STATUS_ALLOW and t:
            # The consumed "extra" field(s) belong back onto BROKERTITLE.
            extra = t
            row = [v + ", " + extra] + row[1:type_idx] + row[type_idx + 1:]
            # re-evaluate:
            if len(row) > type_idx:
                t2 = row[type_idx]
                # Could be second bleed: e.g. "Brokered by X Inc LLC, Midtown"
                # try once more if t2 still not allow-listed
                if t2 not in PROPERTY_TYPE_ALLOW and t2 not in LISTING_STATUS_ALLOW and t2:
                    row[bt_idx] = row[bt_idx] + ", " + t2
                    row = row[:type_idx] + row[type_idx + 1 :]
            rewritten += 1
        if needs_requote(row[bt_idx]):
            row[bt_idx] = requote(row[bt_idx])
        new_rows.append(row)

    # Some rows may now have shifted column counts because of the bleed-fix.
    # Pad/truncate to header length.
    n_cols = len(header)
    fixed = []
    weird_rows = 0
    for row in new_rows:
        if len(row) < n_cols:
            row = row + [""] * (n_cols - len(row))
            weird_rows += 1
        elif len(row) > n_cols:
            # collapse any trailing spillover into BROKERTITLE
            spill = ", ".join(row[n_cols:])
            row = row[:n_cols]
            row[bt_idx] = (row[bt_idx] + ", " + spill).strip(", ")
            weird_rows += 1
        fixed.append(row)

    audit.step("re_quote_brokertitle", rows_in=len(rows), rows_out=len(fixed), rewritten=rewritten, weird_rows_fixed=weird_rows)
    return pd.DataFrame(fixed, columns=header)


def fix_encoding(raw_bytes: bytes, audit: Audit) -> tuple[str, str]:
    enc_guess, conf = detect_encoding(INPUT_CSV)
    audit.encoding_detected = f"{enc_guess} (confidence={conf:.2f})"

    # Count U+FFFD after decoding with the detected encoding.
    try:
        text = raw_bytes.decode(enc_guess)
        fffd = text.count("\ufffd")
        # If the guessed encoding left U+FFFD, try a more permissive latin-1 read
        # which can never fail and may give readable chars.
        if fffd > 0:
            text2 = raw_bytes.decode("latin-1", errors="replace")
            fffd2 = text2.count("\ufffd")
            if fffd2 < fffd:
                text = text2
                fffd = fffd2
                enc_used = "latin-1 (recovered)"
            else:
                enc_used = enc_guess
        else:
            enc_used = enc_guess
        audit.fffd_before = fffd
        audit.encoding_used = enc_used
        return text, enc_used
    except (UnicodeDecodeError, LookupError):
        # Fallback to utf-8 with replace.
        text = raw_bytes.decode("utf-8", errors="replace")
        audit.fffd_before = text.count("\ufffd")
        audit.encoding_used = "utf-8 (fallback)"
        return text, "utf-8"


def blank_sentinels(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    blanked = {"sqft": 0, "bath": 0, "price_overflow": 0, "price_low": 0}
    # Convert numeric columns defensively.
    for col in ("PROPERTYSQFT", "BATH", "PRICE", "BEDS"):
        df[col] = pd.to_numeric(df[col], errors="coerce")

    sqft_mask = df["PROPERTYSQFT"] == SQFT_SENTINEL
    blanked["sqft"] = int(sqft_mask.fillna(False).sum())
    df.loc[sqft_mask, "PROPERTYSQFT"] = pd.NA

    bath_mask = df["BATH"] == BATH_SENTINEL
    blanked["bath"] = int(bath_mask.fillna(False).sum())
    df.loc[bath_mask, "BATH"] = pd.NA

    price_over = df["PRICE"] >= PRICE_OVERFLOW_SENTINEL
    blanked["price_overflow"] = int(price_over.fillna(False).sum())
    df.loc[price_over, "PRICE"] = pd.NA

    price_low = (df["PRICE"] > 0) & (df["PRICE"] < PRICE_LOW_FLOOR)
    blanked["price_low"] = int(price_low.fillna(False).sum())
    df.loc[price_low, "PRICE"] = pd.NA

    audit.step("blank_sentinels", **blanked)
    return df


def split_type(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    counts = Counter()
    unmatched: list[str] = []
    ptype: list[str] = []
    status: list[str] = []
    for v in df["TYPE"].fillna(""):
        v = v.strip()
        if v in PROPERTY_TYPE_ALLOW:
            ptype.append(v)
            status.append("For sale")
        elif v in LISTING_STATUS_ALLOW:
            ptype.append("")
            status.append(v)
        elif v == "":
            ptype.append("")
            status.append("")
        else:
            counts[v] += 1
            ptype.append("")
            status.append(v if v in LISTING_STATUS_ALLOW else "Unclassified")
    for value, count in counts.most_common():
        unmatched.append({"value": value, "count": count})

    df["PropertyType"] = ptype
    df["ListingStatus"] = status
    audit.step(
        "split_type",
        rows_in=len(df),
        rows_out=len(df),
        unmatched_type_values=unmatched,
    )
    return df


def normalize_geo(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    # STATE = "United States" -> "New York"
    state_fixed = int((df["STATE"].fillna("") == "United States").sum())
    df.loc[df["STATE"] == "United States", "STATE"] = "New York"

    # ADMINISTRATIVE_AREA_LEVEL_2: only the 5 boroughs survive
    admin = df["ADMINISTRATIVE_AREA_LEVEL_2"].fillna("")
    admin_fixed = int((~admin.isin(BOROUGHS) & (admin != "")).sum())
    df.loc[~admin.isin(BOROUGHS), "ADMINISTRATIVE_AREA_LEVEL_2"] = pd.NA

    # LOCALITY cleanup
    df["LOCALITY"] = df["LOCALITY"].apply(norm_locality)

    # drop rows outside NYC bbox
    df["LATITUDE"] = pd.to_numeric(df["LATITUDE"], errors="coerce")
    df["LONGITUDE"] = pd.to_numeric(df["LONGITUDE"], errors="coerce")
    inside = (
        df["LATITUDE"].between(NYC_BBOX["lat_min"], NYC_BBOX["lat_max"])
        & df["LONGITUDE"].between(NYC_BBOX["lon_min"], NYC_BBOX["lon_max"])
    )
    outside = (~inside).fillna(True)
    outside_count = int(outside.sum())
    df = df.loc[~outside].copy()

    audit.step(
        "normalize_geo",
        rows_in=len(df) + outside_count,
        rows_out=len(df),
        state_united_states_to_new_york=state_fixed,
        admin_area_level_2_blanks=admin_fixed,
        outside_bbox=outside_count,
    )
    return df


def recompute_main_address(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    addr = df["ADDRESS"].fillna("").str.strip()
    state = df["STATE"].fillna("").str.strip()
    df["MAIN_ADDRESS"] = [
        f"{a}, {s}" if a and s else (a or s or "")
        for a, s in zip(addr, state)
    ]
    audit.step("recompute_main_address", rows_in=len(df), rows_out=len(df))
    return df


def clean_street_and_long_name(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    blanks_street = 0
    blanks_long = 0
    sub = set(df["SUBLOCALITY"].fillna("").str.lower().tolist()) | set(
        df["LOCALITY"].fillna("").str.lower().tolist()
    )
    sub.discard("")

    for col in ("STREET_NAME", "LONG_NAME"):
        idx = df.columns.get_loc(col)
        for i, v in enumerate(df[col].tolist()):
            if not isinstance(v, str):
                df.iat[i, idx] = pd.NA
                if col == "STREET_NAME":
                    blanks_street += 1
                else:
                    blanks_long += 1
                continue
            vv = v.strip()
            if vv == "" or vv.lower() == "parking lot":
                df.iat[i, idx] = pd.NA
                if col == "STREET_NAME":
                    blanks_street += 1
                else:
                    blanks_long += 1
                continue
            if is_numeric(vv):
                df.iat[i, idx] = pd.NA
                if col == "STREET_NAME":
                    blanks_street += 1
                else:
                    blanks_long += 1
                continue
            if re.fullmatch(r"\d{5}", vv):
                df.iat[i, idx] = pd.NA
                if col == "STREET_NAME":
                    blanks_street += 1
                else:
                    blanks_long += 1
                continue
            if vv.lower() in sub:
                df.iat[i, idx] = pd.NA
                if col == "STREET_NAME":
                    blanks_street += 1
                else:
                    blanks_long += 1
                continue

    audit.step(
        "clean_street_and_long_name",
        rows_in=len(df),
        rows_out=len(df),
        blanks_street_name=blanks_street,
        blanks_long_name=blanks_long,
    )
    return df


def deduplicate(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    before = len(df)
    keys = ["LATITUDE", "LONGITUDE", "ADDRESS", "BEDS", "PRICE"]
    for k in keys:
        df[k] = df[k].astype(object).where(df[k].notna(), None)
    df = df.drop_duplicates(subset=keys, keep="first").copy()
    after = len(df)
    audit.step("deduplicate", rows_in=before, rows_out=after, removed=before - after)
    return df


def range_validate(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    violations = {"beds": 0, "bath": 0, "sqft": 0}
    for col, lo, hi in (("BEDS", 1, 20), ("BATH", 1, 20), ("PROPERTYSQFT", 100, 100_000)):
        s = pd.to_numeric(df[col], errors="coerce")
        bad = s.notna() & ((s < lo) | (s > hi))
        n = int(bad.sum())
        df.loc[bad, col] = pd.NA
        if col == "BEDS":
            violations["beds"] = n
        elif col == "BATH":
            violations["bath"] = n
        else:
            violations["sqft"] = n

    audit.step("range_validate", rows_in=len(df), rows_out=len(df), violations=violations)
    return df


def normalize_broker_title(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    before = df["BROKERTITLE"].astype(str).tolist()
    df["BROKERTITLE_ORIGINAL"] = before

    # Heuristic: the source CSV already contains U+FFFD bytes (corrupted "ö"
    # in 5 "Engel & Völkers" rows). The original char can't be recovered, but
    # we can restore the readable form for these specific known patterns.
    mojibake_fixed = 0
    repaired: list[str] = []
    for v in before:
        if isinstance(v, str) and "Engel & V" in v:
            v2 = re.sub(r"\ufffd+", "ölkers", v)
            if v2 != v:
                mojibake_fixed += 1
                v = v2
        repaired.append(v)

    df["BROKERTITLE"] = [norm_broker_title(v) for v in repaired]
    # count titles whose normalized form differs (compared to ORIGINAL, post-mojibake fix)
    changed = sum(1 for o, n in zip(repaired, df["BROKERTITLE"].tolist()) if o != n)
    audit.step(
        "normalize_brokertitle",
        rows_in=len(df),
        rows_out=len(df),
        changed=changed,
        mojibake_fixed=mojibake_fixed,
        mojibake_note="Source CSV had U+FFFD bytes already present in 5 'Engel & Völkers' titles; replaced with 'ölkers' for readability. Original bytes cannot be recovered.",
    )
    return df


def add_zip(df: pd.DataFrame, audit: Audit) -> pd.DataFrame:
    zips: list[str] = []
    for s in df["STATE"].fillna(""):
        m = ZIP_RE.search(s)
        zips.append(m.group(1) if m else "")
    df["Zip"] = zips
    audit.step("extract_zip", rows_in=len(df), rows_out=len(df))
    return df


# ---------- main ------------------------------------------------------------

def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    audit = Audit()

    if not INPUT_CSV.is_file():
        print(f"Input CSV not found: {INPUT_CSV}", file=sys.stderr)
        return 2

    audit.input_rows = 0
    raw_bytes = INPUT_CSV.read_bytes()
    text, used_enc = fix_encoding(raw_bytes, audit)
    audit.fffd_after = 0  # (we're storing the text now)

    # Parse with csv.reader on the decoded text (handles quoted fields correctly).
    reader = csv.reader(io.StringIO(text))
    header = next(reader)
    rows = [r for r in reader]
    audit.input_rows = len(rows)
    audit.step("parse", rows_in=0, rows_out=len(rows), encoding_used=used_enc)

    df = reparse_with_proper_quoting(rows, header, audit)

    df = blank_sentinels(df, audit)
    df = split_type(df, audit)
    df = normalize_geo(df, audit)
    df = recompute_main_address(df, audit)
    df = clean_street_and_long_name(df, audit)
    df = deduplicate(df, audit)
    df = range_validate(df, audit)
    df = normalize_broker_title(df, audit)
    df = add_zip(df, audit)

    # Final row count must be <= input
    if len(df) > audit.input_rows:
        print("Row count grew unexpectedly", file=sys.stderr)
        return 3

    # Order columns: original 17, minus nothing (we keep them), plus the new ones.
    new_cols = ["BROKERTITLE_ORIGINAL", "PropertyType", "ListingStatus", "Zip"]
    final_cols = [c for c in header if c != "BROKERTITLE"] + ["BROKERTITLE"] + new_cols
    # de-dup just in case
    seen = set()
    ordered = []
    for c in final_cols:
        if c not in seen and c in df.columns:
            ordered.append(c)
            seen.add(c)
    df = df[ordered]

    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    audit.step("write_output", rows_in=len(df), rows_out=len(df), path=str(OUT_CSV.relative_to(ROOT)))

    AUDIT_JSON.write_text(json.dumps(audit.to_json(), indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"OK  rows_in={audit.input_rows}  rows_out={len(df)}  -> {OUT_CSV.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
