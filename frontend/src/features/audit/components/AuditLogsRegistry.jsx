import React, { useState } from 'react';
import { useAuditLogsQuery } from '../hooks/useAuditLogs';
import { Server } from 'lucide-react';

/**
 * System Audit Trail viewer for administrators
 */
export function AuditLogsRegistry() {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const { data: response, isLoading, isError } = useAuditLogsQuery(limit, offset);
  const logs = response?.data?.logs || [];
  const totalCount = response?.data?.totalCount || 0;

  return (
    <div className="glass-card" style={{ width: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Server size={20} style={{ color: 'var(--primary)' }} />
        System Audit Logs & Trails
      </h2>

      {isLoading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Querying system logs...</p>
      ) : isError ? (
        <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>Failed to retrieve audit trail logs.</p>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem', width: '25%' }}>Timestamp</th>
                <th style={{ padding: '0.75rem', width: '25%' }}>User Identity</th>
                <th style={{ padding: '0.75rem', width: '15%' }}>Clearance Role</th>
                <th style={{ padding: '0.75rem', width: '15%' }}>Action</th>
                <th style={{ padding: '0.75rem', width: '20%' }}>Target Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.user}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge" style={{
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.7rem'
                    }}>
                      {log.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {log.entity}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No audit log records found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {offset + 1} - {Math.min(offset + limit, totalCount)} of {totalCount} logs
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                disabled={offset === 0}
                onClick={() => setOffset(prev => Math.max(0, prev - limit))}
              >
                Previous
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                disabled={offset + limit >= totalCount}
                onClick={() => setOffset(prev => prev + limit)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
