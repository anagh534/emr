import React, { useState } from 'react';
import { useUpdateSelfPassword } from '../features/auth/hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { User, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

/**
 * User Profile & Password Management portal
 */
export function ProfileSettings({ user }) {
  const { addToast } = useToast();
  const updatePasswordMutation = useUpdateSelfPassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassCurrent, setShowPassCurrent] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    updatePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          addToast('Password changed successfully!', 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (err) => {
          addToast(err.response?.data?.message || 'Failed to change password. Make sure current password is correct.', 'error');
        }
      }
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', width: '100%' }}>
      
      {/* Profile Details Card */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} style={{ color: 'var(--primary)' }} />
          Clinical Account Profile
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1.5rem 0', gap: '0.75rem' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#020617'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</h3>
            <span className="badge badge-success" style={{ display: 'inline-block', marginTop: '0.35rem' }}>{user.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Registered Email</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{user.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Security Clearance</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
              {user.role === 'Super Admin' ? 'Level 3 (Root)' : user.role === 'Doctor' ? 'Level 2 (Clinical)' : 'Level 1 (Operations)'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>HIPAA Audit Trail</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <KeyRound size={20} style={{ color: 'var(--primary)' }} />
          Change Account Password
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group">
            <label>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassCurrent ? "text" : "password"} 
                className="form-input" 
                placeholder="Enter current password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                style={{ paddingRight: '2.5rem' }}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassCurrent(!showPassCurrent)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showPassCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassNew ? "text" : "password"} 
                className="form-input" 
                placeholder="Enter new password (min 6 chars)" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ paddingRight: '2.5rem' }}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassNew(!showPassNew)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showPassNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassConfirm ? "text" : "password"} 
                className="form-input" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={{ paddingRight: '2.5rem' }}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassConfirm(!showPassConfirm)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showPassConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={updatePasswordMutation.isPending} 
            className="btn btn-primary btn-block" 
            style={{ marginTop: '1.5rem' }}
          >
            {updatePasswordMutation.isPending ? 'Updating Password...' : 'Save Password Changes'}
          </button>
        </form>
      </div>

    </div>
  );
}
