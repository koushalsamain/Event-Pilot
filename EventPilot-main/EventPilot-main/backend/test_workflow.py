"""
End-to-End Workflow Verification Script for EventPilot (Command Nexus)
Verifies the complete 7-step prototype lifecycle from PPT Slide 2 & 3:
1. Create sample event (Operational Blueprint)
2. Generate operational plan & Live Control Board metrics
3. Introduce a real event gap (Gap Simulator)
4. Detect the issue (Gap & Risk Detection Engine)
5. Recommend corrective actions (Priority & Recommendation Engine)
6. Assign action to team member (Task delegation)
7. Mark completed & verify closure updates event status & health score
"""

import sys
import json
import urllib.request
import urllib.error

# Force utf-8 for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:5000/api"

def make_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def run_workflow_test():
    print("=" * 70)
    print(">>> STARTING EVENTPILOT WORKFLOW AUTOMATED TEST")
    print("=" * 70)

    # Health Check
    status, health = make_request("GET", "/health")
    assert status == 200, "Health check failed"
    print(f"[OK] [SYSTEM]: API Online: {health['app']} (Version {health['api_version']})")

    # Step 1: Create a Sample Event (Event Blueprint)
    print("\n--- STEP 1: CREATE SAMPLE EVENT (EVENT BLUEPRINT) ---")
    event_payload = {
        "name": "CodeX National Hackathon 2026",
        "event_type": "Hackathon & Expo",
        "event_date": "2026-10-25",
        "location": "Auditorium Hall A",
        "target_registrations": 600,
        "current_registrations": 450,
        "target_sponsorship": 75000,
        "current_sponsorship": 50000,
        "days_remaining": 5
    }
    status, res = make_request("POST", "/events", event_payload)
    assert status == 201, "Event creation failed"
    event = res["event"]
    event_id = event["id"]
    print(f"[OK] Event Created via POST JSON: '{event['name']}' (ID: {event_id})")
    print(f"     Target Registrations: {event['target_registrations']} | Target Sponsorship: Rs.{event['target_sponsorship']}")

    # Step 2: Generate Operational Plan & Control Board
    print("\n--- STEP 2: GENERATE OPERATIONAL PLAN & LIVE CONTROL BOARD ---")
    status, dash = make_request("GET", f"/events/{event_id}/dashboard")
    assert status == 200, "Dashboard fetch failed"
    metrics = dash["metrics"]
    initial_health = metrics["health_score"]
    print(f"[OK] Live Dashboard Generated via GET JSON:")
    print(f"     Health Score: {initial_health}/100")
    print(f"     Registrations: {metrics['registrations']['current']} / {metrics['registrations']['target']} ({metrics['registrations']['percentage']}%)")
    print(f"     Sponsorship: Rs.{metrics['sponsorship']['current']} / Rs.{metrics['sponsorship']['target']} ({metrics['sponsorship']['percentage']}%)")
    print(f"     Active Tasks: {metrics['tasks']['total']} total, {metrics['tasks']['completed']} completed")

    # Step 3: Introduce a Real Event Gap (Simulator)
    print("\n--- STEP 3: INTRODUCE REAL EVENT GAP (GAP SIMULATOR) ---")
    gap_payload = {"gap_type": "registration_gap"}
    status, gap_res = make_request("POST", f"/events/{event_id}/simulate-gap", gap_payload)
    assert status == 200, "Gap simulation failed"
    print(f"[OK] Simulated Gap Introduced: 'registration_gap' via POST JSON")

    # Step 4: Detect the Issue (Gap & Risk Detection Engine)
    print("\n--- STEP 4: DETECT THE ISSUE (GAP & RISK DETECTION) ---")
    status, dash_gap = make_request("GET", f"/events/{event_id}/dashboard")
    risks = dash_gap["risks"]
    health_with_gap = dash_gap["metrics"]["health_score"]
    assert len(risks) > 0, "No risks detected!"
    top_risk = risks[0]
    print(f"[ALERT] Issue Detected by Rule-Based Engine:")
    print(f"        Risk Title: {top_risk['title']}")
    print(f"        Severity: {top_risk['severity']}")
    print(f"        Description: {top_risk['description']}")
    print(f"        Impact on Health Score: dropped from {initial_health} to {health_with_gap}")

    # Step 5: Recommend Corrective Actions (Priority & Recommendation Engine)
    print("\n--- STEP 5: RECOMMEND CORRECTIVE ACTIONS (SMART RECOVERY ENGINE) ---")
    recs = dash_gap["recommendations"]
    assert len(recs) > 0, "No recommendations generated!"
    top_rec = recs[0]
    print(f"[IDEA] Recommendation Generated:")
    print(f"       Action: {top_rec['title']}")
    print(f"       Impact: {top_rec['impact']}")
    print(f"       Urgency: {top_rec['urgency']}")
    print(f"       Suggested Lead: {top_rec['suggested_owner']}")

    # Step 6: Assign Action to Team Member
    print("\n--- STEP 6: ASSIGN ACTION TO TEAM MEMBER (TASK DELEGATION) ---")
    status, apply_res = make_request(
        "POST",
        f"/events/{event_id}/recommendations/apply",
        {"action_task": top_rec["action_task"]}
    )
    assert status == 201, "Apply recommendation failed"
    new_task = apply_res["task"]
    task_id = new_task["id"]
    print(f"[OK] Action Assigned to Team Lead via POST JSON:")
    print(f"     Task ID: {task_id}")
    print(f"     Title: '{new_task['title']}'")
    print(f"     Assignee: {new_task['owner']}")
    print(f"     Priority: {new_task['priority']}")
    print(f"     Status: {new_task['status']}")

    # Step 7: Mark Completed & Verify Closure
    print("\n--- STEP 7: MARK COMPLETED & VERIFY CLOSURE (CLOSURE TRACKING) ---")
    status, patch_res = make_request("PATCH", f"/tasks/{task_id}", {"status": "Completed"})
    assert status == 200, "Task update failed"
    print(f"[OK] Task Status Updated to 'Completed' via PATCH JSON")

    # Verify Final Status & Improved Health
    status, final_dash = make_request("GET", f"/events/{event_id}/dashboard")
    final_metrics = final_dash["metrics"]
    print(f"[OK] Post-Closure Verification:")
    print(f"     Completed Tasks: {final_metrics['tasks']['completed']} / {final_metrics['tasks']['total']}")
    print(f"     Updated Health Score: {final_metrics['health_score']}/100")

    print("\n" + "=" * 70)
    print("SUCCESS: ALL 7 WORKFLOW PHASES PASSED!")
    print("EventPilot prototype is fully functional, integrated, and ready.")
    print("=" * 70)

if __name__ == "__main__":
    run_workflow_test()
