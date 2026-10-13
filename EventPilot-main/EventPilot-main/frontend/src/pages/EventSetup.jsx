import { useState, useEffect } from "react";
import {
  Target,
  Users,
  Handshake,
  Save,
  Plus,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

export default function EventSetup({
  event,
  events,
  metrics,
  onOpenEventModal,
  onSelectEvent,
  onEventUpdated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    event_type: "",
    event_date: "",
    location: "",
    description: "",
    target_registrations: 500,
    target_sponsorship: 50000,
    days_remaining: 5,
    status: "In Progress",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        event_type: event.event_type || "",
        event_date: event.event_date || "",
        location: event.location || "",
        description: event.description || "",
        target_registrations: event.target_registrations ?? 500,
        target_sponsorship: event.target_sponsorship ?? 50000,
        days_remaining: event.days_remaining ?? 5,
        status: event.status || "In Progress",
      });
    }
  }, [event]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!event?.id) return;
    setIsSaving(true);
    try {
      await api.updateEvent(event.id, {
        ...formData,
        target_registrations: Number(formData.target_registrations),
        target_sponsorship: Number(formData.target_sponsorship),
        days_remaining: Number(formData.days_remaining),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onEventUpdated) onEventUpdated(event.id);
    } catch (err) {
      alert("Error saving blueprint: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />
            OPERATIONAL ARCHITECTURE
          </div>
          <h1>Event Blueprint & Goal Setup</h1>
          <p>
            Define format, targets, timeline, and audience requirements for your event command centre.
          </p>
        </div>
        <button className="primary-button" onClick={onOpenEventModal}>
          <Plus size={18} />
          Create New Event
        </button>
      </section>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Active Blueprint Form */}
        <section className="panel" style={{ flex: 1.2 }}>
          <div className="panel-heading">
            <div>
              <h2>Active Event Blueprint</h2>
              <p>Edit planned targets and core logistical parameters</p>
            </div>
            <span className="status-badge in-progress">{formData.status}</span>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "14px" }}>
            <div className="form-group">
              <label>Event Title</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. CodeX Campus Fest 2026"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Event Type / Category</label>
                <input
                  required
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  placeholder="e.g. Hackathon, Technical Fest"
                />
              </div>

              <div className="form-group">
                <label>Event Date</label>
                <input
                  type="date"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Venue / Location</label>
              <input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Main Auditorium & Tech Labs"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Registrations</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.target_registrations}
                  onChange={(e) => setFormData({ ...formData, target_registrations: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Target Sponsorship (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.target_sponsorship}
                  onChange={(e) => setFormData({ ...formData, target_sponsorship: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Days Remaining</label>
                <input
                  type="number"
                  min="1"
                  value={formData.days_remaining}
                  onChange={(e) => setFormData({ ...formData, days_remaining: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Operational Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Final Countdown">Final Countdown</option>
                  <option value="Live Event">Live Event</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Scope & Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key goals, target departments, and special milestones..."
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
              {saveSuccess && (
                <span style={{ color: "#34d399", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} /> Blueprint changes saved to SQLite!
                </span>
              )}
              {!saveSuccess && <span />}

              <button type="submit" className="primary-button" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Blueprint Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Blueprint Target Summary */}
        <section className="panel" style={{ flex: 0.8 }}>
          <div className="panel-heading">
            <div>
              <h2>Target vs Actual Benchmark</h2>
              <p>Live progress compared to operational blueprint</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
            <div className="settings-section-card">
              <h4>
                <Users size={16} color="#60a5fa" />
                Audience & Registration Target
              </h4>
              <div className="settings-row">
                <span>Planned Target:</span>
                <strong>{metrics.registrations.target} Participants</strong>
              </div>
              <div className="settings-row">
                <span>Current Secured:</span>
                <strong>{metrics.registrations.current} Participants</strong>
              </div>
              <div className="settings-row">
                <span>Pacing Status:</span>
                <span style={{ color: metrics.registrations.percentage >= 70 ? "#34d399" : "#f87171" }}>
                  {metrics.registrations.percentage}% ({metrics.registrations.gap} gap)
                </span>
              </div>
            </div>

            <div className="settings-section-card">
              <h4>
                <Handshake size={16} color="#c084fc" />
                Sponsorship & Budget Target
              </h4>
              <div className="settings-row">
                <span>Target Funding:</span>
                <strong>₹{Number(metrics.sponsorship.target).toLocaleString()}</strong>
              </div>
              <div className="settings-row">
                <span>Raised so far:</span>
                <strong>₹{Number(metrics.sponsorship.current).toLocaleString()}</strong>
              </div>
              <div className="settings-row">
                <span>Funding Status:</span>
                <span style={{ color: metrics.sponsorship.percentage >= 70 ? "#34d399" : "#f87171" }}>
                  {metrics.sponsorship.percentage}% (₹{Number(metrics.sponsorship.gap).toLocaleString()} deficit)
                </span>
              </div>
            </div>

            <div className="settings-section-card">
              <h4>
                <Target size={16} color="#34d399" />
                Calculated Event Health Score
              </h4>
              <div className="settings-row">
                <span>Dynamic Score:</span>
                <strong style={{ fontSize: "16px", color: metrics.health_score >= 70 ? "#34d399" : "#f59e0b" }}>
                  {metrics.health_score} / 100
                </strong>
              </div>
              <div className="settings-row">
                <span>Engine Evaluation:</span>
                <span>{metrics.health_score >= 70 ? "On Schedule" : "Action Required"}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Database Events Switcher Table */}
      <section className="panel" style={{ marginTop: "24px" }}>
        <div className="panel-heading">
          <div>
            <h2>All Event Blueprints in Database</h2>
            <p>Switch active workspace view or compare multiple events</p>
          </div>
          <span className="risk-count">{events.length} STORED</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>EVENT NAME</th>
                <th>TYPE</th>
                <th>DATE</th>
                <th>REGISTRATIONS</th>
                <th>SPONSORSHIP</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const isActive = ev.id === event.id;
                return (
                  <tr key={ev.id} style={{ background: isActive ? "rgba(59, 130, 246, 0.08)" : "transparent" }}>
                    <td>
                      <strong>{ev.name}</strong>
                      {isActive && <span className="active-pill" style={{ marginLeft: "8px" }}>Active</span>}
                    </td>
                    <td>{ev.event_type}</td>
                    <td>{ev.event_date}</td>
                    <td>{ev.target_registrations} target</td>
                    <td>₹{Number(ev.target_sponsorship).toLocaleString()}</td>
                    <td>
                      <span className="status-badge in-progress">{ev.status}</span>
                    </td>
                    <td>
                      {isActive ? (
                        <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>Currently Loaded</span>
                      ) : (
                        <button
                          className="secondary-button"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                          onClick={() => onSelectEvent(ev.id)}
                        >
                          Load Event
                        </button>
                      )}
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
