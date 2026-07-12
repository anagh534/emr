import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUsersQuery } from '../features/users/hooks/useUsers';
import { useAppointmentsQuery } from '../features/appointments/hooks/useAppointments';
import { Sidebar } from '../components/Sidebar';
import { StaffRegistry } from '../features/users/components/StaffRegistry';
import { DoctorScheduleConfig } from '../features/users/components/DoctorScheduleConfig';
import { PatientDirectory } from '../features/patients/components/PatientDirectory';
import { AppointmentScheduler } from '../features/appointments/components/AppointmentScheduler';
import { AppointmentsRegistry } from '../features/appointments/components/AppointmentsRegistry';
import { DoctorAppointmentsQueue } from '../features/appointments/components/DoctorAppointmentsQueue';
import { DoctorConsultations } from '../features/appointments/components/DoctorConsultations';
import { ProfileSettings } from '../components/ProfileSettings';
import { useLogout } from '../features/auth/hooks/useAuth';
import { AuditLogsRegistry } from '../features/audit/components/AuditLogsRegistry';

import { 
  Activity, 
  Users, 
  Calendar, 
  Server, 
  ShieldCheck, 
  Database, 
  UserCheck, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

/**
 * Main EMR Dashboard Coordinator - acts as role router and mounts split feature components
 */
export default function Dashboard({ user }) {
  const queryClient = useQueryClient();

  // Determine initial active tab based on role
  const getInitialTab = () => {
    if (user.role === 'Super Admin') return 'overview';
    if (user.role === 'Receptionist') return 'overview';
    if (user.role === 'Doctor') return 'overview';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'System Overview Dashboard';
      case 'staff':
        return 'Clinical Staff Registry';
      case 'schedules':
        return 'Doctor Schedules Configurator';
      case 'appointments':
        return 'Clinical Appointments Registry';
      case 'patients':
        return 'Patients Search Registry';
      case 'appointments_mgmt':
        return 'Appointment Scheduler & Bookings';
      case 'my_appointments':
        return 'My Scheduled Queue';
      case 'consultations':
        return 'Diagnosis & Consultations';
      case 'profile':
        return 'My Profile Settings';
      default:
        return 'Clinical Operations Panel';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Monitor real-time clinical statistics, queue status, and system metrics.';
      case 'staff':
        return 'Manage, audit, and configure user accounts for clinic staff.';
      case 'schedules':
        return 'Configure working days, session timings, slot durations, and break timings for doctors.';
      case 'appointments':
        return 'Audit, cancel, and update scheduled appointment states across all departments.';
      case 'patients':
        return 'Search patient records, contact info, and medical histories.';
      case 'appointments_mgmt':
        return 'Schedule appointments, register arrivals, and check slot availability.';
      case 'my_appointments':
        return 'Inspect patients waiting in your queue and review clinical notes.';
      case 'consultations':
        return 'Record symptom diagnoses, prescriptions, and consult logs.';
      case 'profile':
        return 'View account details and change your password.';
      default:
        return 'EMR Clinical Management System';
    }
  };

  const getTodayDateString = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Queries for dynamic stats metrics in overview dashboard tabs
  const { data: usersResponse } = useUsersQuery({ limit: 1 });
  const { data: appointmentsResponse } = useAppointmentsQuery({ limit: 100 });
  const allAppts = appointmentsResponse?.data?.appointments || [];

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Render sub-sections based on active tab and security level
  const renderSuperAdminTab = () => {
    if (activeTab === 'overview') {
      const activeApptsCount = allAppts.filter(a => a.status === 'Scheduled' || a.status === 'Arrived').length;
      
      const deptCounts = allAppts.reduce((acc, appt) => {
        const dept = appt.department || 'General Medicine';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});

      const statusCounts = allAppts.reduce((acc, appt) => {
        const status = appt.status || 'Scheduled';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const departmentsList = [
        { name: 'General Medicine', color: '#3b82f6' },
        { name: 'Diagnostic Medicine', color: '#10b981' },
        { name: 'Cardiology', color: '#ec4899' },
        { name: 'Immunology', color: '#f59e0b' }
      ];

      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Total Staff</h3>
                <div className="value">{usersResponse?.data?.totalCount || 0}</div>
              </div>
              <div className="stats-icon">
                <Users size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>All Appointments</h3>
                <div className="value">{allAppts.length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--primary)' }}>
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Active Bookings</h3>
                <div className="value">{activeApptsCount}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Department Workload Distribution Chart */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-title)', fontSize: '1.1rem' }}>
                <Database size={18} style={{ color: 'var(--primary)' }} />
                Department Workload Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {departmentsList.map(d => {
                  const count = deptCounts[d.name] || 0;
                  const pct = allAppts.length ? Math.round((count / allAppts.length) * 100) : 0;
                  return (
                    <div key={d.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 500 }}>{d.name}</span>
                        <span style={{ fontWeight: 600, color: d.color }}>{count} bookings ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${pct || 4}%`, 
                          height: '100%', 
                          background: d.color, 
                          boxShadow: `0 0 8px ${d.color}aa`, 
                          borderRadius: '3px', 
                          transition: 'width 0.5s ease-out' 
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appointment Status Analysis Widget */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-title)', fontSize: '1.1rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                Appointment Status Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Scheduled', count: statusCounts['Scheduled'] || 0, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.12)' },
                  { label: 'Arrived', count: statusCounts['Arrived'] || 0, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.12)' },
                  { label: 'Completed', count: statusCounts['Completed'] || 0, color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.12)' },
                  { label: 'Cancelled', count: statusCounts['Cancelled'] || 0, color: '#ef4848', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.12)' }
                ].map(s => {
                  const pct = allAppts.length ? Math.round((s.count / allAppts.length) * 100) : 0;
                  return (
                    <div 
                      key={s.label} 
                      style={{ 
                        padding: '0.85rem 1rem', 
                        background: s.bg, 
                        border: `1px solid ${s.border}`, 
                        borderRadius: 'var(--radius-md)', 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '0.2rem' 
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: s.color }}>{s.count}</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{pct}% of all bookings</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'staff') {
      return <StaffRegistry currentUser={user} />;
    }
    if (activeTab === 'schedules') {
      return <DoctorScheduleConfig />;
    }
    if (activeTab === 'appointments') {
      return <AppointmentsRegistry />;
    }
    if (activeTab === 'audit_logs') {
      return <AuditLogsRegistry />;
    }
  };

  const renderReceptionistTab = () => {
    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Today's Bookings</h3>
                <div className="value">{allAppts.length}</div>
              </div>
              <div className="stats-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Arrived (Waiting)</h3>
                <div className="value">{allAppts.filter(a => a.status === 'Arrived').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Scheduled Sessions</h3>
                <div className="value">{allAppts.filter(a => a.status === 'Scheduled').length}</div>
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
      return <PatientDirectory />;
    }

    if (activeTab === 'appointments_mgmt') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <AppointmentScheduler />
          <AppointmentsRegistry />
        </div>
      );
    }
  };

  const renderDoctorTab = () => {
    const docAppts = allAppts.filter(a => a.doctor?.name === user.name);

    if (activeTab === 'overview') {
      return (
        <>
          <div className="dashboard-grid">
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>My Schedule Queue</h3>
                <div className="value">{docAppts.length}</div>
              </div>
              <div className="stats-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Checked In (Waiting)</h3>
                <div className="value">{docAppts.filter(a => a.status === 'Arrived').length}</div>
              </div>
              <div className="stats-icon" style={{ color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>
            <div className="glass-card stats-card">
              <div className="stats-info">
                <h3>Completed Consults</h3>
                <div className="value">{docAppts.filter(a => a.status === 'Completed').length}</div>
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
      return <DoctorAppointmentsQueue currentUser={user} />;
    }

    if (activeTab === 'consultations') {
      return <DoctorConsultations currentUser={user} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Panel */}
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* Main Panel Content Area */}
      <main className="main-content">
        <header className="header-dashboard" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <h1 className="welcome-title" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {getPageTitle()}
            </h1>
            <p className="welcome-subtitle" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {getPageSubtitle()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              padding: '0.5rem 0.85rem', 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500
            }}>
              <Calendar size={14} style={{ color: 'var(--primary)' }} />
              {getTodayDateString()}
            </div>
          </div>
        </header>

        {/* Active Tab Router */}
        {activeTab === 'profile' ? (
          <ProfileSettings user={user} />
        ) : (
          <>
            {user.role === 'Super Admin' && renderSuperAdminTab()}
            {user.role === 'Receptionist' && renderReceptionistTab()}
            {user.role === 'Doctor' && renderDoctorTab()}
          </>
        )}
      </main>
    </div>
  );
}
