import sqlite3
from pathlib import Path

db_path = Path('e:/EventPilot-main/EventPilot-main/backend/eventpilot.db')
print('Database file path:', db_path)
print('File exists:', db_path.exists())
if db_path.exists():
    print('File size:', db_path.stat().st_size, 'bytes')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    print('Tables in database:', tables)
    for t in tables:
        if t != 'sqlite_sequence':
            cursor.execute(f"SELECT count(*) FROM {t}")
            cnt = cursor.fetchone()[0]
            print(f"  • Table `{t}`: {cnt} rows")
            cursor.execute(f"PRAGMA table_info({t});")
            cols = [c[1] for c in cursor.fetchall()]
            print(f"    Columns: {', '.join(cols)}")
