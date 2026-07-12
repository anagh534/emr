import React from 'react';
import { 
  Activity, 
  UserPlus, 
  Clock, 
  Calendar, 
  Users, 
  Clipboard, 
  LogOut,
  User
} from 'lucide-react';

/**
 * Sidebar Navigation Panel - dynamically adjusts navigation links based on user roles
 */
export function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  return (
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
            >
              <Activity size={18} />
              Overview
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`nav-link btn-block ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={18} />
              Profile Settings
            </button>
          </li>

          {/* Super Admin Menu */}
          {user.role === 'Super Admin' && (
            <>
              <li>
                <button 
                  onClick={() => setActiveTab('staff')} 
                  className={`nav-link btn-block ${activeTab === 'staff' ? 'active' : ''}`}
                >
                  <UserPlus size={18} />
                  Staff Registry
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('schedules')} 
                  className={`nav-link btn-block ${activeTab === 'schedules' ? 'active' : ''}`}
                >
                  <Clock size={18} />
                  Doctor Schedules
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('appointments')} 
                  className={`nav-link btn-block ${activeTab === 'appointments' ? 'active' : ''}`}
                >
                  <Calendar size={18} />
                  Appointments
                </button>
              </li>
            </>
          )}

          {/* Receptionist Menu */}
          {user.role === 'Receptionist' && (
            <>
              <li>
                <button 
                  onClick={() => setActiveTab('patients')} 
                  className={`nav-link btn-block ${activeTab === 'patients' ? 'active' : ''}`}
                >
                  <Users size={18} />
                  Search Patients
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('appointments_mgmt')} 
                  className={`nav-link btn-block ${activeTab === 'appointments_mgmt' ? 'active' : ''}`}
                >
                  <Calendar size={18} />
                  Book Scheduler
                </button>
              </li>
            </>
          )}

          {/* Doctor Menu */}
          {user.role === 'Doctor' && (
            <>
              <li>
                <button 
                  onClick={() => setActiveTab('my_appointments')} 
                  className={`nav-link btn-block ${activeTab === 'my_appointments' ? 'active' : ''}`}
                >
                  <Calendar size={18} />
                  My Appointments
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('consultations')} 
                  className={`nav-link btn-block ${activeTab === 'consultations' ? 'active' : ''}`}
                >
                  <Clipboard size={18} />
                  Consultations
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div className="info">
            <span className="name">{user.name}</span>
            <span className="role">{user.role}</span>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
