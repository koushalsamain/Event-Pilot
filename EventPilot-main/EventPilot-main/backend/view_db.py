"""
Database Viewer Utility for EventPilot
Run: python view_db.py
"""
import sqlite3
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DB_PATH = Path(__file__).resolve().parent / "eventpilot.db"

def view_database():
    if not DB_PATH.exists():
        print(f"[!] Database file not found at: {DB_PATH}")
        return

    print("=" * 80)
    print(f"DATABASE: {DB_PATH}")
    print(f"FILE SIZE: {DB_PATH.stat().st_size} bytes")
    print("=" * 80)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    tables = ["events", "tasks", "team_members", "notifications"]

    for table in tables:
        print(f"\nTABLE: `{table}`")
        print("-" * 80)
        try:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            if not rows:
                print(f"  (Table is currently empty)")
                continue

            col_names = [col[0] for col in cursor.description]
            print(f"  Total records: {len(rows)}")
            print(f"  Columns: {', '.join(col_names)}\n")

            for i, row in enumerate(rows, 1):
                row_dict = dict(row)
                print(f"  [{i}] {json.dumps(row_dict, indent=2, ensure_ascii=False)}")
        except Exception as e:
            print(f"  Error reading table {table}: {e}")

    conn.close()
    print("\n" + "=" * 80)
    print("Database inspection complete.")
    print("=" * 80)

if __name__ == "__main__":
    view_database()
