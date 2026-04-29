import React, { useState, useEffect } from 'react';
import { getToken } from './AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShieldCheck, Zap, AlertTriangle, XCircle, Search, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const COLORS = {
  BLOCK: '#ef4444',
  REVIEW: '#f59e0b',
  ALLOW: '#10b981',
  APPROVED: '#10b981',
  NEEDS_IMPROVEMENT: '#f59e0b',
  REJECTED: '#ef4444'
};

const StatCard = ({ icon: Icon, value, label, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="stat-card"
  >
    <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}20`, color }}>
      <Icon size={24} />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </motion.div>
);

function Dashboard({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/analytics`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load analytics'))
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const decisions = data?.decisions || { BLOCK: 0, REVIEW: 0, ALLOW: 0, APPROVED: 0, NEEDS_IMPROVEMENT: 0, REJECTED: 0 };
  const total = data?.total_analyses || 0;
  const avgRisk = data?.avg_risk_score || 0;
  const trend = data?.trend || [];

  const govData = [
    { name: 'ALLOW', value: decisions.ALLOW },
    { name: 'REVIEW', value: decisions.REVIEW },
    { name: 'BLOCK', value: decisions.BLOCK }
  ];

  const psData = [
    { name: 'APPROVED', value: decisions.APPROVED },
    { name: 'NEEDS_IMPROVEMENT', value: decisions.NEEDS_IMPROVEMENT },
    { name: 'REJECTED', value: decisions.REJECTED }
  ];

  return (
    <div className="dashboard-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="dashboard-modal"
      >
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <Activity size={24} />
            <h2 className="dashboard-title">Analytics Dashboard</h2>
          </div>
          <button onClick={onClose} className="dashboard-close-btn">
            ✕
          </button>
        </div>

        <div className="dashboard-content custom-scrollbar">
          {loading ? (
            <div className="dashboard-loading">
              <Zap className="w-10 h-10 mb-4" />
              <p>Aggregating telemetry...</p>
            </div>
          ) : error ? (
            <div className="dashboard-error">
              <AlertTriangle /> {error}
            </div>
          ) : (
            <div>
              
              {/* Stats Row */}
              <div className="dashboard-stats-grid">
                <StatCard icon={Search} value={total} label="Total Scans" color="#3b82f6" delay={0.1} />
                <StatCard icon={Target} value={avgRisk.toFixed(1)} label="Avg Risk Score" color={avgRisk > 60 ? '#ef4444' : avgRisk > 30 ? '#f59e0b' : '#10b981'} delay={0.2} />
                <StatCard icon={ShieldCheck} value={decisions.ALLOW} label="Allowed" color="#10b981" delay={0.3} />
                <StatCard icon={XCircle} value={decisions.BLOCK} label="Blocked" color="#ef4444" delay={0.4} />
              </div>

              <div className="dashboard-charts-grid">
                {/* Decision Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-card">
                  <h3 className="chart-title"><PieChart size={18}/> Decision Distribution</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="66%" height="100%">
                      <PieChart>
                        <Pie data={govData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {govData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                      {govData.map(d => (
                        <div key={d.name} className="pie-legend-item">
                          <div className="pie-legend-color" style={{ backgroundColor: COLORS[d.name] }} />
                          {d.name} ({d.value})
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Trend Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="chart-card">
                  <h3 className="chart-title"><Activity size={18}/> Analysis Trend (7 Days)</h3>
                  <div className="chart-container" style={{ width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={str => str.substring(5)} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
