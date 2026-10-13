import {
  Users,
  Handshake,
  CheckSquare,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Plus,
  ArrowRight,
  Target,
} from "lucide-react";

export default function Dashboard({
  event,
  metrics,
  tasks,
  risks,
  recommendations,
  onOpenEventModal,
  onSimulateGap,
  onNavigate,
  onToggleTask,
  onApplyRecommendation,
}) {
  const statCards = [
    {
      label: "Total Registrations",
      value: `${metrics.registrations.current}`,
      target: `${metrics.registrations.target} target`,
      change: `${metrics.registrations.percentage}% achieved`,
      up: metrics.registrations.percentage >= 70,
      icon: Users,
      color: "blue",
    },
    {
      label: "Sponsorship",
      value: `₹${Number(metrics.sponsorship.current).toLocaleString()}`,
      target: `₹${Number(metrics.sponsorship.target).toLocaleString()} target`,
      change: `${metrics.sponsorship.percentage}% achieved`,
      up: metrics.sponsorship.percentage >= 70,
      icon: Handshake,
      color: "purple",
    },
    {
      label: "Tasks Pending",
      value: `${metrics.tasks.pending}`,
      target: `${metrics.tasks.overdue} urgent/overdue`,
      change: metrics.tasks.pending > 3 ? "Needs attention" : "On schedule",
      up: metrics.tasks.pending <= 2,
      icon: CheckSquare,
      color: "orange",
    },
    {
      label: "Event Health Score",
      value: `${metrics.health_score}/100`,
      target: metrics.health_score >= 70 ? "Optimal standing" : "Action needed",
      change: metrics.health_score >= 70 ? "+ Good standing" : "- Risk detected",
      up: metrics.health_score >= 70,
      icon: Activity,
      color: metrics.health_score >= 70 ? "green" : "orange",
    },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />
            LIVE OPERATIONAL COMMAND
          </div>
          <h1>Your event, under control.</h1>
          <p>
            Compare targets with real progress, detect critical gaps, and execute smart recovery recommendations.
          </p>
        </div>
        <button className="primary-button" onClick={onOpenEventModal}>
          <Plus size={18} />
          Create Event
        </button>
      </section>

      {/* Prototype Workflow Simulator Bar */}
      <div className="demo-prototype-bar">
        <div className="prototype-title">
          <Zap size={18} color="#f59e0b" />
          <div>
            <strong>Prototype Workflow Simulator</strong>
            <br />
            <span>Simulate real event gaps to test the priority recommendation engine:</span>
          </div>
        </div>

        <div className="simulation-buttons">
          <button
            className="sim-button danger"
            onClick={() => onSimulateGap("registration_gap")}
            title="Simulates registrations dropping behind target"
          >
            <AlertTriangle size={14} />
            Simulate Reg Gap
          </button>
          <button
            className="sim-button warning"
            onClick={() => onSimulateGap("sponsorship_gap")}
            title="Simulates sponsorship funding deficit"
          >
            <Handshake size={14} />
            Simulate Sponsor Gap
          </button>
          <button
            className="sim-button warning"
            onClick={() => onSimulateGap("overdue_tasks")}
            title="Injects critical overdue operational task"
          >
            <Clock size={14} />
            Simulate Task Risk
          </button>
          <button
            className="sim-button success"
            onClick={() => onSimulateGap("resolved")}
            title="Simulates recovery and resets to on-track standing"
          >
            <CheckCircle2 size={14} />
            Reset On-Track
          </button>
        </div>
      </div>

      {/* Featured Event Banner */}
      <section className="event-banner">
        <div className="event-banner-content">
          <span className="event-tag">{event.status || "FEATURED EVENT"}</span>
          <h2>{event.name || "CodeX Campus Fest 2026"}</h2>
          <p>
            <CalendarDays size={16} />
            {event.event_date || "October 15, 2026"}
            <span className="banner-divider">•</span>
            <Users size={16} />
            {event.event_type || "College Event"}
            {event.location && (
              <>
                <span className="banner-divider">•</span>
                <span>{event.location}</span>
              </>
            )}
          </p>
        </div>

        <div className="event-countdown">
          <span>EVENT STARTS IN</span>
          <strong>
            {String(event.days_remaining ?? metrics.days_remaining).padStart(2, "0")}{" "}
            <small>DAYS</small>
          </strong>
          <div className="countdown-line">
            <span />
          </div>
          <small>Active preparation</small>
        </div>
      </section>

      {/* 4 Stat Cards */}
      <section className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="stat-card" key={stat.label}>
              <div className="stat-card-top">
                <span>{stat.label}</span>
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <h2>{stat.value}</h2>

              <div className="stat-footer">
                <span>{stat.target}</span>
                <span className={stat.up ? "positive" : "warning"}>
                  {stat.up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  {stat.change}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Live Goal Progress & Priority Alerts */}
      <div className="dashboard-grid">
        {/* Goal Progress Panel */}
        <section className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <h2>Event Goal Progress</h2>
              <p>Planned targets versus live operational metrics</p>
            </div>
            <button className="text-button" onClick={() => onNavigate("tasks")}>
              View all tasks ↗
            </button>
          </div>

          {/* Registrations */}
          <div className="goal-row">
            <div className="goal-title">
              <span className="goal-icon blue">
                <Users size={18} />
              </span>
              <div>
                <strong>Registrations</strong>
                <p>
                  {metrics.registrations.current} of {metrics.registrations.target} participants
                  {metrics.registrations.gap > 0 ? ` (${metrics.registrations.gap} gap)` : ""}
                </p>
              </div>
            </div>
            <strong>{metrics.registrations.percentage}%</strong>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill blue-fill"
              style={{ width: `${Math.min(metrics.registrations.percentage, 100)}%` }}
            />
          </div>

          {/* Sponsorship */}
          <div className="goal-row">
            <div className="goal-title">
              <span className="goal-icon purple">
                <Handshake size={18} />
              </span>
              <div>
                <strong>Sponsorship</strong>
                <p>
                  ₹{Number(metrics.sponsorship.current).toLocaleString()} of ₹
                  {Number(metrics.sponsorship.target).toLocaleString()}
                  {metrics.sponsorship.gap > 0
                    ? ` (₹${Number(metrics.sponsorship.gap).toLocaleString()} deficit)`
                    : ""}
                </p>
              </div>
            </div>
            <strong>{metrics.sponsorship.percentage}%</strong>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill purple-fill"
              style={{ width: `${Math.min(metrics.sponsorship.percentage, 100)}%` }}
            />
          </div>

          {/* Task Completion */}
          <div className="goal-row">
            <div className="goal-title">
              <span className="goal-icon green">
                <Target size={18} />
              </span>
              <div>
                <strong>Task Closure</strong>
                <p>
                  {metrics.tasks.completed} of {metrics.tasks.total} tasks completed
                </p>
              </div>
            </div>
            <strong>{metrics.tasks.percentage}%</strong>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill green-fill"
              style={{ width: `${Math.min(metrics.tasks.percentage, 100)}%` }}
            />
          </div>
        </section>

        {/* Priority Alerts & Risks Panel */}
        <section className="panel risk-panel">
          <div className="panel-heading">
            <div>
              <h2>Priority Alerts & Gaps</h2>
              <p>Issues detected by rule-based engine</p>
            </div>
            <span className="risk-count">{risks.length} ACTIVE</span>
          </div>

          {risks.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
              <p>All targets are on track! No operational gaps detected.</p>
            </div>
          ) : (
            risks.slice(0, 2).map((risk) => (
              <article
                key={risk.id}
                className={`risk-item ${
                  risk.severity === "Critical" ? "critical-risk" : "warning-risk"
                }`}
              >
                <div className="risk-symbol">
                  {risk.severity === "Critical" ? <ShieldAlert size={19} /> : <Clock size={19} />}
                </div>
                <div className="risk-details">
                  <strong>{risk.title}</strong>
                  <p>{risk.description}</p>
                  <span>Recommended: {risk.recommended_action}</span>
                </div>
              </article>
            ))
          )}

          <button className="secondary-button" onClick={() => onNavigate("risks")}>
            View All Gaps & AI Recovery Queue →
          </button>
        </section>
      </div>

      {/* Quick Access to Task Centre Preview */}
      <section className="panel tasks-panel" style={{ marginTop: "24px" }}>
        <div className="panel-heading">
          <div>
            <h2>Priority Action Queue Preview</h2>
            <p>Recent urgent tasks assigned across team leads</p>
          </div>
          <button className="text-button" onClick={() => onNavigate("tasks")}>
            Open full Task Centre ↗
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>STATUS</th>
                <th>TASK</th>
                <th>ASSIGNED TO</th>
                <th>PRIORITY</th>
                <th>DUE DATE</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 4).map((task) => {
                const isCompleted = task.status === "Completed";
                return (
                  <tr
                    key={task.id}
                    className="clickable-task-row"
                    onClick={() => onToggleTask(task.id, task.status)}
                    title="Click to toggle status"
                  >
                    <td>
                      <span className={`task-checkbox ${isCompleted ? "checked" : ""}`} />
                    </td>
                    <td>
                      <div
                        className="task-name"
                        style={{
                          textDecoration: isCompleted ? "line-through" : "none",
                          color: isCompleted ? "#94a3b8" : "inherit",
                        }}
                      >
                        {task.title}
                      </div>
                    </td>
                    <td>{task.owner}</td>
                    <td>
                      <span className={`priority-badge ${(task.priority || "medium").toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          isCompleted
                            ? "completed"
                            : task.status === "In Progress"
                            ? "in-progress"
                            : "pending"
                        }`}
                      >
                        {task.due_date} ({task.status})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
