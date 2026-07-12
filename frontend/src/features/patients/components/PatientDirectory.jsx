import React, { useState } from 'react';
import { useSearchPatientsQuery } from '../hooks/usePatients';
import { Search, CalendarDays } from 'lucide-react';

/**
 * Receptionist view to search patients database registry with pagination and inspect bookings
 */
export function PatientDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const { data: searchResponse, isLoading, isError } = useSearchPatientsQuery(searchQuery, limit, offset);
  const receptionistPatients = searchResponse?.data?.patients || [];
  const totalCount = searchResponse?.data?.totalCount || 0;

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setOffset(0);
  };

  return (
    <div className="glass-card" style={{ width: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={20} style={{ color: 'var(--primary)' }} />
        Search Patients Database
      </h2>

      <div className="form-group" style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
        <div className="input-wrapper">
          <span className="input-icon">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search patient ID, name, mobile..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Querying patient registry...</p>
      ) : isError ? (
        <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>Failed to retrieve patient registry records.</p>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem', width: '45%' }}>Patient Profile</th>
                <th style={{ padding: '0.75rem', width: '55%' }}>Booking Details (Appointments)</th>
              </tr>
            </thead>
            <tbody>
              {receptionistPatients.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)', verticalAlign: 'top' }}>
                  {/* Column 1: Patient Profile */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{p.name} ({p.age} years old)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>ID: {p.patientId}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Mobile: {p.mobileNumber}</div>
                    {p.history && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Medical History:</strong> {p.history}
                      </div>
                    )}
                  </td>
                  
                  {/* Column 2: Booking Details */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    {p.bookings && p.bookings.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {p.bookings.map(b => (
                          <div 
                            key={b._id} 
                            style={{ 
                              padding: '0.6rem 0.75rem', 
                              background: 'rgba(255,255,255,0.02)', 
                              border: '1px solid var(--border-light)', 
                              borderRadius: 'var(--radius-md)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '1rem'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <CalendarDays size={12} style={{ color: 'var(--primary)' }} />
                                {b.date} @ {b.timeSlot}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                Consulting: <strong>{b.doctorName}</strong>
                              </div>
                              {b.purpose && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  Purpose: {b.purpose}
                                </div>
                              )}
                            </div>
                            
                            <span className={`badge ${
                              b.status === 'Completed' ? 'badge-success' :
                              b.status === 'Arrived' ? 'badge-warning' :
                              b.status === 'Cancelled' ? 'badge-danger' : 'badge-primary'
                            }`} style={{
                              background: b.status === 'Completed' ? 'rgba(16,185,129,0.1)' :
                                          b.status === 'Arrived' ? 'rgba(245,158,11,0.1)' :
                                          b.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                              color: b.status === 'Completed' ? 'var(--success)' :
                                     b.status === 'Arrived' ? 'var(--warning)' :
                                     b.status === 'Cancelled' ? 'var(--error)' : 'var(--secondary)'
                            }}>
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No active or past bookings found for this patient.</span>
                    )}
                  </td>
                </tr>
              ))}
              {receptionistPatients.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No patient records found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {offset + 1} - {Math.min(offset + limit, totalCount)} of {totalCount} patients records
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
