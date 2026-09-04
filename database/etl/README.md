# NY House dataset cleanup

Single Python script that cleans `database/NY-House-Dataset.csv` and writes a
new CSV + audit report. The raw input file is never modified.

## Run

```bash
cd database/etl
pip install -r requirements.txt
python clean_ny_house.py
```

## Outputs

- `cleaned/NY-House-Dataset.cleaned.csv` — cleaned dataset (UTF-8, quote-minimal CSV)
- `cleaned/audit.json` — per-step row counts, matched/unmatched values, etc.

## What the script does

1. Detects the file's encoding with `chardet` and decodes accordingly.
2. Re-parses the CSV with the standard `csv` module (handles quoted fields).
3. Re-glues any `BROKERTITLE` that bled into the `TYPE` column because of an
   unescaped comma, and re-emits with `BROKERTITLE` properly quoted.
4. Blanks the imputation sentinels `PROPERTYSQFT=2184.207862`,
   `BATH=2.3738608579684373`, `PRICE>=2_000_000_000`, and `PRICE<10_000`.
5. Splits the `TYPE` column into `PropertyType` (allow-listed) and
   `ListingStatus` (Pending / Contingent / Coming Soon / For sale / Foreclosure).
6. Normalizes geo fields: `STATE` `"United States"` → `"New York"`;
   `ADMINISTRATIVE_AREA_LEVEL_2` is kept only for the five boroughs;
   `LATITUDE`/`LONGITUDE` are range-checked against the NYC bbox
   (rows outside the bbox are dropped).
7. Recomputes `MAIN_ADDRESS` as `"{ADDRESS}, {STATE}"`.
8. Cleans `STREET_NAME` and `LONG_NAME` (blanks numeric, ZIP, `"Parking lot"`,
   duplicates of `LOCALITY`/`SUBLOCALITY`).
9. Deduplicates on `(LATITUDE, LONGITUDE, ADDRESS, BEDS, PRICE)`.
10. Range-validates `BEDS ∈ [1, 20]`, `BATH ∈ [1, 20]`, `PROPERTYSQFT ∈ [100, 100_000]`.
11. Title-cases `BROKERTITLE` and keeps the original as `BROKERTITLE_ORIGINAL`.
12. Extracts `Zip` from `STATE`.

## Things the script does NOT do

- Does not import the cleaned CSV into Postgres.
- Does not modify the raw input file.
- Does not change any code under `backend/`, `frontend/`, or `docs/`.

## Halt conditions

The script exits with a non-zero status (and prints a message) if:
- The input file cannot be found.
- After cleaning, the row count grows (a sanity check).

It does not halt on unmatched `TYPE` values; they are collected in
`audit.steps[split_type].unmatched_type_values` for human review.
