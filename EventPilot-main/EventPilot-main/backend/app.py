from flask import Flask, jsonify, request
from flask_cors import CORS

from database import (
    init_db,
    get_events,
    get_event_by_id,
    create_event,
    update_event,
    get_tasks,
    create_task,
    update_task,
    delete_task,
    get_team,
    simulate_event_gap,
    reset_demo_data,
    get_custom_notifications,
    create_custom_notification,
    update_notification_status,
    clear_custom_notifications,
)
from recommendations import (
    calculate_health_score,
    detect_gaps_and_recommendations,
    generate_smart_alerts,
)

app = Flask(__name__)
# Enable CORS for all routes so frontend (Vite port 5173 / localhost) can interact smoothly
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database tables and initial seed data exist
init_db()


# -------------------------------------------------------------
# Root & System Health
# -------------------------------------------------------------
@app.get("/")
def index():
    return jsonify({
        "app": "EventPilot Command Centre REST API",
        "team": "Command Nexus",
        "status": "online",
        "api_docs": {
            "health": "/api/health",
            "events": "/api/events",
            "dashboard_demo": "/api/events/1/dashboard",
            "tasks": "/api/events/1/tasks",
            "team": "/api/team"
        },
        "note": "Frontend UI runs on http://localhost:5173 via 'npm run dev' in the frontend folder."
    }), 200


@app.get("/api/health")
def health():
    return jsonify({
        "app": "EventPilot Command Centre",
        "status": "online",
        "api_version": "1.0",
        "supported_format": "application/json"
    }), 200


# -------------------------------------------------------------
# Events Blueprint & Management
# -------------------------------------------------------------
@app.get("/api/events")
def list_events():
    events = get_events()
    return jsonify({
        "count": len(events),
        "events": events
    }), 200


@app.get("/api/events/<int:event_id>")
def get_event(event_id):
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404
    return jsonify(event), 200


@app.post("/api/events")
def add_event():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON request body is required"}), 400

    required_fields = ["name", "event_type", "event_date"]
    for field in required_fields:
        if not data.get(field) or not str(data[field]).strip():
            return jsonify({"error": f"'{field}' is required and cannot be empty"}), 400

    try:
        new_event = create_event(data)
        return jsonify({
            "message": "Event created successfully with operational blueprint",
            "event": new_event
        }), 201
    except (ValueError, KeyError) as error:
        return jsonify({"error": str(error)}), 400


@app.patch("/api/events/<int:event_id>")
def modify_event(event_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON request body is required"}), 400

    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    updated = update_event(event_id, data)
    return jsonify({
        "message": "Event updated successfully",
        "event": updated
    }), 200


# -------------------------------------------------------------
# Live Control Board & Dashboard Summary
# -------------------------------------------------------------
@app.get("/api/events/<int:event_id>/dashboard")
def get_dashboard(event_id):
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    tasks = get_tasks(event_id)
    team = get_team()

    # Calculate dynamic health score & gaps via Recommendation Engine
    health_score = calculate_health_score(event, tasks)
    risks, recommendations = detect_gaps_and_recommendations(event, tasks)

    # Calculate summary metrics
    total_reg = event.get("target_registrations", 500)
    current_reg = event.get("current_registrations", 0)
    reg_pct = round((current_reg / max(total_reg, 1)) * 100, 1)

    target_spon = event.get("target_sponsorship", 50000.0)
    current_spon = event.get("current_sponsorship", 0.0)
    spon_pct = round((current_spon / max(target_spon, 1)) * 100, 1)

    completed_tasks = sum(1 for t in tasks if t.get("status") == "Completed")
    pending_tasks = len(tasks) - completed_tasks
    overdue_tasks = sum(1 for t in tasks if t.get("status") != "Completed" and t.get("due_date") in ["Today", "Overdue"])
    task_pct = round((completed_tasks / max(len(tasks), 1)) * 100, 1) if tasks else 100.0

    # 2 Types of Notifications: Automatic Smart Alerts + Custom Personal Alerts
    smart_alerts = generate_smart_alerts(event, tasks)
    custom_alerts = get_custom_notifications(event_id)
    all_notifications = custom_alerts + smart_alerts

    return jsonify({
        "event": event,
        "metrics": {
            "registrations": {
                "current": current_reg,
                "target": total_reg,
                "percentage": reg_pct,
                "gap": max(0, total_reg - current_reg)
            },
            "sponsorship": {
                "current": current_spon,
                "target": target_spon,
                "percentage": spon_pct,
                "gap": max(0, target_spon - current_spon)
            },
            "tasks": {
                "total": len(tasks),
                "completed": completed_tasks,
                "pending": pending_tasks,
                "overdue": overdue_tasks,
                "percentage": task_pct
            },
            "health_score": health_score,
            "days_remaining": event.get("days_remaining", 0)
        },
        "tasks": tasks,
        "risks": risks,
        "recommendations": recommendations,
        "notifications": all_notifications,
        "smart_alerts": smart_alerts,
        "custom_alerts": custom_alerts,
        "team": team
    }), 200


# -------------------------------------------------------------
# Tasks & Action Queue
# -------------------------------------------------------------
@app.get("/api/events/<int:event_id>/tasks")
def list_tasks(event_id):
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    tasks = get_tasks(event_id)
    return jsonify({
        "count": len(tasks),
        "tasks": tasks
    }), 200


@app.post("/api/events/<int:event_id>/tasks")
def add_task(event_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON request body is required"}), 400

    if not data.get("title", "").strip():
        return jsonify({"error": "Task title is required"}), 400

    task = create_task(event_id, data)
    return jsonify({
        "message": "Task added to queue",
        "task": task
    }), 201


@app.patch("/api/tasks/<int:task_id>")
def modify_task(task_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON request body is required"}), 400

    updated = update_task(task_id, data)
    if not updated:
        return jsonify({"error": f"Task with ID {task_id} not found"}), 404

    return jsonify({
        "message": "Task updated successfully",
        "task": updated
    }), 200


@app.delete("/api/tasks/<int:task_id>")
def remove_task(task_id):
    delete_task(task_id)
    return jsonify({"message": f"Task {task_id} deleted successfully"}), 200


# -------------------------------------------------------------
# Gap Detection & Recommendation Engine
# -------------------------------------------------------------
@app.get("/api/events/<int:event_id>/risks")
def list_risks(event_id):
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    tasks = get_tasks(event_id)
    risks, _ = detect_gaps_and_recommendations(event, tasks)
    return jsonify({
        "count": len(risks),
        "risks": risks
    }), 200


@app.get("/api/events/<int:event_id>/recommendations")
def list_recommendations(event_id):
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    tasks = get_tasks(event_id)
    _, recommendations = detect_gaps_and_recommendations(event, tasks)
    return jsonify({
        "count": len(recommendations),
        "recommendations": recommendations
    }), 200


@app.post("/api/events/<int:event_id>/recommendations/apply")
def apply_recommendation(event_id):
    """
    Directly converts a recommended action into an assigned task in the action queue.
    """
    data = request.get_json(silent=True) or {}
    action_task = data.get("action_task")

    if not action_task or not action_task.get("title"):
        return jsonify({"error": "Valid 'action_task' object with 'title' is required"}), 400

    task = create_task(event_id, action_task)
    return jsonify({
        "message": f"Recommendation applied! Assigned '{task['title']}' to {task['owner']}.",
        "task": task
    }), 201


@app.post("/api/events/<int:event_id>/simulate-gap")
def simulate_gap(event_id):
    data = request.get_json(silent=True) or {}
    gap_type = data.get("gap_type", "registration_gap")

    updated_event = simulate_event_gap(event_id, gap_type)
    if not updated_event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    messages = {
        "registration_gap": f"Simulated Registration Gap: Target deficit of {max(0, updated_event['target_registrations'] - updated_event['current_registrations'])} participants injected. Health score updated.",
        "sponsorship_gap": f"Simulated Sponsorship Gap: Funding deficit of ₹{int(max(0, updated_event['target_sponsorship'] - updated_event['current_sponsorship'])):,} injected into event.",
        "overdue_tasks": "Simulated Task Risk: Critical overdue operational task added to queue with urgent status.",
        "resolved": "All operational targets restored to optimal standing! Status reset to on-track."
    }

    return jsonify({
        "message": messages.get(gap_type, f"Simulated gap '{gap_type}' applied to event."),
        "gap_type": gap_type,
        "event": updated_event
    }), 200


@app.post("/api/reset")
def reset_database():
    """Resets all data to clean default demo state (CodeX Campus Fest 2026)."""
    events = reset_demo_data()
    return jsonify({
        "message": "Database reset to initial demo state with CodeX Campus Fest 2026.",
        "events": events
    }), 200


# -------------------------------------------------------------
# Notifications: Smart Alerts & Custom Personal Alerts
# -------------------------------------------------------------
@app.get("/api/events/<int:event_id>/notifications")
def list_notifications(event_id):
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    tasks = get_tasks(event_id)
    smart_alerts = generate_smart_alerts(event, tasks)
    custom_alerts = get_custom_notifications(event_id)
    all_notifications = custom_alerts + smart_alerts

    return jsonify({
        "count": len(all_notifications),
        "notifications": all_notifications,
        "smart_alerts": smart_alerts,
        "custom_alerts": custom_alerts
    }), 200


@app.post("/api/events/<int:event_id>/notifications")
def add_custom_notification(event_id):
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON request body is required"}), 400

    try:
        new_alert = create_custom_notification(event_id, data)
        return jsonify({
            "message": f"Custom Personal Alert '{new_alert['title']}' sent to {new_alert['recipient']}!",
            "notification": new_alert
        }), 201
    except (ValueError, KeyError) as error:
        return jsonify({"error": str(error)}), 400


@app.patch("/api/notifications/<int:notif_id>")
def modify_notification(notif_id):
    data = request.get_json(silent=True) or {}
    updated = update_notification_status(
        notif_id,
        is_read=data.get("is_read"),
        acknowledged=data.get("acknowledged")
    )
    if not updated:
        return jsonify({"error": f"Custom notification with ID {notif_id} not found"}), 404

    return jsonify({
        "message": "Notification updated",
        "notification": updated
    }), 200


@app.post("/api/events/<int:event_id>/notifications/clear")
def clear_notifications(event_id):
    clear_custom_notifications(event_id)
    return jsonify({"message": "Custom notifications cleared"}), 200


@app.get("/api/team")
def list_team():
    team = get_team()
    return jsonify({
        "count": len(team),
        "team": team
    }), 200


@app.get("/api/database/dump")
def dump_database():
    from database import get_connection
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';")
        tables = [row["name"] for row in cursor.fetchall()]
        data = {}
        for t in tables:
            rows = conn.execute(f"SELECT * FROM {t}").fetchall()
            data[t] = [dict(r) for r in rows]
        return jsonify({
            "database": "eventpilot.db",
            "table_counts": {t: len(data[t]) for t in tables},
            "tables": data
        }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
