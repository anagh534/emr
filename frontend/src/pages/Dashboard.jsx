import React, { useState } from 'react';
import { useLogout, useCreateStaff } from '../features/auth/hooks/useAuth';
import { 
  Activity, 
  LogOut, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Server, 
  Database,
  PlusCircle,
  Search,
  UserPlus,
  Edit,
  Clipboard,
  CalendarDays,
  UserCheck
} from 'lucide-react';

export default function Dashboard({ user }) {
  const logoutMutation = useLogout();
  const createStaffMutation = useCreateStaff();

  // Role-specific initial tabs
  const getInitialTab = () => {
    if (user.role === 'Super Admin') return 'overview';
    if (user.role === 'Receptionist') return 'overview';
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Database mock state (represents backend entities for RBAC actions)
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. Gregory House', email: 'house@emr.com', department: 'Diagnostic Medicine', schedule: 'Mon - Wed, 09:00 AM - 05:00 PM' },
    { id: 2, name: 'Dr. Allison Cameron', email: 'cameron@emr.com', department: 'Immunology', schedule: 'Thu - Fri, 08:00 AM - 04:00 PM' },
  ]);

  const [receptionists, setReceptionists] = useState([
    { id: 3, name: 'Jane Doe', email: 'jane@emr.com' }
  ]);

  const [patients, setPatients] = useState([
    { id: 101, name: 'John Doe', age: 42, history: 'Hypertension, Type 2 Diabetes', contact: '+1-555-0199' },
    { id: 102, name: 'Mary Jane', age: 29, history: 'Mild Asthma', contact: '+1-555-0144' },
    { id: 103, name: 'Robert Smith', age: 65, history: 'Coronary Artery Disease', contact: '+1-555-0188' },
  ]);

  const [appointments, setAppointments] = useState([
    { id: 201, patientName: 'John Doe', age: 42, reason: 'Hypertension Check', status: 'Checked In', room: '101', doctorId: 1, time: '09:00 AM', date: '2026-07-12', notes: 'Blood pressure is 140/90. Suggested low sodium diet.' },
    { id: 202, patientName: 'Mary Jane', age: 29, reason: 'Asthma Follow-up', status: 'Waiting', room: 'Lounge', doctorId: 1, time: '10:30 AM', date: '2026-07-12', notes: 'Albuterol inhaler usage monitored.' },
    { id: 203, patientName: 'Robert Smith', age: 65, reason: 'Blood Work Review', status: 'Scheduled', room: 'None', doctorId: 2, time: '11:30 AM', date: '2026-07-12', notes: '' },
  ]);

  // Form states
  // Super Admin: Create Staff
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('Doctor');
  const [staffDepartment, setStaffDepartment] = useState('Diagnostic Medicine');
  const [staffMessage, setStaffMessage] = useState({ text: '', type: '' });

  // Super Admin: Edit Doctor Schedules
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
  const [newScheduleText, setNewScheduleText] = useState('Mon - Wed, 09:00 AM - 05:00 PM');

  // Receptionist: Patient Search
  const [searchQuery, setSearchQuery] = useState('');

  // Receptionist: Book Appointment
  const [bookName, setBookName] = useState('');
  const [bookAge, setBookAge] = useState('');
  const [bookReason, setBookReason] = useState('');
  const [bookDocId, setBookDocId] = useState(1);
  const [bookTime, setBookTime] = useState('09:00 AM');

  // Doctor: Select Patient & Edit Consultation Notes
  const [selectedApptId, setSelectedApptId] = useState(201);
  const [consultNotes, setConsultNotes] = useState('Blood pressure is 140/90. Suggested low sodium diet.');
  const [notesMessage, setNotesMessage] = useState('');

  // Find current logged in Doctor ID for filtering
  const currentDocId = user.email.includes('doctor') ? 1 : user.email.includes('cameron') ? 2 : 1;

  // Actions handlers
  const handleCreateStaff = (e) => {
    e.preventDefault();
    setStaffMessage({ text: '', type: '' });

    if (!staffName || !staffEmail || !staffPassword) {
      setStaffMessage({ text: 'Please fill in all staff fields', type: 'error' });
      return;
    }

    createStaffMutation.mutate(
      { name: staffName, email: staffEmail, password: staffPassword, role: staffRole },
      {
        onSuccess: (res) => {
          setStaffMessage({ text: `Account created successfully for ${staffName} (${staffRole})`, type: 'success' });
          
          if (staffRole === 'Doctor') {
            setDoctors([
              ...doctors,
              { id: doctors.length + 5, name: staffName, email: staffEmail, department: staffDepartment, schedule: 'Not Assigned' }
            ]);
          } else {
            setReceptionists([
              ...receptionists,
              { id: receptionists.length + 5, name: staffName, email: staffEmail }
            ]);
          }

          // reset inputs
          setStaffName('');
          setStaffEmail('');
          setStaffPassword('');
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'Error creating staff. Email may already exist.';
          setStaffMessage({ text: msg, type: 'error' });
        }
      }
    );
  };

  const handleUpdateSchedule = (e) => {
    e.preventDefault();
    setDoctors(doctors.map(doc => doc.id === parseInt(selectedDoctorId) ? { ...doc, schedule: newScheduleText } : doc));
    alert('Doctor schedule updated successfully!');
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (!bookName || !bookAge || !bookReason) return;

    const newAppt = {
      id: appointments.length + 201,
      patientName: bookName,
      age: parseInt(bookAge),
      reason: bookReason,
      status: 'Scheduled',
      room: 'None',
      doctorId: parseInt(bookDocId),
      time: bookTime,
      date: '2026-07-12',
      notes: ''
    };

    setAppointments([...appointments, newAppt]);
    
    // Add to patients list if new
    if (!patients.some(p => p.name.toLowerCase() === bookName.toLowerCase())) {
      setPatients([
        ...patients,
        { id: patients.length + 101, name: bookName, age: parseInt(bookAge), history: 'No records', contact: '+1-555-0100' }
      ]);
    }

    setBookName('');
    setBookAge('');
    setBookReason('');
    alert(`Appointment booked successfully for ${bookName} at ${bookTime}!`);
  };

  const handleMarkArrived = (apptId) => {
    setAppointments(appointments.map(appt => 
      appt.id === apptId ? { ...appt, status: 'Checked In', room: '101' } : appt
    ));
  };

  const handleUpdateNotes = (e) => {
    e.preventDefault();
    setAppointments(appointments.map(appt => 
      appt.id === selectedApptId ? { ...appt, notes: consultNotes } : appt
    ));
    setNotesMessage('Consultation notes updated successfully!');
    setTimeout(() => setNotesMessage(''), 3000);
  };

  // Render sub-components based on Tab selection
  const renderSuperAdminTab = () => {
    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Total Staff</h3>
                <div className="value">{doctors.length + receptionists.length}</div>
              </div>
              <div className="stats-icon">
                <Users size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>All Appointments</h3>
                <div className="value">{appointments.length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--primary)' }}>
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Server Load</h3>
                <div className="value">3.8%</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--success)' }}>
                <Server size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                Administrative Access: All Dashboards
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                As a Super Admin, you have unified authorization. You can bypass authorization scopes to view clinical queues, modify active registers, and monitor real-time databases.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setActiveTab('staff')} className="btn btn-primary">Manage Staff</button>
                <button onClick={() => setActiveTab('appointments')} className="btn btn-secondary">Review Appointments</button>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} style={{ color: 'var(--primary)' }} />
                Database Monitor
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mongoose Models</span>
                  <span>User, RefreshToken, Patient, Appointment</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Super Admin Seeder</span>
                  <span style={{ color: 'var(--success)' }}>Active (Seed on startup)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>API Request Latency</span>
                  <span>34ms (Standard)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'staff') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* Create Staff Form */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={20} style={{ color: 'var(--primary)' }} />
              Create Clinical Staff Accounts
            </h2>

            {staffMessage.text && (
              <div className={staffMessage.type === 'success' ? 'badge-success' : 'badge-error'} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', width: '100%' }}>
                {staffMessage.text}
              </div>
            )}

            <form onSubmit={handleCreateStaff}>
              <div className="form-group">
                <label>Staff Role</label>
                <select className="form-input" style={{ paddingLeft: '1rem' }} value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                  <option value="Doctor">Doctor (Clinical Access)</option>
                  <option value="Receptionist">Receptionist (Administrative Access)</option>
                </select>
              </div>

              {staffRole === 'Doctor' && (
                <div className="form-group">
                  <label>Department</label>
                  <select className="form-input" style={{ paddingLeft: '1rem' }} value={staffDepartment} onChange={(e) => setStaffDepartment(e.target.value)}>
                    <option value="Diagnostic Medicine">Diagnostic Medicine</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="Dr. James Wilson" value={staffName} onChange={(e) => setStaffName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="wilson@emr.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Security Password</label>
                <input type="password" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="••••••••" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={createStaffMutation.isPending} style={{ marginTop: '1rem' }}>
                {createStaffMutation.isPending ? 'Registering Staff...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Active Staff List */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: 'var(--primary)' }} />
              Active Staff Directory
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem' }}>Doctors</h3>
              {doctors.map(doc => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{doc.email}</p>
                  </div>
                  <span className="badge badge-success" style={{ alignSelf: 'center' }}>{doc.department}</span>
                </div>
              ))}

              <h3 style={{ fontSize: '0.95rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem', marginTop: '1rem' }}>Receptionists</h3>
              {receptionists.map(rec => (
                <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rec.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{rec.email}</p>
                  </div>
                  <span className="badge badge-warning" style={{ alignSelf: 'center' }}>Receptionist</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'schedules') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* Edit Schedule Form */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={20} style={{ color: 'var(--primary)' }} />
              Manage Doctor Schedules
            </h2>
            <form onSubmit={handleUpdateSchedule}>
              <div className="form-group">
                <label>Select Clinical Doctor</label>
                <select className="form-input" style={{ paddingLeft: '1rem' }} value={selectedDoctorId} onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  const doc = doctors.find(d => d.id === parseInt(e.target.value));
                  if (doc) setNewScheduleText(doc.schedule);
                }}>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} ({doc.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Schedule Shift / Hours</label>
                <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} value={newScheduleText} onChange={(e) => setNewScheduleText(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                Update Schedule Shift
              </button>
            </form>
          </div>

          {/* Current Schedules Display */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
              Shift Rotations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {doctors.map(doc => (
                <div key={doc.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontWeight: 600, color: 'var(--primary)' }}>{doc.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Department: {doc.department}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <Clock size={14} style={{ color: 'var(--warning)' }} />
                    <span>{doc.schedule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'appointments') {
      return (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            View All Clinic Appointments
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Reason</th>
                  <th style={{ padding: '0.75rem' }}>Assigned Doctor</th>
                  <th style={{ padding: '0.75rem' }}>Time</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Location/Room</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => {
                  const doc = doctors.find(d => d.id === appt.doctorId);
                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{appt.patientName} (Age {appt.age})</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{appt.reason}</td>
                      <td style={{ padding: '0.75rem' }}>{doc ? doc.name : 'Unknown'}</td>
                      <td style={{ padding: '0.75rem' }}>{appt.time}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${
                          appt.status === 'Checked In' ? 'badge-success' :
                          appt.status === 'Waiting' ? 'badge-warning' : 'badge-primary'
                        }`} style={{ background: appt.status === 'Scheduled' ? 'rgba(59,130,246,0.1)' : undefined, color: appt.status === 'Scheduled' ? 'var(--secondary)' : undefined }}>
                          {appt.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{appt.room}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  const renderReceptionistTab = () => {
    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Today's Registrations</h3>
                <div className="value">{appointments.length}</div>
              </div>
              <div className="stats-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Waiting in Lounge</h3>
                <div className="value">{appointments.filter(a => a.room === 'Lounge' || a.status === 'Waiting').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Checked In</h3>
                <div className="value">{appointments.filter(a => a.status === 'Checked In').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} style={{ color: 'var(--primary)' }} />
                Administrative Gate: Booking Operations
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You have Receptionist permissions. You can register new patient arrivals, search patient records, update scheduled rooms, and mark patients as arrived for clinical consultation.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setActiveTab('patients')} className="btn btn-primary">Search Patients</button>
                <button onClick={() => setActiveTab('appointments_mgmt')} className="btn btn-secondary">Manage Appointments</button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'patients') {
      const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.history.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        <div className="glass-card">
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
                placeholder="Search patient name, medical history..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Age</th>
                  <th style={{ padding: '0.75rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem' }}>Medical History Summary</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '0.75rem' }}>{p.age}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.contact}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{p.history}</td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No patients found matching query
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'appointments_mgmt') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* Booking Form */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} style={{ color: 'var(--primary)' }} />
              Book Appointments
            </h2>

            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label>Patient Full Name</label>
                <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="Elizabeth Bennet" value={bookName} onChange={(e) => setBookName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="34" value={bookAge} onChange={(e) => setBookAge(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <select className="form-input" style={{ paddingLeft: '1rem' }} value={bookTime} onChange={(e) => setBookTime(e.target.value)}>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Consulting Doctor</label>
                <select className="form-input" style={{ paddingLeft: '1rem' }} value={bookDocId} onChange={(e) => setBookDocId(e.target.value)}>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Reason for Visit</label>
                <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} placeholder="Chronic cough review" value={bookReason} onChange={(e) => setBookReason(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                Book Schedule
              </button>
            </form>
          </div>

          {/* List of Appointments & Toggles */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} style={{ color: 'var(--primary)' }} />
              Manage Booked Appointments
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.map(appt => (
                <div key={appt.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{appt.patientName}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      Reason: {appt.reason} • Time: {appt.time}
                    </p>
                    <div style={{ marginTop: '0.4rem' }}>
                      <span className={`badge ${appt.status === 'Checked In' ? 'badge-success' : 'badge-warning'}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>

                  {appt.status === 'Scheduled' && (
                    <button 
                      onClick={() => handleMarkArrived(appt.id)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem' }}
                    >
                      <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                      Mark Arrived
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  const renderDoctorTab = () => {
    // Filter appointments: Doctor can only view their own appointments
    const myAppts = appointments.filter(appt => appt.doctorId === currentDocId);

    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>My Schedule Queue</h3>
                <div className="value">{myAppts.length}</div>
              </div>
              <div className="stats-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Checked In (Waiting)</h3>
                <div className="value">{myAppts.filter(a => a.status === 'Checked In' || a.status === 'Waiting').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Completed Notes</h3>
                <div className="value">{myAppts.filter(a => a.notes !== '').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} style={{ color: 'var(--primary)' }} />
                Clinical Sandbox: HIPAA Scopes
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You have Doctor credentials. Under HIPAA rules, you can only view patient information and appointment listings mapped specifically to your profile. You are authorized to update consultation files.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setActiveTab('my_appointments')} className="btn btn-primary">My Queue</button>
                <button onClick={() => setActiveTab('consultations')} className="btn btn-secondary">Update Notes</button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'my_appointments') {
      return (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            My Appointment Queue (Role Protected)
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem' }}>Age</th>
                  <th style={{ padding: '0.75rem' }}>Reason</th>
                  <th style={{ padding: '0.75rem' }}>Time</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Active Consult Notes</th>
                </tr>
              </thead>
              <tbody>
                {myAppts.map(appt => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{appt.patientName}</td>
                    <td style={{ padding: '0.75rem' }}>{appt.age}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{appt.reason}</td>
                    <td style={{ padding: '0.75rem' }}>{appt.time}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${appt.status === 'Checked In' ? 'badge-success' : 'badge-warning'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {appt.notes ? appt.notes.substring(0, 30) + '...' : 'No notes written'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'consultations') {
      const activeAppt = appointments.find(a => a.id === selectedApptId);

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Select & Update Consultation Notes */}
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
                <select className="form-input" style={{ paddingLeft: '1rem' }} value={selectedApptId} onChange={(e) => {
                  setSelectedApptId(parseInt(e.target.value));
                  const appt = appointments.find(a => a.id === parseInt(e.target.value));
                  if (appt) setConsultNotes(appt.notes);
                }}>
                  {myAppts.map(appt => (
                    <option key={appt.id} value={appt.id}>{appt.patientName} - {appt.reason} ({appt.time})</option>
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

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                Save Consultation Notes
              </button>
            </form>
          </div>

          {/* View Patient Details (Doctor Permission) */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: 'var(--primary)' }} />
              HIPAA Patient Record File
            </h2>

            {activeAppt ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PATIENT</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{activeAppt.patientName}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Age: {activeAppt.age} • Contact: {patients.find(p => p.name === activeAppt.patientName)?.contact}</p>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CHIEF COMPLAINT</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{activeAppt.reason}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MEDICAL HISTORY</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {patients.find(p => p.name === activeAppt.patientName)?.history}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select an appointment in the form to view full patient files.</p>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <Activity size={26} />
            <span>EMR</span>
          </div>

          <ul className="nav-menu">
            <li>
              <button onClick={() => setActiveTab('overview')} className={`nav-link btn-block ${activeTab === 'overview' ? 'active' : ''}`}>
                <Activity size={18} />
                Overview
              </button>
            </li>

            {/* Super Admin specific menus */}
            {user.role === 'Super Admin' && (
              <>
                <li>
                  <button onClick={() => setActiveTab('staff')} className={`nav-link btn-block ${activeTab === 'staff' ? 'active' : ''}`}>
                    <UserPlus size={18} />
                    Staff Registry
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('schedules')} className={`nav-link btn-block ${activeTab === 'schedules' ? 'active' : ''}`}>
                    <Clock size={18} />
                    Doctor Schedules
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('appointments')} className={`nav-link btn-block ${activeTab === 'appointments' ? 'active' : ''}`}>
                    <Calendar size={18} />
                    All Appointments
                  </button>
                </li>
              </>
            )}

            {/* Receptionist specific menus */}
            {user.role === 'Receptionist' && (
              <>
                <li>
                  <button onClick={() => setActiveTab('patients')} className={`nav-link btn-block ${activeTab === 'patients' ? 'active' : ''}`}>
                    <Search size={18} />
                    Patient Registry
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('appointments_mgmt')} className={`nav-link btn-block ${activeTab === 'appointments_mgmt' ? 'active' : ''}`}>
                    <Calendar size={18} />
                    Book & Manage
                  </button>
                </li>
              </>
            )}

            {/* Doctor specific menus */}
            {user.role === 'Doctor' && (
              <>
                <li>
                  <button onClick={() => setActiveTab('my_appointments')} className={`nav-link btn-block ${activeTab === 'my_appointments' ? 'active' : ''}`}>
                    <Calendar size={18} />
                    My Appointments
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('consultations')} className={`nav-link btn-block ${activeTab === 'consultations' ? 'active' : ''}`}>
                    <Clipboard size={18} />
                    Consultations
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* User profile section */}
        {user && (
          <div className="user-profile-badge">
            <div className="avatar">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name" title={user.name}>{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Dashboard Panel */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>
              {activeTab === 'overview' ? 'EMR Command Center' : activeTab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Security Clearance: <span className="badge badge-success" style={{ marginLeft: '0.25rem' }}>{user.role}</span>
            </p>
          </div>

          <button
            onClick={() => logoutMutation.mutate()}
            className="btn btn-secondary"
            disabled={logoutMutation.isPending}
            style={{ padding: '0.5rem 1rem' }}
          >
            <LogOut size={16} />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </header>

        {user.role === 'Super Admin' && renderSuperAdminTab()}
        {user.role === 'Receptionist' && renderReceptionistTab()}
        {user.role === 'Doctor' && renderDoctorTab()}
      </main>
    </div>
  );
}
