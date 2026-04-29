import React, { useState, useEffect } from 'react';
import { getToken } from './AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShieldCheck, Zap, AlertTriangle, XCircle, Search, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
    className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex items-center gap-4"
  >
    <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
      <Icon size={24} />
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100">Analytics Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Zap className="w-10 h-10 animate-pulse text-blue-500 mb-4" />
              <p>Aggregating telemetry...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/30 text-red-400 rounded-xl border border-red-900/50 flex items-center gap-3">
              <AlertTriangle /> {error}
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Search} value={total} label="Total Scans" color="#3b82f6" delay={0.1} />
                <StatCard icon={Target} value={avgRisk.toFixed(1)} label="Avg Risk Score" color={avgRisk > 60 ? '#ef4444' : avgRisk > 30 ? '#f59e0b' : '#10b981'} delay={0.2} />
                <StatCard icon={ShieldCheck} value={decisions.ALLOW} label="Allowed" color="#10b981" delay={0.3} />
                <StatCard icon={XCircle} value={decisions.BLOCK} label="Blocked" color="#ef4444" delay={0.4} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Decision Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2"><PieChart size={18}/> Decision Distribution</h3>
                  <div className="flex h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={govData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {govData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col justify-center gap-4 w-1/3">
                      {govData.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.name] }} />
                          {d.name} ({d.value})
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Trend Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2"><Activity size={18}/> Analysis Trend (7 Days)</h3>
                  <div className="h-64">
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
