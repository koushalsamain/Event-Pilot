import { useState } from "react";
import {
  KeyRound,
  UserCheck,
} from "lucide-react";

export default function Team({
  team,
  tasks,
  currentUser,
  onSwitchUser,
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const activeMember = team.find((m) => m.id === selectedMemberId) || null;

  return (
    <div>
      {/* Header */}
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />
            ROLE-BASED WORKFLOWS & ACCESS
          </div>
          <h1>Team Command Nexus</h1>
          <p>
            Role-based event operational leads with accountable action queues and Firebase authentication.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="active-pill" style={{ padding: "6px 14px", fontSize: "12px" }}>
            ● Active: {currentUser.name} ({currentUser.role.split(" ")[0]})
          </span>
        </div>
      </section>

      {/* Active User Session Card */}
      <section className="panel" style={{ marginBottom: "24px", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="avatar" style={{ width: "52px", height: "52px", fontSize: "22px" }}>
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>{currentUser.name}</h3>
                <span className="active-pill">Logged In</span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#60a5fa" }}>{currentUser.role}</p>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                Role Permissions: Full Operational Execution & Task Delegation
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="api-status-badge online" style={{ padding: "6px 14px" }}>
              <KeyRound size={14} />
              Firebase Auth Active
            </div>
          </div>
        </div>
      </section>

      {/* Team Cards Grid */}
      <section className="panel" style={{ marginBottom: "24px" }}>
        <div className="panel-heading">
          <div>
            <h2>Command Nexus Leads</h2>
            <p>Click any member card to view assigned responsibilities or switch your active role</p>
          </div>
          <span className="risk-count">{team.length} LEADS</span>
        </div>

        <div className="team-grid" style={{ marginTop: "16px" }}>
          {team.map((member) => {
            const memberTasks = tasks.filter(
              (t) =>
                t.owner.toLowerCase().includes(member.name.toLowerCase()) ||
                member.name.toLowerCase().includes(t.owner.toLowerCase())
            );
            const pendingTasks = memberTasks.filter((t) => t.status !== "Completed");
            const isCurrent = currentUser.id === member.id;
            const isSelected = selectedMemberId === member.id;

            return (
              <div
                key={member.id}
                className="team-card avatar-clickable"
                style={{
                  padding: "16px",
                  borderColor: isCurrent ? "#3b82f6" : isSelected ? "#60a5fa" : "#334155",
                  background: isCurrent ? "rgba(59, 130, 246, 0.1)" : isSelected ? "rgba(30, 41, 59, 0.8)" : "#1e293b40",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
                onClick={() => setSelectedMemberId(member.id)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="team-avatar" style={{ width: "40px", height: "40px", fontSize: "15px" }}>
                      {member.avatar || member.name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ fontSize: "13px" }}>{member.name}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#60a5fa" }}>
                        {member.role.split(" ")[0]} Lead
                      </p>
                    </div>
                  </div>
                  {isCurrent && <span className="active-pill">You</span>}
                </div>

                <div style={{ fontSize: "11px", color: "#94a3b8", width: "100%" }}>
                  <p style={{ margin: "0 0 4px" }}>{member.role}</p>
                  <p style={{ margin: 0, color: "#64748b" }}>{member.email}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderTop: "1px solid #1e293b", paddingTop: "10px" }}>
                  <span style={{ fontSize: "11px", color: pendingTasks.length > 0 ? "#f59e0b" : "#10b981", fontWeight: "600" }}>
                    {pendingTasks.length} pending • {memberTasks.length} total
                  </span>

                  {!isCurrent ? (
                    <button
                      className="sim-button"
                      style={{ padding: "4px 10px", fontSize: "10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchUser(member);
                      }}
                    >
                      <UserCheck size={12} />
                      Switch Role
                    </button>
                  ) : (
                    <span style={{ fontSize: "10px", color: "#34d399", fontWeight: "600" }}>Active Role</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Member Tasks Breakdown */}
      <section className="panel tasks-panel">
        <div className="panel-heading" style={{ padding: "0 20px" }}>
          <div>
            <h2>
              {activeMember ? `${activeMember.name}'s Action Queue` : "All Team Member Tasks"}
            </h2>
            <p>
              {activeMember
                ? `Showing tasks assigned to ${activeMember.name} (${activeMember.role})`
                : "Select any member above to filter by lead"}
            </p>
          </div>
          {activeMember && (
            <button className="text-button" onClick={() => setSelectedMemberId(null)}>
              Show all leads ✕
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>STATUS</th>
                <th>TASK</th>
                <th>ASSIGNED LEAD</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>DUE DATE</th>
              </tr>
            </thead>
            <tbody>
              {tasks
                .filter((t) => {
                  if (!activeMember) return true;
                  return (
                    t.owner.toLowerCase().includes(activeMember.name.toLowerCase()) ||
                    activeMember.name.toLowerCase().includes(t.owner.toLowerCase())
                  );
                })
                .map((task) => {
                  const isCompleted = task.status === "Completed";
                  return (
                    <tr key={task.id}>
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
                      <td>{task.category || "Operations"}</td>
                      <td>
                        <span className={`priority-badge ${(task.priority || "medium").toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            isCompleted ? "completed" : "pending"
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
