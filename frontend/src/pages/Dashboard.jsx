import React, { useState } from 'react';
import { useLogout } from '../features/auth/hooks/useAuth';
import { 
  Activity, 
  LogOut, 
  User, 
  Users, 
  CheckSquare, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Server, 
  HardDrive, 
  Database,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

export default function Dashboard({ user }) {
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState('overview');

  // Simple state for mockup interactions
  const [patients, setPatients] = useState([
    { id: 1, name: 'John Doe', age: 42, reason: 'Hypertension Check', status: 'Checked In', room: '101' },
    { id: 2, name: 'Mary Jane', age: 29, reason: 'Asthma Follow-up', status: 'Waiting', room: 'Lounge' },
    { id: 3, name: 'Robert Smith', age: 65, reason: 'Blood Work Review', status: 'Scheduled', time: '11:30 AM' },
  ]);

  const [newPatient, setNewPatient] = useState({ name: '', age: '', reason: '', status: 'Checked In', room: 'Lounge' });

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.reason) return;

    setPatients([
      ...patients,
      {
        id: patients.length + 1,
        ...newPatient,
        age: parseInt(newPatient.age)
      }
    ]);
    setNewPatient({ name: '', age: '', reason: '', status: 'Checked In', room: 'Lounge' });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'U';
  };

  // Render role-specific dashboards
  const renderDoctorView = () => (
    <>
      {/* Stats row */}
      <div className="dashboard-grid">
        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Today's Appts</h3>
            <div className="value">{patients.length}</div>
          </div>
          <div className="stats-icon">
            <Calendar size={24} />
          </div>
        </div>

        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Pending Prescriptions</h3>
            <div className="value">3</div>
          </div>
          <div className="stats-icon" style={{ color: 'var(--warning)' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Checked In Patients</h3>
            <div className="value">
              {patients.filter(p => p.status === 'Checked In').length}
            </div>
          </div>
          <div className="stats-icon" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Primary Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Patient Queue */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} />
            Active Clinical Queue
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patients.map(patient => (
              <div key={patient.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{patient.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Age: {patient.age} • Reason: {patient.reason}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span className={`badge ${
                    patient.status === 'Checked In' ? 'badge-success' :
                    patient.status === 'Waiting' ? 'badge-warning' : 'badge-primary'
                  }`} style={{ background: patient.status === 'Scheduled' ? 'rgba(59, 130, 246, 0.1)' : undefined, color: patient.status === 'Scheduled' ? 'var(--secondary)' : undefined }}>
                    {patient.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {patient.room ? `Room ${patient.room}` : patient.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Checklist */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={20} style={{ color: 'var(--primary)' }} />
            Clinical Reminders
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>Sign diagnostic reports for yesterday's shifts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem' }}>Approve renewal of Lipitor prescription for Mary Jane</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem' }}>Review lab results for patient John Doe</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem' }}>Prepare notes for case consultation at 2:00 PM</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );

  const renderReceptionistView = () => (
    <>
      {/* Stats row */}
      <div className="dashboard-grid">
        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Registered Appointments</h3>
            <div className="value">18</div>
          </div>
          <div className="stats-icon">
            <Calendar size={24} />
          </div>
        </div>

        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Rooms Occupied</h3>
            <div className="value">5 / 8</div>
          </div>
          <div className="stats-icon" style={{ color: 'var(--primary)' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Lounge Queue</h3>
            <div className="value">
              {patients.filter(p => p.room === 'Lounge').length}
            </div>
          </div>
          <div className="stats-icon" style={{ color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Quick Check In Form */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} style={{ color: 'var(--primary)' }} />
            New Patient Arrival Check-In
          </h2>
          <form onSubmit={handleAddPatient}>
            <div className="form-group">
              <label htmlFor="pname">Patient Name</label>
              <input
                id="pname"
                type="text"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                placeholder="Elizabeth Bennet"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="page">Age</label>
                <input
                  id="page"
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="34"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="proom">Assign Room</label>
                <select
                  id="proom"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={newPatient.room}
                  onChange={(e) => setNewPatient({ ...newPatient, room: e.target.value })}
                >
                  <option value="Lounge">Lounge (Waiting)</option>
                  <option value="101">Room 101</option>
                  <option value="102">Room 102</option>
                  <option value="103">Room 103</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="preason">Chief Complaint / Reason</label>
              <input
                id="preason"
                type="text"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                placeholder="Routine health checkup"
                value={newPatient.reason}
                onChange={(e) => setNewPatient({ ...newPatient, reason: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
              Check-In Patient
            </button>
          </form>
        </div>

        {/* Current Checked In List */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} />
            Active Clinic Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patients.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <h4 style={{ fontWeight: 600 }}>{p.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Complaint: {p.reason}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success">{p.room === 'Lounge' ? 'Waiting' : 'Admitted'}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {p.room ? `Loc: ${p.room}` : p.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminView = () => (
    <>
      {/* Stats row */}
      <div className="dashboard-grid">
        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Server Node Health</h3>
            <div className="value" style={{ color: 'var(--success)' }}>Online</div>
          </div>
          <div className="stats-icon">
            <Server size={24} />
          </div>
        </div>

        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Database Load</h3>
            <div className="value">4.2 %</div>
          </div>
          <div className="stats-icon" style={{ color: 'var(--primary)' }}>
            <Database size={24} />
          </div>
        </div>

        <div className="glass-card stats-card">
          <div className="stats-info">
            <h3>Active Sessions</h3>
            <div className="value">8</div>
          </div>
          <div className="stats-icon">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Audit Log Terminal */}
        <div className="glass-card" style={{ fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            System Audit Monitor
          </h2>
          <div style={{ backgroundColor: 'black', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#10b981', minHeight: '180px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>[2026-07-12 08:00:12] INFO: Token generated for User doctor@emr.com</div>
            <div>[2026-07-12 08:02:15] WARN: Multiple refresh requests from client IP ::1 - throttled</div>
            <div>[2026-07-12 08:03:00] INFO: DB Health checked. Ping latency: 1.2ms</div>
            <div>[2026-07-12 08:04:18] INFO: New staff registered - role 'Receptionist' - ID: 60a5e...</div>
            <div style={{ color: 'var(--primary)', animation: 'pulse 1.5s infinite' }}>[MONITOR] Listening for active security webhooks... _</div>
          </div>
        </div>

        {/* System Config actions */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HardDrive size={20} style={{ color: 'var(--primary)' }} />
            Administrative Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <Users size={20} />
              <span style={{ fontSize: '0.85rem' }}>Review Users</span>
            </button>
            <button className="btn btn-secondary" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <ShieldCheck size={20} />
              <span style={{ fontSize: '0.85rem' }}>Security Policy</span>
            </button>
            <button className="btn btn-secondary" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <Database size={20} />
              <span style={{ fontSize: '0.85rem' }}>DB Backups</span>
            </button>
            <button className="btn btn-secondary" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <HelpCircle size={20} />
              <span style={{ fontSize: '0.85rem' }}>View Metrics</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

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
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`nav-link btn-block ${activeTab === 'overview' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                <Activity size={18} />
                Overview
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('patients')} 
                className={`nav-link btn-block ${activeTab === 'patients' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                <Users size={18} />
                Staff Directory
              </button>
            </li>
          </ul>
        </div>

        {/* User Card inside Sidebar */}
        {user && (
          <div className="user-profile-badge">
            <div className="avatar">
              {getInitials(user.name)}
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
              Welcome back, {user?.name || 'Staff'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Access Level: <span className="badge badge-success" style={{ marginLeft: '0.25rem' }}>{user?.role}</span>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            disabled={logoutMutation.isPending}
            style={{ padding: '0.5rem 1rem' }}
          >
            <LogOut size={16} />
            {logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}
          </button>
        </header>

        {activeTab === 'overview' ? (
          user?.role === 'Doctor' ? renderDoctorView() :
          user?.role === 'Receptionist' ? renderReceptionistView() :
          renderAdminView()
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Users size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.7 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Staff Directory</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              Access restricted. The clinical registry list and active shift roster requires verified HIPAA Admin credentials.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
