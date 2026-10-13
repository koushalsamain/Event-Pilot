import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  ShieldAlert,
  Users,
  Settings,
  Bell,
  RefreshCw,
  Zap,
  X,
  Database,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Send,
  MessageSquare,
  Check,
} from "lucide-react";

import "./App.css";
import api from "./services/api";
import { playNotificationSound, testNotificationChime } from "./services/sound";

// 5 Dedicated Page Components
import Dashboard from "./pages/Dashboard";
import EventSetup from "./pages/EventSetup";
import Tasks from "./pages/Tasks";
import Risks from "./pages/Risks";
import Team from "./pages/Team";

const TEAM_MEMBERS = [
  { id: 1, name: "Koushal", role: "Team Leader & Event Director", email: "koushal@eventpilot.internal", avatar: "K" },
  { id: 2, name: "Vanshika Sharma", role: "Partnerships & Sponsorship Lead", email: "vanshika@eventpilot.internal", avatar: "V" },
  { id: 3, name: "Saania", role: "Outreach & Marketing Lead", email: "saania@eventpilot.internal", avatar: "S" },
  { id: 4, name: "Soniya Sharma", role: "Content & Communications Lead", email: "soniya@eventpilot.internal", avatar: "S" },
  { id: 5, name: "Dev Dutt Sharma", role: "Logistics & Operations Lead", email: "devdutt@eventpilot.internal", avatar: "D" },
];

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [team, setTeam] = useState(TEAM_MEMBERS);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  // Active Workspace Page Navigation: 'dashboard' | 'blueprint' | 'tasks' | 'risks' | 'team'
  const [activePage, setActivePage] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(TEAM_MEMBERS[0]);

  // Modals & Popups
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCustomAlertModal, setShowCustomAlertModal] = useState(false);

  // 2-Type Notifications System State & Audio
  const [notifFilterTab, setNotifFilterTab] = useState("all"); // 'all' | 'smart' | 'custom'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [customAlertForm, setCustomAlertForm] = useState({
    title: "Urgent Volunteer Meeting",
    priority: "High",
    recipient: "All Team Members",
    message: "All volunteers must attend the meeting at 4 PM today. Please confirm your availability.",
    sound_enabled: true,
  });

  // Forms
  const [eventForm, setEventForm] = useState({
    name: "",
    event_type: "Tech Fest & Hackathon",
    event_date: "",
    location: "Main Auditorium",
    description: "",
    target_registrations: 500,
    target_sponsorship: 50000,
    days_remaining: 5,
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    owner: TEAM_MEMBERS[1].name,
    priority: "High",
    due_date: "Today",
    category: "Operations",
  });

  const notifRef = useRef(null);

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(""), 5000);
  };

  const addNotification = (title, desc) => {
    showFeedback(`${title}: ${desc}`);
  };

  // Load Events
  const loadEvents = useCallback(async () => {
    try {
      const health = await api.checkHealth();
      setApiOnline(health.status === "online" || health.status === "running");

      const res = await api.getEvents();
      if (res.events && res.events.length > 0) {
        setEvents(res.events);
        if (!selectedEventId) {
          setSelectedEventId(res.events[0].id);
        }
      }
    } catch (err) {
      console.warn("API unreachable:", err);
      setApiOnline(false);
    }
  }, [selectedEventId]);

  // Load Live Dashboard for Selected Event
  const loadDashboard = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      setLoading(true);
      const data = await api.getDashboard(eventId);
      setDashboardData(data);
      if (data.team && data.team.length > 0) setTeam(data.team);
      setApiOnline(true);
    } catch (err) {
      console.error("Dashboard error:", err);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Team
  const loadTeam = useCallback(async () => {
    try {
      const res = await api.getTeam();
      if (res.team && res.team.length > 0) setTeam(res.team);
    } catch (err) {
      console.warn("Team fetch error:", err);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadTeam();
  }, [loadEvents, loadTeam]);

  useEffect(() => {
    if (selectedEventId) {
      loadDashboard(selectedEventId);
    }
  }, [selectedEventId, loadDashboard]);

  // Handle URL hash changes (e.g. #dashboard, #blueprint, #tasks, #risks, #team)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (["dashboard", "blueprint", "tasks", "risks", "team"].includes(hash)) {
        setActivePage(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reload action
  const handleReload = async () => {
    setIsReloading(true);
    try {
      await loadEvents();
      if (selectedEventId) {
        await loadDashboard(selectedEventId);
      }
      showFeedback("Synced with REST API! Latest operational metrics refreshed.");
      addNotification("Manual Sync Executed", "Refreshed operational blueprint from SQLite backend.", "info");
    } catch (err) {
      showFeedback("Sync failed: " + err.message);
    } finally {
      setTimeout(() => setIsReloading(false), 600);
    }
  };

  // Gap simulator with audio alerts
  const handleSimulateGap = async (gapType) => {
    if (!selectedEventId) return;
    try {
      const res = await api.simulateGap(selectedEventId, gapType);
      showFeedback(res.message);

      if (gapType === "registration_gap") {
        if (soundEnabled) playNotificationSound("Critical");
      } else if (gapType === "sponsorship_gap") {
        if (soundEnabled) playNotificationSound("High");
      } else if (gapType === "overdue_tasks") {
        if (soundEnabled) playNotificationSound("Critical");
      } else if (gapType === "resolved") {
        if (soundEnabled) playNotificationSound("Success");
      }

      await loadDashboard(selectedEventId);
    } catch (err) {
      alert("Error running gap simulation: " + err.message);
    }
  };

  // Send Custom Personal Alert (POST JSON)
  const handleSendCustomAlert = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;

    try {
      const alertPayload = {
        title: customAlertForm.title,
        priority: customAlertForm.priority,
        recipient: customAlertForm.recipient,
        message: customAlertForm.message,
        sound_enabled: customAlertForm.sound_enabled,
        sender: `${currentUser.name} (${currentUser.role.split(" ")[0]})`,
      };

      const res = await api.createNotification(selectedEventId, alertPayload);
      showFeedback(res.message);

      if (customAlertForm.sound_enabled && soundEnabled) {
        playNotificationSound(customAlertForm.priority);
      }

      setShowCustomAlertModal(false);
      setCustomAlertForm({
        title: "Urgent Volunteer Meeting",
        priority: "High",
        recipient: "All Team Members",
        message: "All volunteers must attend the meeting at 4 PM today. Please confirm your availability.",
        sound_enabled: true,
      });

      await loadDashboard(selectedEventId);
    } catch (err) {
      alert("Error sending personal alert: " + err.message);
    }
  };

  // Acknowledge Notification
  const handleAcknowledgeAlert = async (notifItem) => {
    try {
      if (notifItem.id && typeof notifItem.id === "number") {
        await api.updateNotification(notifItem.id, { acknowledged: true, is_read: true });
      }
      if (soundEnabled) playNotificationSound("Success");
      showFeedback(`Acknowledged alert: "${notifItem.title}"`);
      await loadDashboard(selectedEventId);
    } catch (err) {
      console.warn("Acknowledge error:", err);
    }
  };

  // Clear Custom Notifications
  const handleClearNotifications = async () => {
    if (!selectedEventId) return;
    try {
      await api.clearNotifications(selectedEventId);
      showFeedback("Custom notifications cleared.");
      setHasUnreadNotifs(false);
      await loadDashboard(selectedEventId);
    } catch (err) {
      console.warn(err);
    }
  };

  // Create Event (POST JSON)
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createEvent({
        ...eventForm,
        target_registrations: Number(eventForm.target_registrations),
        target_sponsorship: Number(eventForm.target_sponsorship),
        days_remaining: Number(eventForm.days_remaining),
      });

      showFeedback(`Event "${res.event.name}" created successfully!`);
      addNotification("New Event Created", `Operational blueprint generated for ${res.event.name}.`, "info");
      setShowEventModal(false);
      setEventForm({
        name: "",
        event_type: "Tech Fest & Hackathon",
        event_date: "",
        location: "Main Auditorium",
        description: "",
        target_registrations: 500,
        target_sponsorship: 50000,
        days_remaining: 5,
      });

      await loadEvents();
      setSelectedEventId(res.event.id);
    } catch (err) {
      alert("Error creating event: " + err.message);
    }
  };

  // Create Task (POST JSON)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;

    try {
      await api.createTask(selectedEventId, taskForm);
      showFeedback(`Task "${taskForm.title}" added to queue!`);
      addNotification("Task Queued", `Assigned "${taskForm.title}" to ${taskForm.owner}.`, "info");
      setShowTaskModal(false);
      setTaskForm({
        title: "",
        owner: currentUser.name,
        priority: "High",
        due_date: "Today",
        category: "Operations",
      });
      loadDashboard(selectedEventId);
    } catch (err) {
      alert("Error adding task: " + err.message);
    }
  };

  // Toggle Task Status (PATCH JSON)
  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      await api.updateTask(taskId, { status: nextStatus });
      showFeedback(`Task marked as ${nextStatus}!`);
      if (nextStatus === "Completed") {
        addNotification("Task Closed", `Task closed by ${currentUser.name}. Health score boosted.`, "info");
      }
      loadDashboard(selectedEventId);
    } catch (err) {
      alert("Error updating task: " + err.message);
    }
  };

  // Apply Recommendation (POST JSON)
  const handleApplyRecommendation = async (rec) => {
    if (!selectedEventId || !rec.action_task) return;
    try {
      const res = await api.applyRecommendation(selectedEventId, rec.action_task);
      showFeedback(res.message);
      addNotification("Recommendation Executed", `Action assigned to ${rec.action_task.owner}.`, "info");
      loadDashboard(selectedEventId);
    } catch (err) {
      alert("Error applying recommendation: " + err.message);
    }
  };

  // Reset database to demo state
  const handleResetDatabase = async () => {
    if (!confirm("Reset database to clean initial demo state (CodeX Campus Fest 2026)?")) return;
    try {
      const res = await api.resetDatabase();
      showFeedback(res.message);
      addNotification("Database Reset", "Restored demo blueprint for CodeX Campus Fest 2026.", "info");
      setShowSettingsModal(false);
      await loadEvents();
      if (res.events && res.events.length > 0) {
        setSelectedEventId(res.events[0].id);
      }
    } catch (err) {
      alert("Failed to reset database: " + err.message);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!dashboardData) return;
    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name || "EventPilot"}-blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("Event JSON Blueprint exported successfully!");
  };

  const navigateToPage = (pageKey) => {
    setActivePage(pageKey);
    window.location.hash = pageKey;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Derived metrics
  const event = dashboardData?.event || events.find((e) => e.id === selectedEventId) || {};
  const metrics = dashboardData?.metrics || {
    registrations: { current: 320, target: 500, percentage: 64, gap: 180 },
    sponsorship: { current: 35000, target: 50000, percentage: 70, gap: 15000 },
    tasks: { total: 5, completed: 2, pending: 3, overdue: 1, percentage: 40 },
    health_score: 72,
    days_remaining: 4,
  };
  const tasksList = dashboardData?.tasks || [];
  const risksList = dashboardData?.risks || [];
  const recommendationsList = dashboardData?.recommendations || [];
  const allNotifications = dashboardData?.notifications || [];
  const smartAlerts = dashboardData?.smart_alerts || [];
  const customAlerts = dashboardData?.custom_alerts || [];

  const displayedNotifications =
    notifFilterTab === "smart"
      ? smartAlerts
      : notifFilterTab === "custom"
      ? customAlerts
      : allNotifications;

  const pageNames = {
    dashboard: "Dashboard",
    blueprint: "Event Blueprint",
    tasks: "Task Centre",
    risks: "Risk & Alerts",
    team: "Team",
  };

  return (
    <div className="app-shell">
      {/* Sidebar with 5 Workspace Pages */}
      <aside className="sidebar">
        <div className="brand" onClick={() => navigateToPage("dashboard")} style={{ cursor: "pointer" }}>
          <div className="brand-icon">E</div>
          <div>
            <h2>EventPilot</h2>
            <p>COMMAND NEXUS</p>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE PAGES</div>

        <nav className="navigation">
          {/* Page 1: Dashboard */}
          <button
            className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => navigateToPage("dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          {/* Page 2: Event Blueprint */}
          <button
            className={`nav-item ${activePage === "blueprint" ? "active" : ""}`}
            onClick={() => navigateToPage("blueprint")}
          >
            <CalendarDays size={19} />
            Event Blueprint
          </button>

          {/* Page 3: Task Centre */}
          <button
            className={`nav-item ${activePage === "tasks" ? "active" : ""}`}
            onClick={() => navigateToPage("tasks")}
          >
            <CheckSquare size={19} />
            Task Centre
            <span className="nav-count">{metrics.tasks.pending}</span>
          </button>

          {/* Page 4: Risk & Alerts */}
          <button
            className={`nav-item ${activePage === "risks" ? "active" : ""}`}
            onClick={() => navigateToPage("risks")}
          >
            <ShieldAlert size={19} />
            Risk & Alerts
            {risksList.length > 0 && <span className="alert-dot" />}
          </button>

          {/* Page 5: Team */}
          <button
            className={`nav-item ${activePage === "team" ? "active" : ""}`}
            onClick={() => navigateToPage("team")}
          >
            <Users size={19} />
            Team
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">✦</div>
            <h3>Intelligent Command</h3>
            <p>Turn scattered event data into prioritized recovery actions.</p>
            <a
              href="#risks"
              onClick={(e) => {
                e.preventDefault();
                navigateToPage("risks");
              }}
            >
              Explore insights →
            </a>
          </div>

          <button
            className="nav-item"
            style={{ width: "100%", justifyContent: "flex-start", background: "none", border: 0 }}
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings size={19} />
            Settings
          </button>

          {/* Profile Card */}
          <div
            className="profile avatar-clickable"
            onClick={() => setShowUserModal(true)}
            title="Click to view profile & switch role"
          >
            <div className="avatar">{currentUser.avatar || currentUser.name.charAt(0)}</div>
            <div>
              <strong>{currentUser.name}</strong>
              <p>{currentUser.role.split(" ")[0]} • Switch</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar" style={{ position: "relative" }}>
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{pageNames[activePage] || "Dashboard"}</strong>
            {event.name && <span>/</span>}
            {event.name && <strong>{event.name}</strong>}
          </div>

          <div className="topbar-actions">
            {/* Event Selector */}
            {events.length > 0 && (
              <select
                className="event-selector-select"
                value={selectedEventId || ""}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            )}

            {/* REST API Status Badge */}
            <div
              className={`api-status-badge ${apiOnline ? "online" : "offline"}`}
              title={apiOnline ? "REST API Online (SQLite Connected)" : "API Reconnecting..."}
            >
              <span className="status-indicator-dot" />
              {apiOnline ? "REST API Connected" : "Connecting..."}
            </div>

            {/* Reload Button */}
            <button
              className={`icon-button ${isReloading ? "spin" : ""}`}
              aria-label="Refresh Data"
              onClick={handleReload}
              title="Click to reload from REST API"
            >
              <RefreshCw size={18} />
            </button>

            {/* Notifications Bell */}
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasUnreadNotifs(false);
              }}
              title="Operational Notifications (Smart & Custom Alerts)"
              style={{ position: "relative" }}
            >
              <Bell size={19} />
              {(hasUnreadNotifs || allNotifications.some((n) => !n.acknowledged)) && (
                <span className="notification-dot" />
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="notifications-dropdown" ref={notifRef}>
                <div className="notif-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Bell size={15} color="#60a5fa" />
                      Command Nexus Alerts
                    </h4>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>
                      {allNotifications.length} active ({allNotifications.filter((n) => !n.acknowledged).length} unacknowledged)
                    </span>
                  </div>
                  <button
                    className="primary-button"
                    style={{ fontSize: "11px", padding: "4px 10px", gap: "4px" }}
                    onClick={() => {
                      setShowNotifications(false);
                      setShowCustomAlertModal(true);
                    }}
                  >
                    <Send size={12} />
                    + Create Alert
                  </button>
                </div>

                {/* Filter Tabs: All | Smart Alerts | Custom Alerts */}
                <div className="notif-filter-tabs">
                  <button
                    className={`notif-filter-tab ${notifFilterTab === "all" ? "active" : ""}`}
                    onClick={() => setNotifFilterTab("all")}
                  >
                    All ({allNotifications.length})
                  </button>
                  <button
                    className={`notif-filter-tab ${notifFilterTab === "smart" ? "active" : ""}`}
                    onClick={() => setNotifFilterTab("smart")}
                  >
                    🤖 Smart ({smartAlerts.length})
                  </button>
                  <button
                    className={`notif-filter-tab ${notifFilterTab === "custom" ? "active" : ""}`}
                    onClick={() => setNotifFilterTab("custom")}
                  >
                    👤 Custom ({customAlerts.length})
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="notif-list" style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {displayedNotifications.length === 0 ? (
                    <div style={{ padding: "30px 20px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                      No alerts in this category. All operations running smoothly!
                    </div>
                  ) : (
                    displayedNotifications.map((notif) => {
                      const isSmart = notif.type === "smart";
                      const priorityLower = (notif.priority || "medium").toLowerCase();
                      return (
                        <div
                          key={notif.id}
                          className={`notif-item ${!notif.acknowledged ? "unread" : ""}`}
                          style={{
                            borderLeft: `3px solid ${
                              priorityLower === "critical"
                                ? "#ef4444"
                                : priorityLower === "high"
                                ? "#f97316"
                                : priorityLower === "success"
                                ? "#10b981"
                                : "#eab308"
                            }`,
                          }}
                        >
                          <div style={{ flexShrink: 0, marginTop: 2 }}>
                            {priorityLower === "critical" ? (
                              <AlertTriangle size={16} color="#ef4444" />
                            ) : priorityLower === "high" ? (
                              <Clock size={16} color="#f97316" />
                            ) : priorityLower === "success" ? (
                              <CheckCircle2 size={16} color="#10b981" />
                            ) : (
                              <Clock size={16} color="#eab308" />
                            )}
                          </div>

                          <div className="notif-content" style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                flexWrap: "wrap",
                                marginBottom: "4px",
                              }}
                            >
                              <span className={`notif-source-badge ${isSmart ? "smart" : "custom"}`}>
                                {isSmart ? "🤖 Smart Alert" : "👤 Custom Alert"}
                              </span>
                              <span className={`priority-pill ${priorityLower}`}>{notif.priority}</span>
                              {notif.sound_enabled && (
                                <span title="Sound chime enabled" style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  🔊
                                </span>
                              )}
                            </div>

                            <strong>{notif.title}</strong>
                            <p>{notif.message}</p>

                            <div className="notif-action-row">
                              <span className="notif-time">
                                {isSmart
                                  ? "Auto-detected by Engine"
                                  : `Sent by: ${notif.sender || "Coordinator"}`}
                                {notif.recipient && ` ➔ ${notif.recipient}`}
                                {notif.created_at && !isSmart && ` • ${notif.created_at}`}
                              </span>

                              <div>
                                {notif.acknowledged ? (
                                  <span className="acknowledged-badge">
                                    <Check size={12} /> Acknowledged
                                  </span>
                                ) : (
                                  <button
                                    className="ack-button"
                                    onClick={() => handleAcknowledgeAlert(notif)}
                                    title="Acknowledge alert and mark reviewed"
                                  >
                                    <Check size={11} /> Acknowledge
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Notifications Drawer Footer with Sound & Clear Controls */}
                <div
                  className="notif-footer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      className="text-button"
                      style={{
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: soundEnabled ? "#60a5fa" : "#64748b",
                      }}
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        showFeedback(soundEnabled ? "Notification sound muted" : "Notification sound enabled");
                      }}
                      title="Toggle browser notification sound"
                    >
                      {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      {soundEnabled ? "Sound ON" : "Sound Muted"}
                    </button>

                    {soundEnabled && (
                      <button
                        className="text-button"
                        style={{ fontSize: "10px", color: "#94a3b8" }}
                        onClick={() => testNotificationChime()}
                        title="Test Web Audio API chime"
                      >
                        ♪ Test Chime
                      </button>
                    )}
                  </div>

                  {customAlerts.length > 0 && (
                    <button
                      className="text-button"
                      style={{ fontSize: "10px", color: "#ef4444" }}
                      onClick={handleClearNotifications}
                      title="Clear custom alerts from SQLite database"
                    >
                      Clear Custom
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Avatar / Profile Button */}
            <div
              className="avatar avatar-clickable"
              onClick={() => setShowUserModal(true)}
              title={`Logged in as ${currentUser.name} (Click to switch user)`}
            >
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            style={{
              margin: "15px 0 0",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "#1d4ed825",
              border: "1px solid #3b82f6",
              color: "#93c5fd",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              animation: "modalFadeIn 0.2s ease",
            }}
          >
            <Zap size={16} color="#60a5fa" />
            <strong>Action Recorded:</strong> {actionFeedback}
          </div>
        )}

        {/* 5 DEDICATED WORKSPACE COMPONENT PAGES */}
        <div style={{ marginTop: "10px" }}>
          {activePage === "dashboard" && (
            <Dashboard
              event={event}
              metrics={metrics}
              tasks={tasksList}
              risks={risksList}
              recommendations={recommendationsList}
              onOpenEventModal={() => setShowEventModal(true)}
              onSimulateGap={handleSimulateGap}
              onNavigate={navigateToPage}
              onToggleTask={handleToggleTaskStatus}
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}

          {activePage === "blueprint" && (
            <EventSetup
              event={event}
              events={events}
              metrics={metrics}
              onOpenEventModal={() => setShowEventModal(true)}
              onSelectEvent={(id) => setSelectedEventId(id)}
              onEventUpdated={(id) => {
                showFeedback("Event Blueprint updated successfully!");
                loadDashboard(id);
                loadEvents();
              }}
            />
          )}

          {activePage === "tasks" && (
            <Tasks
              tasks={tasksList}
              eventId={selectedEventId}
              onOpenTaskModal={() => setShowTaskModal(true)}
              onToggleTask={handleToggleTaskStatus}
              onTaskDeleted={() => {
                showFeedback("Task removed from queue.");
                loadDashboard(selectedEventId);
              }}
            />
          )}

          {activePage === "risks" && (
            <Risks
              risks={risksList}
              recommendations={recommendationsList}
              metrics={metrics}
              onSimulateGap={handleSimulateGap}
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}

          {activePage === "team" && (
            <Team
              team={team}
              tasks={tasksList}
              currentUser={currentUser}
              onSwitchUser={(user) => {
                setCurrentUser(user);
                showFeedback(`Active user switched to ${user.name}`);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="footer" style={{ marginTop: "40px" }}>
          <span>EventPilot © 2026 • Command Nexus</span>
          <span>REST API + JSON • SQLite Database • Rule-Based Engine</span>
        </footer>
      </main>

      {/* USER ROLE MODAL */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Role-Based Access (Command Nexus)</h3>
              <button className="modal-close-btn" onClick={() => setShowUserModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingBottom: "12px", borderBottom: "1px solid #1e293b" }}>
                <div className="avatar" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
                  {currentUser.avatar || currentUser.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", color: "#f8fafc" }}>{currentUser.name}</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#60a5fa" }}>{currentUser.role}</p>
                  <span style={{ fontSize: "10px", color: "#10b981" }}>● Firebase Auth & Session Active</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1" }}>
                  Switch Active Role:
                </label>
                <div className="user-cards-grid">
                  {TEAM_MEMBERS.map((m) => {
                    const isActive = currentUser.id === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`user-switch-card ${isActive ? "active" : ""}`}
                        onClick={() => {
                          setCurrentUser(m);
                          showFeedback(`Logged in as ${m.name} (${m.role.split(" ")[0]})`);
                        }}
                      >
                        <div className="user-meta-left">
                          <div className="avatar" style={{ width: "30px", height: "30px", fontSize: "12px" }}>
                            {m.avatar}
                          </div>
                          <div>
                            <strong>{m.name}</strong>
                            <span>{m.role}</span>
                          </div>
                        </div>
                        {isActive && <span className="active-pill">Active Lead</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="primary-button" onClick={() => setShowUserModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Command Centre Settings</h3>
              <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="settings-section-card">
                <h4>
                  <Database size={15} color="#3b82f6" />
                  REST API & Engine Status
                </h4>
                <div className="settings-row">
                  <span>Backend Endpoint</span>
                  <strong>{window.location.protocol}//{window.location.hostname}:5000/api</strong>
                </div>
                <div className="settings-row">
                  <span>Connection Status</span>
                  <span style={{ color: apiOnline ? "#34d399" : "#f87171", fontWeight: "600" }}>
                    {apiOnline ? "Connected (SQLite Online)" : "Offline / Reconnecting"}
                  </span>
                </div>
                <div className="settings-row">
                  <span>Data Format</span>
                  <strong>application/json</strong>
                </div>
              </div>

              <div className="settings-section-card">
                <h4>
                  <Download size={15} color="#10b981" />
                  Blueprint & Data Controls
                </h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="secondary-button" onClick={handleExportJSON}>
                    <Download size={14} />
                    Export Blueprint JSON
                  </button>
                  <button
                    className="sim-button danger"
                    style={{ padding: "8px 14px" }}
                    onClick={handleResetDatabase}
                  >
                    Reset to Demo State
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setShowSettingsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Event Blueprint (REST API)</h3>
              <button className="modal-close-btn" onClick={() => setShowEventModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    required
                    placeholder="e.g. CodeX Campus Fest 2026"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Type *</label>
                    <input
                      required
                      placeholder="e.g. Hackathon, Conference"
                      value={eventForm.event_type}
                      onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.event_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Location / Venue</label>
                  <input
                    placeholder="e.g. Main Auditorium"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Registration Target</label>
                    <input
                      type="number"
                      min="1"
                      value={eventForm.target_registrations}
                      onChange={(e) => setEventForm({ ...eventForm, target_registrations: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Sponsorship Target (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={eventForm.target_sponsorship}
                      onChange={(e) => setEventForm({ ...eventForm, target_sponsorship: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Days Remaining</label>
                  <input
                    type="number"
                    min="1"
                    value={eventForm.days_remaining}
                    onChange={(e) => setEventForm({ ...eventForm, days_remaining: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Submit via POST JSON
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Action to Queue (REST API)</h3>
              <button className="modal-close-btn" onClick={() => setShowTaskModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    required
                    placeholder="e.g. Confirm audio/visual setup"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Assignee</label>
                    <select
                      value={taskForm.owner}
                      onChange={(e) => setTaskForm({ ...taskForm, owner: e.target.value })}
                    >
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role.split(" ")[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      placeholder="e.g. Today, Tomorrow, Oct 15"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={taskForm.category}
                      onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    >
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Content">Content</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add Task (POST JSON)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM ALERT MODAL */}
      {showCustomAlertModal && (
        <div className="modal-overlay" onClick={() => setShowCustomAlertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageSquare size={18} color="#a855f7" />
                CREATE CUSTOM ALERT
              </h3>
              <button className="modal-close-btn" onClick={() => setShowCustomAlertModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendCustomAlert}>
              <div className="modal-body">
                <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                  Send a personalized operational alert to your team members. Custom alerts are dispatched with priority tagging, audible chime, and acknowledgement tracking.
                </p>

                <div className="form-group">
                  <label>Alert Title *</label>
                  <input
                    required
                    placeholder="e.g. Urgent Volunteer Meeting"
                    value={customAlertForm.title}
                    onChange={(e) => setCustomAlertForm({ ...customAlertForm, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority *</label>
                    <select
                      value={customAlertForm.priority}
                      onChange={(e) => setCustomAlertForm({ ...customAlertForm, priority: e.target.value })}
                    >
                      <option value="Critical">🔴 Critical</option>
                      <option value="High">🟠 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">⚪ Low</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Send To *</label>
                    <select
                      value={customAlertForm.recipient}
                      onChange={(e) => setCustomAlertForm({ ...customAlertForm, recipient: e.target.value })}
                    >
                      <option value="All Team Members">All Team Members</option>
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role.split(" ")[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Personal Alert Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. All volunteers must attend the meeting at 4 PM today. Please confirm your availability."
                    value={customAlertForm.message}
                    onChange={(e) => setCustomAlertForm({ ...customAlertForm, message: e.target.value })}
                    style={{
                      width: "100%",
                      background: "#0b1120",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "#f8fafc",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#1e293b50",
                    borderRadius: "8px",
                    border: "1px solid #334155",
                    marginTop: "8px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#e2e8f0",
                      margin: 0,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={customAlertForm.sound_enabled}
                      onChange={(e) =>
                        setCustomAlertForm({ ...customAlertForm, sound_enabled: e.target.checked })
                      }
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    Notification Sound (Enable chime)
                  </label>

                  <button
                    type="button"
                    className="text-button"
                    style={{ fontSize: "11px", color: "#60a5fa" }}
                    onClick={() => playNotificationSound(customAlertForm.priority)}
                  >
                    ♪ Preview Tone
                  </button>
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: "space-between" }}>
                <button type="button" className="secondary-button" onClick={() => setShowCustomAlertModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  style={{
                    background:
                      customAlertForm.priority === "Critical"
                        ? "#dc2626"
                        : customAlertForm.priority === "High"
                        ? "#ea580c"
                        : "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Send size={14} />
                  SEND ALERT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
