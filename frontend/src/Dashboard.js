import React, { useState, useEffect } from 'react';
import { getToken } from './AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function DonutChart({ data }) {
  const total = data.BLOCK + data.REVIEW + data.ALLOW;
  if (total === 0) return <div className="chart-empty">No data yet</div>;

  const colors = { BLOCK: '#dc2626', REVIEW: '#f59e0b', ALLOW: '#16a34a' };
  let offset = 0;
  const radius = 60, cx = 80, cy = 80, stroke = 28;
  const circumference = 2 * Math.PI * radius;

  const segments = Object.entries(data).map(([key, val]) => {
    const pct = val / total;
    const dash = pct * circumference;
    const seg = { key, val, pct, dash, offset, color: colors[key] };
    offset += dash;
    return seg;
  });

  return (
    <svg viewBox="0 0 160 160" className="donut-svg">
      {segments.map(s => (
        <circle key={s.key}
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={s.color}
          strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" className="donut-total">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="donut-label">Total</text>
    </svg>
  );
}

function TrendChart({ trend }) {
  if (!trend || trend.length === 0) return <div className="chart-empty">No trend data yet</div>;

  const max = Math.max(...trend.map(t => t.count), 1);
  const W = 400, H = 120, pad = 30;
  const xStep = trend.length > 1 ? (W - pad * 2) / (trend.length - 1) : W - pad * 2;

  const points = trend.map((t, i) => ({
    x: pad + i * xStep,
    y: H - pad - ((t.count / max) * (H - pad * 2)),
    ...t
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${H - pad} L${points[0].x},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#trendGrad)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
          <text x={p.x} y={H - 8} textAnchor="middle" className="trend-date">
            {p.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Dashboard({ onClose }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/analytics`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load analytics'))
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const decisions = data?.decisions || { BLOCK: 0, REVIEW: 0, ALLOW: 0, APPROVED: 0, NEEDS_IMPROVEMENT: 0, REJECTED: 0 };
  const governanceTotal     = decisions.BLOCK + decisions.REVIEW + decisions.ALLOW;
  const problemSolvingTotal = decisions.APPROVED + decisions.NEEDS_IMPROVEMENT + decisions.REJECTED;
  const total     = data?.total_analyses || 0;
  const avgRisk   = data?.avg_risk_score || 0;
  const trend     = data?.trend || [];

  const riskColor = avgRisk >= 60 ? '#dc2626' : avgRisk >= 30 ? '#f59e0b' : '#16a34a';

  return (
    <div className="dash-overlay">
      <div className="dash-panel">
        <div className="dash-header">
          <h2>📊 Analytics Dashboard</h2>
          <button className="dash-close" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="dash-loading"><div className="spinner"></div><p>Loading analytics...</p></div>}
        {error   && <div className="dash-error">⚠️ {error}</div>}

        {!loading && !error && (
          <div className="dash-body">

            {/* Stat Cards */}
            <div className="dash-stats">
              <div className="stat-card">
                <div className="stat-icon">🔍</div>
                <div className="stat-value">{total}</div>
                <div className="stat-label">Total Analyses</div>
              </div>
              <div className="stat-card" style={{ borderColor: '#dc2626' }}>
                <div className="stat-icon">🚫</div>
                <div className="stat-value" style={{ color: '#dc2626' }}>{decisions.BLOCK}</div>
                <div className="stat-label">Blocked</div>
              </div>
              <div className="stat-card" style={{ borderColor: '#f59e0b' }}>
                <div className="stat-icon">⚠️</div>
                <div className="stat-value" style={{ color: '#f59e0b' }}>{decisions.REVIEW}</div>
                <div className="stat-label">Reviews</div>
              </div>
              <div className="stat-card" style={{ borderColor: '#16a34a' }}>
                <div className="stat-icon">✅</div>
                <div className="stat-value" style={{ color: '#16a34a' }}>{decisions.ALLOW}</div>
                <div className="stat-label">Allowed</div>
              </div>
              <div className="stat-card" style={{ borderColor: '#16a34a' }}>
                <div className="stat-icon">✅</div>
                <div className="stat-value" style={{ color: '#16a34a' }}>{decisions.APPROVED}</div>
                <div className="stat-label">Approved</div>
              </div>
              <div className="stat-card" style={{ borderColor: '#f59e0b' }}>
                <div className="stat-icon">🔧</div>
                <div className="stat-value" style={{ color: '#f59e0b' }}>{decisions.NEEDS_IMPROVEMENT}</div>
                <div className="stat-label">Needs Work</div>
              </div>
              <div className="stat-card" style={{ borderColor: '#dc2626' }}>
                <div className="stat-icon">🚫</div>
                <div className="stat-value" style={{ color: '#dc2626' }}>{decisions.REJECTED}</div>
                <div className="stat-label">Rejected</div>
              </div>
              <div className="stat-card" style={{ borderColor: riskColor }}>
                <div className="stat-icon">⚡</div>
                <div className="stat-value" style={{ color: riskColor }}>{avgRisk}</div>
                <div className="stat-label">Avg Risk Score</div>
              </div>
            </div>

            {/* Donut Charts */}
            <div className="dash-section">
              <h3>Decision Breakdown</h3>
              <div className="donut-row">
                <div className="donut-block">
                  <div className="donut-mode-label">🛡️ Governance</div>
                  <div className="donut-container">
                    <DonutChart data={{ BLOCK: decisions.BLOCK, REVIEW: decisions.REVIEW, ALLOW: decisions.ALLOW }} />
                    <div className="donut-legend">
                      {[['BLOCK','#dc2626'], ['REVIEW','#f59e0b'], ['ALLOW','#16a34a']].map(([k, c]) => (
                        <div key={k} className="legend-item">
                          <span className="legend-dot" style={{ background: c }}></span>
                          <span className="legend-label">{k}</span>
                          <span className="legend-count">{decisions[k]}</span>
                          <span className="legend-pct">{governanceTotal > 0 ? Math.round((decisions[k] / governanceTotal) * 100) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="donut-block">
                  <div className="donut-mode-label">🤖 Problem Solving</div>
                  <div className="donut-container">
                    <DonutChart data={{ APPROVED: decisions.APPROVED, NEEDS_IMPROVEMENT: decisions.NEEDS_IMPROVEMENT, REJECTED: decisions.REJECTED }} />
                    <div className="donut-legend">
                      {[['APPROVED','#16a34a'], ['NEEDS_IMPROVEMENT','#f59e0b'], ['REJECTED','#dc2626']].map(([k, c]) => (
                        <div key={k} className="legend-item">
                          <span className="legend-dot" style={{ background: c }}></span>
                          <span className="legend-label">{k}</span>
                          <span className="legend-count">{decisions[k]}</span>
                          <span className="legend-pct">{problemSolvingTotal > 0 ? Math.round((decisions[k] / problemSolvingTotal) * 100) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="dash-section">
              <h3>Analysis Trend</h3>
              <TrendChart trend={trend} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
