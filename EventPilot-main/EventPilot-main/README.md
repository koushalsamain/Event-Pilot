# 🚀 EventPilot — Intelligent Event Command Centre

### Built by Team Command Nexus for CodeX 3.0

EventPilot transforms scattered event management details into a live operational command centre, comparing planned targets with real progress, detecting critical gaps, and suggesting smart recovery actions.

## 🌟 Architecture & Features

### Frontend (React 19, Tailwind CSS, Lucide Icons, Vite)

- Unified Live Control Board with registration, sponsorship, and task metrics.
- Interactive Prototype Gap Simulator.
- Priority Action Queue with one-click status closure and task assignment.
- Responsive dark-themed dashboard.

### Backend (Python Flask REST API)

- RESTful JSON endpoints for events, tasks, gaps, recommendations, and team roles.
- SQLite persistent database storage (`backend/eventpilot.db`).
- Rule-Based Priority & Gap Recommendation Engine (`backend/recommendations.py`).
- Dynamic Event Health Score (0–100) computation.

## 🚀 Quick Start Guide

### 1. Run the Flask Backend

Open a terminal in the project root and run:

```powershell
cd backend
.\.venv\Scripts\python.exe app.py