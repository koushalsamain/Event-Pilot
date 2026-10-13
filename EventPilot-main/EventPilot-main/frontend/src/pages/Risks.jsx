import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Handshake,
  Users,
  UserCheck,
} from "lucide-react";

export default function Risks({
  risks,
  recommendations,
  metrics,
  onSimulateGap,
  onApplyRecommendation,
}) {
  const criticalCount = risks.filter((r) => r.severity === "Critical").length;
  const warningCount = risks.filter((r) => r.severity === "Warning").length;

  return (
    <div>
      {/* Header */}
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="live-dot" style={{ background: criticalCount > 0 ? "#ef4444" : "#10b981" }} />
            REAL-TIME DEFICIT SURVEILLANCE
          </div>
          <h1>Gap & Risk Detection Centre</h1>
          <p>
            Autonomous comparison of planned targets against real-time operational pacing.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="risk-count" style={{ fontSize: "12px", padding: "6px 14px" }}>
            {risks.length} ACTIVE {risks.length === 1 ? "GAP" : "GAPS"}
          </span>
        </div>
      </section>

      {/* Simulator Trigger Bar */}
      <div className="demo-prototype-bar">
        <div className="prototype-title">
          <Zap size={18} color="#f59e0b" />
          <div>
            <strong>Interactive Gap Detection Simulator</strong>
            <br />
            <span>Inject realistic event shortfalls to observe how the Python engine flags them:</span>
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

      {/* Risk Metrics */}
      <section className="stats-grid" style={{ marginBottom: "20px" }}>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Critical Alerts</span>
            <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <h2>{criticalCount}</h2>
          <div className="stat-footer">
            <span>High impact</span>
            <span className={criticalCount > 0 ? "warning" : "positive"}>
              {criticalCount > 0 ? "Immediate Action" : "None Detected"}
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Warning Alerts</span>
            <div className="stat-icon orange">
              <Clock size={18} />
            </div>
          </div>
          <h2>{warningCount}</h2>
          <div className="stat-footer">
            <span>Moderate risk</span>
            <span className={warningCount > 0 ? "warning" : "positive"}>
              {warningCount > 0 ? "Monitor Closely" : "Clean"}
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Registration Gap</span>
            <div className="stat-icon blue">
              <Users size={18} />
            </div>
          </div>
          <h2>{metrics.registrations.gap}</h2>
          <div className="stat-footer">
            <span>Participants needed</span>
            <span className={metrics.registrations.gap > 0 ? "warning" : "positive"}>
              {metrics.registrations.percentage}% Reached
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Funding Gap</span>
            <div className="stat-icon purple">
              <Handshake size={18} />
            </div>
          </div>
          <h2>₹{Number(metrics.sponsorship.gap).toLocaleString()}</h2>
          <div className="stat-footer">
            <span>Sponsorship remaining</span>
            <span className={metrics.sponsorship.gap > 0 ? "warning" : "positive"}>
              {metrics.sponsorship.percentage}% Reached
            </span>
          </div>
        </article>
      </section>

      {/* Priority Alerts List */}
      <section className="panel" style={{ marginBottom: "24px" }}>
        <div className="panel-heading">
          <div>
            <h2>Detected Gaps & Operational Vulnerabilities</h2>
            <p>Computed by Rule-Based Priority & Gap Detection Engine</p>
          </div>
          <span className="risk-count">{risks.length} ACTIVE</span>
        </div>

        {risks.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
            <CheckCircle2 size={40} color="#10b981" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ margin: "0 0 6px", color: "#f8fafc" }}>All Systems On-Track!</h3>
            <p style={{ margin: 0 }}>Planned targets match or exceed current pacing benchmarks.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
            {risks.map((risk) => (
              <article
                key={risk.id}
                className={`risk-item ${
                  risk.severity === "Critical" ? "critical-risk" : "warning-risk"
                }`}
                style={{ padding: "18px" }}
              >
                <div className="risk-symbol" style={{ width: "42px", height: "42px" }}>
                  {risk.severity === "Critical" ? <ShieldAlert size={22} /> : <Clock size={22} />}
                </div>
                <div className="risk-details" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "14px" }}>{risk.title}</strong>
                    <span className={`priority-badge ${risk.severity.toLowerCase()}`}>
                      {risk.severity} Severity
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", margin: "4px 0 8px", color: "#cbd5e1" }}>
                    {risk.description}
                  </p>
                  <span style={{ fontSize: "12px", color: "#93c5fd" }}>
                    <strong>Recommended Recovery:</strong> {risk.recommended_action}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Smart Recovery Recommendations Queue */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Smart Recovery Recommendations</h2>
            <p>Ranked by impact, urgency and days remaining — 1-click action delegation</p>
          </div>
          <span className="risk-count">{recommendations.length} SUGGESTED</span>
        </div>

        {recommendations.length === 0 ? (
          <p style={{ color: "#64748b", margin: "14px 0" }}>
            No recovery actions required at this moment. Current pacing satisfies targets.
          </p>
        ) : (
          <div className="recs-container">
            {recommendations.map((rec) => (
              <div className="rec-card" key={rec.id} style={{ padding: "16px" }}>
                <div className="rec-info" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <h4 style={{ margin: 0, fontSize: "14px" }}>{rec.title}</h4>
                    <span className={`priority-badge ${(rec.priority || "high").toLowerCase()}`}>
                      {rec.priority} Priority
                    </span>
                  </div>

                  <div className="rec-meta">
                    <span>
                      <strong>Impact:</strong> {rec.impact}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Urgency:</strong> {rec.urgency}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Suggested Lead:</strong> {rec.suggested_owner}
                    </span>
                  </div>
                </div>

                <button
                  className="primary-button"
                  style={{ padding: "9px 16px", fontSize: "12px" }}
                  onClick={() => onApplyRecommendation(rec)}
                >
                  <UserCheck size={16} />
                  Assign to {rec.suggested_owner}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
