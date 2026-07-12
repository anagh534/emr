import React, { useState } from 'react';
import { useAppointmentsQuery, useUpdateAppointment } from '../hooks/useAppointments';
import { useToast } from '../../../context/ToastContext';
import { CalendarDays } from 'lucide-react';

/**
 * Audit registry and workflow manager for EMR staff (Super Admin and Receptionist)
 */
export function AppointmentsRegistry() {
  const { addToast } = useToast();
  const updateAppointmentMutation = useUpdateAppointment();

  // Registry Pagination & Filters
  const [apptLimit, setApptLimit] = useState(5);
  const [apptOffset, setApptOffset] = useState(0);

  // Filter form states (local inputs)
  const [filterDoc, setFilterDoc] = useState('');
  const [filterPat, setFilterPat] = useState('');
  const [filterMob, setFilterMob] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterApptStatus, setFilterApptStatus] = useState('All');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  // Applied filter parameters passed into React Query
  const [appliedDoc, setAppliedDoc] = useState('');
  const [appliedPat, setAppliedPat] = useState('');
  const [appliedMob, setAppliedMob] = useState('');
  const [appliedDept, setAppliedDept] = useState('All');
  const [appliedApptStatus, setAppliedApptStatus] = useState('All');
  const [appliedStart, setAppliedStart] = useState('');
  const [appliedEnd, setAppliedEnd] = useState('');

  // Dynamic server-side directory lookup
  const { data: registryResponse, isLoading, isError } = useAppointmentsQuery({
    limit: apptLimit,
    offset: apptOffset,
    doctorSearch: appliedDoc,
    patientSearch: appliedPat,
    mobileSearch: appliedMob,
    department: appliedDept,
    status: appliedApptStatus,
    startDate: appliedStart,
    endDate: appliedEnd
  });

  // Inline editing details
  const [editingApptId, setEditingApptId] = useState(null);
  const [editingPurpose, setEditingPurpose] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  const handleApplyApptFilters = () => {
    setAppliedDoc(filterDoc);
    setAppliedPat(filterPat);
    setAppliedMob(filterMob);
    setAppliedDept(filterDept);
    setAppliedApptStatus(filterApptStatus);
    setAppliedStart(filterStart);
    setAppliedEnd(filterEnd);
    setApptOffset(0);
  };

  const handleResetApptFilters = () => {
    setFilterDoc('');
    setFilterPat('');
    setFilterMob('');
    setFilterDept('All');
    setFilterApptStatus('All');
    setFilterStart('');
    setFilterEnd('');
    setAppliedDoc('');
    setAppliedPat('');
    setAppliedMob('');
    setAppliedDept('All');
    setAppliedApptStatus('All');
    setAppliedStart('');
    setAppliedEnd('');
    setApptOffset(0);
  };

  const handleUpdateStatus = (apptId, newStatus) => {
    updateAppointmentMutation.mutate({
      id: apptId,
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

  const handleSaveInlineEdit = (apptId) => {
    updateAppointmentMutation.mutate({
      id: apptId,
      updateData: { purpose: editingPurpose, notes: editingNotes }
    }, {
      onSuccess: () => {
        addToast('Appointment details saved', 'success');
        setEditingApptId(null);
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update appointment details', 'error');
      }
    });
  };

  return (
    <div className="glass-card" style={{ width: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
        Manage Booked Appointments
      </h2>

      {/* Filter panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Patient Search</label>
          <input type="text" className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} placeholder="Name or Patient ID..." value={filterPat} onChange={(e) => setFilterPat(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Doctor Search</label>
          <input type="text" className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} placeholder="Doctor Name..." value={filterDoc} onChange={(e) => setFilterDoc(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Mobile Search</label>
          <input type="text" className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} placeholder="Patient Mobile..." value={filterMob} onChange={(e) => setFilterMob(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Department</label>
          <select className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="Diagnostic Medicine">Diagnostic Medicine</option>
            <option value="Immunology">Immunology</option>
            <option value="Cardiology">Cardiology</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</label>
          <select className="form-input" style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', height: '32px' }} value={filterApptStatus} onChange={(e) => setFilterApptStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Arrived">Arrived</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Start Date</label>
          <input type="date" className="form-input" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', height: '32px' }} value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>End Date</label>
          <input type="date" className="form-input" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', height: '32px' }} value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', gridColumn: '1 / -1', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleResetApptFilters}>Reset</button>
          <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleApplyApptFilters}>Filter Appointments</button>
        </div>
      </div>

      {/* Directory list table */}
      {isLoading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading appointments registry...</p>
      ) : isError ? (
        <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>Failed to query appointments from database.</p>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Patient Details</th>
                <th style={{ padding: '0.75rem' }}>Assigned Doctor</th>
                <th style={{ padding: '0.75rem' }}>Schedule Slot</th>
                <th style={{ padding: '0.75rem' }}>Purpose & Notes</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(registryResponse?.data?.appointments || []).map(appt => {
                const isEditing = editingApptId === appt._id;
                return (
                  <tr key={appt._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td data-label="Patient Details" style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{appt.patient?.name} (Age {appt.patient?.age})</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {appt.patient?.patientId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile: {appt.patient?.mobileNumber}</div>
                    </td>
                    <td data-label="Assigned Doctor" style={{ padding: '0.75rem' }}>
                      <div>{appt.doctor?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept: {appt.department}</div>
                    </td>
                    <td data-label="Schedule Slot" style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{appt.timeSlot}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{appt.date}</div>
                    </td>
                    <td data-label="Purpose & Notes" style={{ padding: '0.75rem' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '28px' }} 
                            value={editingPurpose} 
                            onChange={(e) => setEditingPurpose(e.target.value)} 
                            placeholder="Purpose"
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '28px' }} 
                            value={editingNotes} 
                            onChange={(e) => setEditingNotes(e.target.value)} 
                            placeholder="Notes"
                          />
                        </div>
                      ) : (
                        <div>
                          <div><strong>Purpose:</strong> {appt.purpose}</div>
                          {appt.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><strong>Notes:</strong> {appt.notes}</div>}
                        </div>
                      )}
                    </td>
                    <td data-label="Status" style={{ padding: '0.75rem' }}>
                      <span className={`badge ${
                        appt.status === 'Completed' ? 'badge-success' :
                        appt.status === 'Arrived' ? 'badge-warning' :
                        appt.status === 'Cancelled' ? 'badge-danger' : 'badge-primary'
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
                    <td data-label="Actions" style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveInlineEdit(appt._id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Save</button>
                            <button onClick={() => setEditingApptId(null)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Cancel</button>
                          </>
                        ) : (
                          <>
                            {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                              <button 
                                onClick={() => {
                                  setEditingApptId(appt._id);
                                  setEditingPurpose(appt.purpose);
                                  setEditingNotes(appt.notes || '');
                                }} 
                                className="btn btn-secondary" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                              >
                                Edit Details
                              </button>
                            )}
                            {appt.status === 'Scheduled' && (
                              <button onClick={() => handleUpdateStatus(appt._id, 'Arrived')} className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                Mark Arrived
                              </button>
                            )}
                            {appt.status === 'Arrived' && (
                              <button onClick={() => handleUpdateStatus(appt._id, 'Completed')} className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                Mark Completed
                              </button>
                            )}
                            {(appt.status === 'Scheduled' || appt.status === 'Arrived') && (
                              <button onClick={() => handleUpdateStatus(appt._id, 'Cancelled')} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!registryResponse?.data?.appointments || registryResponse?.data?.appointments.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No booked appointments registered on database.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Server-side Pagination Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {apptOffset + 1} - {Math.min(apptOffset + apptLimit, registryResponse?.data?.totalCount || 0)} of {registryResponse?.data?.totalCount || 0} registry records
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                disabled={apptOffset === 0}
                onClick={() => setApptOffset(prev => Math.max(0, prev - apptLimit))}
              >
                Previous
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                disabled={apptOffset + apptLimit >= (registryResponse?.data?.totalCount || 0)}
                onClick={() => setApptOffset(prev => prev + apptLimit)}
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
