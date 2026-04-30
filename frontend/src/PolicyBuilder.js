import React, { useEffect, useState } from "react";
import { getToken } from "./AuthContext";
import { ShieldAlert, AlertTriangle, CheckCircle, Save, SlidersHorizontal, Info } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const LEVELS = ["HIGH", "MEDIUM", "LOW"];
const DECISIONS = ["BLOCK", "REVIEW", "ALLOW"];

function PolicyBuilder() {
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const response = await fetch(`${API_URL}/policy/governance`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!response.ok) {
          throw new Error("Failed to load policy configuration");
        }
        const data = await response.json();
        setPolicies(data.policies);
      } catch (err) {
        setError(err.message || "Unable to load policy configuration");
      } finally {
        setLoading(false);
      }
    };
    loadPolicies();
  }, []);

  const updateField = (level, field, value) => {
    setPolicies((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value,
      },
    }));
  };

  const updateActions = (level, value) => {
    const actions = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    updateField(level, "actions", actions);
  };

  const savePolicies = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/policy/governance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ policies }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to save policies");
      }
      const data = await response.json();
      setPolicies(data.policies);
      setSuccess("Policy updated successfully. New analyses will immediately use this policy.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to save policies");
    } finally {
      setSaving(false);
    }
  };

  const getLevelColor = (level) => {
    if (level === 'HIGH') return 'var(--danger)';
    if (level === 'MEDIUM') return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="glass-card" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="card-title">
          <SlidersHorizontal size={24} color="var(--primary)" /> Global Governance Policy
        </h2>
        <button className="btn btn-primary" onClick={savePolicies} disabled={saving}>
          <Save size={18} /> {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      <div className="card-body">
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <Info size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Configure the decision matrix for the AI Governance Agents. When an agent determines a problem's risk score, it uses these thresholds to decide whether to <strong>ALLOW</strong>, flag for <strong>REVIEW</strong>, or completely <strong>BLOCK</strong> the action.
          </p>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner"></div>
          </div>
        )}

        {error && (
          <div className="auth-error">
            <AlertTriangle size={18} /> <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-error" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--success)' }}>
            <CheckCircle size={18} /> <span>{success}</span>
          </div>
        )}

        {!loading && policies && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {LEVELS.map((level) => (
              <div key={level} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', transition: 'transform 0.2s', borderTop: `4px solid ${getLevelColor(level)}` }}>
                
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  {level === 'HIGH' && <ShieldAlert color={getLevelColor(level)} size={20} />}
                  {level === 'MEDIUM' && <AlertTriangle color={getLevelColor(level)} size={20} />}
                  {level === 'LOW' && <CheckCircle color={getLevelColor(level)} size={20} />}
                  {level} Risk Tier
                </h3>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="form-label">Threshold Score</label>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{policies[level]?.score ?? 5}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={policies[level]?.score ?? 5}
                    onChange={(e) => updateField(level, "score", Number(e.target.value))}
                    style={{ width: '100%', accentColor: getLevelColor(level), cursor: 'pointer' }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Triggers at risk score {policies[level]?.score ?? 5} or above.</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Decision</label>
                  <select
                    className="form-select"
                    value={policies[level]?.decision || "REVIEW"}
                    onChange={(e) => updateField(level, "decision", e.target.value)}
                  >
                    {DECISIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Governance Reason</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={policies[level]?.reason || ""}
                    onChange={(e) => updateField(level, "reason", e.target.value)}
                    placeholder="Provide a rationale for this policy level..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Recommended Mitigation (one per line)</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    value={(policies[level]?.actions || []).join("\n")}
                    onChange={(e) => updateActions(level, e.target.value)}
                    placeholder="Enter recommended actions..."
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PolicyBuilder;
