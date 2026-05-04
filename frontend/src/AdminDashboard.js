import React, { useState, useEffect } from 'react';
import { getToken } from './AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { ShieldAlert, Users, Search, Activity, Trash2, X, Terminal, Server, ShieldCheck, Cpu, Zap, Settings, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function AdminDashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toggles state
  const [strictMode, setStrictMode] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);
  const [heuristicOverride, setHeuristicOverride] = useState(false);

  const fetchAdminData = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Not authorized'))
      .then(data => { setStats(data); return fetch(`${API_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } }); })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load users'))
      .then(data => { setUsers(data); return fetch(`${API_URL}/admin/activity`, { headers: { 'Authorization': `Bearer ${getToken()}` } }); })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load activity'))
      .then(data => { setActivity(data); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (response.ok) fetchAdminData();
      else alert("Failed to delete user");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const decisionData = stats ? [
    { name: 'ALLOW', count: stats.decisions.ALLOW || 0 },
    { name: 'REVIEW', count: stats.decisions.REVIEW || 0 },
    { name: 'BLOCK', count: stats.decisions.BLOCK || 0 }
  ] : [];

  const COLORS = { ALLOW: '#10b981', REVIEW: '#f59e0b', BLOCK: '#ef4444' };

  // Mock data for System Load chart
  const loadData = Array.from({ length: 20 }).map((_, i) => ({
    time: `T-${20 - i}`,
    tokens: Math.floor(Math.random() * 5000) + 1000,
    cpu: Math.floor(Math.random() * 40) + 20
  }));

  const agents = [
    { name: 'Governance Engine', status: 'Optimal', latency: '42ms', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { name: 'Risk Analyzer', status: 'Active', latency: '89ms', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { name: 'Policy Enforcer', status: 'High Load', latency: '156ms', icon: Lock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { name: 'Decomposer', status: 'Optimal', latency: '24ms', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-slate-900 border border-slate-700 w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse"></div>
              <ShieldAlert className="text-red-500 relative z-10" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">Global Admin Command Center</h2>
              <p className="text-sm text-slate-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> System Online & Enforcing Policies</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-900/50">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-slate-400 flex-col gap-4">
              <Activity className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="animate-pulse">Initializing Command Center...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-900/20 text-red-400 rounded-xl border border-red-900/50 flex items-center gap-3"><ShieldAlert/> {error}</div>
          ) : (
            <div className="space-y-6">
              
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                  <div className="flex items-center justify-between text-slate-400 text-sm font-bold uppercase tracking-wider"><span>Total Users</span> <Users size={16}/></div>
                  <div className="text-4xl font-black text-white mt-2">{stats?.total_users}</div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="flex items-center justify-between text-slate-400 text-sm font-bold uppercase tracking-wider"><span>Admins</span> <ShieldAlert size={16}/></div>
                  <div className="text-4xl font-black text-emerald-400 mt-2">{stats?.total_admins}</div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                  <div className="flex items-center justify-between text-slate-400 text-sm font-bold uppercase tracking-wider"><span>Total Scans</span> <Search size={16}/></div>
                  <div className="text-4xl font-black text-indigo-400 mt-2">{stats?.total_queries}</div>
                </div>
                <div className="bg-gradient-to-br from-red-900/20 to-slate-900 border border-red-900/40 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
                  <div className="flex items-center justify-between text-red-400/80 text-sm font-bold uppercase tracking-wider"><span>Blocked Scans</span> <Activity size={16}/></div>
                  <div className="text-4xl font-black text-red-400 mt-2">{stats?.decisions.BLOCK || 0}</div>
                </div>
              </div>

              {/* Middle Row: System Load & Agent Health */}
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* System Load Chart */}
                <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2"><Zap className="text-yellow-400" size={18}/> Real-Time Token Usage & Load</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={loadData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Agent Health Monitor */}
                <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl backdrop-blur-md flex flex-col">
                  <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2"><Server className="text-indigo-400" size={18}/> Agent Cluster Health</h3>
                  <div className="flex-1 space-y-3">
                    {agents.map((agent, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${agent.border} ${agent.bg} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <agent.icon className={agent.color} size={20} />
                          <div>
                            <div className="text-sm font-bold text-slate-200">{agent.name}</div>
                            <div className={`text-xs ${agent.color} flex items-center gap-1`}><div className={`w-1.5 h-1.5 rounded-full ${agent.bg.replace('10', '100')}`}></div> {agent.status}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-400 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50">{agent.latency}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Row: Live Feed & Toggles */}
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Live Activity Feed */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-700 p-0 rounded-2xl overflow-hidden shadow-inner flex flex-col">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><Terminal size={16} className="text-emerald-400"/> Live Platform Activity</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                    </div>
                  </div>
                  <div className="p-4 h-80 overflow-y-auto custom-scrollbar font-mono text-sm space-y-2 bg-[#0a0f18]">
                    {activity.length === 0 ? <div className="text-slate-500">Awaiting new events...</div> : 
                      activity.map((act, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={act.query_id || i} className="flex flex-col border-b border-slate-800/50 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500 text-xs">[{new Date(act.created_at).toLocaleTimeString()}]</span>
                            <span className="text-blue-400 font-bold">@{act.username}</span>
                            <span className="text-slate-400">issued query:</span>
                          </div>
                          <div className="text-slate-300 truncate opacity-80 mb-1">"{act.query_text}"</div>
                          <div className="flex gap-3 text-xs">
                            <span className={`px-2 py-0.5 rounded-sm ${act.final_decision === 'BLOCK' ? 'bg-red-900/40 text-red-400' : act.final_decision === 'REVIEW' ? 'bg-amber-900/40 text-amber-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                              {act.final_decision || 'ALLOW'}
                            </span>
                            {act.risk_score && <span className="text-slate-500">Risk: {act.risk_score}</span>}
                          </div>
                        </motion.div>
                      ))
                    }
                  </div>
                </div>

                {/* Global Controls & Chart */}
                <div className="flex flex-col gap-6">
                  {/* Toggles */}
                  <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Settings size={16}/> Global Override Controls</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-200">Enterprise Strict Mode</div>
                          <div className="text-xs text-slate-500">Enforce maximum policy adherence</div>
                        </div>
                        <div onClick={() => setStrictMode(!strictMode)} className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${strictMode ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${strictMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-200">Auto-Block Threats</div>
                          <div className="text-xs text-slate-500">Skip review queue for critical risks</div>
                        </div>
                        <div onClick={() => setAutoBlock(!autoBlock)} className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${autoBlock ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoBlock ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-200">Heuristic Engine</div>
                          <div className="text-xs text-slate-500">Enable experimental pattern matching</div>
                        </div>
                        <div onClick={() => setHeuristicOverride(!heuristicOverride)} className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${heuristicOverride ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${heuristicOverride ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Decision Chart */}
                  <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-300 mb-4">Decision Distribution</h3>
                    <div className="flex-1 min-h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={decisionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} width={60} />
                          <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                            {decisionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>

              {/* Registered Users Table */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur-md mt-6">
                <div className="p-5 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2"><Users size={18}/> Platform Users</h3>
                  <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">{users.length} Total</div>
                </div>
                <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-xs sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4 text-center">API Calls</th>
                        <th className="px-6 py-4 text-center">Privilege Level</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {users.map(u => (
                        <tr key={u.user_id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${u.is_admin ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-200">{u.username}</div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-bold text-indigo-300">{u.query_count}</td>
                          <td className="px-6 py-4 text-center">
                            {u.is_admin ? 
                              <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black rounded-full flex items-center justify-center gap-1 w-24 mx-auto"><ShieldAlert size={12}/> ADMIN</span> : 
                              <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-full border border-slate-700 w-24 mx-auto block">USER</span>
                            }
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!u.is_admin && (
                              <button onClick={() => handleDeleteUser(u.user_id)} className="text-red-400/70 hover:text-red-400 hover:bg-red-900/30 p-2 rounded-lg transition-all" title="Terminate User">
                                <Trash2 size={18}/>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;
