import React, { useState, useEffect } from 'react';
import { getToken } from './AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ShieldAlert, Users, Search, Activity, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function AdminDashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Not authorized'))
      .then(data => { setStats(data); return fetch(`${API_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } }); })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load users'))
      .then(data => { setUsers(data); setLoading(false); })
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={28} />
            <h2 className="text-2xl font-bold text-slate-100">Global Admin Command Center</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"><X /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20 text-slate-400 animate-pulse"><Activity className="w-10 h-10 text-red-500" /></div>
          ) : error ? (
            <div className="p-4 bg-red-900/30 text-red-400 rounded-xl border border-red-900/50">{error}</div>
          ) : (
            <div className="space-y-8">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider"><Users size={16}/> Total Users</div>
                  <div className="text-3xl font-bold text-white">{stats?.total_users}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider"><ShieldAlert size={16}/> Admins</div>
                  <div className="text-3xl font-bold text-blue-400">{stats?.total_admins}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider"><Search size={16}/> Total Scans</div>
                  <div className="text-3xl font-bold text-indigo-400">{stats?.total_queries}</div>
                </div>
                <div className="bg-red-900/20 border border-red-900/50 p-5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-400/80 text-sm font-bold uppercase tracking-wider"><Activity size={16}/> Blocked Scans</div>
                  <div className="text-3xl font-bold text-red-400">{stats?.decisions.BLOCK || 0}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-slate-200 mb-6">Global Decision Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={decisionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} width={80} />
                        <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                          {decisionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-lg font-bold text-slate-200">Registered Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-xs">
                      <tr>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-center">Scans</th>
                        <th className="px-6 py-4 text-center">Role</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {users.map(u => (
                        <tr key={u.user_id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            {u.username}
                          </td>
                          <td className="px-6 py-4 text-slate-400">{u.email}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold">{u.query_count}</td>
                          <td className="px-6 py-4 text-center">
                            {u.is_admin ? 
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">ADMIN</span> : 
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">USER</span>
                            }
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!u.is_admin && (
                              <button onClick={() => handleDeleteUser(u.user_id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded-lg transition-colors">
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
