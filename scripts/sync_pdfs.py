#!/usr/bin/env python3
"""Copy the PDFs referenced by backend/seed/coa.json into backend/public/pdfs/.

The COA/ tree is organised by product; express.static and the Vercel CDN both
serve one flat directory, so the files are flattened here under the exact
pdf_filename stored in the database.

    python3 scripts/sync_pdfs.py [--dry-run]
"""

from __future__ import annotations

import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED_PATH = os.path.join(ROOT, "backend", "seed", "coa.json")
DEST_DIR = os.path.join(ROOT, "backend", "public", "pdfs")


def main() -> int:
    dry_run = "--dry-run" in sys.argv

    with open(SEED_PATH) as f:
        rows = json.load(f)

    os.makedirs(DEST_DIR, exist_ok=True)

    copied = skipped = 0
    total_bytes = 0
    for row in rows:
        source = os.path.join(ROOT, row["sourcePath"])
        dest = os.path.join(DEST_DIR, row["pdfFilename"])

        if not os.path.exists(source):
            print(f"ERROR: missing source {row['sourcePath']}", file=sys.stderr)
            return 1

        size = os.path.getsize(source)
        total_bytes += size

        if os.path.exists(dest) and os.path.getsize(dest) == size:
            skipped += 1
            continue

        if not dry_run:
            shutil.copy2(source, dest)
        copied += 1

    print(
        f"{'would copy' if dry_run else 'copied'} {copied}, up to date {skipped}, "
        f"{len(rows)} referenced PDFs totalling {total_bytes / 1024 / 1024:.0f} MB"
    )
    print(f"destination: {os.path.relpath(DEST_DIR, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
