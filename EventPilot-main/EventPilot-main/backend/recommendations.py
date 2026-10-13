"""
Rule-Based Priority & Recommendation Engine for EventPilot (Command Nexus)
Calculates health scores, detects operational gaps, and recommends recovery actions.
"""

from datetime import datetime


def calculate_health_score(event, tasks):
    """
    Computes an intelligent Event Health Score (0-100)
    Weighted by:
    - Registration completion: 35%
    - Sponsorship completion: 30%
    - Task completion: 25%
    - Overdue/Critical penalty: up to -10%
    """
    target_reg = max(event.get("target_registrations", 1), 1)
    curr_reg = event.get("current_registrations", 0)
    reg_ratio = min(curr_reg / target_reg, 1.0)

    target_spon = max(event.get("target_sponsorship", 1), 1)
    curr_spon = event.get("current_sponsorship", 0)
    spon_ratio = min(curr_spon / target_spon, 1.0)

    total_tasks = len(tasks)
    if total_tasks > 0:
        completed_tasks = sum(1 for t in tasks if t.get("status") == "Completed")
        task_ratio = completed_tasks / total_tasks
    else:
        task_ratio = 1.0

    # Base weighted score
    score = (reg_ratio * 35.0) + (spon_ratio * 30.0) + (task_ratio * 25.0) + 10.0

    # Penalties for critical pending tasks
    critical_pending = sum(
        1 for t in tasks if t.get("priority") == "Critical" and t.get("status") != "Completed"
    )
    score -= critical_pending * 5.0

    return max(0, min(100, int(round(score))))


def detect_gaps_and_recommendations(event, tasks):
    """
    Detects operational gaps and returns prioritized actionable recommendations.
    Ranking is based on Impact, Urgency, and Time Remaining.
    """
    target_reg = event.get("target_registrations", 500)
    curr_reg = event.get("current_registrations", 0)
    reg_gap = max(0, target_reg - curr_reg)

    target_spon = event.get("target_sponsorship", 50000)
    curr_spon = event.get("current_sponsorship", 0)
    spon_gap = max(0, target_spon - curr_spon)

    days_remaining = event.get("days_remaining", 4)

    risks = []
    recommendations = []

    # 1. Registration Gap Check
    if reg_gap > 0:
        gap_percent = (reg_gap / max(target_reg, 1)) * 100
        severity = "Critical" if gap_percent > 30 else "Warning"
        urgency = "High" if days_remaining <= 5 else "Medium"

        risks.append({
            "id": "risk_reg",
            "type": "registration",
            "severity": severity,
            "title": "Registration target at risk",
            "description": f"{reg_gap} more registrations ({int(gap_percent)}% remaining) needed to hit target.",
            "recommended_action": "Execute flash promotional campaign and alumni outreach immediately.",
        })

        recommendations.append({
            "id": "rec_outreach",
            "title": "Launch Flash Social Media Outreach",
            "category": "Marketing",
            "impact": "High (+20% registrations)",
            "urgency": urgency,
            "priority": "Critical" if severity == "Critical" else "High",
            "suggested_owner": "Saania",
            "action_task": {
                "title": f"Run blitz campaign to close {reg_gap} registration gap",
                "owner": "Saania",
                "priority": "Critical" if severity == "Critical" else "High",
                "due_date": "Today",
                "category": "Marketing"
            }
        })

    # 2. Sponsorship Gap Check
    if spon_gap > 0:
        gap_percent = (spon_gap / max(target_spon, 1)) * 100
        severity = "Critical" if gap_percent > 40 else "Warning"

        risks.append({
            "id": "risk_spon",
            "type": "sponsorship",
            "severity": severity,
            "title": "Sponsorship gap detected",
            "description": f"₹{int(spon_gap):,} remaining to reach the ₹{int(target_spon):,} target.",
            "recommended_action": "Follow up with tier-2 prospects and offer title/booth incentives.",
        })

        recommendations.append({
            "id": "rec_sponsors",
            "title": "Emergency Sponsor Follow-up Call Round",
            "category": "Finance",
            "impact": "High (Recover ₹15,000+)",
            "urgency": "High",
            "priority": "Critical" if severity == "Critical" else "High",
            "suggested_owner": "Vanshika",
            "action_task": {
                "title": f"Follow up with 5 shortlisted sponsors to bridge ₹{int(spon_gap):,} deficit",
                "owner": "Vanshika",
                "priority": "Critical",
                "due_date": "Today",
                "category": "Finance"
            }
        })

    # 3. Task Centric Gaps (Pending & Overdue)
    pending_tasks = [t for t in tasks if t.get("status") != "Completed"]
    critical_tasks = [t for t in pending_tasks if t.get("priority") == "Critical"]

    if len(critical_tasks) > 0:
        risks.append({
            "id": "risk_tasks",
            "type": "operations",
            "severity": "Warning",
            "title": f"{len(critical_tasks)} Critical tasks pending closure",
            "description": f"Action required to avoid delaying event day execution.",
            "recommended_action": "Assign co-leads and expedite closure before EOD.",
        })

    if len(pending_tasks) > 8:
        recommendations.append({
            "id": "rec_volunteers",
            "title": "Mobilize Volunteer Task Force",
            "category": "Operations",
            "impact": "Medium (Clear task bottleneck)",
            "urgency": "Medium",
            "priority": "Medium",
            "suggested_owner": "Devdatt",
            "action_task": {
                "title": "Delegate pending logistics tasks across 4 volunteer leads",
                "owner": "Devdatt",
                "priority": "Medium",
                "due_date": "Tomorrow",
                "category": "Operations"
            }
        })

    return risks, recommendations


def generate_smart_alerts(event, tasks):
    """
    Automatic Smart Alerts generated strictly based on predefined system conditions:
    1. Registration target se bahut peeche hai -> Critical
    2. Sponsor confirmation pending hai -> High
    3. Task deadline approaching hai -> Medium
    4. Important task overdue hai -> Critical
    5. Event target achieve ho gaya -> Success
    """
    alerts = []
    target_reg = max(event.get("target_registrations") or 500, 1)
    curr_reg = event.get("current_registrations") or 0

    target_spon = max(event.get("target_sponsorship") or 50000.0, 1.0)
    curr_spon = event.get("current_sponsorship") or 0.0

    # 1. Registration target achieved OR critically behind
    if curr_reg >= target_reg and target_reg > 0:
        alerts.append({
            "id": "smart_reg_achieved",
            "type": "smart",
            "priority": "Success",
            "title": "Registration Target Achieved",
            "message": "Congratulations! The event has achieved its registration target.",
            "sender": "System Condition Engine",
            "recipient": "All Team Members",
        })
    elif (curr_reg / target_reg) < 0.6:
        alerts.append({
            "id": "smart_reg_critical",
            "type": "smart",
            "priority": "Critical",
            "title": "Registration Deficit Alert",
            "message": "Registration progress is critically below target. Immediate action is required.",
            "sender": "System Condition Engine",
            "recipient": "All Team Members",
        })

    # 2. Sponsor confirmation pending
    if curr_spon < target_spon:
        alerts.append({
            "id": "smart_spon_pending",
            "type": "smart",
            "priority": "High",
            "title": "Sponsorship Confirmation Pending",
            "message": "Important sponsor confirmation is pending. Please follow up immediately.",
            "sender": "System Condition Engine",
            "recipient": "Partnerships & Sponsorship Lead",
        })

    # 3. Important task overdue
    overdue_tasks = [
        t for t in tasks
        if t.get("status") != "Completed" and (t.get("due_date") == "Overdue" or (t.get("priority") == "Critical" and t.get("due_date") == "Today"))
    ]
    if overdue_tasks:
        alerts.append({
            "id": "smart_task_overdue",
            "type": "smart",
            "priority": "Critical",
            "title": "Critical Task Overdue",
            "message": f"An important task ('{overdue_tasks[0].get('title', 'Operations')}') is overdue. Please take immediate action.",
            "sender": "System Condition Engine",
            "recipient": overdue_tasks[0].get("owner", "All Team Members"),
        })

    # 4. Task deadline approaching (Today / Tomorrow)
    approaching_tasks = [
        t for t in tasks
        if t.get("status") != "Completed" and t.get("due_date") in ["Today", "Tomorrow"]
    ]
    if approaching_tasks:
        alerts.append({
            "id": "smart_task_deadline",
            "type": "smart",
            "priority": "Medium",
            "title": "Task Deadline Approaching",
            "message": f"Your assigned task deadline is approaching ({len(approaching_tasks)} tasks pending today/tomorrow). Please review its status.",
            "sender": "System Condition Engine",
            "recipient": "All Team Members",
        })

    return alerts

