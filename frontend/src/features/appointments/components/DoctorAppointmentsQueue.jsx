import React from 'react';
import { useAppointmentsQuery, useUpdateAppointment } from '../hooks/useAppointments';
import { useToast } from '../../../context/ToastContext';
import { Calendar } from 'lucide-react';

/**
 * List of appointments scheduled for the currently logged-in clinical doctor with status controllers
 */
export function DoctorAppointmentsQueue({ currentUser }) {
  const { addToast } = useToast();
  const updateAppointmentMutation = useUpdateAppointment();

  const { data: doctorQueueResponse, isLoading, isError } = useAppointmentsQuery({
    doctorSearch: currentUser?.name,
    limit: 100
  });
  const myAppts = doctorQueueResponse?.data?.appointments || [];

  const handleUpdateStatus = (id, newStatus) => {
    updateAppointmentMutation.mutate({
      id,
      updateData: { status: newStatus }
    }, {
      onSuccess: () => {
        addToast(`Appointment status updated to ${newStatus}`, 'success');
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update status', 'error');
      }
    });
  };

  return (
    <div className="glass-card" style={{ width: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={20} style={{ color: 'var(--primary)' }} />
        My Appointment Queue
      </h2>

      {isLoading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading appointment queue...</p>
      ) : isError ? (
        <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>Failed to query appointments list.</p>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Patient Name</th>
                <th style={{ padding: '0.75rem' }}>Age</th>
                <th style={{ padding: '0.75rem' }}>Reason (Purpose)</th>
                <th style={{ padding: '0.75rem' }}>Time Slot</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Active Consult Notes</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myAppts.map(appt => (
                <tr key={appt._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{appt.patient?.name}</td>
                  <td style={{ padding: '0.75rem' }}>{appt.patient?.age}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{appt.purpose}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{appt.timeSlot} ({appt.date})</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${
                      appt.status === 'Completed' ? 'badge-success' :
                      appt.status === 'Arrived' ? 'badge-warning' :
                      appt.status === 'Cancelled' ? 'badge-error' : 'badge-primary'
                    }`} style={{
                      background: appt.status === 'Completed' ? 'rgba(16,185,129,0.1)' :
                                  appt.status === 'Arrived' ? 'rgba(245,158,11,0.1)' :
                                  appt.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                      color: appt.status === 'Completed' ? 'var(--success)' :
                             appt.status === 'Arrived' ? 'var(--warning)' :
                             appt.status === 'Cancelled' ? 'var(--error)' : 'var(--secondary)'
                    }}>
                      {appt.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {appt.notes ? appt.notes.substring(0, 30) + '...' : 'No notes written'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {appt.status === 'Scheduled' && (
                        <button 
                          onClick={() => handleUpdateStatus(appt._id, 'Arrived')} 
                          className="btn btn-success" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}
                        >
                          Mark Arrived
                        </button>
                      )}
                      {appt.status === 'Arrived' && (
                        <button 
                          onClick={() => handleUpdateStatus(appt._id, 'Completed')} 
                          className="btn btn-success" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}
                        >
                          Mark Completed
                        </button>
                      )}
                      {(appt.status === 'Scheduled' || appt.status === 'Arrived') && (
                        <button 
                          onClick={() => handleUpdateStatus(appt._id, 'Cancelled')} 
                          className="btn btn-danger" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      )}
                      {(appt.status === 'Completed' || appt.status === 'Cancelled') && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {myAppts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No active appointments in your queue today.
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
