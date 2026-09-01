#!/usr/bin/env python3
"""Build backend/seed/coa.json from the COA spreadsheets and the PDFs in COA/.

Rows come from 1.xlsx / 2.xlsx / 3.xlsx (already-extracted COA data). PDFs that
no spreadsheet covers are parsed directly from the certificate text.

Every PDF under COA/ must end up with exactly one row: the script fails loudly
if a spreadsheet points at a missing file, or if a PDF cannot be parsed.

    python3 scripts/extract_coa.py

Requires pypdf (only for the PDF fallback path).
"""

from __future__ import annotations

import json
import os
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COA_DIR = os.path.join(ROOT, "COA")
SPREADSHEETS = ["1.xlsx", "2.xlsx", "3.xlsx"]
OUT_PATH = os.path.join(ROOT, "backend", "seed", "coa.json")

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


# --- xlsx reading (stdlib only; an .xlsx is a zip of XML) ---------------------


def _column_index(ref: str) -> int:
    letters = re.match(r"([A-Z]+)", ref).group(1)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1


def read_sheets(path: str) -> dict[str, list[list[str]]]:
    z = zipfile.ZipFile(path)

    shared: list[str] = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.iter(NS + "si"):
            shared.append("".join(t.text or "" for t in si.iter(NS + "t")))

    rels = {
        r.get("Id"): r.get("Target")
        for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    }

    sheets: dict[str, list[list[str]]] = {}
    for sheet in ET.fromstring(z.read("xl/workbook.xml")).iter(NS + "sheet"):
        target = rels[sheet.get(REL + "id")].lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target

        rows: list[list[str]] = []
        for row in ET.fromstring(z.read(target)).iter(NS + "row"):
            cells: dict[int, str] = {}
            next_index = 0
            for c in row.iter(NS + "c"):
                kind = c.get("t")
                v = c.find(NS + "v")
                inline = c.find(NS + "is")
                if kind == "s" and v is not None:
                    value = shared[int(v.text)]
                elif kind == "inlineStr" and inline is not None:
                    value = "".join(t.text or "" for t in inline.iter(NS + "t"))
                elif v is not None:
                    value = v.text or ""
                else:
                    value = ""

                ref = c.get("r")
                index = _column_index(ref) if ref else next_index
                next_index = index + 1
                cells[index] = value

            width = max(cells) + 1 if cells else 0
            rows.append([cells.get(i, "") for i in range(width)])

        sheets[sheet.get("name")] = rows

    return sheets


# --- PDF fallback ------------------------------------------------------------

# Every certificate prints the accession twice; "COA: <n>" is the unambiguous
# anchor, since the lot itself is sometimes a 10-digit number too.
ACCESSION_RE = re.compile(r"COA:\s*(\d{6,})")
DATE_RE = re.compile(r"\d{1,2}/\d{1,2}/\d{4}")


def parse_pdf(path: str) -> dict[str, str]:
    from pypdf import PdfReader

    text = PdfReader(path).pages[0].extract_text() or ""
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    accession = ACCESSION_RE.search(text)
    if not accession:
        raise ValueError(f"no accession number in {path}")

    # Layout: ... Received Date / Reported Date / "<product> <lot>"
    dates = [i for i, line in enumerate(lines) if DATE_RE.fullmatch(line)]
    if not dates or dates[-1] + 1 >= len(lines):
        raise ValueError(f"no product/lot line in {path}")

    product_lot = lines[dates[-1] + 1].rsplit(" ", 1)
    if len(product_lot) != 2:
        raise ValueError(f"cannot split product/lot in {path}: {lines[dates[-1] + 1]!r}")

    return {
        "accessionNumber": accession.group(1),
        "productName": product_lot[0].strip(),
        "lotNumber": product_lot[1].strip(),
    }


# --- main --------------------------------------------------------------------


def main() -> int:
    pdfs_on_disk: dict[str, str] = {}
    for dirpath, _, filenames in os.walk(COA_DIR):
        for name in filenames:
            if not name.lower().endswith(".pdf"):
                continue
            if name in pdfs_on_disk:
                print(
                    f"ERROR: duplicate filename {name!r} in {dirpath} and "
                    f"{os.path.dirname(pdfs_on_disk[name])}; PDFs are served from "
                    "one flat directory so names must be unique",
                    file=sys.stderr,
                )
                return 1
            pdfs_on_disk[name] = os.path.relpath(
                os.path.join(dirpath, name), ROOT
            )

    rows: dict[str, dict[str, str]] = {}
    duplicates = 0

    for spreadsheet in SPREADSHEETS:
        for sheet_name, sheet_rows in read_sheets(os.path.join(ROOT, spreadsheet)).items():
            header = [c.strip().lower() for c in sheet_rows[0]]
            if header[:4] != ["pdf name", "accession number", "product", "lot"]:
                continue  # e.g. the "Verification" summary sheet in 2.xlsx

            for raw in sheet_rows[1:]:
                raw = (raw + [""] * 4)[:4]
                pdf, accession, product, lot = (c.strip() for c in raw)
                if not any((pdf, accession, product, lot)):
                    continue

                row = {
                    "accessionNumber": accession,
                    "lotNumber": lot.upper(),
                    "productName": product,
                    "pdfFilename": pdf,
                    "sourcePath": pdfs_on_disk.get(pdf),
                    "source": spreadsheet,
                }

                if pdf in rows:
                    if rows[pdf] == row:
                        duplicates += 1
                        continue
                    print(
                        f"ERROR: {pdf!r} appears twice with different data:\n"
                        f"  {rows[pdf]}\n  {row}",
                        file=sys.stderr,
                    )
                    return 1

                rows[pdf] = row

    missing_files = sorted(pdf for pdf in rows if not rows[pdf]["sourcePath"])
    if missing_files:
        print(
            f"ERROR: {len(missing_files)} spreadsheet rows point at PDFs that are "
            f"not under COA/: {missing_files[:5]}",
            file=sys.stderr,
        )
        return 1

    uncovered = sorted(set(pdfs_on_disk) - set(rows))
    for pdf in uncovered:
        parsed = parse_pdf(os.path.join(ROOT, pdfs_on_disk[pdf]))
        rows[pdf] = {
            "accessionNumber": parsed["accessionNumber"],
            "lotNumber": parsed["lotNumber"].upper(),
            "productName": parsed["productName"],
            "pdfFilename": pdf,
            "sourcePath": pdfs_on_disk[pdf],
            "source": "pdf",
        }

    # A handful of certificates were filed under two names (e.g. "TESA 9_22.pdf"
    # and "TESA 9_22.1.pdf"). accession_number is UNIQUE and GET /coa/:accession/pdf
    # can only serve one file, so keep the shortest filename and drop the rest --
    # but only when the duplicates really do describe the same certificate.
    by_accession: dict[str, list[dict[str, str]]] = {}
    for row in rows.values():
        by_accession.setdefault(row["accessionNumber"], []).append(row)

    dropped: list[tuple[str, str]] = []
    for accession, group in by_accession.items():
        if len(group) == 1:
            continue

        details = {(r["productName"], r["lotNumber"]) for r in group}
        if len(details) > 1:
            print(
                f"ERROR: accession {accession} is shared by PDFs that describe "
                "different products or lots -- cannot pick one:",
                file=sys.stderr,
            )
            for r in group:
                print(
                    f"  {r['pdfFilename']}  product={r['productName']!r} "
                    f"lot={r['lotNumber']!r}",
                    file=sys.stderr,
                )
            return 1

        group.sort(key=lambda r: (len(r["pdfFilename"]), r["pdfFilename"]))
        for r in group[1:]:
            dropped.append((accession, r["pdfFilename"]))
            del rows[r["pdfFilename"]]

    ordered = sorted(rows.values(), key=lambda r: r["pdfFilename"])
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(ordered, f, indent=2, ensure_ascii=False)
        f.write("\n")

    from_pdf = sum(1 for r in ordered if r["source"] == "pdf")
    no_lot = sum(1 for r in ordered if r["lotNumber"] in ("", "N/A", "NA"))
    print(f"PDFs on disk:        {len(pdfs_on_disk)}")
    print(f"rows written:        {len(ordered)}  -> {os.path.relpath(OUT_PATH, ROOT)}")
    print(f"  from spreadsheets: {len(ordered) - from_pdf} ({duplicates} exact duplicates collapsed)")
    print(f"  parsed from PDF:   {from_pdf}")
    print(f"rows with no usable lot number: {no_lot}")
    if dropped:
        print(f"dropped as re-filed duplicates ({len(dropped)}):")
        for accession, pdf in dropped:
            print(f"  {accession}  {pdf}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
