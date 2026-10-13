import { useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";
import api from "../services/api";

export default function Tasks({
  tasks,
  onOpenTaskModal,
  onToggleTask,
  onTaskDeleted,
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const criticalCount = tasks.filter((t) => t.priority === "Critical" && t.status !== "Completed").length;

  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filterStatus === "pending" && task.status !== "Pending") return false;
    if (filterStatus === "in_progress" && task.status !== "In Progress") return false;
    if (filterStatus === "completed" && task.status !== "Completed") return false;
    if (filterStatus === "critical" && task.priority !== "Critical") return false;

    // Category filter
    if (filterCategory !== "all" && task.category?.toLowerCase() !== filterCategory.toLowerCase()) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchOwner = task.owner?.toLowerCase().includes(q);
      if (!matchTitle && !matchOwner) return false;
    }

    return true;
  });

  const handleDelete = async (e, taskId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this task?")) return;
    try {
      await api.deleteTask(taskId);
      if (onTaskDeleted) onTaskDeleted(taskId);
    } catch (err) {
      alert("Failed to delete task: " + err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />
            ACCOUNTABILITY & EXECUTION
          </div>
          <h1>Task Centre & Priority Queue</h1>
          <p>
            Track team responsibilities, assign recovery actions, and mark completed in real-time.
          </p>
        </div>
        <button className="primary-button" onClick={onOpenTaskModal}>
          <Plus size={18} />
          Add New Task
        </button>
      </section>

      {/* Task Metric Chips */}
      <section className="stats-grid" style={{ marginBottom: "20px" }}>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Total Actions</span>
            <div className="stat-icon blue">
              <CheckSquare size={18} />
            </div>
          </div>
          <h2>{tasks.length}</h2>
          <div className="stat-footer">
            <span>Overall Queue</span>
            <span className="positive">Active Queue</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Completed</span>
            <div className="stat-icon green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h2>{completedCount}</h2>
          <div className="stat-footer">
            <span>Closed tasks</span>
            <span className="positive">
              {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 100}% Done
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Pending Closure</span>
            <div className="stat-icon orange">
              <Clock size={18} />
            </div>
          </div>
          <h2>{pendingCount + inProgressCount}</h2>
          <div className="stat-footer">
            <span>{inProgressCount} In Progress</span>
            <span className={pendingCount > 0 ? "warning" : "positive"}>
              {pendingCount} Pending
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Critical Bottlenecks</span>
            <div className="stat-icon orange" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <h2>{criticalCount}</h2>
          <div className="stat-footer">
            <span>Urgent attention</span>
            <span className={criticalCount > 0 ? "warning" : "positive"}>
              {criticalCount > 0 ? "Needs Resolution" : "Clean"}
            </span>
          </div>
        </article>
      </section>

      {/* Task Filters & Search Bar */}
      <section className="panel" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { id: "all", label: `All (${tasks.length})` },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "in_progress", label: `In Progress (${inProgressCount})` },
              { id: "completed", label: `Completed (${completedCount})` },
              { id: "critical", label: `Critical (${criticalCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                className="sim-button"
                style={{
                  background: filterStatus === tab.id ? "#3b82f6" : "#1e293b",
                  color: filterStatus === tab.id ? "#ffffff" : "#94a3b8",
                  borderColor: filterStatus === tab.id ? "#3b82f6" : "#334155",
                }}
                onClick={() => setFilterStatus(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & Category Select */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="search-box" style={{ padding: "6px 10px" }}>
              <Search size={15} />
              <input
                placeholder="Search tasks or leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "160px" }}
              />
            </div>

            <select
              className="event-selector-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="operations">Operations</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="content">Content</option>
            </select>
          </div>
        </div>
      </section>

      {/* Task Table */}
      <section className="panel tasks-panel">
        <div className="panel-heading" style={{ padding: "0 20px" }}>
          <div>
            <h2>Priority Action Queue</h2>
            <p>Click any row or checkbox to toggle status (Pending ➔ Completed)</p>
          </div>
          <span className="risk-count">{filteredTasks.length} SHOWN</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>STATUS</th>
                <th>TASK DESCRIPTION</th>
                <th>ASSIGNED TO</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>DUE DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No tasks found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status === "Completed";
                  return (
                    <tr
                      key={task.id}
                      className="clickable-task-row"
                      onClick={() => onToggleTask(task.id, task.status)}
                      title="Click row to toggle completion status"
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
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <User size={13} color="#60a5fa" />
                          <span>{task.owner}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {task.category || "Operations"}
                        </span>
                      </td>
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
                      <td>
                        <button
                          className="icon-button"
                          onClick={(e) => handleDelete(e, task.id)}
                          title="Delete Task"
                          style={{ color: "#ef4444" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
