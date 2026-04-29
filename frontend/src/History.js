import React, { useState, useEffect, useCallback } from 'react';
import { getToken } from './AuthContext';
import { Download, History as HistoryIcon, Search, ShieldCheck, Zap } from 'lucide-react';
import './History.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const DECISION_META = {
  BLOCK: { icon: '🚫', color: 'var(--danger)', bg: 'var(--danger-bg)' },
  REVIEW: { icon: '⚠️', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  ALLOW: { icon: '✅', color: 'var(--success)', bg: 'var(--success-bg)' },
  APPROVED: { icon: '✅', color: 'var(--success)', bg: 'var(--success-bg)' },
  NEEDS_IMPROVEMENT: { icon: '⚠️', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  REJECTED: { icon: '🚫', color: 'var(--danger)', bg: 'var(--danger-bg)' },
};

function History() {
  const [history, setHistory] = useState([]);
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const LIMIT = 10;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/history?limit=${LIMIT}&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(data.history);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/history/all`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to export CSV');
      const data = await res.json();
      
      const headers = ['Query ID', 'Mode', 'Decision', 'Date', 'Query Text'];
      const csvRows = [headers.join(',')];
      
      data.history.forEach(row => {
        const escapedText = `"${(row.query_text || '').replace(/"/g, '""')}"`;
        const values = [
          row.query_id, 
          row.mode, 
          row.final_decision || 'N/A', 
          new Date(row.created_at).toLocaleString().replace(/,/g, ''),
          escapedText
        ];
        csvRows.push(values.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ai_decision_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Error exporting CSV: " + e.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="history-title-group">
          <HistoryIcon size={24} />
          <span>Audit Trail</span>
        </div>
        <div className="history-actions">
          <button onClick={handleExportCsv} className="btn-export">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="history-content">
        {loading && (
          <div className="history-loading">
            <div className="spinner"></div>
            <p>Loading audit trail...</p>
          </div>
        )}

        {error && (
          <div className="auth-error" style={{ margin: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="history-empty">
            <Search size={48} />
            <p>No analysis history yet. Run your first analysis to see it here.</p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Mode</th>
                  <th>Outcome</th>
                  <th>Query Text</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const meta = DECISION_META[item.final_decision] || { icon: '❓', color: 'var(--text-muted)', bg: 'var(--bg-hover)' };
                  return (
                    <tr key={item.query_id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <span className={`mode-badge ${item.mode}`}>
                          {item.mode === 'governance' ? <ShieldCheck size={12}/> : <Zap size={12}/>}
                          {item.mode === 'governance' ? 'Governance' : 'Problem Solving'}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}40` }}>
                          <span style={{ marginRight: '0.25rem' }}>{meta.icon}</span> {item.final_decision}
                        </span>
                      </td>
                      <td className="query-cell">
                        <span className="query-text-truncate" title={item.query_text}>
                          {item.query_text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && total > LIMIT && (
          <div className="history-pagination">
            <div className="pagination-info">
              Showing {offset + 1} to {Math.min(offset + LIMIT, total)} of {total} entries
            </div>
            <div className="pagination-controls">
              <button 
                className="btn-page" 
                disabled={offset === 0} 
                onClick={() => setOffset(o => o - LIMIT)}
              >
                Previous
              </button>
              <button 
                className="btn-page" 
                disabled={offset + LIMIT >= total} 
                onClick={() => setOffset(o => o + LIMIT)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
