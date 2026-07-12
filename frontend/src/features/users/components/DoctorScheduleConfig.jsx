import React, { useState } from 'react';
import { useUsersQuery, useUpdateUserSchedule } from '../hooks/useUsers';
import { useToast } from '../../../context/ToastContext';
import { Edit, CalendarDays } from 'lucide-react';

/**
 * Super Admin Doctor Calendar & Shifts Configurator
 */
export function DoctorScheduleConfig() {
  const { addToast } = useToast();

  const updateScheduleMutation = useUpdateUserSchedule();

  const [selectedDocId, setSelectedDocId] = useState('');
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [slotDuration, setSlotDuration] = useState(15);
  const [sessions, setSessions] = useState([
    { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
    { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
  ]);
  const [breaks, setBreaks] = useState([
    { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
  ]);

  // Query doctors database registry
  const { data: dbDoctorsResponse, isLoading } = useUsersQuery({ limit: 100, role: 'Doctor' });
  const dbDoctors = dbDoctorsResponse?.data?.users || [];

  const handleDoctorSelectChange = (docId) => {
    setSelectedDocId(docId);
    const doc = dbDoctors.find(d => d._id === docId);
    if (doc && doc.schedule) {
      setWorkingDays(doc.schedule.workingDays || []);
      setSlotDuration(doc.schedule.slotDuration || 15);
      setSessions(doc.schedule.sessions || []);
      setBreaks(doc.schedule.breaks || []);
    } else {
      setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      setSlotDuration(15);
      setSessions([
        { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
        { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
      ]);
      setBreaks([
        { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
      ]);
    }
  };

  const handleWorkingDayToggle = (day) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSessionFieldChange = (index, field, value) => {
    setSessions(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: value } : s));
  };

  const addSession = () => {
    setSessions(prev => [...prev, { name: 'New Session', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSession = (index) => {
    setSessions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleBreakFieldChange = (index, field, value) => {
    setBreaks(prev => prev.map((b, idx) => idx === index ? { ...b, [field]: value } : b));
  };

  const addBreak = () => {
    setBreaks(prev => [...prev, { name: 'New Break', startTime: '12:00', endTime: '13:00' }]);
  };

  const removeBreak = (index) => {
    setBreaks(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSchedule = (e) => {
    e.preventDefault();
    if (!selectedDocId) {
      addToast('Please select a doctor', 'error');
      return;
    }

    updateScheduleMutation.mutate({
      id: selectedDocId,
      scheduleData: { workingDays, slotDuration, sessions, breaks }
    }, {
      onSuccess: () => {
        addToast('Doctor schedule updated successfully!', 'success');
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to update schedule', 'error');
      }
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
      
      {/* Configuration Form panel */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Edit size={20} style={{ color: 'var(--primary)' }} />
          Configure Doctor Schedule
        </h2>
        <form onSubmit={handleUpdateSchedule}>
          <div className="form-group">
            <label>Select Clinical Doctor</label>
            <select 
              className="form-input" 
              style={{ paddingLeft: '1rem' }} 
              value={selectedDocId} 
              onChange={(e) => handleDoctorSelectChange(e.target.value)} 
              required
            >
              <option value="">-- Choose Doctor --</option>
              {dbDoctors.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.name}</option>
              ))}
            </select>
          </div>

          {selectedDocId && (
            <>
              {/* Working Days */}
              <div className="form-group">
                <label>Working Days</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input 
                        type="checkbox" 
                        checked={workingDays.includes(day)} 
                        onChange={() => handleWorkingDayToggle(day)} 
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              {/* Slot Duration */}
              <div className="form-group">
                <label>Slot Duration (Minutes)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: '1rem' }} 
                  value={slotDuration} 
                  onChange={(e) => setSlotDuration(parseInt(e.target.value) || 15)} 
                  min="5" 
                  max="120"
                  required
                />
              </div>

              {/* Sessions */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Working Sessions</span>
                  <button 
                    type="button" 
                    onClick={addSession} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', border: 'none' }}
                  >
                    + Add Session
                  </button>
                </label>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sessions.map((sess, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ flex: 1.2, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                        placeholder="Session Name (e.g. Morning)" 
                        value={sess.name} 
                        onChange={(e) => handleSessionFieldChange(idx, 'name', e.target.value)}
                        required
                      />
                      <input 
                        type="time" 
                        className="form-input" 
                        style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                        value={sess.startTime} 
                        onChange={(e) => handleSessionFieldChange(idx, 'startTime', e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>to</span>
                      <input 
                        type="time" 
                        className="form-input" 
                        style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                        value={sess.endTime} 
                        onChange={(e) => handleSessionFieldChange(idx, 'endTime', e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => removeSession(idx)} 
                        style={{ border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breaks */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Break Timings</span>
                  <button 
                    type="button" 
                    onClick={addBreak} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', border: 'none' }}
                  >
                    + Add Break
                  </button>
                </label>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {breaks.map((brk, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ flex: 1.2, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                        placeholder="Break Name (e.g. Lunch)" 
                        value={brk.name} 
                        onChange={(e) => handleBreakFieldChange(idx, 'name', e.target.value)}
                        required
                      />
                      <input 
                        type="time" 
                        className="form-input" 
                        style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                        value={brk.startTime} 
                        onChange={(e) => handleBreakFieldChange(idx, 'startTime', e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>to</span>
                      <input 
                        type="time" 
                        className="form-input" 
                        style={{ flex: 0.9, paddingLeft: '0.5rem', fontSize: '0.8rem', height: '32px' }} 
                        value={brk.endTime} 
                        onChange={(e) => handleBreakFieldChange(idx, 'endTime', e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => removeBreak(idx)} 
                        style={{ border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={updateScheduleMutation.isPending} 
                style={{ marginTop: '1.5rem' }}
              >
                {updateScheduleMutation.isPending ? 'Saving Schedule...' : 'Save Schedule Settings'}
              </button>
            </>
          )}
        </form>
      </div>

      {/* Current Active doctor shifts list panel */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
          Active Doctor Shifts
        </h2>
        
        {isLoading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading active Shifts rotations...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dbDoctors.map(doc => (
              <div key={doc._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--primary)' }}>{doc.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Email: {doc.email}</p>
                
                {doc.schedule ? (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div>
                      <strong>Working Days:</strong> {doc.schedule.workingDays?.join(', ') || 'None'}
                    </div>
                    <div>
                      <strong>Slot Duration:</strong> {doc.schedule.slotDuration} minutes
                    </div>
                    {doc.schedule.sessions?.length > 0 && (
                      <div>
                        <strong>Sessions:</strong>
                        <ul style={{ margin: '0.25rem 0 0 1rem', paddingLeft: 0, listStyle: 'circle' }}>
                          {doc.schedule.sessions.map((s, i) => (
                            <li key={i}>{s.name}: {s.startTime} - {s.endTime}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {doc.schedule.breaks?.length > 0 && (
                      <div>
                        <strong>Breaks:</strong>
                        <ul style={{ margin: '0.25rem 0 0 1rem', paddingLeft: 0, listStyle: 'circle', color: 'var(--warning)' }}>
                          {doc.schedule.breaks.map((b, i) => (
                            <li key={i}>{b.name}: {b.startTime} - {b.endTime}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No schedule configured</p>
                )}
              </div>
            ))}
            {dbDoctors.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No clinical doctors registered.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
