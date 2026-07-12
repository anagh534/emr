import React, { useState } from 'react';
import { useAppointmentsQuery, useUpdateAppointment } from '../hooks/useAppointments';
import { useToast } from '../../../context/ToastContext';
import { Clipboard, FileText } from 'lucide-react';

/**
 * Consultation Notes Editor & HIPAA Patient record files lookups for Doctors
 */
export function DoctorConsultations({ currentUser }) {
  const { addToast } = useToast();
  const updateAppointmentMutation = useUpdateAppointment();

  const [selectedApptId, setSelectedApptId] = useState('');
  const [consultNotes, setConsultNotes] = useState('');
  const [notesMessage, setNotesMessage] = useState('');

  // Fetch doctor queue
  const { data: doctorQueueResponse } = useAppointmentsQuery({
    doctorSearch: currentUser?.name,
    limit: 100
  });
  const myAppts = doctorQueueResponse?.data?.appointments || [];
  const activeAppt = myAppts.find(a => a._id === selectedApptId);

  const handleUpdateNotes = (e) => {
    e.preventDefault();
    if (!selectedApptId) {
      addToast('Please select a patient appointment first', 'error');
      return;
    }

    updateAppointmentMutation.mutate({
      id: selectedApptId,
      updateData: { notes: consultNotes }
    }, {
      onSuccess: () => {
        setNotesMessage('Consultation notes updated successfully!');
        setTimeout(() => setNotesMessage(''), 3000);
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to save notes', 'error');
      }
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', width: '100%' }}>
      
      {/* Write Consultation Notes Form */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clipboard size={20} style={{ color: 'var(--primary)' }} />
          Write Consultation Notes
        </h2>

        {notesMessage && (
          <div className="badge-success" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            {notesMessage}
          </div>
        )}

        <form onSubmit={handleUpdateNotes}>
          <div className="form-group">
            <label>Select Active Patient Appt</label>
            <select 
              className="form-input" 
              style={{ paddingLeft: '1rem' }} 
              value={selectedApptId} 
              onChange={(e) => {
                const val = e.target.value;
                setSelectedApptId(val);
                const appt = myAppts.find(a => a._id === val);
                if (appt) setConsultNotes(appt.notes || '');
              }}
              required
            >
              <option value="">-- Select Patient --</option>
              {myAppts.map(appt => (
                <option key={appt._id} value={appt._id}>{appt.patient?.name} - {appt.purpose} ({appt.timeSlot})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Consultation & Diagnosis Notes</label>
            <textarea 
              className="form-input" 
              rows={6}
              style={{ padding: '0.75rem 1rem', resize: 'vertical' }}
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              placeholder="Record symptoms, diagnoses, recommendations..."
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={updateAppointmentMutation.isPending} 
            className="btn btn-primary btn-block" 
            style={{ marginTop: '1rem' }}
          >
            {updateAppointmentMutation.isPending ? 'Saving Notes...' : 'Save Consultation Notes'}
          </button>
        </form>
      </div>

      {/* View Patient Details (HIPAA File Viewer) */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} style={{ color: 'var(--primary)' }} />
          HIPAA Patient Record File
        </h2>

        {activeAppt ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PATIENT</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{activeAppt.patient?.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Age: {activeAppt.patient?.age} • Contact: {activeAppt.patient?.mobileNumber}</p>
              <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.2rem' }}>ID: {activeAppt.patient?.patientId}</p>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CHIEF COMPLAINT</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{activeAppt.purpose}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MEDICAL HISTORY</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {activeAppt.patient?.history || 'No recorded clinical history.'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
            <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem' }}>Select an appointment in the form to view full patient files.</p>
          </div>
        )}
      </div>

    </div>
  );
}
