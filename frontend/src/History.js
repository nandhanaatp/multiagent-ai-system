import React, { useState, useEffect, useCallback } from 'react';
import { getToken } from './AuthContext';
import './History.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const DECISION_COLORS = {
  BLOCK: '#dc2626', REVIEW: '#f59e0b', ALLOW: '#16a34a',
  APPROVED: '#16a34a', NEEDS_IMPROVEMENT: '#f59e0b', REJECTED: '#dc2626'
};
const DECISION_ICONS = {
  BLOCK: '🚫', REVIEW: '⚠️', ALLOW: '✅',
  APPROVED: '✅', NEEDS_IMPROVEMENT: '⚠️', REJECTED: '🚫'
};

function History({ onClose }) {
  const [history, setHistory] = useState([]);
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const LIMIT = 5;

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
    <div className="history-overlay">
      <div className="history-panel">
        <div className="history-header">
          <h2>📜 Decision History</h2>
          <div style={{ marginLeft: 'auto', marginRight: '1rem' }}>
            <button 
              onClick={handleExportCsv} 
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            >
              ⬇️ Export CSV
            </button>
          </div>
          <button className="history-close" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="history-loading"><div className="spinner"></div></div>}
        {error   && <div className="history-error">⚠️ {error}</div>}

        {!loading && !error && history.length === 0 && (
          <div className="history-empty">No analysis history yet. Run your first analysis!</div>
        )}

        {!loading && history.map((item) => (
          <div key={item.query_id} className="history-item">
            <div className="history-item-top">
              <span className="history-decision" style={{ color: DECISION_COLORS[item.final_decision] }}>
                {DECISION_ICONS[item.final_decision]} {item.final_decision}
              </span>
              <span className="history-date">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
            <div className="history-item-meta">
              <span className={`history-mode-badge ${item.mode}`}>
                {item.mode === 'governance' ? '🛡️ Governance' : '🤖 Problem Solving'}
              </span>
            </div>
            <div className="history-query">{item.query_text}</div>
          </div>
        ))}

        {total > LIMIT && (
          <div className="history-pagination">
            <button disabled={offset === 0} onClick={() => setOffset(o => o - LIMIT)}>← Prev</button>
            <span>{Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}</span>
            <button disabled={offset + LIMIT >= total} onClick={() => setOffset(o => o + LIMIT)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
