import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateStaff } from '../../auth/hooks/useAuth';
import { 
  useUsersQuery, 
  useToggleUserStatus, 
  useDeleteUser, 
  useChangeUserPassword 
} from '../hooks/useUsers';
import { userApi } from '../services/userApi';
import { useToast } from '../../../context/ToastContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldAlert, 
  KeyRound, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Eye, 
  EyeOff, 
  X 
} from 'lucide-react';

/**
 * Super Admin Staff Registry View - manages and audits clinical accounts
 */
export function StaffRegistry({ currentUser }) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Registry Pagination & Filters
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const [searchNameVal, setSearchNameVal] = useState('');
  const [searchEmailVal, setSearchEmailVal] = useState('');
  const [roleVal, setRoleVal] = useState('All');
  const [statusVal, setStatusVal] = useState('All');

  const [appliedSearchName, setAppliedSearchName] = useState('');
  const [appliedSearchEmail, setAppliedSearchEmail] = useState('');
  const [appliedRole, setAppliedRole] = useState('All');
  const [appliedStatus, setAppliedStatus] = useState('All');

  // Autocomplete Suggestions State
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const nameSearchTimeoutRef = useRef(null);
  const emailSearchTimeoutRef = useRef(null);

  // Modals & Creation States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activePasswordEditId, setActivePasswordEditId] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // New staff form states
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('Doctor');
  const [staffDepartment, setStaffDepartment] = useState('Diagnostic Medicine');
  const [emailSuggestion, setEmailSuggestion] = useState('');

  // Queries & Mutations
  const { data: usersResponse, isLoading, isError } = useUsersQuery({
    limit,
    offset,
    role: appliedRole,
    isActive: appliedStatus,
    name: appliedSearchName,
    email: appliedSearchEmail,
  });

  const createStaffMutation = useCreateStaff();
  const toggleStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();
  const changePasswordMutation = useChangeUserPassword();

  // Click outside to dismiss suggestions dropdowns
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNameSuggestions(false);
      setShowEmailSuggestions(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cleanup autocomplete search timeouts on unmount
  useEffect(() => {
    return () => {
      if (nameSearchTimeoutRef.current) clearTimeout(nameSearchTimeoutRef.current);
      if (emailSearchTimeoutRef.current) clearTimeout(emailSearchTimeoutRef.current);
    };
  }, []);

  const handleApplyFilters = () => {
    setAppliedSearchName(searchNameVal);
    setAppliedSearchEmail(searchEmailVal);
    setAppliedRole(roleVal);
    setAppliedStatus(statusVal);
    setOffset(0);
  };

  const handleResetFilters = () => {
    setSearchNameVal('');
    setSearchEmailVal('');
    setRoleVal('All');
    setStatusVal('All');
    setAppliedSearchName('');
    setAppliedSearchEmail('');
    setAppliedRole('All');
    setAppliedStatus('All');
    setOffset(0);
  };

  const handleNameSearchChange = (e) => {
    const val = e.target.value;
    setSearchNameVal(val);

    if (nameSearchTimeoutRef.current) clearTimeout(nameSearchTimeoutRef.current);

    if (val.trim() === '') {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }

    nameSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await userApi.getUsers({ name: val, limit: 3 });
        if (res.success && res.data.users) {
          setNameSuggestions(res.data.users);
          setShowNameSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching name suggestions:', err);
      }
    }, 300);
  };

  const handleEmailSearchChange = (e) => {
    const val = e.target.value;
    setSearchEmailVal(val);

    if (emailSearchTimeoutRef.current) clearTimeout(emailSearchTimeoutRef.current);

    if (val.trim() === '') {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
      return;
    }

    emailSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await userApi.getUsers({ email: val, limit: 3 });
        if (res.success && res.data.users) {
          setEmailSuggestions(res.data.users);
          setShowEmailSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching email suggestions:', err);
      }
    }, 300);
  };

  const handleCreateStaffNameChange = (e) => {
    const nameVal = e.target.value;
    setStaffName(nameVal);

    // Generate suggested email based on staff name
    const parts = nameVal.toLowerCase().trim().split(/\s+/);
    let suggestion = '';
    if (parts.length > 0 && parts[0] !== '') {
      const cleanParts = parts.filter(p => p !== 'dr' && p !== 'dr.' && p !== 'mr' && p !== 'mrs' && p !== 'ms');
      if (cleanParts.length > 0) {
        suggestion = cleanParts.join('.') + '@emr.com';
      }
    }
    setEmailSuggestion(suggestion);

    const previousParts = staffName.toLowerCase().trim().split(/\s+/);
    const cleanPrevParts = previousParts.filter(p => p !== 'dr' && p !== 'dr.' && p !== 'mr' && p !== 'mrs' && p !== 'ms');
    const previousSuggestion = cleanPrevParts.length > 0 ? cleanPrevParts.join('.') + '@emr.com' : '';

    if (suggestion && (!staffEmail || staffEmail === previousSuggestion)) {
      setStaffEmail(suggestion);
    }
  };

  const handleCreateStaffSubmit = (e) => {
    e.preventDefault();

    if (!staffName || !staffEmail || !staffPassword) {
      addToast('Please fill in all staff fields', 'error');
      return;
    }

    createStaffMutation.mutate(
      { name: staffName, email: staffEmail, password: staffPassword, role: staffRole, department: staffRole === 'Doctor' ? staffDepartment : undefined },
      {
        onSuccess: () => {
          addToast(`Account created successfully for ${staffName} (${staffRole})`, 'success');
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setIsCreateModalOpen(false);

          // Clear form
          setStaffName('');
          setStaffEmail('');
          setStaffPassword('');
          setEmailSuggestion('');
          setShowStaffPassword(false);
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'Error creating staff. Email may already exist.';
          addToast(msg, 'error');
        }
      }
    );
  };

  const handleToggleStatus = (id, currentStatus) => {
    toggleStatusMutation.mutate(
      { id, isActive: !currentStatus },
      {
        onSuccess: () => {
          addToast(`User status successfully ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
          addToast(err.response?.data?.message || 'Failed to toggle user status', 'error');
        }
      }
    );
  };

  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Are you absolutely sure you want to remove ${name} from the clinical registry?`)) {
      deleteUserMutation.mutate(id, {
        onSuccess: () => {
          addToast('Account successfully removed', 'success');
          queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err) => {
          addToast(err.response?.data?.message || 'Failed to remove user account', 'error');
        }
      });
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!newPasswordVal || newPasswordVal.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    changePasswordMutation.mutate(
      { id: activePasswordEditId, password: newPasswordVal },
      {
        onSuccess: () => {
          addToast('Password updated successfully!', 'success');
          setActivePasswordEditId(null);
          setNewPasswordVal('');
        },
        onError: (err) => {
          addToast(err.response?.data?.message || 'Failed to update password', 'error');
        }
      }
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Active Staff Registry Table */}
      <div className="glass-card" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} />
            Active Staff Directory
          </h2>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <UserPlus size={16} />
            Create Staff Account
          </button>
        </div>

        {/* Filters panel */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', alignItems: 'flex-end' }}>
          {/* Search Name input */}
          <div style={{ flex: '1', minWidth: '180px', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Search Name</label>
            <div className="input-wrapper" onClick={(e) => e.stopPropagation()}>
              <span className="input-icon" style={{ left: '0.75rem' }}>
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-input" 
                style={{ padding: '0.35rem 0.75rem 0.35rem 2rem', fontSize: '0.85rem' }} 
                placeholder="Name..." 
                value={searchNameVal}
                onChange={handleNameSearchChange}
              />
            </div>
            {showNameSuggestions && nameSuggestions.length > 0 && (
              <ul 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  width: '100%', 
                  backgroundColor: '#111827', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: 'var(--radius-md)', 
                  zIndex: 50, 
                  maxHeight: '130px', 
                  overflowY: 'auto',
                  listStyle: 'none',
                  margin: '0.25rem 0 0 0',
                  padding: '0.15rem 0',
                  boxShadow: 'var(--shadow-lg)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {nameSuggestions.map(s => (
                  <li 
                    key={s._id}
                    onClick={() => {
                      setSearchNameVal(s.name);
                      setAppliedSearchName(s.name);
                      setOffset(0);
                      setShowNameSuggestions(false);
                    }}
                    style={{ 
                      padding: '0.35rem 0.65rem', 
                      cursor: 'pointer', 
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.775rem', color: 'var(--text-main)' }}>{s.name} <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({s.role})</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search Email input */}
          <div style={{ flex: '1', minWidth: '180px', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Search Email</label>
            <div className="input-wrapper" onClick={(e) => e.stopPropagation()}>
              <span className="input-icon" style={{ left: '0.75rem' }}>
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-input" 
                style={{ padding: '0.35rem 0.75rem 0.35rem 2rem', fontSize: '0.85rem' }} 
                placeholder="Email..." 
                value={searchEmailVal}
                onChange={handleEmailSearchChange}
              />
            </div>
            {showEmailSuggestions && emailSuggestions.length > 0 && (
              <ul 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  width: '100%', 
                  backgroundColor: '#111827', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: 'var(--radius-md)', 
                  zIndex: 50, 
                  maxHeight: '130px', 
                  overflowY: 'auto',
                  listStyle: 'none',
                  margin: '0.25rem 0 0 0',
                  padding: '0.15rem 0',
                  boxShadow: 'var(--shadow-lg)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {emailSuggestions.map(s => (
                  <li 
                    key={s._id}
                    onClick={() => {
                      setSearchEmailVal(s.email);
                      setAppliedSearchEmail(s.email);
                      setOffset(0);
                      setShowEmailSuggestions(false);
                    }}
                    style={{ 
                      padding: '0.35rem 0.65rem', 
                      cursor: 'pointer', 
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.775rem', color: 'var(--text-main)' }}>{s.email} <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({s.role})</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ width: '130px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Role</label>
            <select 
              className="form-input" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              value={roleVal} 
              onChange={(e) => setRoleVal(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          <div style={{ width: '130px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Status</label>
            <select 
              className="form-input" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              value={statusVal} 
              onChange={(e) => setStatusVal(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={handleResetFilters} 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            >
              Reset
            </button>
            <button 
              type="button" 
              onClick={handleApplyFilters} 
              className="btn btn-primary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            >
              Filter Staff
            </button>
          </div>
        </div>

        {/* Directory table */}
        {isLoading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Querying clinical staff registry...</p>
        ) : isError ? (
          <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>Failed to retrieve registry records from backend.</p>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(usersResponse?.data?.users || []).map(u => {
                  const isSelf = currentUser?.email === u.email;
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td data-label="Name" style={{ padding: '0.75rem', fontWeight: 600 }}>{u.name} {isSelf && <span style={{ color: 'var(--primary)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>(You)</span>}</td>
                      <td data-label="Email" style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td data-label="Role" style={{ padding: '0.75rem' }}>
                        <span className={`badge badge-primary`} style={{ background: u.role === 'Super Admin' ? 'rgba(139,92,246,0.1)' : undefined, color: u.role === 'Super Admin' ? 'var(--primary)' : undefined }}>
                          {u.role}
                        </span>
                      </td>
                      <td data-label="Status" style={{ padding: '0.75rem' }}>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-warning'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Actions" style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setActivePasswordEditId(u._id)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            title="Reset Password"
                          >
                            <KeyRound size={12} />
                            Reset
                          </button>
                          
                          <button 
                            disabled={isSelf} 
                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                            className={`btn ${u.isActive ? 'btn-secondary' : 'btn-primary'}`} 
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', opacity: isSelf ? 0.4 : 1 }}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <ToggleLeft size={12} style={{ color: 'var(--warning)' }} /> : <ToggleRight size={12} />}
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          
                          <button 
                            disabled={isSelf} 
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="btn btn-danger" 
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', opacity: isSelf ? 0.4 : 1 }}
                            title="Delete Permanently"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing {offset + 1} - {Math.min(offset + limit, usersResponse?.data?.totalCount || 0)} of {usersResponse?.data?.totalCount || 0} staff members
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  disabled={offset === 0}
                  onClick={() => setOffset(prev => Math.max(0, prev - limit))}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  disabled={offset + limit >= (usersResponse?.data?.totalCount || 0)}
                  onClick={() => setOffset(prev => prev + limit)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Creation Modal Overlay */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserPlus size={18} style={{ color: 'var(--primary)' }} />
                Create Clinical Staff Account
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit}>
              <div className="form-group">
                <label>Staff Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Gregory House" 
                  value={staffName} 
                  onChange={handleCreateStaffNameChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="gregory.house@emr.com" 
                  value={staffEmail} 
                  onChange={(e) => setStaffEmail(e.target.value)} 
                  required 
                />
                {emailSuggestion && emailSuggestion !== staffEmail && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Suggestion:{' '}
                    <span 
                      onClick={() => setStaffEmail(emailSuggestion)} 
                      style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {emailSuggestion}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Temporary Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showStaffPassword ? "text" : "password"} 
                    className="form-input" 
                    placeholder="Minimum 6 characters" 
                    value={staffPassword} 
                    onChange={(e) => setStaffPassword(e.target.value)} 
                    style={{ paddingRight: '2.5rem' }}
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Staff Role Type</label>
                  <select 
                    className="form-input" 
                    value={staffRole} 
                    onChange={(e) => setStaffRole(e.target.value)}
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                {staffRole === 'Doctor' && (
                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      className="form-input" 
                      value={staffDepartment} 
                      onChange={(e) => setStaffDepartment(e.target.value)}
                    >
                      <option value="Diagnostic Medicine">Diagnostic Medicine</option>
                      <option value="Immunology">Immunology</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={createStaffMutation.isPending} 
                className="btn btn-primary btn-block" 
                style={{ marginTop: '1.25rem' }}
              >
                {createStaffMutation.isPending ? 'Seeding Profile...' : 'Save Account Registry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {activePasswordEditId && (
        <div className="modal-overlay" onClick={() => setActivePasswordEditId(null)}>
          <div className="modal-content glass-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
                Administrative Password Reset
              </h3>
              <button 
                onClick={() => setActivePasswordEditId(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePassword}>
              <div className="form-group">
                <label>Set New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    placeholder="Minimum 6 characters" 
                    value={newPasswordVal} 
                    onChange={(e) => setNewPasswordVal(e.target.value)} 
                    style={{ paddingRight: '2.5rem' }}
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={changePasswordMutation.isPending} 
                className="btn btn-primary btn-block" 
                style={{ marginTop: '1rem' }}
              >
                {changePasswordMutation.isPending ? 'Updating...' : 'Confirm Password Reset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
