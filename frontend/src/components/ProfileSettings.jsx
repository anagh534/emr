import React, { useState } from 'react';
import { useUpdateSelfPassword } from '../features/auth/hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { User, KeyRound, Eye, EyeOff, Mail, Activity } from 'lucide-react';

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
      <div className="glass-card" style={{ 
        background: 'rgba(30, 41, 59, 0.25)', 
        backdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
          <User size={20} style={{ color: 'var(--primary)' }} />
          Clinical Account Profile
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
          <div style={{ 
            width: '90px', 
            height: '90px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.25rem',
            fontWeight: '800',
            color: '#020617',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.35)',
            border: '3px solid rgba(255, 255, 255, 0.1)'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{user.name}</h3>
            <span className="badge badge-success" style={{ 
              display: 'inline-block', 
              marginTop: '0.25rem',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '0.75rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontWeight: 600
            }}>{user.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: 'var(--radius-md)' 
          }}>
            <Mail size={16} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>

          {/* Pulsating Session Badge */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: 'rgba(16, 185, 129, 0.05)', 
            border: '1px solid rgba(16, 185, 129, 0.1)', 
            borderRadius: 'var(--radius-md)', 
            justifyContent: 'center' 
          }}>
            <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
              <span style={{ 
                position: 'absolute', 
                height: '100%', 
                width: '100%', 
                borderRadius: '50%', 
                backgroundColor: 'var(--success)', 
                opacity: 0.75,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}></span>
              <span style={{ position: 'relative', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: 'var(--success)' }}></span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', letterSpacing: '0.05em' }}>SESSION ACTIVE & SECURED</span>
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
