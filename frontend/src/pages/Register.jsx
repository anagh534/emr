import React, { useState } from 'react';
import { useRegister } from '../features/auth/hooks/useAuth';
import { Mail, Lock, User, Shield, Activity, Loader2 } from 'lucide-react';

export default function Register({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Doctor');
  const [formError, setFormError] = useState('');

  const registerMutation = useRegister();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !role) {
      setFormError('Please fill in all fields');
      return;
    }

    registerMutation.mutate(
      { name, email, password, role },
      {
        onError: (error) => {
          const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
          setFormError(errMsg);
        },
      }
    );
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Activity size={28} style={{ color: 'var(--primary)' }} />
            <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>
              EMR
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Register Clinic Staff Account
          </p>
        </div>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-title)' }}>
          Create Account
        </h2>

        {formError && (
          <div className="badge-error" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', width: '100%' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <User size={18} />
              </span>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Dr. Gregory House"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="doctor@emr.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Security Role</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Shield size={18} />
              </span>
              <select
                id="role"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ paddingRight: '1rem', appearance: 'none', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
              >
                <option value="Doctor">Doctor (Clinical Access)</option>
                <option value="Receptionist">Receptionist (Administrative Access)</option>
                <option value="Super Admin">Super Admin (System Control)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '1.5rem' }}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 size={18} className="loading-spinner" style={{ animation: 'spin 1s linear infinite' }} />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <button
            onClick={() => onNavigate('login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
              fontFamily: 'inherit'
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
