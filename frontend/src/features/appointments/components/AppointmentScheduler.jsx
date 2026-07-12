import React, { useState, useEffect } from 'react';
import { useUsersQuery } from '../../users/hooks/useUsers';
import { useSearchPatientsQuery } from '../../patients/hooks/usePatients';
import { useAppointmentsQuery, useCreateAppointment } from '../hooks/useAppointments';
import { useToast } from '../../../context/ToastContext';
import { PlusCircle, Search, Clock, Calendar, CheckCircle2 } from 'lucide-react';

/**
 * Appointment Booking Gate & Slots Scheduler panel
 */
export function AppointmentScheduler() {
  const { addToast } = useToast();
  const createAppointmentMutation = useCreateAppointment();

  // Booking states
  const [patientType, setPatientType] = useState('Existing'); // 'Existing' or 'New'
  const [selectedPatientObj, setSelectedPatientObj] = useState(null);
  const [bookPatientSearch, setBookPatientSearch] = useState('');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);

  // New Patient Form States
  const [newPatName, setNewPatName] = useState('');
  const [newPatMobile, setNewPatMobile] = useState('');
  const [newPatAge, setNewPatAge] = useState('');
  const [newPatHistory, setNewPatHistory] = useState('');

  // Booking details
  const [bookDocId, setBookDocId] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookDate, setBookDate] = useState(new Date().toLocaleDateString('sv'));
  const [bookPurpose, setBookPurpose] = useState('');
  const [bookNotes, setBookNotes] = useState('');

  // Autocomplete patient search query
  const { data: patientSearchResponse } = useSearchPatientsQuery(bookPatientSearch);
  const patientSuggestions = patientSearchResponse?.data?.patients || [];

  // Query database doctors registry
  const { data: dbDoctorsResponse } = useUsersQuery({ limit: 100, role: 'Doctor', isActive: 'true' });
  const dbDoctors = dbDoctorsResponse?.data?.users || [];

  // Query booked slots for the selected doctor on the selected date to filter shift grid
  const selectedDoctorObjForBooking = dbDoctors.find(d => d._id === bookDocId);
  const { data: dayAppointmentsResponse } = useAppointmentsQuery({
    doctorSearch: selectedDoctorObjForBooking?.name,
    startDate: bookDate,
    endDate: bookDate,
    limit: 100
  });
  const bookedSlotsList = dayAppointmentsResponse?.data?.appointments?.map(a => a.timeSlot) || [];

  // Click outside to dismiss patient suggestions
  useEffect(() => {
    const handleDismiss = () => setShowPatientSuggestions(false);
    document.addEventListener('click', handleDismiss);
    return () => document.removeEventListener('click', handleDismiss);
  }, []);

  // Helper to generate dynamic slot options while omitting breaks and past time slots
  const generateSlotsForDoctor = (doctor) => {
    if (!doctor || !doctor.schedule) {
      return ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];
    }

    const { sessions, breaks, slotDuration } = doctor.schedule;
    const slots = [];

    const todayStr = new Date().toLocaleDateString('sv');
    const isToday = bookDate === todayStr;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const toMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const formatTime = (totalMin) => {
      let hrs = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      const formattedHrs = hrs < 10 ? `0${hrs}` : hrs;
      const formattedMins = mins < 10 ? `0${mins}` : mins;
      return `${formattedHrs}:${formattedMins} ${ampm}`;
    };

    const parsedBreaks = (breaks || []).map(b => ({
      start: toMinutes(b.startTime),
      end: toMinutes(b.endTime)
    }));

    (sessions || []).forEach(sess => {
      const sessionStart = toMinutes(sess.startTime);
      const sessionEnd = toMinutes(sess.endTime);

      for (let time = sessionStart; time + slotDuration <= sessionEnd; time += slotDuration) {
        // Skip past time slots if date is today
        if (isToday && time <= currentMin) {
          continue;
        }

        // Slot overlaps break if slot start is inside [brk.start, brk.end)
        // or if slot end is inside (brk.start, brk.end] or contains it
        const slotStart = time;
        const slotEnd = time + slotDuration;
        const inBreak = parsedBreaks.some(brk => {
          return (slotStart >= brk.start && slotStart < brk.end) || 
                 (slotEnd > brk.start && slotEnd <= brk.end) ||
                 (slotStart <= brk.start && slotEnd >= brk.end);
        });

        if (!inBreak) {
          slots.push(formatTime(time));
        }
      }
    });

    return slots.length > 0 ? slots : ['No slots available'];
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatientObj(patient);
    setBookPatientSearch(patient.name);
    setShowPatientSuggestions(false);
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();

    if (!bookDocId) {
      addToast('Please select a doctor', 'error');
      return;
    }
    if (!bookTime) {
      addToast('Please select an available time slot', 'error');
      return;
    }
    if (!bookPurpose) {
      addToast('Please provide a reason for the visit', 'error');
      return;
    }

    const payload = {
      doctorId: bookDocId,
      date: bookDate,
      timeSlot: bookTime,
      purpose: bookPurpose,
      notes: bookNotes
    };

    if (patientType === 'Existing') {
      if (!selectedPatientObj) {
        addToast('Please select an existing patient from suggestions', 'error');
        return;
      }
      payload.patientId = selectedPatientObj.patientId;
    } else {
      if (!newPatName || !newPatMobile || !newPatAge) {
        addToast('Please fill in new patient name, contact, and age', 'error');
        return;
      }
      payload.patientData = {
        name: newPatName,
        mobileNumber: newPatMobile,
        age: parseInt(newPatAge, 10),
        history: newPatHistory
      };
    }

    createAppointmentMutation.mutate(payload, {
      onSuccess: () => {
        addToast('Appointment booked successfully!', 'success');
        setBookPurpose('');
        setBookNotes('');
        setBookTime('');
        if (patientType === 'New') {
          setNewPatName('');
          setNewPatMobile('');
          setNewPatAge('');
          setNewPatHistory('');
        } else {
          setBookPatientSearch('');
          setSelectedPatientObj(null);
        }
      },
      onError: (err) => {
        addToast(err.response?.data?.message || 'Failed to book appointment', 'error');
      }
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
      
      {/* Left: Booking Form */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} style={{ color: 'var(--primary)' }} />
          Appointment Booking Gate
        </h2>

        {/* Patient selector switch */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            onClick={() => {
              setPatientType('Existing');
              setSelectedPatientObj(null);
              setBookPatientSearch('');
            }}
            className={`btn ${patientType === 'Existing' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', border: 'none' }}
          >
            Existing Patient
          </button>
          <button
            type="button"
            onClick={() => {
              setPatientType('New');
              setSelectedPatientObj(null);
              setBookPatientSearch('');
            }}
            className={`btn ${patientType === 'New' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', border: 'none' }}
          >
            New Patient
          </button>
        </div>

        <form onSubmit={handleBookAppointment}>
          {patientType === 'Existing' ? (
            /* Autocomplete selector */
            <div className="form-group" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <label>Search Existing Patient (Name, Mobile, or ID)</label>
              <div className="input-wrapper">
                <span className="input-icon" style={{ left: '0.75rem' }}>
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  placeholder="Type to search..."
                  value={bookPatientSearch}
                  onChange={(e) => {
                    setBookPatientSearch(e.target.value);
                    setShowPatientSuggestions(true);
                    if (selectedPatientObj) setSelectedPatientObj(null);
                  }}
                  required
                />
              </div>
              {showPatientSuggestions && patientSuggestions.length > 0 && (
                <ul
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    backgroundColor: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    zIndex: 60,
                    maxHeight: '130px',
                    overflowY: 'auto',
                    listStyle: 'none',
                    margin: '0.25rem 0 0 0',
                    padding: '0.15rem 0',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  {patientSuggestions.map(p => (
                    <li
                      key={p._id}
                      onClick={() => handleSelectPatient(p)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        fontSize: '0.775rem',
                        color: 'var(--text-main)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <strong>{p.name}</strong> ({p.mobileNumber}) - <span style={{ color: 'var(--primary)' }}>{p.patientId}</span>
                    </li>
                  ))}
                </ul>
              )}
              {selectedPatientObj && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} />
                  Linked to: {selectedPatientObj.name} ({selectedPatientObj.patientId})
                </div>
              )}
            </div>
          ) : (
            /* New Patient registration */
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary)' }}>Register New Patient Record</h4>
              <div className="form-group">
                <label>Patient Full Name</label>
                <input type="text" className="form-input" placeholder="Enter patient full name" value={newPatName} onChange={(e) => setNewPatName(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="text" className="form-input" placeholder="Enter mobile number" value={newPatMobile} onChange={(e) => setNewPatMobile(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" className="form-input" placeholder="Enter age" value={newPatAge} onChange={(e) => setNewPatAge(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Medical History Summary (Optional)</label>
                <input type="text" className="form-input" placeholder="Enter medical history summary (optional)" value={newPatHistory} onChange={(e) => setNewPatHistory(e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Consulting Doctor</label>
              <select className="form-input" style={{ paddingLeft: '1rem' }} value={bookDocId} onChange={(e) => {
                setBookDocId(e.target.value);
                setBookTime('');
              }} required>
                <option value="">-- Choose Doctor --</option>
                {dbDoctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.schedule?.department || 'General'})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Appointment Date</label>
              <input 
                type="date" 
                className="form-input" 
                style={{ paddingLeft: '1rem' }} 
                value={bookDate} 
                onChange={(e) => {
                  setBookDate(e.target.value);
                  setBookTime('');
                }} 
                min={new Date().toLocaleDateString('sv')}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Visit (Purpose)</label>
            <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="Enter reason for visit" value={bookPurpose} onChange={(e) => setBookPurpose(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Internal Consultation Notes (Optional)</label>
            <textarea className="form-input" style={{ padding: '0.5rem 1rem', minHeight: '50px' }} placeholder="Enter internal consultation notes (optional)" value={bookNotes} onChange={(e) => setBookNotes(e.target.value)} />
          </div>

          <button type="submit" disabled={createAppointmentMutation.isPending} className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
            {createAppointmentMutation.isPending ? 'Booking Slot...' : 'Book Schedule Appointment'}
          </button>
        </form>
      </div>

      {/* Right: Scheduler Available / Booked Grid Display */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} style={{ color: 'var(--primary)' }} />
          Appointment Scheduler
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          Select a doctor and date on the left to see slot availability. Slots are auto-generated based on shifts and exclude breaks and past timings.
        </p>

        {selectedDoctorObjForBooking ? (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <strong>Doctor Shift Profile:</strong> {selectedDoctorObjForBooking.name}
              <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                Slot Duration: {selectedDoctorObjForBooking.schedule?.slotDuration || 15} mins • 
                Sessions: {selectedDoctorObjForBooking.schedule?.sessions?.map(s => `${s.startTime}-${s.endTime}`).join(', ') || 'None'}
              </div>
            </div>

            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Shift Grid ({bookDate})
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              {generateSlotsForDoctor(selectedDoctorObjForBooking).map((slot, i) => {
                const isBooked = bookedSlotsList.includes(slot);
                const isSelected = bookTime === slot;

                if (slot === 'No slots available') {
                  return <div key={i} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', gridColumn: '1 / -1' }}>No active slots available for today's shift.</div>;
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setBookTime(slot)}
                    style={{
                      padding: '0.4rem 0.25rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                      background: isBooked ? 'rgba(239, 68, 68, 0.1)' : isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                      color: isBooked ? 'var(--error)' : isSelected ? '#000' : 'var(--text-secondary)',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      fontWeight: isSelected ? '600' : 'normal',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>{slot}</div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.8, marginTop: '0.1rem' }}>
                      {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <Calendar size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem' }}>Choose doctor to inspect slot rotations</p>
          </div>
        )}
      </div>

    </div>
  );
}
