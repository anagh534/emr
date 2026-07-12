import React, { useState } from 'react';
import { useSearchPatientsQuery } from '../hooks/usePatients';
import { Search } from 'lucide-react';

/**
 * Receptionist view to search patients database registry
 */
export function PatientDirectory() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResponse, isLoading, isError } = useSearchPatientsQuery(searchQuery);
  const receptionistPatients = searchQuery.trim() ? (searchResponse?.data || []) : [];

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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Searching Patient registry...</p>
      ) : isError ? (
        <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>Failed to retrieve patient registry records.</p>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Patient ID</th>
                <th style={{ padding: '0.75rem' }}>Patient Name</th>
                <th style={{ padding: '0.75rem' }}>Age</th>
                <th style={{ padding: '0.75rem' }}>Mobile Contact</th>
                <th style={{ padding: '0.75rem' }}>Medical History Summary</th>
              </tr>
            </thead>
            <tbody>
              {receptionistPatients.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{p.patientId}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '0.75rem' }}>{p.age}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.mobileNumber}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{p.history || 'No records'}</td>
                </tr>
              ))}
              {receptionistPatients.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {searchQuery.trim() ? 'No patients found matching query' : 'Type name, ID, or mobile number to search...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
