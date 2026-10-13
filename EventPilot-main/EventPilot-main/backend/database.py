import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "eventpilot.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                event_type TEXT NOT NULL,
                event_date TEXT NOT NULL,
                location TEXT DEFAULT '',
                description TEXT DEFAULT '',
                target_registrations INTEGER DEFAULT 500,
                current_registrations INTEGER DEFAULT 320,
                target_sponsorship REAL DEFAULT 50000.0,
                current_sponsorship REAL DEFAULT 35000.0,
                days_remaining INTEGER DEFAULT 4,
                status TEXT DEFAULT 'In Progress',
                created_at TEXT DEFAULT ''
            )
        """)

        # Migration: Add columns to existing events table if not present
        existing_cols = [c["name"] for c in conn.execute("PRAGMA table_info(events)").fetchall()]
        col_defs = {
            "target_registrations": "INTEGER DEFAULT 500",
            "current_registrations": "INTEGER DEFAULT 320",
            "target_sponsorship": "REAL DEFAULT 50000.0",
            "current_sponsorship": "REAL DEFAULT 35000.0",
            "days_remaining": "INTEGER DEFAULT 4",
            "status": "TEXT DEFAULT 'In Progress'",
            "created_at": "TEXT DEFAULT ''"
        }
        for col_name, col_type in col_defs.items():
            if col_name not in existing_cols:
                conn.execute(f"ALTER TABLE events ADD COLUMN {col_name} {col_type}")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                owner TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                due_date TEXT NOT NULL,
                category TEXT DEFAULT 'Operations',
                created_at TEXT DEFAULT '',
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS team_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                email TEXT DEFAULT ''
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                type TEXT NOT NULL DEFAULT 'custom',
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT 'Medium',
                sender TEXT DEFAULT 'Event Coordinator',
                recipient TEXT DEFAULT 'All Team Members',
                sound_enabled INTEGER DEFAULT 1,
                is_read INTEGER DEFAULT 0,
                acknowledged INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """)

        # Seed default team members from the PPT (Command Nexus team)
        team_count = conn.execute("SELECT COUNT(*) as count FROM team_members").fetchone()["count"]
        if team_count == 0:
            default_team = [
                ("Koushal", "Team Leader & Event Director", "koushal@eventpilot.internal"),
                ("Vanshika Sharma", "Partnerships & Sponsorship Lead", "vanshika@eventpilot.internal"),
                ("Saania", "Outreach & Marketing Lead", "saania@eventpilot.internal"),
                ("Soniya Sharma", "Content & Communications Lead", "soniya@eventpilot.internal"),
                ("Dev Dutt Sharma", "Logistics & Operations Lead", "devdutt@eventpilot.internal"),
            ]
            conn.executemany(
                "INSERT INTO team_members (name, role, email) VALUES (?, ?, ?)",
                default_team
            )

        # Ensure demo event exists for presentation
        demo_event = conn.execute("SELECT * FROM events WHERE name = 'CodeX Campus Fest 2026'").fetchone()
        if not demo_event:
            cursor = conn.execute("""
                INSERT INTO events (
                    name, event_type, event_date, location, description,
                    target_registrations, current_registrations,
                    target_sponsorship, current_sponsorship, days_remaining, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "CodeX Campus Fest 2026",
                "College Hackathon & Tech Fest",
                "2026-10-15",
                "Main Campus Auditorium",
                "Flagship inter-college hackathon and technical convention.",
                500,
                320,
                50000.0,
                35000.0,
                4,
                "In Progress"
            ))
            demo_event_id = cursor.lastrowid
        else:
            demo_event_id = demo_event["id"]

        # Ensure tasks exist for demo event
        tasks_count = conn.execute("SELECT COUNT(*) as count FROM tasks WHERE event_id = ?", (demo_event_id,)).fetchone()["count"]
        if tasks_count == 0:
            default_tasks = [
                (demo_event_id, "Contact pending sponsors for contract sign-off", "Vanshika Sharma", "Critical", "Pending", "Today", "Finance"),
                (demo_event_id, "Promote event registration on student Discord & LinkedIn", "Saania", "High", "In Progress", "Tomorrow", "Marketing"),
                (demo_event_id, "Finalize event volunteers & venue badge logistics", "Dev Dutt Sharma", "Medium", "Pending", "Oct 14", "Operations"),
                (demo_event_id, "Publish round-1 schedule & mentor guidelines", "Soniya Sharma", "High", "Completed", "Yesterday", "Content"),
                (demo_event_id, "Inspect audio-visual and projector setup in main hall", "Koushal", "Medium", "Completed", "Oct 10", "Operations")
            ]
            conn.executemany("""
                INSERT INTO tasks (event_id, title, owner, priority, status, due_date, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, default_tasks)


def get_events():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM events ORDER BY id DESC").fetchall()
        return [dict(row) for row in rows]


def get_event_by_id(event_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
        return dict(row) if row else None


def create_event(data):
    name = data["name"].strip()
    event_type = data["event_type"].strip()
    event_date = data["event_date"].strip()

    if not name or not event_type or not event_date:
        raise ValueError("name, event_type, and event_date are required")

    location = data.get("location", "")
    description = data.get("description", "")
    target_reg = int(data.get("target_registrations", 500))
    current_reg = int(data.get("current_registrations", 0))
    target_spon = float(data.get("target_sponsorship", 50000.0))
    current_spon = float(data.get("current_sponsorship", 0.0))
    days_remaining = int(data.get("days_remaining", 7))
    status = data.get("status", "Planning")

    with get_connection() as conn:
        cursor = conn.execute("""
            INSERT INTO events (
                name, event_type, event_date, location, description,
                target_registrations, current_registrations,
                target_sponsorship, current_sponsorship, days_remaining, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, event_type, event_date, location, description,
            target_reg, current_reg, target_spon, current_spon, days_remaining, status
        ))
        event_id = cursor.lastrowid

        starter_tasks = [
            (event_id, "Launch registration portal and announcement", "Saania", "High", "Pending", "Today", "Marketing"),
            (event_id, "Prepare sponsor pitch decks and proposal packages", "Vanshika Sharma", "Critical", "Pending", "Tomorrow", "Finance"),
            (event_id, "Coordinate stage, tech equipment & volunteer setup", "Dev Dutt Sharma", "Medium", "Pending", "Next Week", "Operations"),
        ]
        conn.executemany("""
            INSERT INTO tasks (event_id, title, owner, priority, status, due_date, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, starter_tasks)

        row = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
        return dict(row)


def update_event(event_id, data):
    fields = []
    values = []

    for key in [
        "name", "event_type", "event_date", "location", "description",
        "target_registrations", "current_registrations",
        "target_sponsorship", "current_sponsorship", "days_remaining", "status"
    ]:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])

    if not fields:
        return get_event_by_id(event_id)

    values.append(event_id)
    with get_connection() as conn:
        conn.execute(f"UPDATE events SET {', '.join(fields)} WHERE id = ?", values)
        return get_event_by_id(event_id)


def get_tasks(event_id):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM tasks WHERE event_id = ? ORDER BY id DESC",
            (event_id,)
        ).fetchall()
        return [dict(row) for row in rows]


def create_task(event_id, data):
    title = data.get("title", "").strip()
    owner = data.get("owner", "Unassigned").strip()
    priority = data.get("priority", "Medium").strip()
    due_date = data.get("due_date", "Today").strip()
    status = data.get("status", "Pending").strip()
    category = data.get("category", "Operations").strip()

    if not title:
        raise ValueError("Task title is required")

    with get_connection() as conn:
        cursor = conn.execute("""
            INSERT INTO tasks (event_id, title, owner, priority, status, due_date, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (event_id, title, owner, priority, status, due_date, category))
        task_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row)


def update_task(task_id, data):
    fields = []
    values = []

    for key in ["title", "owner", "priority", "status", "due_date", "category"]:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])

    if not fields:
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return dict(row) if row else None

    values.append(task_id)
    with get_connection() as conn:
        conn.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", values)
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row) if row else None


def delete_task(task_id):
    with get_connection() as conn:
        conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        return True


def get_team():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM team_members ORDER BY id ASC").fetchall()
        return [dict(row) for row in rows]


def simulate_event_gap(event_id, gap_type):
    event = get_event_by_id(event_id)
    if not event:
        return None

    target_reg = max(event.get("target_registrations") or 500, 100)
    target_spon = max(event.get("target_sponsorship") or 50000.0, 10000.0)

    with get_connection() as conn:
        if gap_type == "registration_gap":
            new_reg = int(target_reg * 0.35)
            conn.execute(
                "UPDATE events SET current_registrations = ?, target_registrations = ? WHERE id = ?",
                (new_reg, target_reg, event_id)
            )
        elif gap_type == "sponsorship_gap":
            new_spon = round(target_spon * 0.25)
            conn.execute(
                "UPDATE events SET current_sponsorship = ?, target_sponsorship = ? WHERE id = ?",
                (new_spon, target_spon, event_id)
            )
        elif gap_type == "overdue_tasks":
            conn.execute("""
                INSERT INTO tasks (event_id, title, owner, priority, status, due_date, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                event_id,
                "URGENT: Main Stage Audio-Visual Permit & Safety Clearance Overdue",
                "Dev Dutt Sharma",
                "Critical",
                "Pending",
                "Overdue",
                "Operations"
            ))
        elif gap_type == "resolved":
            resolved_reg = int(target_reg * 0.95)
            conn.execute(
                "UPDATE events SET current_registrations = ?, current_sponsorship = ? WHERE id = ?",
                (resolved_reg, target_spon, event_id)
            )
            conn.execute(
                "UPDATE tasks SET status = 'Completed' WHERE event_id = ?",
                (event_id,)
            )

    return get_event_by_id(event_id)


def reset_demo_data():
    """Resets the database with fresh demo data for CodeX Campus Fest 2026."""
    with get_connection() as conn:
        conn.execute("DELETE FROM tasks")
        conn.execute("DELETE FROM events")
        conn.execute("DELETE FROM team_members")
        conn.execute("DELETE FROM notifications")

    init_db()
    return get_events()


def get_custom_notifications(event_id):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM notifications WHERE event_id = ? ORDER BY id DESC",
            (event_id,)
        ).fetchall()
        return [dict(row) for row in rows]


def create_custom_notification(event_id, data):
    title = data.get("title", "").strip()
    message = data.get("message", "").strip()
    priority = data.get("priority", "High").strip()
    sender = data.get("sender", "Event Coordinator").strip()
    recipient = data.get("recipient", "All Team Members").strip()
    sound_enabled = 1 if data.get("sound_enabled", True) else 0

    if not title or not message:
        raise ValueError("Alert Title and Message are required")

    with get_connection() as conn:
        cursor = conn.execute("""
            INSERT INTO notifications (event_id, type, title, message, priority, sender, recipient, sound_enabled)
            VALUES (?, 'custom', ?, ?, ?, ?, ?, ?)
        """, (event_id, title, message, priority, sender, recipient, sound_enabled))
        notif_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM notifications WHERE id = ?", (notif_id,)).fetchone()
        return dict(row)


def update_notification_status(notification_id, is_read=None, acknowledged=None):
    fields = []
    values = []
    if is_read is not None:
        fields.append("is_read = ?")
        values.append(1 if is_read else 0)
    if acknowledged is not None:
        fields.append("acknowledged = ?")
        values.append(1 if acknowledged else 0)

    if not fields:
        return None

    values.append(notification_id)
    with get_connection() as conn:
        conn.execute(f"UPDATE notifications SET {', '.join(fields)} WHERE id = ?", values)
        row = conn.execute("SELECT * FROM notifications WHERE id = ?", (notification_id,)).fetchone()
        return dict(row) if row else None


def clear_custom_notifications(event_id):
    with get_connection() as conn:
        conn.execute("DELETE FROM notifications WHERE event_id = ?", (event_id,))
        return True


