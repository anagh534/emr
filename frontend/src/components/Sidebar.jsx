import React, { useState } from 'react';
import { 
  Activity, 
  UserPlus, 
  Clock, 
  Calendar, 
  Users, 
  Clipboard, 
  LogOut,
  User,
  History,
  Menu,
  X
} from 'lucide-react';

/**
 * Sidebar Navigation Panel - dynamically adjusts navigation links based on user roles
 * Fully responsive: includes a mobile hamburger toggle menu and sliding drawer.
 */
export function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false); // Close sidebar drawer on mobile after clicking
  };

  return (
    <>
      {/* Mobile Header (Visible only on mobile screens) */}
      <div className="mobile-header">
        <div className="sidebar-brand" style={{ marginBottom: 0 }}>
          <Activity size={24} />
          <span>EMR</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="mobile-toggle-btn"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div>
          {/* Brand header displayed only on desktop sidebar */}
          <div className="sidebar-header-desktop">
            <div className="sidebar-brand">
              <Activity size={26} />
              <span>EMR</span>
            </div>
          </div>

          <ul className="nav-menu">
            <li>
              <button 
                onClick={() => handleNavClick('overview')} 
                className={`nav-link btn-block ${activeTab === 'overview' ? 'active' : ''}`}
              >
                <Activity size={18} />
                Overview
              </button>
            </li>

            <li>
              <button 
                onClick={() => handleNavClick('profile')} 
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
                    onClick={() => handleNavClick('staff')} 
                    className={`nav-link btn-block ${activeTab === 'staff' ? 'active' : ''}`}
                  >
                    <UserPlus size={18} />
                    Staff Registry
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('schedules')} 
                    className={`nav-link btn-block ${activeTab === 'schedules' ? 'active' : ''}`}
                  >
                    <Clock size={18} />
                    Doctor Schedules
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('appointments')} 
                    className={`nav-link btn-block ${activeTab === 'appointments' ? 'active' : ''}`}
                  >
                    <Calendar size={18} />
                    Appointments
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('audit_logs')} 
                    className={`nav-link btn-block ${activeTab === 'audit_logs' ? 'active' : ''}`}
                  >
                    <History size={18} />
                    System Audit Logs
                  </button>
                </li>
              </>
            )}

            {/* Receptionist Menu */}
            {user.role === 'Receptionist' && (
              <>
                <li>
                  <button 
                    onClick={() => handleNavClick('patients')} 
                    className={`nav-link btn-block ${activeTab === 'patients' ? 'active' : ''}`}
                  >
                    <Users size={18} />
                    Search Patients
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('appointments_mgmt')} 
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
                    onClick={() => handleNavClick('my_appointments')} 
                    className={`nav-link btn-block ${activeTab === 'my_appointments' ? 'active' : ''}`}
                  >
                    <Calendar size={18} />
                    My Appointments
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('consultations')} 
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
    </>
  );
}
