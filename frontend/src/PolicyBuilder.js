import React, { useEffect, useState } from "react";
import { getToken } from "./AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const LEVELS = ["HIGH", "MEDIUM", "LOW"];
const DECISIONS = ["BLOCK", "REVIEW", "ALLOW"];

function PolicyBuilder({ onClose }) {
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
      setSuccess("Policy updated successfully. New analyses will use this policy.");
    } catch (err) {
      setError(err.message || "Failed to save policies");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="policy-overlay" onClick={onClose}>
      <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="policy-header">
          <h2>Policy Builder</h2>
          <button className="policy-close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="policy-subtitle">Configure governance decisions for each risk level.</p>

        {loading && <p>Loading policy...</p>}
        {error && <div className="error-message"><span className="error-icon">⚠️</span><span>{error}</span></div>}
        {success && <div className="policy-success">{success}</div>}

        {!loading && policies && (
          <>
            <div className="policy-grid">
              {LEVELS.map((level) => (
                <div className="policy-card" key={level}>
                  <h3>{level} Risk</h3>
                  <label>Decision</label>
                  <select
                    value={policies[level]?.decision || "REVIEW"}
                    onChange={(e) => updateField(level, "decision", e.target.value)}
                  >
                    {DECISIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <label>Score (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={policies[level]?.score ?? 5}
                    onChange={(e) => updateField(level, "score", Number(e.target.value))}
                  />

                  <label>Reason</label>
                  <textarea
                    rows="3"
                    value={policies[level]?.reason || ""}
                    onChange={(e) => updateField(level, "reason", e.target.value)}
                  />

                  <label>Recommended Actions (one per line)</label>
                  <textarea
                    rows="4"
                    value={(policies[level]?.actions || []).join("\n")}
                    onChange={(e) => updateActions(level, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="policy-actions">
              <button className="history-button" onClick={onClose}>Cancel</button>
              <button className="analyze-button" onClick={savePolicies} disabled={saving}>
                {saving ? "Saving..." : "Save Policy"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PolicyBuilder;
