# EventPilot (Command Nexus) — Prototype Demo Script & REST API Guide

This document guides you through the live demonstration of **EventPilot: Intelligent Event Command Centre**, following the workflow submitted in the CodeX 3.0 Round 1 presentation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19 + Tailwind CSS + Lucide Icons + Vite
- **Backend:** Python Flask REST API
- **Data Format:** JSON requests & responses (`Content-Type: application/json`)
- **Database:** SQLite (`backend/eventpilot.db`)
- **Core Engine:** Python Rule-Based Priority & Gap Recommendation Engine (`backend/recommendations.py`)

---

## 🚀 How to Run the Application

### 1. Start the Flask Backend (Port 5000)
Open a terminal in `backend/`:
```bash
cd backend
.\.venv\Scripts\python.exe app.py
```
*API Base URL:* `http://localhost:5000/api`

### 2. Start the React Frontend (Port 5173)
Open a second terminal in `frontend/`:
```bash
cd frontend
npm run dev
```
*Open in Browser:* `http://localhost:5173`

---

## 📋 Expected Prototype Workflow (From Presentation Slide 2 & 3)

The system fulfills the complete 7-step prototype lifecycle:

1. **Create Sample Event:**
   - Click **"+ Create Event"** on the dashboard.
   - Enter event format, dates, target registrations (e.g., 500), and sponsorship goal (e.g., ₹50,000).
   - *REST API Call:* `POST /api/events` (sends JSON payload, auto-generates operational plan).

2. **Generate Operational Plan & Unified Dashboard:**
   - Unified dashboard presents live metrics: Registrations vs Target, Sponsorship vs Target, Task Closure, and calculated Event Health Score.
   - *REST API Call:* `GET /api/events/<id>/dashboard` (returns JSON operational summary).

3. **Introduce a Real Event Gap (Simulator):**
   - Click **"Simulate Reg Gap"** or **"Simulate Sponsor Gap"** in the Prototype Workflow Simulator bar.
   - *REST API Call:* `POST /api/events/<id>/simulate-gap` with `{ "gap_type": "registration_gap" }`.

4. **Detect the Issue:**
   - The engine automatically detects the gap.
   - The **Priority Alerts & Gaps** panel immediately highlights critical issues (e.g. *Registration target at risk* or *Sponsorship gap detected*).

5. **Recommend Corrective Actions:**
   - The Python recommendation engine ranks issues based on impact, urgency, and time remaining.
   - Displays recommendations under **Smart Recovery Recommendations** with suggested team leads.

6. **Assign Action to Team Member:**
   - Click **"Assign to Saania"** or **"Assign to Vanshika"** directly from the recommendation card.
   - *REST API Call:* `POST /api/events/<id>/recommendations/apply` (sends JSON task object).
   - The task is immediately added into the **Priority Action Queue**.

7. **Mark Task Completed (Closure Tracking):**
   - Click on the task row or checkbox in the **Priority Action Queue**.
   - *REST API Call:* `PATCH /api/tasks/<id>` with `{ "status": "Completed" }`.
   - The Event Health Score automatically increases!

---

## 📡 REST API & JSON Endpoint Reference

| Method | Endpoint | Request Body (JSON) | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Service health status |
| `GET` | `/api/events` | None | Returns all events list |
| `POST` | `/api/events` | `{"name": "...", "event_type": "...", "event_date": "...", "target_registrations": 500, "target_sponsorship": 50000}` | Create new event blueprint |
| `GET` | `/api/events/<id>` | None | Get single event details |
| `PATCH` | `/api/events/<id>` | `{"current_registrations": 400}` | Update event targets/progress |
| `GET` | `/api/events/<id>/dashboard` | None | Complete dashboard metrics, risks, recs, tasks |
| `GET` | `/api/events/<id>/tasks` | None | Get all tasks for event |
| `POST` | `/api/events/<id>/tasks` | `{"title": "...", "owner": "...", "priority": "...", "due_date": "..."}` | Add task to action queue |
| `PATCH` | `/api/tasks/<id>` | `{"status": "Completed"}` | Update task status or details |
| `DELETE` | `/api/tasks/<id>` | None | Remove task |
| `GET` | `/api/events/<id>/risks` | None | Detected gaps and operational risks |
| `GET` | `/api/events/<id>/recommendations` | None | Rule-based recovery recommendations |
| `POST` | `/api/events/<id>/recommendations/apply` | `{"action_task": {"title": "...", "owner": "..."}}` | Convert recommendation into assigned task |
| `POST` | `/api/events/<id>/simulate-gap` | `{"gap_type": "registration_gap"}` | Test gap simulation (`registration_gap`, `sponsorship_gap`, `overdue_tasks`, `resolved`) |
| `GET` | `/api/team` | None | Team members and roles |

---

## 👥 Command Nexus Team Details
1. **Koushal** — Team Leader & Event Director
2. **Vanshika Sharma** — Partnerships & Sponsorship Lead
3. **Saania** — Outreach & Marketing Lead
4. **Soniya Sharma** — Content & Communications Lead
5. **Dev Dutt Sharma** — Logistics & Operations Lead
