# 🚀 EventPilot — Intelligent Event Command Centre

<img width="1600" height="600" alt="image" src="https://github.com/user-attachments/assets/e6509c7d-81aa-4b32-b272-12f80f1e50c4" />



**Monitor events. Detect risks. Prioritize actions. Keep every team on track.**

EventPilot is an intelligent event operations platform designed to help organizers manage event progress, identify operational gaps, prioritize critical issues, and coordinate corrective actions from a centralized dashboard.

Instead of simply displaying event metrics, EventPilot focuses on helping teams understand what needs attention, why it matters, and what action should be taken next.

---

## 🎯 Problem Statement

Event teams often manage registrations, marketing, sponsorships, operations, deadlines, and internal responsibilities across multiple tools and communication channels.

This fragmented workflow can lead to:
- Delayed follow-ups and missed deadlines.
- Difficulty identifying critical operational risks.
- Poor coordination between event teams.
- Lack of clarity about which task should be prioritized.
- Limited visibility into whether corrective actions are effective.

EventPilot addresses these challenges by connecting event monitoring with risk detection, actionable recommendations, notifications, and task tracking.

---

## 💡 Our Solution

EventPilot provides a centralized command centre that transforms event information into actionable insights.

The platform helps organizers:
- Monitor event progress against predefined targets.
- Detect operational gaps and potential risks.
- Prioritize issues based on urgency and impact.
- Receive contextual alerts and recommended actions.
- Create and distribute custom notifications.
- Assign tasks to responsible team members.
- Track task status and record outcomes.

---

<img width="1600" height="696" alt="image" src="https://github.com/user-attachments/assets/5f1ee760-696b-45b9-90bd-a0a3dda5eb08" />


## ✨ Key Features

### 📊 1. Centralized Event Dashboard
View important event metrics, progress indicators, pending tasks, and operational status in one place.

### 🚨 2. Risk Detection Engine
Analyze event targets, current progress, and deadlines using predefined rules to identify operational gaps and assign risk levels.

### 🧠 3. Priority-Based Recommendations
Generate actionable suggestions based on detected issues, their urgency, and the time remaining.

### 🔔 4. Smart Notifications
Generate contextual alerts when predefined event conditions are triggered.

### 📢 5. Custom Alerts
Allow users to create personalized alert messages, select priority levels, and choose notification recipients according to their requirements.

### 🔊 6. Sound Notifications
Play notification sounds when alerts are displayed, subject to browser audio permissions and user interaction requirements.

### 👥 7. Team Task Management
Assign corrective actions to team members, set deadlines, update task status, and record outcomes.

### 📈 8. Progress Monitoring
Track event performance against targets and review updated metrics to evaluate whether corrective actions improve results.

---

## ⚙️ How It Works

1. **Create an Event:** Enter event details, targets, deadlines, and relevant requirements.
2. **Monitor Progress:** View event metrics and operational status through the dashboard.
3. **Detect Risks:** Analyze progress against targets and identify potential problems.
4. **Prioritize Issues:** Determine which risks require attention based on predefined rules.
5. **Recommend Actions:** Generate relevant corrective actions.
6. **Notify Team Members:** Display automatic alerts or distribute user-created custom notifications.
7. **Assign Tasks:** Allocate responsibilities and deadlines to team members.
8. **Track Outcomes:** Record task completion and review updated event metrics.

---

## 🏗️ System Architecture

```text
                EVENT ORGANIZER
                       |
                       v
                REACT FRONTEND
                       |
                       v
                  FLASK API
                       |
             +---------+---------+
             |                   |
             v                   v
        SQLITE DATABASE     PYTHON RULE ENGINE
             |                   |
             |                   v
             |            RISK & RECOMMENDATIONS
             |                   |
             +---------+---------+
                       |
                       v
               NOTIFICATION SYSTEM
                       |
                       v
              ACTION ASSIGNMENT
                       |
                       v
                OUTCOME TRACKING
```

The frontend communicates with the Flask backend through APIs. The backend coordinates data storage and risk analysis, while the frontend presents the resulting information to users.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React.js | User interface and interactive components |
| Styling | Tailwind CSS | Responsive interface styling |
| Charts | Recharts | Event metrics and progress visualization |
| Backend | Python Flask | API endpoints and application logic |
| Database | SQLite | Persistent event and task data |
| Risk Engine | Python | Rule-based risk analysis and recommendations |
| Version Control | Git and GitHub | Source code management |

---

## 🔔 Notification System

EventPilot supports two notification categories.

### Automatic Smart Alerts
These alerts are generated when configured event conditions are triggered, such as critical registration gaps, approaching deadlines, or overdue tasks.

### User-Created Custom Alerts
Users can create their own alert messages, choose a priority, select recipients, and send notifications according to their requirements.

Both notification types can use sound alerts where supported by the browser.

Notification delivery across multiple connected users depends on the application's configured communication mechanism.

---

## 🧪 Example Scenario

Consider a simulated college hackathon with the following details:

- Registration target: 500 participants
- Current registrations: 270
- Days remaining: 5
- Recent registration rate: 18 participants per day

### Risk Analysis

**Registration Gap:** 230 participants

**Required Daily Registration Rate:** 46 participants per day

Since the recent registration rate is below the required rate, the configured risk engine can flag the registration process for attention.

### Recommended Action

- Launch targeted campus outreach.
- Contact student communities.
- Send reminders to incomplete registrants.
- Assign the outreach task to the marketing team.
- Review updated registration metrics after the intervention.

This example illustrates how EventPilot connects event monitoring with risk identification and corrective action.

*The scenario uses illustrative data and does not represent actual event performance.*

---

## 🎯 Project Objectives

- Centralize event operational information.
- Improve visibility into event progress and risks.
- Reduce delays in identifying critical issues.
- Support priority-based decision-making.
- Improve team coordination and accountability.
- Connect alerts and recommendations with actionable workflows.

---

## 🚀 Getting Started

### Prerequisites

Install the following software:

- Node.js and npm
- Python 3
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/koushalsamain/EventPilot.git
cd EventPilot
```

### 2. Start the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**

```bash
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask application using the command configured in your project.

For example, if your Flask entry point is `app.py`:

```bash
python app.py
```

### 3. Start the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL printed by Vite or your configured frontend development server.

**Note:** These commands assume your repository contains `backend/` and `frontend/` directories and that the corresponding configuration files are present. Adjust the commands to match your actual project structure.

---

## 👥 Team

**Team Name:** Command Nexus

| Team Member | Responsibility |
|---|---|
| Koushal | Team Leadership and Integration |
| Vanshika Sharma | Backend and Database |
| Sania | Frontend Dashboard |
| Soniya Sharma | Event Setup and Task Workflow |
| Dev Dutt Sharma | Risk and Recommendation Engine |

*Team responsibilities reflect the proposed development plan and can be updated to match actual contributions.*

---

## 🔮 Future Enhancements

- Real-time notifications across connected users.
- More advanced risk scoring and forecasting.
- Optional LLM-assisted recommendation explanations.
- Role-based permissions and authentication.
- Integration with external event-management platforms.
- Historical analytics and intervention effectiveness tracking.
- Improved notification acknowledgement and escalation workflows.

---

## 🏆 Hackathon Project

**Problem Statement:** PS1 — Build an Intelligent Event Command Centre

**Project Name:** EventPilot

**Team:** Command Nexus

EventPilot aims to help event teams move beyond monitoring dashboards by connecting operational insights with prioritized actions, team coordination, and outcome tracking.

---

## 📄 License

A license has not yet been specified for this project. Add an appropriate license before granting permissions for reuse or redistribution.
